import { useState, useEffect, useRef } from 'react';

interface SplashScreenProps {
  videoSrc: string;
  onComplete: () => void;
  duration?: number;
}

const SplashScreen = ({ videoSrc, onComplete, duration = 3000 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 1. FORCE MUTE (Critical for Mobile Autoplay)
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      
      // 2. Play with error catching (for Low Power Mode)
      videoRef.current.play().catch((err) => {
        console.warn("Video autoplay blocked (likely Low Power Mode):", err);
      });
    }

    // 3. Timer to fade out
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration);

    // 4. Timer to remove component
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration + 500); // Wait for fade to finish

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline // REQUIRED for iOS (prevents full-screen popup)
        preload="auto"
      />
      
      {/* Fallback Text (Shows if video is blocked by Low Power Mode) */}
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <h1 className="text-2xl font-bold animate-pulse">Faith Baptist Church</h1>
      </div>
    </div>
  );
};

export default SplashScreen;
