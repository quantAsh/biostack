import React from 'react';
import { Achievement } from '../types';

interface AchievementIconProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

const AchievementIcon: React.FC<AchievementIconProps> = ({ achievement, isUnlocked }) => {
  const color = achievement?.color || '#a0aec0';
  const id = achievement.id;

  const iconBaseProps = {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: "1.5",
    stroke: "currentColor",
    className: "w-6 h-6",
  };

  const icons: { [key: string]: React.ReactElement } = {
    'first_stack': <svg {...iconBaseProps}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h12" /></svg>,
    'stack_of_five': <svg {...iconBaseProps}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" /></svg>,
    'cold_warrior': <svg {...iconBaseProps}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m-6.364-16.364L7.05 5.05m11.314 11.314l-1.414-1.414M2 12h2m16 0h2M5.636 18.364L7.05 16.95m11.314-11.314l-1.414-1.414M12 6.75a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z" /></svg>,
    'mindful_master': <svg {...iconBaseProps}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25c-1.12 0-2.15 .25-3.12 .75M12 8.25v2.25M12 8.25a2.25 2.25 0 012.25 2.25M12 8.25a2.25 2.25 0 00-2.25 2.25m2.25-2.25a2.25 2.25 0 01-2.25-2.25M12 8.25a2.25 2.25 0 002.25-2.25m-2.25 2.25v.01M16.5 13.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>,
    'first_journal': <svg {...iconBaseProps}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H21a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0021 3H7.5a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21H12M9 3v6h6" /></svg>,
    'seven_day_journal': <svg {...iconBaseProps}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M9.75 14.25l.008.008 3-3 .008-.008-3 3-.008-.008zM12.75 11.25l3 3 .008-.008-3-3-.008.008z" /></svg>,
    'balanced_stack': <svg {...iconBaseProps}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>,
  };

  const icon = icons[id] || <svg {...iconBaseProps}><path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>;
  
  return (
    <div className={`relative w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-300 overflow-hidden
      ${isUnlocked ? 'bg-gray-800/50' : 'bg-gray-800/50 border border-gray-700'}`}>
      
      {isUnlocked && (
        <div 
          className="absolute inset-0 z-0"
          style={{ background: `radial-gradient(circle, ${color}33, transparent 70%)` }}
        ></div>
      )}

      <div 
        className={`relative z-10 transition-colors duration-300`}
        style={isUnlocked ? { color: color } : { color: 'rgb(107 114 128)' /* text-gray-500 */ }}
      >
        {React.cloneElement(icon)}
      </div>
    </div>
  );
};

export default AchievementIcon;