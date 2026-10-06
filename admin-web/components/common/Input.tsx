'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  badge?: string;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightElement,
  badge,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 tracking-wide">
            {label}
          </label>
          {badge && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
              {badge}
            </span>
          )}
        </div>
      )}

      <div className="relative rounded-xl shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`block w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition
            focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
            ${leftIcon ? 'pl-9' : ''}
            ${rightElement ? 'pr-12' : ''}
            ${error ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200'}
            ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
