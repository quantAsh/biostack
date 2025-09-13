import React from 'react';
import { Wearable } from '../types';

interface WearableIconProps {
  wearable: Wearable;
  className?: string;
}

export const WearableIcon: React.FC<WearableIconProps> = ({ wearable, className = 'w-8 h-8' }) => {
  const icons: { [key in Wearable]: React.ReactNode } = {
    [Wearable.Oura]: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 19C7.582 19 4 15.418 4 11C4 6.582 7.582 3 12 3C16.418 3 20 6.582 20 11C20 15.418 16.418 19 12 19Z" />
      </svg>
    ),
    [Wearable.Whoop]: (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12H7L9.5 5L14.5 19L17 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    [Wearable.AppleWatch]: (
       <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.5 4H6.5C5.12 4 4 5.12 4 6.5V17.5C4 18.88 5.12 20 6.5 20H17.5C18.88 20 20 18.88 20 17.5V6.5C20 5.12 18.88 4 17.5 4ZM18 17.5C18 17.78 17.78 18 17.5 18H6.5C6.22 18 6 17.78 6 17.5V6.5C6 6.22 6.22 6 6.5 6H17.5C17.78 6 18 6.22 18 6.5V17.5Z"/>
        <path d="M12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17ZM12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9Z"/>
      </svg>
    ),
    [Wearable.Garmin]: (
       <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 12L12 22L22 12L12 2Z" />
      </svg>
    ),
    [Wearable.Fitbit]: (
       <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.3 2C10.12 3.16 10.12 5.07 11.3 6.2L12.7 7.6C13.88 8.76 15.78 8.76 16.95 7.6C18.12 6.43 18.12 4.54 16.95 3.4L15.55 2C14.38 .84 12.48 .84 11.3 2M11.3 17.8L12.7 16.4C13.88 15.24 15.78 15.24 16.95 16.4C18.12 17.57 18.12 19.46 16.95 20.6L15.55 22C14.38 23.16 12.48 23.16 11.3 22M7.05 3.4C5.88 4.57 5.88 6.46 7.05 7.6L8.45 9C9.62 10.16 11.52 10.16 12.7 9L11.3 7.6C10.12 6.43 10.12 4.54 11.3 3.4L9.9 2C8.72 .84 6.82 .84 5.65 2L7.05 3.4M12.7 15L11.3 16.4C10.12 17.57 10.12 19.46 11.3 20.6L9.9 22C8.72 23.16 6.82 23.16 5.65 22L7.05 20.6C5.88 19.43 5.88 17.54 7.05 16.4L8.45 15C9.62 13.84 11.52 13.84 12.7 15Z"/>
      </svg>
    ),
  };

  return icons[wearable] || null;
};