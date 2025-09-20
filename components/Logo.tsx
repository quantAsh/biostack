import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, showText = false }) => (
  <div className={`flex items-center ${className || ''}`.trim()}>
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16M4 12h10M4 18h16" />
    </svg>
    {showText && (
      <span className="ml-2 font-semibold text-gray-100 tracking-tight">Biostack</span>
    )}
  </div>
);

export default Logo;