import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, RotateCcw, Trophy, Target, Zap, AlertCircle, Settings, Play, Pause, Timer } from 'lucide-react';

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

const textSamples = {
  easy: [
    "The cat sat on the mat. It was a sunny day. The birds were singing in the trees. Children played in the park nearby.",
    "I like to read books. My favorite color is blue. The sun is bright today. We went to the store yesterday.",
    "Dogs are loyal pets. They love to play fetch. Cats are independent animals. Fish swim in the ocean.",
  ],
  medium: [
    "Technology has revolutionized the way we communicate, work, and live. From smartphones to artificial intelligence, innovation continues to shape our future in unprecedented ways.",
    "The art of programming requires patience, creativity, and logical thinking. Writing clean and efficient code is both a science and an art form that demands continuous learning.",
    "Climate change is one of the most pressing issues of our time. Sustainable practices and renewable energy sources are essential for our planet's future generations.",
  ],
  hard: [
    "Quantum mechanics represents a fundamental theory in physics that describes the physical properties of nature at the scale of atoms and subatomic particles, challenging our classical understanding of reality.",
    "Cryptocurrency and blockchain technology have emerged as revolutionary concepts that could potentially transform traditional financial systems through decentralized, transparent, and secure transactions.",
    "Artificial intelligence and machine learning algorithms are increasingly sophisticated, capable of processing vast amounts of data to identify patterns and make predictions with remarkable accuracy.",
  ]
};

