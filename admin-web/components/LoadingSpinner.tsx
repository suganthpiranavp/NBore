import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  sublabel?: string;
}

export default function LoadingSpinner({
  label = 'Loading Borewell Fleet Portal...',
  sublabel = 'Connecting to database and verifying session...',
}: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-blue-100 rounded-2xl p-8 shadow-xl max-w-sm w-full text-center space-y-4">
        <div className="relative mx-auto w-14 h-14 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          <span className="absolute text-xl">⛏️</span>
        </div>
        <div>
          <h3 className="text-base font-extrabold text-blue-950">{label}</h3>
          <p className="text-xs text-slate-500 mt-1">{sublabel}</p>
        </div>
      </div>
    </div>
  );
}
