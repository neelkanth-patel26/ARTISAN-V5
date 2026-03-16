'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ArtistPreloaderProps {
  onComplete?: () => void;
}

export default function ArtistPreloader({ onComplete }: ArtistPreloaderProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onComplete?.(), 1000);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: "blur(20px)",
            transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
          }}
          className="fixed inset-0 z-[100] bg-neutral-950 flex items-center justify-center overflow-hidden"
        >
          {/* Subtle Background Depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,119,6,0.03),transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

          <div className="relative flex flex-col items-center gap-12">
            {/* Branding Logo */}
            <div className="relative">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-6xl md:text-8xl font-light tracking-[0.3em] text-white"
                style={{ fontFamily: 'ForestSmooth, serif' }}
              >
                ARTISAN
              </motion.h2>

              {/* Light Sweep Effect */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
              />
            </div>

            {/* Context Label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="flex items-center gap-6"
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />
              <p className="text-[9px] tracking-[0.6em] font-black uppercase text-amber-600/60">Creator Sanctuary</p>
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />
            </motion.div>
          </div>

          {/* Iris Reveal Elements */}
          <motion.div
            initial={{ scale: 0 }}
            exit={{ scale: 50 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 border-[0.5px] border-white/5 rounded-full pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
