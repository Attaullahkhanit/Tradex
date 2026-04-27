import React from 'react';
import { cn } from "@/lib/utils";

export function TradexLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn("shrink-0", className)}
    >
      {/* Blue Arrow (pointing top right) */}
      <path 
        d="M25 65 V 35 L 50 15 L 62 25 L 75 15" 
        stroke="#0ea5e9" 
        strokeWidth="12" 
        strokeLinecap="square" 
        strokeLinejoin="miter"
      />
      <polygon points="65,15 88,5 75,28" fill="#0ea5e9" />
      
      {/* Green Arrow (pointing bottom left) */}
      <path 
        d="M75 35 V 65 L 50 85 L 38 75 L 25 85" 
        stroke="#22c55e" 
        strokeWidth="12" 
        strokeLinecap="square" 
        strokeLinejoin="miter"
      />
      <polygon points="35,85 12,95 25,72" fill="#22c55e" />
    </svg>
  );
}
