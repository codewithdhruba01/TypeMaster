import React from 'react';
import { Trophy } from 'lucide-react';
import { TypingStats, TestSettings } from '../../types/typing';

interface ResultsModalProps {
  stats: TypingStats;
  performance: { level: string; color: string; icon: React.ReactNode };
  settings: TestSettings;
  formatTime: (seconds: number) => string;
}

const ResultsModal: React.FC<ResultsModalProps> = ({
  stats,
  performance,
  settings,
  formatTime,
}) => {
  return (
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
          <span className="font-semibold capitalize">{settings.mode}</span>
          {settings.mode === 'time'
            ? ` (${settings.duration}s)`
            : ` (${settings.wordCount} words)`}
          • Difficulty:{' '}
          <span className="font-semibold capitalize">{settings.difficulty}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-lg p-6 shadow-md border border-[#141415]">
          <p className="text-sm text-gray-400 mb-2">Net WPM</p>
          <p className="text-4xl font-bold text-blue-600">{stats.wpm}</p>
        </div>

        <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-lg p-6 shadow-md border border-[#141415]">
          <p className="text-sm text-gray-400 mb-2">Gross WPM</p>
          <p className="text-4xl font-bold text-purple-600">{stats.grossWpm}</p>
        </div>

        <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-lg p-6 shadow-md border border-[#141415]">
          <p className="text-sm text-gray-400 mb-2">Accuracy</p>
          <p className="text-4xl font-bold text-green-600">{stats.accuracy}%</p>
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
            {Math.round((stats.incorrectCharacters / stats.totalCharacters) * 100) || 0}
            %
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
