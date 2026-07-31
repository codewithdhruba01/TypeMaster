import React from 'react';
import { Clock, Target, Zap } from 'lucide-react';
import { TypingStats } from '../../types/typing';

interface StatsDisplayProps {
  stats: TypingStats;
  performance: { level: string; color: string; icon: React.ReactNode };
  formatTime: (seconds: number) => string;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, performance, formatTime }) => {
  return (
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
            <p className="text-2xl font-bold text-green-600">{stats.accuracy}%</p>
          </div>
          <Target className="w-8 h-8 text-green-500" />
        </div>
      </div>

      <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-xl p-4 shadow-lg border border-[#141415] hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Time</p>
            <p className="text-2xl font-bold text-purple-600">{formatTime(stats.timeElapsed)}</p>
          </div>
          <Clock className="w-8 h-8 text-purple-500" />
        </div>
      </div>

      <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-xl p-4 shadow-lg border border-[#141415] hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Gross WPM</p>
            <p className="text-2xl font-bold text-orange-600">{stats.grossWpm}</p>
          </div>
          <Zap className="w-8 h-8 text-orange-500" />
        </div>
      </div>

      <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-xl p-4 shadow-lg border border-[#141415] hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Level</p>
            <p className={`text-lg font-bold ${performance.color} flex items-center gap-1`}>
              {performance.icon}
              <span className="text-sm">{performance.level}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;
