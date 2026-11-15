// ponytail: cinematic 2-stage intro with unmuted ganesh-intro by default followed by click-to-open intro video
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { introVideo, ganeshIntroVideo, introPoster, backgroundImg } from '../assets';

interface IntroVideoProps {
  onComplete: () => void;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'ganesh' | 'intro'>('ganesh');
  const ganeshRef = useRef<HTMLVideoElement | null>(null);
  const introRef = useRef<HTMLVideoElement | null>(null);

  const [hasStartedIntro, setHasStartedIntro] = useState(false);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Auto-play ganesh video with sound on mount
  useEffect(() => {
    const ganesh = ganeshRef.current;
    if (!ganesh) return;

    // Set unmuted with full volume every time
    ganesh.muted = false;
    ganesh.volume = 1.0;

    ganesh.play().catch(() => {
      // If browser autoplay policy strictly blocks unmuted media before gesture,
      // start playback and immediately unmute on first gesture
      if (ganesh) {
        ganesh.muted = true;
        ganesh.play().catch(() => {
          setStep('intro');
        });
      }
    });

    // Ensure audio is fully unmuted on first screen touch/click
    const handleFirstGesture = () => {
      if (ganesh) {
        ganesh.muted = false;
        ganesh.volume = 1.0;
      }
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  const handleGaneshEnded = () => {
    if (ganeshRef.current) {
      try {
        ganeshRef.current.pause();
      } catch {
        // Ignore pause errors
      }
    }
    setStep('intro');
  };

  const handleStartIntroPlay = async () => {
    const video = introRef.current;
    if (!video) {
      onComplete();
      return;
    }

    setHasStartedIntro(true);

    try {
      video.muted = false;
      await video.play();
    } catch {
      // Fallback if browser blocks unmuted audio on first gesture
      try {
        video.muted = true;
        await video.play();
      } catch {
        onComplete();
      }
    }
  };

  const handleIntroEnded = () => {
    if (isEnding) return;
    setIsEnding(true);
    if (introRef.current) {
      try {
        introRef.current.pause();
      } catch {
        // Ignore pause errors on exit
      }
    }
    onComplete();
  };

  const handleScreenClick = () => {
    if (isEnding) return;

    if (step === 'ganesh') {
      if (ganeshRef.current) {
        ganeshRef.current.muted = false;
        ganeshRef.current.volume = 1.0;
      }
      return;
    }

    if (step === 'intro' && !hasStartedIntro) {
      handleStartIntroPlay();
    }
  };

  return (
    <motion.div
      key="intro-overlay"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.35, ease: 'easeOut' },
      }}
      onClick={handleScreenClick}
      className={`fixed inset-0 z-50 bg-[#F4DCB3] flex justify-center overflow-hidden select-none ${
        isEnding ? 'pointer-events-none' : 'cursor-pointer'
      }`}
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: '100% auto',
        backgroundRepeat: 'repeat-y',
        backgroundAttachment: 'fixed',
      }}
      aria-label="Play Intro Video"
    >
      <div className="w-full max-w-[450px] h-full relative bg-[#F4DCB3] shadow-2xl overflow-hidden sm:border-x border-[#D5C0A5]/70 flex items-center justify-center">
        {/* Step 1: Ganesh Intro Video (Plays with sound by default) */}
        {step === 'ganesh' && (
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <video
              ref={ganeshRef}
              src={ganeshIntroVideo}
              playsInline
              autoPlay
              preload="auto"
              onEnded={handleGaneshEnded}
              className="w-full h-full object-cover"
            />

            {/* Skip button in top right */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleGaneshEnded();
              }}
              className="absolute top-5 right-5 z-30 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-[#F9E7B9]/40 text-[#F9E7B9] font-cinzel text-[11px] tracking-wider uppercase font-semibold transition-all cursor-pointer"
            >
              Skip &rarr;
            </button>
          </div>
        )}

        {/* Step 2: Main Intro Video (Preloads during Step 1; exact existing design) */}
        <div className={`w-full h-full relative ${step === 'intro' ? 'block' : 'hidden'}`}>
          <video
            ref={introRef}
            src={introVideo}
            poster={introPoster}
            playsInline
            preload="auto"
            muted={!hasStartedIntro}
            onPlaying={() => setIsIntroPlaying(true)}
            onEnded={handleIntroEnded}
            className="w-full h-full object-cover"
          />

          {/* Video Cover Image (intro-poster.png) shown until video starts actively rendering frames */}
          <AnimatePresence>
            {!isIntroPlaying && (
              <motion.img
                src={introPoster}
                alt="Video Cover"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
                loading="eager"
              />
            )}
          </AnimatePresence>

          {/* 'Click to Open' indicator at 68% height with breathing whole-element opacity */}
          <AnimatePresence>
            {!hasStartedIntro && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: [0.4, 1, 0.4],
                  y: 0,
                }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                transition={{
                  opacity: {
                    repeat: Infinity,
                    duration: 2.2,
                    ease: 'easeInOut',
                  },
                  y: { duration: 0.5, ease: 'easeOut' },
                }}
                className="absolute top-[68%] -translate-y-1/2 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
              >
                <div className="px-6 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-[#F9E7B9]/50 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                  <span className="font-cinzel text-xs tracking-[0.26em] text-[#F9E7B9] uppercase font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] whitespace-nowrap">
                    Click to open
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
