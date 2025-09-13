import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 6h16M4 12h10M4 18h16" />
  </svg>
);

export default Logo;