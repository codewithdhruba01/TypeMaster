import React from 'react';
import { Pause, Play } from 'lucide-react';
import Button from '../ui/Button';

interface PauseModalProps {
  togglePause: () => void;
}

const PauseModal: React.FC<PauseModalProps> = ({ togglePause }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-2xl p-8 text-center shadow-2xl border border-[#141415]">
        <Pause className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-100 mb-2">Test Paused</h3>
        <p className="text-gray-400 mb-6">
          Click Resume to continue your typing test
        </p>
        <Button variant="success" onClick={togglePause}>
          <Play className="w-5 h-5" />
          Resume Test
        </Button>
      </div>
    </div>
  );
};

export default PauseModal;
