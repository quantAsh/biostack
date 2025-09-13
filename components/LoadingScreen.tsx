import React from 'react';
import Logo from './Logo';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#0A0A0A] z-50 flex flex-col items-center justify-center text-white">
      <div className="flex items-center space-x-4 mb-4">
        <Logo className="text-gray-200 w-10 h-10" />
        <h1 className="font-title text-5xl font-extrabold text-gray-100 tracking-tighter">
          BiohackStack
        </h1>
      </div>
      <div className="flex items-center gap-2 text-cyan-300">
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Initializing Life OS...</span>
      </div>
    </div>
  );
};

export default LoadingScreen;