const TypingTest: React.FC = () => {
  const [settings, setSettings] = useState<TestSettings>({
    duration: 60,
    mode: 'time',
    difficulty: 'medium',
    wordCount: 50
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
    netWpm: 0
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateText = useCallback(() => {
    const samples = textSamples[settings.difficulty];
    if (settings.mode === 'words') {
      // Generate text with specific word count
      let words: string[] = [];
      while (words.length < settings.wordCount) {
        const randomSample = samples[Math.floor(Math.random() * samples.length)];
        const sampleWords = randomSample.split(' ');
        words = [...words, ...sampleWords];
      }
      return words.slice(0, settings.wordCount).join(' ');
    } else {
      // For time mode, use longer text
      return samples[Math.floor(Math.random() * samples.length)];
    }
  }, [settings]);

  const calculateStats = useCallback((input: string, timeElapsed: number): TypingStats => {
    const totalCharacters = input.length;
    let correctCharacters = 0;
    
    for (let i = 0; i < Math.min(input.length, currentText.length); i++) {
      if (input[i] === currentText[i]) {
        correctCharacters++;
      }
    }
    
    const incorrectCharacters = totalCharacters - correctCharacters;
    const accuracy = totalCharacters > 0 ? (correctCharacters / totalCharacters) * 100 : 0;
    
    const timeInMinutes = timeElapsed / 60;
    const grossWpm = timeInMinutes > 0 ? Math.round((totalCharacters / 5) / timeInMinutes) : 0;
    const netWpm = timeInMinutes > 0 ? Math.round(((correctCharacters / 5) - (incorrectCharacters / 5)) / timeInMinutes) : 0;
    
    const timeRemaining = settings.mode === 'time' ? Math.max(0, settings.duration - timeElapsed) : 0;
    
    return {
      wpm: Math.max(0, netWpm),
      accuracy: Math.round(accuracy),
      timeElapsed,
      timeRemaining,
      totalCharacters,
      correctCharacters,
      incorrectCharacters,
      grossWpm,
      netWpm: Math.max(0, netWpm)
    };
  }, [currentText, settings]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (startTime && !isPaused) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const newStats = calculateStats(userInput, elapsed);
        setStats(newStats);
        
        // Check if time is up for time mode
        if (settings.mode === 'time' && elapsed >= settings.duration) {
          setIsFinished(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }
    }, 100);
  }, [startTime, isPaused, userInput, calculateStats, settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!isStarted && value.length > 0) {
      setIsStarted(true);
      setStartTime(Date.now());
      startTimer();
    }
    
    if (value.length <= currentText.length) {
      setUserInput(value);
      setCurrentIndex(value.length);
      
      // Check if test is complete for words mode
      if (settings.mode === 'words' && value.length === currentText.length) {
        setIsFinished(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        const finalStats = calculateStats(value, stats.timeElapsed);
        setStats(finalStats);
      }
    }
  };

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
        const pausedTime = Date.now() - startTime - stats.timeElapsed * 1000;
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
      netWpm: 0
    });
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setCurrentText(generateText());
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const applySettings = (newSettings: TestSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
    resetTest();
  };

  const renderText = () => {
    return currentText.split('').map((char, index) => {
      let className = 'transition-all duration-200 ';
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += 'text-green-600 bg-green-100 rounded px-0.5';
        } else {
          className += 'text-red-600 bg-red-100 rounded px-0.5';
        }
      } else if (index === currentIndex && isStarted && !isPaused && !isFinished) {
        className += 'text-blue-600 bg-blue-200 rounded px-0.5 animate-pulse';
      } else {
        className += 'text-gray-700';
      }
      
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const getPerformanceLevel = (wpm: number): { level: string; color: string; icon: React.ReactNode } => {
    if (wpm >= 80) return { level: 'Expert', color: 'text-purple-600', icon: <Trophy className="w-5 h-5" /> };
    if (wpm >= 60) return { level: 'Advanced', color: 'text-blue-600', icon: <Zap className="w-5 h-5" /> };
    if (wpm >= 40) return { level: 'Intermediate', color: 'text-green-600', icon: <Target className="w-5 h-5" /> };
    if (wpm >= 20) return { level: 'Beginner', color: 'text-yellow-600', icon: <AlertCircle className="w-5 h-5" /> };
    return { level: 'Novice', color: 'text-gray-600', icon: <AlertCircle className="w-5 h-5" /> };
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setCurrentText(generateText());
    setStats(prev => ({
      ...prev,
      timeRemaining: settings.mode === 'time' ? settings.duration : 0
    }));
  }, [generateText, settings]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
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

  const progress = settings.mode === 'time' 
    ? ((settings.duration - stats.timeRemaining) / settings.duration) * 100
    : (userInput.length / currentText.length) * 100;
  
  const performance = getPerformanceLevel(stats.wpm);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
            ⚡ Professional Typing Test
          </h1>
          <p className="text-gray-600 text-xl mb-6">
            Test your typing speed and accuracy with customizable settings
          </p>
          
          {/* Test Mode Indicator */}
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="bg-white rounded-full px-6 py-2 shadow-md border">
              <span className="text-sm font-semibold text-gray-600">Mode: </span>
              <span className="text-sm font-bold text-blue-600 capitalize">
                {settings.mode} {settings.mode === 'time' ? `(${settings.duration}s)` : `(${settings.wordCount} words)`}
              </span>
            </div>
            <div className="bg-white rounded-full px-6 py-2 shadow-md border">
              <span className="text-sm font-semibold text-gray-600">Difficulty: </span>
              <span className="text-sm font-bold text-purple-600 capitalize">{settings.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Test Settings</h3>
              
              <div className="space-y-6">
                {/* Test Mode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Test Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, mode: 'time' }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.mode === 'time'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Timer className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-semibold">Time Based</div>
                    </button>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, mode: 'words' }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.mode === 'words'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Target className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-semibold">Word Count</div>
                    </button>
                  </div>
                </div>

                {/* Duration/Word Count */}
                {settings.mode === 'time' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Duration (seconds)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[30, 60, 120, 300].map(duration => (
                        <button
                          key={duration}
                          onClick={() => setSettings(prev => ({ ...prev, duration }))}
                          className={`p-2 rounded-lg border-2 transition-all text-sm font-semibold ${
                            settings.duration === duration
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {duration < 60 ? `${duration}s` : `${duration/60}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Word Count</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 100, 200].map(wordCount => (
                        <button
                          key={wordCount}
                          onClick={() => setSettings(prev => ({ ...prev, wordCount }))}
                          className={`p-2 rounded-lg border-2 transition-all text-sm font-semibold ${
                            settings.wordCount === wordCount
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {wordCount}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['easy', 'medium', 'hard'] as const).map(difficulty => (
                      <button
                        key={difficulty}
                        onClick={() => setSettings(prev => ({ ...prev, difficulty }))}
                        className={`p-2 rounded-lg border-2 transition-all text-sm font-semibold capitalize ${
                          settings.difficulty === difficulty
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {difficulty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => applySettings(settings)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Apply Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Timer Display */}
        {settings.mode === 'time' && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-lg border-4 border-blue-100">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatTime(Math.max(0, stats.timeRemaining))}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Time Left</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">WPM</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.wpm}
                </p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.accuracy}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatTime(stats.timeElapsed)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gross WPM</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.grossWpm}
                </p>
              </div>
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className={`text-lg font-bold ${performance.color} flex items-center gap-1`}>
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
            <span className="text-sm text-gray-600">
              Progress {settings.mode === 'time' ? '(Time)' : '(Characters)'}
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progress)}%` }}
            ></div>
          </div>
        </div>

        {/* Text Display */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-6">
          <div className="text-xl leading-relaxed font-mono select-none min-h-[120px]">
            {renderText()}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={isFinished || isPaused}
            placeholder={isPaused ? "Test is paused..." : "Start typing here..."}
            className="w-full text-xl p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-300 font-mono disabled:bg-gray-50"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          
          {isStarted && !isFinished && (
            <button
              onClick={togglePause}
              className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                isPaused 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                  : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'
              }`}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
          
          <button
            onClick={resetTest}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Test
          </button>
        </div>

        {/* Results */}
        {isFinished && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 shadow-lg border border-green-200 animate-fade-in">
            <div className="text-center mb-6">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
                Test Completed! 🎉
              </h2>
              <p className={`text-2xl font-semibold ${performance.color} mb-4`}>
                Performance Level: {performance.level}
              </p>
              <div className="text-lg text-gray-600">
                Test Mode: <span className="font-semibold capitalize">{settings.mode}</span>
                {settings.mode === 'time' ? ` (${settings.duration}s)` : ` (${settings.wordCount} words)`}
                • Difficulty: <span className="font-semibold capitalize">{settings.difficulty}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <p className="text-sm text-gray-600 mb-2">Net WPM</p>
                <p className="text-4xl font-bold text-blue-600">{stats.wpm}</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <p className="text-sm text-gray-600 mb-2">Gross WPM</p>
                <p className="text-4xl font-bold text-purple-600">{stats.grossWpm}</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <p className="text-sm text-gray-600 mb-2">Accuracy</p>
                <p className="text-4xl font-bold text-green-600">{stats.accuracy}%</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <p className="text-sm text-gray-600 mb-2">Total Time</p>
                <p className="text-4xl font-bold text-orange-600">{formatTime(stats.timeElapsed)}</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <p className="text-sm text-gray-600 mb-2">Characters</p>
                <p className="text-4xl font-bold text-gray-700">{stats.totalCharacters}</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <p className="text-sm text-gray-600 mb-2">Correct</p>
                <p className="text-4xl font-bold text-green-600">{stats.correctCharacters}</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <p className="text-sm text-gray-600 mb-2">Incorrect</p>
                <p className="text-4xl font-bold text-red-600">{stats.incorrectCharacters}</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <p className="text-sm text-gray-600 mb-2">Errors</p>
                <p className="text-4xl font-bold text-red-600">{Math.round((stats.incorrectCharacters / stats.totalCharacters) * 100) || 0}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
              <Pause className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Test Paused</h3>
              <p className="text-gray-600 mb-6">Click Resume to continue your typing test</p>
              <button
                onClick={togglePause}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                Resume Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingTest;