import React from 'react';

interface CustomButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  className?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
}) => {
  const baseStyles =
    'rounded-full px-6 py-2 font-semibold focus:outline-none transition-all duration-200';

  const variants: Record<string, string> = {
    primary: 'bg-kidoova-yellow text-kidoova-green shadow-yellowSoft hover:bg-yellow-400',
    secondary: 'bg-kidoova-green text-white shadow-kidoova hover:bg-emerald-700',
  };

  return (
    <button 
      onClick={onClick} 
      type={type} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default CustomButton; 