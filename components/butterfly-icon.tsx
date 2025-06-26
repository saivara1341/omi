"use client"

import React from "react"

interface ButterflyIconProps {
  className?: string
  size?: number
}

export function ButterflyIcon({ className = "", size = 24 }: ButterflyIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Butterfly body */}
      <path
        d="M12 2C12.5523 2 13 2.44772 13 3V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V3C11 2.44772 11.4477 2 12 2Z"
        fill="currentColor"
        opacity="0.8"
      />
      
      {/* Left upper wing */}
      <path
        d="M11 4C11 4 8.5 3.5 6.5 5.5C4.5 7.5 4 10 5 11.5C6 13 8 12.5 9.5 11.5C10.5 10.8 11 9 11 7.5V4Z"
        fill="currentColor"
        opacity="0.9"
      />
      
      {/* Right upper wing */}
      <path
        d="M13 4C13 4 15.5 3.5 17.5 5.5C19.5 7.5 20 10 19 11.5C18 13 16 12.5 14.5 11.5C13.5 10.8 13 9 13 7.5V4Z"
        fill="currentColor"
        opacity="0.9"
      />
      
      {/* Left lower wing */}
      <path
        d="M11 12C11 12 8.5 12.5 6.5 14.5C4.5 16.5 4 19 5 20.5C6 22 8 21.5 9.5 20.5C10.5 19.8 11 18 11 16.5V12Z"
        fill="currentColor"
        opacity="0.7"
      />
      
      {/* Right lower wing */}
      <path
        d="M13 12C13 12 15.5 12.5 17.5 14.5C19.5 16.5 20 19 19 20.5C18 22 16 21.5 14.5 20.5C13.5 19.8 13 18 13 16.5V12Z"
        fill="currentColor"
        opacity="0.7"
      />
      
      {/* Wing patterns - left upper */}
      <circle cx="8" cy="7" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="7" cy="9" r="0.5" fill="currentColor" opacity="0.3" />
      
      {/* Wing patterns - right upper */}
      <circle cx="16" cy="7" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="17" cy="9" r="0.5" fill="currentColor" opacity="0.3" />
      
      {/* Wing patterns - left lower */}
      <circle cx="8" cy="16" r="0.8" fill="currentColor" opacity="0.4" />
      <circle cx="7" cy="18" r="0.4" fill="currentColor" opacity="0.3" />
      
      {/* Wing patterns - right lower */}
      <circle cx="16" cy="16" r="0.8" fill="currentColor" opacity="0.4" />
      <circle cx="17" cy="18" r="0.4" fill="currentColor" opacity="0.3" />
      
      {/* Antennae */}
      <path
        d="M11.5 2.5C11.5 2.5 10.5 1.5 9.5 1.5C9 1.5 8.5 2 8.5 2.5"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M12.5 2.5C12.5 2.5 13.5 1.5 14.5 1.5C15 1.5 15.5 2 15.5 2.5"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      
      {/* Antennae tips */}
      <circle cx="8.5" cy="2.5" r="0.5" fill="currentColor" opacity="0.5" />
      <circle cx="15.5" cy="2.5" r="0.5" fill="currentColor" opacity="0.5" />
    </svg>
  )
}