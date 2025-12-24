import { useState, useEffect, useRef } from 'react';

interface SplashScreenProps {
  videoSrc: string;
  onComplete: () => void;
  duration?: number; // Duration in milliseconds before hiding
}

const SplashScreen = ({ videoSrc, onComplete, duration = 3000 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Start fade out after duration
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration);

    // Complete hide after fade animation
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration + 500); // 500ms for fade animation

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onComplete]);

  // Auto-play video logic with mobile support
  useEffect(() => {
    if (videoRef.current) {
      // CRITICAL: Set muted property directly on the DOM element
      // React's 'muted' attribute sometimes isn't enough for strict mobile policies
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      
      // Try to play
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Autoplay prevented by browser:", error);
          // Optional: You could show a static image fallback here if video fails
        });
      }
    }
  }, []);

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
        playsInline // CRITICAL for iOS: prevents video from going fullscreen automatically
        preload="auto"
        loop={false}
      />
      
      {/* Fallback content if video fails (hidden by default) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm opacity-0 pointer-events-none">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-4xl">✝️</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-foreground mt-4">Faith Baptist Church</h1>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
