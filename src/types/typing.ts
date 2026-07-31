export interface TypingStats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  timeRemaining: number;
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  grossWpm: number;
  netWpm: number;
}

export interface TestSettings {
  duration: number; // in seconds
  mode: 'time' | 'words';
  difficulty: 'easy' | 'medium' | 'hard';
  wordCount: number;
}
