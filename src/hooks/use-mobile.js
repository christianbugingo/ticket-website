import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check screen width (e.g., less than 768px for mobile)
      const mobileBreakpoint = 768;
      setIsMobile(window.innerWidth < mobileBreakpoint);

      // Optional: Check user agent for mobile devices
      // const userAgent = navigator.userAgent.toLowerCase();
      // const isMobileUA = /mobile|android|iphone|ipad|blackberry/i.test(userAgent);
      // setIsMobile(isMobileUA);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup event listener on unmount
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};