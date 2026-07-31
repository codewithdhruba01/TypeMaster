import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'outline' | 'custom';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'custom', 
  className = '', 
  ...props 
}) => {
  let variantClass = '';
  
  if (variant === 'primary') {
    variantClass = 'btn-keyboard flex items-center gap-2 px-6 py-3 font-semibold hover:text-gray-300';
  } else if (variant === 'secondary') {
    variantClass = 'btn-keyboard-purple text-white font-semibold transition-all px-4 py-2';
  } else if (variant === 'success') {
    variantClass = 'px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2 mx-auto';
  } else if (variant === 'outline') {
    variantClass = 'btn-keyboard text-gray-400 hover:text-white font-semibold transition-all px-4 py-2 flex-1';
  }

  return (
    <button className={`${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
};

export default Button;
