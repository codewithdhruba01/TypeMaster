import React from 'react';
import { Timer, Target } from 'lucide-react';
import { TestSettings } from '../../types/typing';
import Button from '../ui/Button';

interface SettingsModalProps {
  settings: TestSettings;
  setSettings: React.Dispatch<React.SetStateAction<TestSettings>>;
  setShowSettings: (show: boolean) => void;
  applySettings: (newSettings: TestSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  setSettings,
  setShowSettings,
  applySettings,
}) => {
  return (
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
                onClick={() => setSettings((prev) => ({ ...prev, mode: 'time' }))}
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
                onClick={() => setSettings((prev) => ({ ...prev, mode: 'words' }))}
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
                    onClick={() => setSettings((prev) => ({ ...prev, duration }))}
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
                    onClick={() => setSettings((prev) => ({ ...prev, wordCount }))}
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
                  onClick={() => setSettings((prev) => ({ ...prev, difficulty }))}
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
          <Button variant="outline" onClick={() => setShowSettings(false)}>
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
  );
};

export default SettingsModal;
