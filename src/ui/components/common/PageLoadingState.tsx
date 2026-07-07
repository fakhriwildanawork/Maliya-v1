import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import * as TOKENS from '../../styles/tokens';
import { cn } from '../../../logic/utils/classNames';

export function Mosaic() {
  return (
    <div className="grid grid-cols-3 gap-1.5 w-12 h-12">
      {[...Array(9)].map((_, i) => (
        <motion.div
          key={i}
          className={cn("w-full h-full rounded-[2px]", TOKENS.BG_PRIMARY)}
          animate={{
            scale: [1, 0.4, 1],
            opacity: [1, 0.3, 1],
            borderRadius: ["2px", "4px", "2px"]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (i % 3 + Math.floor(i / 3)) * 0.15, // Diagonal cascade effect
          }}
        />
      ))}
    </div>
  );
}

interface PageLoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export function PageLoadingState({ isLoading, children }: PageLoadingStateProps) {
  const [shouldShow, setShouldShow] = useState(true);
  const startTimeRef = React.useRef<number>(Date.now());

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 450 - elapsed);
      
      const timer = setTimeout(() => {
        setShouldShow(false);
      }, remaining);
      
      return () => clearTimeout(timer);
    } else {
      setShouldShow(true);
    }
  }, [isLoading]);

  if (shouldShow) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[calc(100vh-10rem)] gap-6">
        <Mosaic />
      </div>
    );
  }

  return <>{children}</>;
}
