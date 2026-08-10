"use client";

import type React from 'react';
import { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}

export function OtpInput({ length = 6, value, onChange, onComplete }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (value.length === length) {
      inputRefs.current[length - 1]?.blur();
    }
  }, [value, length]);

  const focusInput = (index: number) => {
    const el = inputRefs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const digit = inputValue.slice(-1);

    if (!/^\d*$/.test(inputValue)) {
      e.target.value = value[index] || '';
      return;
    }

    const newValue = value.split('');
    newValue[index] = digit;
    const nextValue = newValue.join('');
    onChange(nextValue);

    if (digit && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        focusInput(index - 1);
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(paste);
    if (paste.length >= length) {
      inputRefs.current[length - 1]?.blur();
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={() => focusInput(i)}
          className={`w-10 h-12 text-center text-lg font-mono font-bold border-2 rounded transition-colors ${
            value[i]
              ? 'border-[#000000] ring-1 ring-[#000000]'
              : 'border-[#c6c6cd]'
          }`}
        />
      ))}
    </div>
  );
}