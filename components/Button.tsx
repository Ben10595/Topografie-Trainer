import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'glass';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  fullWidth = false,
  ...props 
}) => {
  // Added: transform, active:scale-95, hover:scale-105 equivalent, smooth transition
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-sm will-change-transform";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/50 hover:scale-[1.02]",
    secondary: "bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 hover:border-slate-500 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.02]",
    danger: "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/30 hover:scale-[1.02]",
    success: "bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-500/30 hover:scale-[1.02]",
    outline: "border-2 border-slate-600 bg-transparent hover:bg-slate-800 text-slate-300 hover:scale-[1.02]",
    glass: "bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md shadow-none hover:shadow-lg hover:shadow-white/10 hover:scale-[1.05]"
  };

  const sizes = {
    xs: "h-7 px-2 text-xs",
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-14 px-8 text-lg"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};