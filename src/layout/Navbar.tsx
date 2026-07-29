import React from 'react';
import { Github } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="max-w-6xl mx-auto w-full flex justify-end items-center py-4 mb-4">
      <div className="flex gap-3">
        <a
          href="https://x.com/codewithdhruba"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
            <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
          </svg>
        </a>
        <a
          href="https://github.com/codewithdhruba01/TypeMaster"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200 flex items-center justify-center"
        >
          <Github className="w-[22px] h-[22px]" />
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
