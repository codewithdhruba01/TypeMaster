import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center mt-12 pb-4 text-gray-500 text-sm font-outfit">
      <p className="flex items-center justify-center gap-1">
        Developed with <span className="text-red-500 text-lg">❤️</span>
      </p>
      <p className="mt-1 opacity-75">
        © {new Date().getFullYear()} Typing Master. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
