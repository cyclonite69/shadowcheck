/**
 * TruncatedCell - Text cell with automatic truncation and tooltip
 *
 * Displays text with ellipsis when it overflows, and shows a tooltip
 * with the full content on hover (only when truncated).
 */

import { useRef, useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TruncatedCellProps {
  text: string | null | undefined;
  className?: string;
  fallback?: React.ReactNode;
}

export function TruncatedCell({ text, className = '', fallback }: TruncatedCellProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    // Check if text is truncated by comparing scroll width vs client width
    const checkTruncation = () => {
      setIsTruncated(element.scrollWidth > element.clientWidth);
    };

    checkTruncation();

    // Recheck on window resize
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text]);

  const displayText = text || fallback;

  // If no text, just render fallback
  if (!text && fallback) {
    return <>{fallback}</>;
  }

  // If not truncated, just render text without tooltip
  if (!isTruncated) {
    return (
      <span
        ref={textRef}
        className={`block truncate ${className}`}
      >
        {displayText}
      </span>
    );
  }

  // If truncated, wrap in tooltip
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            ref={textRef}
            className={`block truncate ${className}`}
          >
            {displayText}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-md break-words bg-slate-950 border-slate-700 text-slate-200 text-xs"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
