"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Activity, Target, Zap } from 'lucide-react';

const stages = [
  { text: "Preparing the Arena...", icon: Swords, color: "text-red-500" },
  { text: "Summoning combatants...", icon: Target, color: "text-orange-500" },
  { text: "Measuring power levels...", icon: Activity, color: "text-purple-500" },
  { text: "Calculating ultimate winner...", icon: Zap, color: "text-yellow-500" }
];

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(p => {
        const diff = 95 - p;
        return p + Math.max(diff * 0.05, 0.2);
      });
    }, 100);

    const stageInterval = setInterval(() => {
      setStageIdx(prev => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
  }, []);

  const ActiveIcon = stages[stageIdx].icon;

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center p-6 text-center z-50 overflow-hidden">
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-red-600/30 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[30%] right-[20%] w-[40%] h-[40%] bg-orange-600/30 blur-[150px] rounded-full"
        />
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto space-y-12 flex flex-col items-center">
        
        <div className="relative w-32 h-32 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-red-500/20 rounded-full border-dashed"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={stageIdx}
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 45 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className={`w-16 h-16 flex items-center justify-center rounded-2xl glass border border-white/10 shadow-2xl backdrop-blur-xl ${stages[stageIdx].color}`}
            >
              <ActiveIcon className="w-8 h-8" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="h-16 flex flex-col items-center justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.h2
              key={stageIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl md:text-3xl font-black text-white tracking-tight"
            >
              {stages[stageIdx].text}
            </motion.h2>
          </AnimatePresence>
        </div>

        <div className="w-full space-y-4">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
            <span>Loading Data</span>
            <motion.span>{Math.round(progress)}%</motion.span>
          </div>
          
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
            <motion.div
              className="h-full rounded-full relative"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] rounded-full" />
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              />
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}
