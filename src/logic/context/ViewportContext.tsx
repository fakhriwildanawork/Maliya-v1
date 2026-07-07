import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ViewportContextType {
  isCompact: boolean; // Mobile/Narrow
  isMedium: boolean;  // Tablet
  isWide: boolean;    // Desktop
  isPortrait: boolean;
  isLandscape: boolean;
}

const ViewportContext = createContext<ViewportContextType | undefined>(undefined);

export function ViewportProvider({ children }: { children: ReactNode }) {
  const [viewport, setViewport] = useState<ViewportContextType>({
    isCompact: false,
    isMedium: false,
    isWide: true,
    isPortrait: false,
    isLandscape: true,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({
        isCompact: width < 768,
        isMedium: width >= 768 && width < 1024,
        isWide: width >= 1024,
        isPortrait: height > width,
        isLandscape: width >= height,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ViewportContext.Provider value={viewport}>
      {children}
    </ViewportContext.Provider>
  );
}

export function useViewport() {
  const context = useContext(ViewportContext);
  if (context === undefined) {
    throw new Error('useViewport must be used within a ViewportProvider');
  }
  return context;
}
