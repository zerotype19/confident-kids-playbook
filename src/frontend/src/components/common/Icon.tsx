import React from 'react';

interface IconProps {
  name: 'check-circle' | 'x-circle' | 'chevron-down' | 'chevron-up' | 'magnifying-glass' | 'funnel' | 'x-mark';
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = 'w-5 h-5' }) => {
  const icons = {
    'check-circle': (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.04l2.25 3.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
      </svg>
    ),
    'x-circle': (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
      </svg>
    ),
    'chevron-down': (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
      </svg>
    ),
    'chevron-up': (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z" clipRule="evenodd" />
      </svg>
    ),
    'magnifying-glass': (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8.25 10.875a2.625 2.625 0 115.25 0 2.625 2.625 0 01-5.25 0z" />
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.125 4.5a4.125 4.125 0 100 8.25 4.125 4.125 0 000-8.25zM12 3.75a8.625 8.625 0 100 17.25 8.625 8.625 0 000-17.25z" clipRule="evenodd" />
      </svg>
    ),
    'funnel': (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M3.792 2.938A49.069 49.069 0 0112 3.75c2.797 0 5.487.46 8.207 1.812a1.786 1.786 0 010 2.541c-.411.416-.852.823-1.314 1.221a.75.75 0 11-1.06-1.06c.415-.415.814-.84 1.2-1.276a.25.25 0 000-.354 47.774 47.774 0 00-7.207-1.612.75.75 0 01-.14-1.494A49.069 49.069 0 013.792 2.938zM3.792 7.5a.75.75 0 01-.14 1.494 47.774 47.774 0 007.207 1.612.75.75 0 01.14 1.494A49.069 49.069 0 013.792 7.5zM3.792 12a.75.75 0 01-.14 1.494 47.774 47.774 0 007.207 1.612.75.75 0 01.14 1.494A49.069 49.069 0 013.792 12zM3.792 16.5a.75.75 0 01-.14 1.494 47.774 47.774 0 007.207 1.612.75.75 0 01.14 1.494A49.069 49.069 0 013.792 16.5z" clipRule="evenodd" />
      </svg>
    ),
    'x-mark': (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
      </svg>
    ),
  };

  return icons[name] || null;
};

export default Icon; 