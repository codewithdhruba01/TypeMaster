import React from 'react';
import { TestSettings } from '../../types/typing';

interface TestHeaderProps {
  settings: TestSettings;
}

const TestHeader: React.FC<TestHeaderProps> = ({ settings }) => {
  return (
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
  );
};

export default TestHeader;
