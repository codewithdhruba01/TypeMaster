import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Keyboard from './Keyboard';
import { textSamples } from '../data/textSamples';
import { TypingStats, TestSettings } from '../types/typing';
import TestHeader from './typing/TestHeader';
import SettingsModal from './typing/SettingsModal';
import StatsDisplay from './typing/StatsDisplay';
import ProgressBar from './typing/ProgressBar';
import TextDisplay from './typing/TextDisplay';
import ControlButtons from './typing/ControlButtons';
import ResultsModal from './typing/ResultsModal';
import PauseModal from './typing/PauseModal';
import { Trophy, Zap, Target, AlertCircle } from 'lucide-react';

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
          <TestHeader settings={settings} />

          {showSettings && (
            <SettingsModal
              settings={settings}
              setSettings={setSettings}
              setShowSettings={setShowSettings}
              applySettings={applySettings}
            />
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

          <StatsDisplay stats={stats} performance={performance} formatTime={formatTime} />
          
          <ProgressBar progress={progress} mode={settings.mode} />

          <TextDisplay
            currentText={currentText}
            userInput={userInput}
            currentIndex={currentIndex}
            isStarted={isStarted}
            isPaused={isPaused}
            isFinished={isFinished}
          />

          <div className="mb-8 flex justify-center w-full transform scale-90 md:scale-100">
            <Keyboard />
          </div>

          <ControlButtons
            setShowSettings={setShowSettings}
            isStarted={isStarted}
            isFinished={isFinished}
            isPaused={isPaused}
            togglePause={togglePause}
            resetTest={resetTest}
          />

          {isFinished && (
            <ResultsModal
              stats={stats}
              performance={performance}
              settings={settings}
              formatTime={formatTime}
            />
          )}

          {isPaused && <PauseModal togglePause={togglePause} />}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TypingTest;
