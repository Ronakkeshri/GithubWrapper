"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Database, GitCommit, Code2, Sparkles, Activity, FileJson, GitBranch } from 'lucide-react';

const stages = [
  { text: "Connecting to GitHub API...", icon: Terminal, color: "text-blue-400" },
  { text: "Scanning public repositories...", icon: Database, color: "text-purple-400" },
  { text: "Reading contribution history...", icon: GitCommit, color: "text-green-400" },
  { text: "Analyzing language usage...", icon: Code2, color: "text-yellow-400" },
  { text: "Calculating universal rank...", icon: Activity, color: "text-red-400" },
  { text: "Building your developer persona...", icon: Sparkles, color: "text-cyan-400" },
];

const flavorTexts = [
  "Inspecting your commit DNA...",
  "Measuring your coding consistency...",
  "Finding your strongest language...",
  "Compiling your open source story...",
  "Calculating your dev aura...",
  "Reviewing pull requests...",
  "Counting the forks..."
];

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [flavorIdx, setFlavorIdx] = useState(0);

  useEffect(() => {
    // Smooth, asymptotic progress bar filling up to 95%
    const progressInterval = setInterval(() => {
      setProgress(p => {
        const diff = 95 - p;
        return p + Math.max(diff * 0.05, 0.2);
      });
    }, 100);

    // Stage rotation based on time (assumes a 4-6 second loading time)
    const stageInterval = setInterval(() => {
      setStageIdx(prev => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 1200);

    // Flavor text rotation
    const flavorInterval = setInterval(() => {
      setFlavorIdx(prev => (prev + 1) % flavorTexts.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      clearInterval(flavorInterval);
    };
  }, []);

  const ActiveIcon = stages[stageIdx].icon;

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center p-6 text-center z-50 overflow-hidden">
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-purple-600/30 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-blue-600/30 blur-[150px] rounded-full"
        />
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto space-y-12 flex flex-col items-center">
        
        {/* Central Icon Animation */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-white/10 rounded-full border-dashed"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border border-purple-500/30 rounded-full"
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

        {/* Text Area */}
        <div className="h-24 flex flex-col items-center justify-center space-y-2 w-full">
          <AnimatePresence mode="wait">
            <motion.h2
              key={stageIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl md:text-3xl font-bold text-white tracking-tight"
            >
              {stages[stageIdx].text}
            </motion.h2>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={flavorIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-400 font-medium"
            >
              {flavorTexts[flavorIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-4">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
            <span>Loading Data</span>
            <motion.span>{Math.round(progress)}%</motion.span>
          </div>
          
          <div className="h-2 md:h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.1)] relative">
            <motion.div
              className="h-full rounded-full relative"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
            >
              {/* Neon Glow gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.8)] rounded-full" />
              {/* Shimmer effect inside progress bar */}
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              />
            </motion.div>
          </div>
        </div>

        {/* Floating Code Snippets / Git Nodes Background Decorators */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden h-[400px]">
          {[FileJson, GitBranch, Terminal].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute text-white/5"
              initial={{ y: "100%", x: Math.random() * 200 - 100, rotate: 0 }}
              animate={{ 
                y: "-100%", 
                rotate: 360,
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 5 + Math.random() * 5, 
                repeat: Infinity, 
                delay: i * 2,
                ease: "linear" 
              }}
              style={{ left: `${20 + i * 30}%` }}
            >
              <Icon className="w-12 h-12" />
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
