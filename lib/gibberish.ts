/**
 * Lightweight, instant, offline heuristic to catch nonsense answers like
 * "ubefwiueybfceyg76t8" or keyboard-mashing before we waste an AI grading call.
 * Returns a reason string when the text looks like gibberish, else null.
 */
export function detectGibberish(input: string): string | null {
  const text = input.trim()

  if (text.length < 15) {
    return 'Your answer is too short. Please write a real, complete response.'
  }

  const words = text.split(/\s+/).filter(Boolean)

  if (words.length < 4) {
    return 'Please answer in full sentences, not just a few words.'
  }

  // Common English words — presence of several signals genuine writing.
  const common = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'i', 'we', 'my', 'me', 'you', 'to', 'of', 'in',
    'on', 'for', 'with', 'at', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'it',
    'this', 'that', 'as', 'have', 'has', 'had', 'do', 'did', 'not', 'they', 'their', 'our',
    'would', 'could', 'should', 'can', 'will', 'about', 'which', 'when', 'how', 'what', 'who',
    'because', 'so', 'then', 'also', 'used', 'use', 'work', 'worked', 'team', 'project', 'led',
    'built', 'made', 'created', 'helped', 'able', 'like', 'time', 'more', 'most', 'than', 'into',
  ])

  const letterWords = words
    .map((w) => w.toLowerCase().replace(/[^a-z']/g, ''))
    .filter((w) => w.length > 0)

  if (letterWords.length < 3) {
    return 'Please write your answer using real words and sentences.'
  }

  const commonHits = letterWords.filter((w) => common.has(w)).length

  // Words with no vowels (e.g. "bcdfg") or absurdly long unbroken tokens are strong gibberish signals.
  const vowel = /[aeiou]/
  const noVowelLong = letterWords.filter((w) => w.length >= 4 && !vowel.test(w)).length
  const veryLongToken = letterWords.some((w) => w.length >= 20)

  // Long runs of consonants inside a single token (e.g. "wiueybfceyg" -> "bfc", "yg").
  const consonantRun = /[^aeiou\s]{5,}/i
  const runHits = letterWords.filter((w) => consonantRun.test(w)).length

  const gibberishRatio = (noVowelLong + runHits) / letterWords.length

  // Genuine answers almost always contain several common function words.
  if (commonHits === 0 && letterWords.length >= 4) {
    return 'That doesn\u2019t look like a real answer. Please type a proper response in your own words.'
  }

  if (veryLongToken || gibberishRatio > 0.4) {
    return 'That looks like random characters rather than a real answer. Please respond properly.'
  }

  // Repeated single character mashing, e.g. "aaaaaa" or "asdasdasd".
  if (/(.)\1{5,}/.test(text) || /(.{1,3})\1{4,}/.test(text.replace(/\s/g, ''))) {
    return 'Please stop entering placeholder text and write a genuine answer.'
  }

  return null
}
