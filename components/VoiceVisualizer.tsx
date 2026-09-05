"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Square, AlertTriangle } from "lucide-react";

interface VoiceVisualizerProps {
  isRecording: boolean;
  onToggleRecord: () => void;
  // Called with each finalized chunk of transcribed speech.
  onTranscript?: (text: string) => void;
  // Called with the current non-final speech so the answer updates live.
  onInterimTranscript?: (text: string) => void;
}

// Minimal typings for the Web Speech API (not in the standard lib DOM types).
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export default function VoiceVisualizer({
  isRecording,
  onToggleRecord,
  onTranscript,
  onInterimTranscript,
}: VoiceVisualizerProps) {
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState("");
  const [interim, setInterim] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [levels, setLevels] = useState<number[]>(Array(16).fill(0.15));

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const wantRecordingRef = useRef(false);
  const startingRef = useRef(false);
  const generationRef = useRef(0);
  const onTranscriptRef = useRef(onTranscript);
  const onInterimTranscriptRef = useRef(onInterimTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onInterimTranscriptRef.current = onInterimTranscript;
  }, [onTranscript, onInterimTranscript]);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    if (!w.SpeechRecognition && !w.webkitSpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const stopEverything = useCallback(() => {
    wantRecordingRef.current = false;
    generationRef.current += 1;
    startingRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* noop */
    }
    recognitionRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
    setLevels(Array(16).fill(0.15));
    setInterim("");
  }, []);

  const startEverything = useCallback(async () => {
    setError("");
    setIsStarting(true);
    const generation = generationRef.current;
    if (startingRef.current || recognitionRef.current) return;
    startingRef.current = true;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      startingRef.current = false;
      setError("Live transcription is unavailable here. Use the answer box below to type your response.");
      setIsStarting(false);
      return;
    }

    // 1) Mic level meter
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(data);
        const bars: number[] = [];
        const step = Math.floor(data.length / 16) || 1;
        for (let i = 0; i < 16; i++) {
          const v = data[i * step] / 255;
          bars.push(Math.max(0.12, v));
        }
        setLevels(bars);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setError("Microphone access was blocked. Enable it in your browser to use voice mode.");
      wantRecordingRef.current = false;
      startingRef.current = false;
      setIsStarting(false);
      onToggleRecord();
      return;
    }

    // 2) Speech recognition
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0].transcript;
        if (res.isFinal) {
          onTranscriptRef.current?.(text.trim());
          setInterim("");
        } else {
          interimText += text;
        }
      }
      setInterim(interimText);
      onInterimTranscriptRef.current?.(interimText.trim());
    };

    recognition.onerror = (ev) => {
      if (ev.error === "no-speech" || ev.error === "aborted") return;
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        setError("Microphone permission denied. Allow microphone access, then tap to speak again.");
        wantRecordingRef.current = false;
        onToggleRecord();
      } else {
        setError("Voice recognition lost connection. Tap to speak again or type your answer below.");
      }
    };

    // Auto-restart while the user still wants to record (Chrome stops after silence).
    recognition.onend = () => {
      startingRef.current = false;
      if (wantRecordingRef.current && generationRef.current === generation) {
        window.setTimeout(() => {
          if (!wantRecordingRef.current || generationRef.current !== generation || recognitionRef.current !== recognition) return;
          try {
            startingRef.current = true;
            recognition.start();
          } catch {
            startingRef.current = false;
          }
        }, 120);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsStarting(false);
    } catch {
      recognitionRef.current = null;
      startingRef.current = false;
      setIsStarting(false);
      setError("Voice recognition could not start. Try Chrome or Edge, or type your answer below.");
    }
  }, [onToggleRecord]);

  // React to parent isRecording changes.
  useEffect(() => {
    if (isRecording) {
      wantRecordingRef.current = true;
      startEverything();
    } else {
      stopEverything();
    }
    return () => stopEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  if (!supported) {
    return (
      <div className="p-5 border-b border-outline-variant bg-surface-container-low flex items-start gap-2 text-xs text-on-surface-variant">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <span>
          Live voice transcription isn&apos;t supported in this browser. Use Chrome or Edge, or
          switch to <span className="font-bold text-primary">Type Answer</span> mode.
        </span>
      </div>
    );
  }

  return (
    <div className="p-5 bg-gradient-to-b from-secondary-container/30 to-surface-container-lowest border-b border-outline-variant flex flex-col items-center justify-center gap-4 transition-all">
      {/* Top status bar */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isRecording ? "bg-error animate-ping" : "bg-primary animate-pulse"
            }`}
          />
          <span className="font-bold text-xs text-primary uppercase tracking-wider">
            {isStarting ? "Starting microphone…" : isRecording ? "Listening — speak now" : "Voice mode ready"}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-mono text-[11px]">Live transcription</span>
        </div>
      </div>

      {/* Live Waveform Bars driven by real mic levels */}
      <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-sm px-4 py-2 bg-surface-container-low/80 rounded-full border border-outline-variant shadow-inner">
        {levels.map((lvl, idx) => (
          <div
            key={idx}
            className="w-1.5 rounded-full bg-primary transition-[height] duration-75"
            style={{ height: `${Math.round(lvl * 100)}%`, opacity: isRecording ? 1 : 0.4 }}
          />
        ))}
      </div>

      {/* Interim transcript preview */}
      {isRecording && (
        <p className="text-[11px] text-on-surface-variant italic text-center min-h-[16px] max-w-md">
          {interim || "..."}
        </p>
      )}

      {error && (
        <p className="text-[11px] text-red-700 text-center max-w-md">{error}</p>
      )}

      {/* Control Button */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full">
        <button
          type="button"
          onClick={onToggleRecord}
          className={`group flex items-center gap-2.5 px-6 py-2.5 rounded-full font-bold text-xs transition-all duration-200 shadow-md cursor-pointer active:scale-95 ${
            isRecording
              ? "bg-error text-on-error hover:bg-error/90 border-[1.5px] border-error"
              : "bg-primary text-on-primary hover:bg-surface-tint border-[1.5px] border-primary"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            {isRecording ? (
              <Square className="w-3 h-3 text-white" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-white" />
            )}
          </span>
          <span>{isRecording ? "Stop & Save Transcript" : "Tap to Speak"}</span>
        </button>
      </div>

      <p className="text-[11px] text-on-surface-variant italic text-center">
        Your speech is transcribed into the answer field in real time.
      </p>
    </div>
  );
}
