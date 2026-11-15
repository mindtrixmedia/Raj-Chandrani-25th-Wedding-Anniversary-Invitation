// ponytail: unified 2-stage intro video player with clean state and smooth transition
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { introVideo, ganeshIntroVideo, introPoster, backgroundImg } from '../assets';

interface IntroVideoProps {
  onComplete: () => void;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'ganesh' | 'intro'>('ganesh');
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayingCelebration, setIsPlayingCelebration] = useState(false);
  const [hasStartedCelebration, setHasStartedCelebration] = useState(false);

  const ganeshRef = useRef<HTMLVideoElement | null>(null);
  const introRef = useRef<HTMLVideoElement | null>(null);

  // Auto-play ganesh video on mount with robust sound handling
  useEffect(() => {
    const v = ganeshRef.current;
    if (!v) return;

    v.muted = false;
    v.volume = 1.0;

    v.play()
      .then(() => setIsMuted(false))
      .catch(() => {
        // Fallback to muted autoplay if browser blocks sound before user interaction
        v.muted = true;
        setIsMuted(true);
        v.play().catch(() => setStep('intro'));
      });
  }, []);

  const handleNextStep = () => {
    ganeshRef.current?.pause();
    setStep('intro');
    setIsMuted(false);
  };

  const handlePlayCelebration = () => {
    if (hasStartedCelebration) return;
    setHasStartedCelebration(true);
    const v = introRef.current;
    if (!v) {
      onComplete();
      return;
    }
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(onComplete);
    });
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = ganeshRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) v.volume = 1.0;
    setIsMuted(v.muted);
  };

  return (
    <motion.div
      key="intro-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
      onClick={step === 'intro' ? handlePlayCelebration : undefined}
      className={`fixed inset-0 z-50 bg-[#F4DCB3] flex justify-center overflow-hidden select-none ${
        step === 'intro' ? 'cursor-pointer' : 'cursor-default'
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
        <AnimatePresence mode="wait">
          {step === 'ganesh' ? (
            <motion.div
              key="ganesh"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="w-full h-full relative flex items-center justify-center bg-black"
            >
              <video
                ref={ganeshRef}
                src={ganeshIntroVideo}
                playsInline
                autoPlay
                preload="auto"
                onEnded={handleNextStep}
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Skip button in top right */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextStep();
                }}
                className="absolute top-5 right-5 z-30 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-[#F9E7B9]/40 text-[#F9E7B9] font-cinzel text-[11px] tracking-wider uppercase font-semibold transition-all cursor-pointer"
              >
                Skip &rarr;
              </button>

              {/* Floating Mute/Unmute button in bottom right */}
              <div className="absolute inset-x-0 bottom-14 sm:bottom-16 z-30 pointer-events-none flex justify-end px-4">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={!isMuted ? 'Mute video sound' : 'Play video sound'}
                  title={!isMuted ? 'Mute Sound' : 'Play Sound'}
                  className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 active:scale-95 backdrop-blur-md border border-[#F9E7B9]/40 text-[#F9E7B9] flex items-center justify-center transition-all cursor-pointer shadow-lg"
                >
                  {!isMuted ? (
                    <Volume2 className="w-4 h-4 text-[#F9E7B9]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-[#F9E7B9]" />
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="w-full h-full relative"
            >
              <video
                ref={introRef}
                src={introVideo}
                poster={introPoster}
                playsInline
                preload="metadata"
                muted={!hasStartedCelebration}
                onPlaying={() => setIsPlayingCelebration(true)}
                onEnded={onComplete}
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Video Cover Image shown until video frames render */}
              {!isPlayingCelebration && (
                <img
                  src={introPoster}
                  alt="Video Cover"
                  className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
                  loading="lazy"
                  decoding="async"
                />
              )}

              {/* 'Click to Open' indicator at 68% height */}
              {!hasStartedCelebration && (
                <div className="absolute top-[68%] -translate-y-1/2 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-pulse">
                  <div className="px-6 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-[#F9E7B9]/50 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                    <span className="font-cinzel text-xs tracking-[0.26em] text-[#F9E7B9] uppercase font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] whitespace-nowrap">
                      Click to open
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
