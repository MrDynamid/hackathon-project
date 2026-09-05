"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrep } from "../../context/PrepContext";
import VoiceVisualizer from "../../components/VoiceVisualizer";
import { detectGibberish } from "../../lib/gibberish";
import {
  ArrowLeft,
  Briefcase,
  Play,
  Volume2,
  Mic,
  Edit3,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  StopCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";

export default function InterviewPage() {
  const router = useRouter();
  const {
    resume,
    targetRole,
    questions,
    answers,
    setAnswer,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    isVoiceMode,
    setIsVoiceMode,
    isRecording,
    setIsRecording,
    evaluateInterview,
    isSimulating,
  } = usePrep();

  const [timerSeconds, setTimerSeconds] = useState(255); // 04:15 default
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTypedAnswer, setCurrentTypedAnswer] = useState("");
  const [answerError, setAnswerError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAnswerRef = useRef("");
  const committedAnswerRef = useRef("");

  useEffect(() => {
    currentAnswerRef.current = currentTypedAnswer;
  }, [currentTypedAnswer]);

  const currentQ = questions[currentQuestionIndex] || questions[0];
  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  // Sync current typed answer with saved state
  useEffect(() => {
    if (currentQ) {
      const savedAnswer = answers[currentQ.id] || "";
      currentAnswerRef.current = savedAnswer;
      committedAnswerRef.current = savedAnswer;
      setCurrentTypedAnswer(savedAnswer);
    }
    // Only hydrate when the question changes. Including answers here resets the
    // textarea during live speech because each recognition event updates answers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, currentQ?.id]);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // No interview questions in state (e.g. the page was opened directly without
  // running the upload/parse flow first): send the user back to start.
  useEffect(() => {
    if (totalQuestions === 0) {
      router.replace("/upload");
    }
  }, [totalQuestions, router]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    currentAnswerRef.current = val;
    committedAnswerRef.current = val;
    setCurrentTypedAnswer(val);
    setAnswer(currentQ.id, val);
    if (answerError) setAnswerError("");
  };

  const handleVoiceTranscript = (text: string) => {
    const existing = currentAnswerRef.current.trim();
    const updated = existing ? `${existing} ${text}` : text;
    currentAnswerRef.current = updated;
    committedAnswerRef.current = updated;
    setCurrentTypedAnswer(updated);
    setAnswer(currentQ.id, updated);
    if (answerError) setAnswerError("");
  };

  const handleInterimTranscript = (text: string) => {
    const base = committedAnswerRef.current.trim();
    const live = text ? (base ? `${base} ${text}` : text) : base;
    currentAnswerRef.current = live;
    setCurrentTypedAnswer(live);
    setAnswer(currentQ.id, live);
  };

  const wordCount = currentTypedAnswer.trim()
    ? currentTypedAnswer.trim().split(/\s+/).length
    : 0;

  const handleNextQuestion = async () => {
    // Block gibberish / placeholder answers before advancing or grading.
    const problem = detectGibberish(currentTypedAnswer);
    if (problem) {
      setAnswerError(problem);
      return;
    }
    setAnswerError("");
    setAnswer(currentQ.id, currentTypedAnswer);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question reached: submit for evaluation
      await evaluateInterview();
      router.push("/feedback");
    }
  };

  // Read the current question aloud using the Gemini TTS route, with a
  // Web Speech API fallback when the server voice is unavailable.
  const handlePlayAudio = async () => {
    if (isPlayingAudio) {
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }
    if (!currentQ?.text) return;
    setIsPlayingAudio(true);
    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentQ.text }),
      });
      if (!res.ok) throw new Error("tts unavailable");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch {
      // Fallback: browser speech synthesis.
      try {
        const utter = new SpeechSynthesisUtterance(currentQ.text);
        utter.rate = 0.98;
        utter.onend = () => setIsPlayingAudio(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      } catch {
        setIsPlayingAudio(false);
      }
    }
  };

  // Keyboard shortcut for Cmd/Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleNextQuestion();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestionIndex, currentTypedAnswer]);

  if (!currentQ) {
    return (
      <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-on-surface-variant max-w-sm">
          No interview session found. Redirecting you to upload your resume and generate questions&hellip;
        </p>
        <Link
          href="/upload"
          className="text-xs font-bold text-primary underline underline-offset-4"
        >
          Go to upload
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-secondary-container">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-50 bg-background/90 backdrop-blur-md border-b-[1.5px] border-primary flex flex-col pt-2">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 w-full max-w-[1280px] mx-auto">
          {/* Left: Back icon + badge */}
          <div className="flex items-center gap-2">
            <Link
              href="/review"
              className="p-2 hover:bg-secondary-container rounded-full transition-colors duration-200 cursor-pointer active:scale-95 text-primary border border-transparent hover:border-primary"
              title="Return to parsed review"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: '"FILL" 0' }}
              >
                arrow_back
              </span>
            </Link>
            <div className="hidden sm:flex bg-surface-container-high border-[1.5px] border-primary rounded-full px-3 py-1 items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-[16px]">work</span>
              <span className="text-xs font-bold text-on-surface truncate max-w-[240px]">
                {targetRole || "Senior Frontend Engineer @ Stripe"}
              </span>
            </div>
          </div>

          {/* Center: Question Progress */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-primary mb-1">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <div className="w-24 sm:w-32 h-1.5 bg-surface-variant rounded-full overflow-hidden border border-outline-variant/60">
              <div
                className="h-full bg-secondary-fixed transition-all duration-300 rounded-full border-r border-primary"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right: Timer + End Button */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-on-surface-variant hidden sm:inline-block bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant">
              {formatTimer(timerSeconds)}
            </span>
            <button
              onClick={async () => {
                await evaluateInterview();
                router.push("/feedback");
              }}
              className="border-[1.5px] border-error text-error hover:bg-error-container px-4 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">stop_circle</span>
              <span>Finish Early</span>
            </button>
          </div>
        </div>

        {/* Mobile badge below header */}
        <div className="sm:hidden px-4 pb-3 flex justify-center w-full">
          <div className="bg-surface-container-high border-[1px] border-primary rounded-full px-3 py-1 items-center gap-1 flex inline-flex max-w-full overflow-hidden whitespace-nowrap text-ellipsis">
            <span className="material-symbols-outlined text-[14px] shrink-0">work</span>
            <span className="text-xs text-on-surface truncate">
              {targetRole || "Senior Frontend Engineer @ Stripe"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col md:flex-row w-full max-w-[1280px] mx-auto md:px-6 py-6 gap-6">
        {/* Collapsible Sidebar: Candidate Profile Reference */}
        <aside className="w-full md:w-80 shrink-0 px-4 md:px-0">
          <details
            className="group bg-surface-container-low border-[1.5px] border-primary rounded-xl overflow-hidden shadow-sm"
            open
          >
            <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-surface-container-high transition-colors select-none text-xs font-bold text-primary">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">account_circle</span>
                <span>Your Profile Reference</span>
              </div>
              <span className="material-symbols-outlined group-open:rotate-180 transition-transform">
                expand_more
              </span>
            </summary>

            <div className="p-4 border-t-[1px] border-outline-variant bg-surface-container-lowest">
              <div className="mb-4">
                <h4 className="text-[10px] text-on-surface-variant mb-2 uppercase tracking-wider font-bold">
                  Key Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {resume.skills.slice(0, 6).map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-secondary-container text-on-secondary-container border-[1px] border-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] text-on-surface-variant mb-2 uppercase tracking-wider font-bold">
                  Resume Highlights
                </h4>
                <ul className="list-none space-y-2 text-xs text-on-surface pl-1">
                  {resume.experience[0]?.bullets.slice(0, 2).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5 shrink-0">
                        check_circle
                      </span>
                      <span className="leading-snug">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant text-[11px] text-on-surface-variant flex items-center justify-between">
                <span>{resume.name}</span>
                <span className="font-mono text-[10px]">{resume.experience.length} Positions</span>
              </div>
            </div>
          </details>
        </aside>

        {/* Main Interview Area */}
        <section className="flex-1 flex flex-col gap-6 px-4 md:px-0">
          {/* AI Question Card */}
          <div className="bg-white/90 backdrop-blur-md border-[1.5px] border-primary rounded-xl p-6 shadow-sm relative overflow-hidden group">
            {/* Subtle background decorative bloom */}
            <div className="absolute -right-10 -top-10 w-36 h-36 bg-secondary-fixed opacity-60 rounded-full blur-2xl -z-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container border-[1.5px] border-primary flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-primary">AI Interviewer</h3>
                  <span className="inline-block bg-surface-container-high text-on-surface-variant border-[1px] border-outline-variant px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mt-0.5">
                    {currentQ.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 bg-secondary-container text-on-secondary-container border border-primary px-3 py-1 rounded-full text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[16px]">volume_up</span>
                  <span>Voice AI Active</span>
                </div>

                <button
                  type="button"
                  aria-label="Play Audio"
                  onClick={handlePlayAudio}
                  className={`w-10 h-10 rounded-full border-[1.5px] border-primary flex items-center justify-center text-primary transition-colors cursor-pointer active:scale-95 shrink-0 shadow-sm ${
                    isPlayingAudio
                      ? "bg-primary text-white animate-pulse"
                      : "bg-secondary-fixed hover:bg-secondary-container"
                  }`}
                  title="Read question out loud"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    {isPlayingAudio ? "graphic_eq" : "play_arrow"}
                  </span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <p className="font-serif text-xl sm:text-2xl text-on-surface relative z-10 pl-3 border-l-[3.5px] border-secondary-fixed leading-relaxed">
              &ldquo;{currentQ.text}&rdquo;
            </p>
          </div>

          {/* Response Area */}
          <div className="flex-1 flex flex-col bg-surface-container-lowest border-[1.5px] border-primary rounded-xl overflow-hidden relative shadow-sm">
            {/* Status Pill & Mode Toggles */}
            <div className="flex flex-wrap justify-between items-center p-3 border-b-[1px] border-outline-variant bg-surface-container-low gap-3">
              <div className="inline-flex items-center p-1 bg-surface-container-high rounded-full border border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsVoiceMode(true)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isVoiceMode
                      ? "bg-secondary-fixed text-primary border border-primary shadow-sm"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">mic</span>
                  <span>Voice Mode</span>
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse ml-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsVoiceMode(false)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    !isVoiceMode
                      ? "bg-secondary-fixed text-primary border border-primary shadow-sm"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  <span>Type Answer</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/70 border border-secondary-fixed text-[11px] font-bold text-on-secondary-container">
                  <span className="material-symbols-outlined text-[14px]">graphic_eq</span>
                  <span>Wispr Flow Active</span>
                </div>
                <span className="text-xs text-on-surface-variant font-mono">{wordCount} words</span>
              </div>
            </div>

            {/* Voice Mode Visualizer Area (shown when Voice Mode is active) */}
            {isVoiceMode && (
              <VoiceVisualizer
                isRecording={isRecording}
                onToggleRecord={() => setIsRecording(!isRecording)}
                onTranscript={handleVoiceTranscript}
                onInterimTranscript={handleInterimTranscript}
              />
            )}

            {/* Answer Textarea */}
            <div className="flex-1 relative group min-h-[220px]">
              <textarea
                value={currentTypedAnswer}
                onChange={handleTextChange}
                className="w-full h-full min-h-[220px] p-6 resize-none bg-transparent outline-none text-xs sm:text-sm text-on-surface placeholder:text-outline-variant focus:ring-0 border-none custom-scrollbar leading-relaxed"
                placeholder="Type your answer here, or activate Wispr Flow voice mode and speak your technical reasoning..."
              />
            </div>

            {/* Gibberish / validation warning */}
            {answerError && (
              <div className="mx-4 mb-1 flex items-start gap-2 text-xs text-error bg-error-container/60 border border-error rounded-lg p-3">
                <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">warning</span>
                <span className="font-medium">{answerError}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="p-4 border-t-[1px] border-outline-variant bg-surface-container-low flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="hidden sm:flex items-center gap-1 text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-[16px]">keyboard</span>
                <span>Press</span>
                <kbd className="border border-outline-variant rounded px-1.5 py-0.5 shadow-sm bg-surface-container-lowest font-mono mx-0.5 text-[11px]">
                  ⌘
                </kbd>
                <span>+</span>
                <kbd className="border border-outline-variant rounded px-1.5 py-0.5 shadow-sm bg-surface-container-lowest font-mono mx-0.5 text-[11px]">
                  Enter
                </kbd>
                <span>to advance</span>
              </div>

              <div className="flex w-full sm:w-auto gap-3 items-center">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTypedAnswer("");
                    setAnswer(currentQ.id, "");
                  }}
                  className="px-4 py-2 text-xs font-bold text-on-surface hover:text-error transition-colors bg-transparent cursor-pointer"
                >
                  Clear Answer
                </button>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={isSimulating}
                  className="flex-1 sm:flex-none bg-secondary-fixed border-[1.5px] border-primary text-primary px-6 py-2 rounded-full text-xs font-bold hover:bg-secondary-container transition-all duration-200 cursor-pointer active:scale-95 flex justify-center items-center gap-2 group shadow-sm disabled:opacity-75"
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>Grading Interview...</span>
                    </>
                  ) : currentQuestionIndex < totalQuestions - 1 ? (
                    <>
                      <span>Next Question</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Finish Interview & Grade</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        check_circle
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Accordion: Previous Responses */}
          {currentQuestionIndex > 0 && (
            <details className="bg-surface-container-low border-[1.5px] border-outline-variant rounded-xl overflow-hidden">
              <summary className="flex justify-between items-center p-3 cursor-pointer hover:bg-surface-container-high transition-colors select-none text-xs font-bold text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  <span>Previous Responses (Questions 1 to {currentQuestionIndex})</span>
                </div>
                <span className="material-symbols-outlined">expand_more</span>
              </summary>

              <div className="p-4 border-t-[1px] border-outline-variant bg-surface-container-lowest space-y-3">
                {questions.slice(0, currentQuestionIndex).map((q, idx) => (
                  <div key={q.id} className="border-l-2 border-secondary-fixed pl-3 py-1">
                    <p className="text-xs font-bold text-primary mb-1">
                      Q{idx + 1}: {q.text}
                    </p>
                    <p className="text-xs text-on-surface-variant italic">
                      &ldquo;{answers[q.id] || "No answer recorded."}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </section>
      </main>
    </div>
  );
}
