import React from 'react';

export default function PageTransition({ children }) {
  return (
    <div className="animate-[fadeIn_.25s_ease-out]">
      {children}
    </div>
  );
}