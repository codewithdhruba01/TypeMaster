import React from 'react';
import { Settings, Play, Pause, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';

interface ControlButtonsProps {
  setShowSettings: (show: boolean) => void;
  isStarted: boolean;
  isFinished: boolean;
  isPaused: boolean;
  togglePause: () => void;
  resetTest: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  setShowSettings,
  isStarted,
  isFinished,
  isPaused,
  togglePause,
  resetTest,
}) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center mb-8">
      <Button variant="primary" onClick={() => setShowSettings(true)}>
        <Settings className="w-5 h-5" />
        Settings
      </Button>

      {isStarted && !isFinished && (
        <Button variant="primary" onClick={togglePause}>
          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
      )}

      <Button variant="primary" onClick={resetTest}>
        <RotateCcw className="w-5 h-5" />
        Reset Test
      </Button>
    </div>
  );
};

export default ControlButtons;
