import React from 'react';
import { TestSettings } from '../../types/typing';

interface ProgressBarProps {
  progress: number;
  mode: TestSettings['mode'];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, mode }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-outfit text-gray-400">
          Progress {mode === 'time' ? '(Time)' : '(Characters)'}
        </span>
        <span className="text-sm font-semibold text-gray-100">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gradient-to-b from-[#38383a] to-[#252527] border border-[#141415] shadow-inner rounded-full h-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#9b6cff] to-[#7641f2] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(155,108,255,0.5)]"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
