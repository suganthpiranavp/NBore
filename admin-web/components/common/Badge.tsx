'use client';

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

export default function Badge({
  children,
  variant = 'blue',
  size = 'md',
}: BadgeProps) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantStyles = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg tracking-wide ${sizeStyles[size]} ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
