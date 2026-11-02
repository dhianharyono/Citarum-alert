'use client';

import React, { useEffect, useState, useRef } from 'react';

interface CountingNumberProps {
  value?: number;
  duration?: number;
  isLoading?: boolean;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function CountingNumber({
  value = 0,
  duration = 900,
  isLoading = false,
  className = '',
  prefix = '',
  suffix = '',
}: CountingNumberProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const prevValueRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Loading animation: rapid counting / ticker effect
  useEffect(() => {
    if (!isLoading) return;

    let count = 0;
    const interval = setInterval(() => {
      // Rapidly flicker/cycle numbers around a plausible range to simulate active telemetry counting
      count = (count + 1) % 10;
      setDisplayValue(Math.floor(Math.random() * 8) + 1);
    }, 60);

    return () => clearInterval(interval);
  }, [isLoading]);

  // When value changes or when loading finishes, animate counting up/down to target value
  useEffect(() => {
    if (isLoading) return;

    const startValue = prevValueRef.current;
    const endValue = Number.isFinite(value) ? value : 0;
    const diff = endValue - startValue;

    if (diff === 0 && displayValue === endValue) {
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic curve: fast start, soft gentle landing
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + diff * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [value, duration, isLoading]);

  return (
    <span
      className={`tabular-nums inline-block transition-opacity duration-200 ${
        isLoading ? 'animate-pulse opacity-75' : 'opacity-100'
      } ${className}`}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

