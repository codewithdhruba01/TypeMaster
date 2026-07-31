import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  RotateCcw,
  Trophy,
  Target,
  Zap,
  AlertCircle,
  Settings,
  Play,
  Pause,
  Timer,
} from 'lucide-react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Keyboard from './Keyboard';
import Button from './ui/Button';
import { textSamples } from '../data/textSamples';

interface TypingStats {
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

interface TestSettings {
  duration: number; // in seconds
  mode: 'time' | 'words';
  difficulty: 'easy' | 'medium' | 'hard';
  wordCount: number;
}



const TypingTest: React.FC = () => {
  const [settings, setSettings] = useState<TestSettings>({
    duration: 60,
    mode: 'time',
    difficulty: 'medium',
    wordCount: 50,
  });

  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 0,
    timeElapsed: 0,
    timeRemaining: 0,
    totalCharacters: 0,
    correctCharacters: 0,
    incorrectCharacters: 0,
    grossWpm: 0,
    netWpm: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateText = useCallback(() => {
    const samples = textSamples[settings.difficulty];
    if (settings.mode === 'words') {
      let words: string[] = [];
      while (words.length < settings.wordCount) {
        const randomSample =
          samples[Math.floor(Math.random() * samples.length)];
        const sampleWords = randomSample.split(' ');
        words = [...words, ...sampleWords];
      }
      return words.slice(0, settings.wordCount).join(' ');
    } else {
      return samples[Math.floor(Math.random() * samples.length)];
    }
  }, [settings]);

  const calculateStats = useCallback(
    (input: string, timeElapsed: number): TypingStats => {
      const totalCharacters = input.length;
      let correctCharacters = 0;

      for (let i = 0; i < Math.min(input.length, currentText.length); i++) {
        if (input[i] === currentText[i]) {
          correctCharacters++;
        }
      }

      const incorrectCharacters = totalCharacters - correctCharacters;
      const accuracy =
        totalCharacters > 0 ? (correctCharacters / totalCharacters) * 100 : 0;

      const timeInMinutes = timeElapsed / 60;
      const grossWpm =
        timeInMinutes > 0 ? Math.round(totalCharacters / 5 / timeInMinutes) : 0;
      const netWpm =
        timeInMinutes > 0
          ? Math.round(
              (correctCharacters / 5 - incorrectCharacters / 5) / timeInMinutes
            )
          : 0;

      const timeRemaining =
        settings.mode === 'time'
          ? Math.max(0, settings.duration - timeElapsed)
          : 0;

      return {
        wpm: Math.max(0, netWpm),
        accuracy: Math.round(accuracy),
        timeElapsed,
        timeRemaining,
        totalCharacters,
        correctCharacters,
        incorrectCharacters,
        grossWpm,
        netWpm: Math.max(0, netWpm),
      };
    },
    [currentText, settings]
  );

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (startTime && !isPaused) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const newStats = calculateStats(userInput, elapsed);
        setStats(newStats);

        if (settings.mode === 'time' && elapsed >= settings.duration) {
          setIsFinished(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }
    }, 100);
  }, [startTime, isPaused, userInput, calculateStats, settings]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isFinished || isPaused || showSettings) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        setUserInput((prev) => {
          const newValue = prev.slice(0, -1);
          setCurrentIndex(newValue.length);
          return newValue;
        });
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        setUserInput((prev) => {
          if (prev.length >= currentText.length) return prev;
          const newValue = prev + e.key;
          setCurrentIndex(newValue.length);

          if (!isStarted) {
            setIsStarted(true);
            setStartTime(Date.now());
          }

          return newValue;
        });
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isFinished, isPaused, isStarted, currentText, showSettings]);

  useEffect(() => {
    if (isStarted && settings.mode === 'words' && userInput.length > 0 && userInput.length === currentText.length) {
      setIsFinished(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStats((prev) => calculateStats(userInput, prev.timeElapsed));
    }
  }, [userInput, currentText, isStarted, settings.mode, calculateStats]);

  const togglePause = () => {
    if (!isStarted || isFinished) return;

    setIsPaused(!isPaused);
    if (!isPaused) {
      // Pausing
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      // Resuming
      if (startTime) {
        setStartTime(Date.now() - stats.timeElapsed * 1000);
        startTimer();
      }
    }
  };

  const resetTest = () => {
    setUserInput('');
    setCurrentIndex(0);
    setIsStarted(false);
    setIsPaused(false);
    setIsFinished(false);
    setStartTime(null);
    setStats({
      wpm: 0,
      accuracy: 0,
      timeElapsed: 0,
      timeRemaining: settings.mode === 'time' ? settings.duration : 0,
      totalCharacters: 0,
      correctCharacters: 0,
      incorrectCharacters: 0,
      grossWpm: 0,
      netWpm: 0,
    });

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setCurrentText(generateText());
  };

  const applySettings = (newSettings: TestSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
    resetTest();
  };

  useEffect(() => {
    if (showSettings || isPaused) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [showSettings, isPaused]);

  const renderText = () => {
    return currentText.split('').map((char, index) => {
      let className = 'transition-all duration-200 ';

      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += 'text-green-600 bg-green-100 rounded px-0.5';
        } else {
          className += 'text-red-600 bg-red-100 rounded px-0.5';
        }
      } else if (
        index === currentIndex &&
        isStarted &&
        !isPaused &&
        !isFinished
      ) {
        className += 'text-blue-600 bg-blue-200 rounded px-0.5 animate-pulse';
      } else {
        className += 'text-gray-300';
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const getPerformanceLevel = (
    wpm: number
  ): { level: string; color: string; icon: React.ReactNode } => {
    if (wpm >= 80)
      return {
        level: 'Expert',
        color: 'text-purple-600',
        icon: <Trophy className="w-5 h-5" />,
      };
    if (wpm >= 60)
      return {
        level: 'Advanced',
        color: 'text-blue-600',
        icon: <Zap className="w-5 h-5" />,
      };
    if (wpm >= 40)
      return {
        level: 'Intermediate',
        color: 'text-green-600',
        icon: <Target className="w-5 h-5" />,
      };
    if (wpm >= 20)
      return {
        level: 'Beginner',
        color: 'text-yellow-600',
        icon: <AlertCircle className="w-5 h-5" />,
      };
    return {
      level: 'Novice',
      color: 'text-gray-400',
      icon: <AlertCircle className="w-5 h-5" />,
    };
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setCurrentText(generateText());
    setStats((prev) => ({
      ...prev,
      timeRemaining: settings.mode === 'time' ? settings.duration : 0,
    }));
  }, [generateText, settings]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isStarted && !isPaused && !isFinished) {
      startTimer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTimer, isStarted, isPaused, isFinished]);

  const progress =
    settings.mode === 'time'
      ? ((settings.duration - stats.timeRemaining) / settings.duration) * 100
      : (userInput.length / currentText.length) * 100;

  const performance = getPerformanceLevel(stats.wpm);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#050505] to-[#1a0b2e] py-4 px-4">
      <div>
        <Navbar />

        <div className="max-w-6xl mx-auto">
          {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-5xl font-bold font-excon text-white mb-4 mt-10 animate-fade-in">
            ⚡Typing Master
          </h1>
          <p className="text-gray-400 text-xl mb-6 font-supreme">
            Test your typing speed and accuracy with customizable settings
          </p>

          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-full px-6 py-2 shadow-md border border-[#141415]">
              <span className="text-sm font-semibold font-outfit text-gray-400">
                Mode:{' '}
              </span>
              <span className="text-sm font-bold font-outfit text-blue-600 capitalize">
                {settings.mode}{' '}
                {settings.mode === 'time'
                  ? `(${settings.duration}s)`
                  : `(${settings.wordCount} words)`}
              </span>
            </div>
            <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-full px-6 py-2 shadow-md border border-[#141415]">
              <span className="text-sm font-semibold font-outfit text-gray-400">
                Difficulty:{' '}
              </span>
              <span className="text-sm font-bold font-outfit text-purple-600 capitalize">
                {settings.difficulty}
              </span>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-[#141415]">
              <h3 className="text-2xl font-bold font-outfit text-gray-100 mb-6 text-center">
                Test Settings
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Test Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, mode: 'time' }))
                      }
                      className={`p-3 transition-all font-semibold ${
                        settings.mode === 'time'
                          ? 'btn-keyboard-purple text-white translate-y-[2px]'
                          : 'btn-keyboard text-gray-400 hover:text-white'
                      }`}
                    >
                      <Timer className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-semibold">Time Based</div>
                    </button>
                    <button
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, mode: 'words' }))
                      }
                      className={`p-3 transition-all font-semibold ${
                        settings.mode === 'words'
                          ? 'btn-keyboard-purple text-white translate-y-[2px]'
                          : 'btn-keyboard text-gray-400 hover:text-white'
                      }`}
                    >
                      <Target className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-semibold">Word Count</div>
                    </button>
                  </div>
                </div>

                {settings.mode === 'time' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Duration (seconds)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[30, 60, 120, 300].map((duration) => (
                        <button
                          key={duration}
                          onClick={() =>
                            setSettings((prev) => ({ ...prev, duration }))
                          }
                          className={`p-2 transition-all text-sm font-semibold ${
                            settings.duration === duration
                              ? 'btn-keyboard-purple text-white translate-y-[2px]'
                              : 'btn-keyboard text-gray-400 hover:text-white'
                          }`}
                        >
                          {duration < 60 ? `${duration}s` : `${duration / 60}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Word Count
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 100, 200].map((wordCount) => (
                        <button
                          key={wordCount}
                          onClick={() =>
                            setSettings((prev) => ({ ...prev, wordCount }))
                          }
                          className={`p-2 transition-all text-sm font-semibold ${
                            settings.wordCount === wordCount
                              ? 'btn-keyboard-purple text-white translate-y-[2px]'
                              : 'btn-keyboard text-gray-400 hover:text-white'
                          }`}
                        >
                          {wordCount}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() =>
                          setSettings((prev) => ({ ...prev, difficulty }))
                        }
                        className={`p-2 transition-all text-sm font-semibold capitalize ${
                          settings.difficulty === difficulty
                            ? 'btn-keyboard-purple text-white translate-y-[2px]'
                            : 'btn-keyboard text-gray-400 hover:text-white'
                        }`}
                      >
                        {difficulty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => applySettings(settings)}
                >
                  Apply Settings
                </Button>
              </div>
            </div>
          </div>
        )}

        {settings.mode === 'time' && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-b from-[#38383a] to-[#252527] rounded-full shadow-lg border-4 border-[#141415]">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatTime(Math.max(0, stats.timeRemaining))}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Time Left
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-xl p-4 shadow-lg border border-[#141415] hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">WPM</p>
                <p className="text-2xl font-bold text-blue-600">{stats.wpm}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-xl p-4 shadow-lg border border-[#141415] hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Accuracy</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.accuracy}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-xl p-4 shadow-lg border border-[#141415] hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Time</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatTime(stats.timeElapsed)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-xl p-4 shadow-lg border border-[#141415] hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Gross WPM</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.grossWpm}
                </p>
              </div>
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-xl p-4 shadow-lg border border-[#141415] hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Level</p>
                <p
                  className={`text-lg font-bold ${performance.color} flex items-center gap-1`}
                >
                  {performance.icon}
                  <span className="text-sm">{performance.level}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-outfit text-gray-400">
              Progress {settings.mode === 'time' ? '(Time)' : '(Characters)'}
            </span>
            <span className="text-sm font-semibold text-gray-100">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gradient-to-b from-[#38383a] to-[#252527] border border-[#141415] shadow-inner rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#9b6cff] to-[#7641f2] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(155,108,255,0.5)]"
              style={{ width: `${Math.min(100, progress)}%` }}
            ></div>
          </div>
        </div>

        {/* Text Display */}
        <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-xl p-8 shadow-lg border border-[#141415] mb-6">
          <div className="text-xl leading-relaxed font-poppins select-none min-h-[120px]">
            {renderText()}
          </div>
        </div>

        {/* Keyboard Section */}
        <div className="mb-8 flex justify-center w-full transform scale-90 md:scale-100">
          <Keyboard />
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button
            variant="primary"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Button>

          {isStarted && !isFinished && (
            <Button
              variant="primary"
              onClick={togglePause}
            >
              {isPaused ? (
                <Play className="w-5 h-5" />
              ) : (
                <Pause className="w-5 h-5" />
              )}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}

          <Button
            variant="primary"
            onClick={resetTest}
          >
            <RotateCcw className="w-5 h-5" />
            Reset Test
          </Button>
        </div>

        {/* Results */}
        {isFinished && (
          <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-xl p-8 shadow-lg border border-green-200 animate-fade-in">
            <div className="text-center mb-6">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-4xl font-bold text-gray-100 mb-2">
                Test Completed! 🎉
              </h2>
              <p className={`text-2xl font-semibold ${performance.color} mb-4`}>
                Performance Level: {performance.level}
              </p>
              <div className="text-lg text-gray-400">
                Test Mode:{' '}
                <span className="font-semibold capitalize">
                  {settings.mode}
                </span>
                {settings.mode === 'time'
                  ? ` (${settings.duration}s)`
                  : ` (${settings.wordCount} words)`}
                • Difficulty:{' '}
                <span className="font-semibold capitalize">
                  {settings.difficulty}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-lg p-6 shadow-md border border-[#141415]">
                <p className="text-sm text-gray-400 mb-2">Net WPM</p>
                <p className="text-4xl font-bold text-blue-600">{stats.wpm}</p>
              </div>

              <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-lg p-6 shadow-md border border-[#141415]">
                <p className="text-sm text-gray-400 mb-2">Gross WPM</p>
                <p className="text-4xl font-bold text-purple-600">
                  {stats.grossWpm}
                </p>
              </div>

              <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-lg p-6 shadow-md border border-[#141415]">
                <p className="text-sm text-gray-400 mb-2">Accuracy</p>
                <p className="text-4xl font-bold text-green-600">
                  {stats.accuracy}%
                </p>
              </div>

              <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-lg p-6 shadow-md border border-[#141415]">
                <p className="text-sm text-gray-400 mb-2">Total Time</p>
                <p className="text-4xl font-bold text-orange-600">
                  {formatTime(stats.timeElapsed)}
                </p>
              </div>

              <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-lg p-6 shadow-md border border-[#141415]">
                <p className="text-sm text-gray-400 mb-2">Characters</p>
                <p className="text-4xl font-bold text-gray-300">
                  {stats.totalCharacters}
                </p>
              </div>

              <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-lg p-6 shadow-md border border-[#141415]">
                <p className="text-sm text-gray-400 mb-2">Correct</p>
                <p className="text-4xl font-bold text-green-600">
                  {stats.correctCharacters}
                </p>
              </div>

              <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-lg p-6 shadow-md border border-[#141415]">
                <p className="text-sm text-gray-400 mb-2">Incorrect</p>
                <p className="text-4xl font-bold text-red-600">
                  {stats.incorrectCharacters}
                </p>
              </div>

              <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-lg p-6 shadow-md border border-[#141415]">
                <p className="text-sm text-gray-400 mb-2">Errors</p>
                <p className="text-4xl font-bold text-red-600">
                  {Math.round(
                    (stats.incorrectCharacters / stats.totalCharacters) * 100
                  ) || 0}
                  %
                </p>
              </div>
            </div>
          </div>
        )}

        {isPaused && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-2xl p-8 text-center shadow-2xl border border-[#141415]">
              <Pause className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-100 mb-2">
                Test Paused
              </h3>
              <p className="text-gray-400 mb-6">
                Click Resume to continue your typing test
              </p>
              <Button
                variant="success"
                onClick={togglePause}
              >
                <Play className="w-5 h-5" />
                Resume Test
              </Button>
            </div>
          </div>
        )}
      </div>
      </div>

      <Footer />
    </div>
  );
};

export default TypingTest;
