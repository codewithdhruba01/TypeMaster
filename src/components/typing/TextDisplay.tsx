import React from 'react';

interface TextDisplayProps {
  currentText: string;
  userInput: string;
  currentIndex: number;
  isStarted: boolean;
  isPaused: boolean;
  isFinished: boolean;
}

const TextDisplay: React.FC<TextDisplayProps> = ({
  currentText,
  userInput,
  currentIndex,
  isStarted,
  isPaused,
  isFinished,
}) => {
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

  return (
    <div className="bg-gradient-to-b from-[#38383a] to-[#252527] rounded-xl p-8 shadow-lg border border-[#141415] mb-6">
      <div className="text-xl leading-relaxed font-poppins select-none min-h-[120px]">
        {renderText()}
      </div>
    </div>
  );
};

export default TextDisplay;
