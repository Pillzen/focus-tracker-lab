
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface RotatingWordsProps {
  words: string[];
  className?: string;
  duration?: number;
}

const RotatingWords = ({ words, className, duration = 3000 }: RotatingWordsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsAnimating(false);
      }, 500); // Half a second for fade out
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  return (
    <div className="relative">
      <span
        className={cn(
          "inline-block transition-opacity duration-500",
          isAnimating ? "opacity-0" : "opacity-100",
          className
        )}
      >
        {words[currentIndex]}
      </span>
    </div>
  );
};

export default RotatingWords;
