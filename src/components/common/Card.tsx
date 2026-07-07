/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined';
  className?: string;
}

export default function Card({ children, className, variant = 'elevated', ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        {
          "bg-slate-900/85 border border-slate-800 shadow-xl shadow-slate-950/40 backdrop-blur-md": variant === 'elevated',
          "bg-slate-900 border border-transparent": variant === 'filled',
          "border border-slate-700 bg-transparent": variant === 'outlined'
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
