"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isRateLimit = error.message.includes("RATE_LIMIT") || error.message.toLowerCase().includes("rate limit");

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass-card p-8 md:p-12 rounded-3xl max-w-lg w-full flex flex-col items-center space-y-6"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h2 className="text-3xl font-bold text-white">
          {isRateLimit ? "Rate Limit Exceeded" : "Oops! Something broke."}
        </h2>
        
        <p className="text-gray-400 text-lg">
          {isRateLimit 
            ? "We've hit the GitHub API rate limit. Please try again later or configure a GITHUB_TOKEN if you're the site owner." 
            : "We couldn't generate the wrapped experience. The GitHub API might be down or the data is temporarily unavailable."}
        </p>

        <div className="flex flex-col w-full space-y-3 mt-4">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
          <Link 
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
