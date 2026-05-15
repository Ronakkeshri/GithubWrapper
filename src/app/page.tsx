"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ArrowRight, Sparkles, Activity, Star, Code2, Swords } from 'lucide-react';

export default function Home() {
  const [mode, setMode] = useState<'solo' | 'compare'>('solo');
  const [username, setUsername] = useState('');
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGenerateSolo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsLoading(true);
    router.push(`/wrapped/${username.trim()}`);
  };

  const handleGenerateCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user1.trim() || !user2.trim()) return;
    setIsLoading(true);
    router.push(`/compare/${user1.trim()}-vs-${user2.trim()}`);
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 bg-[#050505] text-white selection:bg-purple-500/30">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/30 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/30 blur-[120px]" />

      <div className="max-w-4xl w-full z-10 flex flex-col items-center text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm font-medium text-purple-300 mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Decode Your Developer DNA</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Unwrap Your <br className="hidden md:block" />
            <span className="text-gradient">GitHub Journey</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Explore your GitHub journey with stunning insights, contribution stats, and developer achievements.
          </p>
        </motion.div>

        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="flex items-center p-1 bg-white/5 border border-white/10 rounded-full glass"
        >
          <button
            onClick={() => setMode('solo')}
            className={`px-6 py-2.5 rounded-full font-semibold transition-colors duration-200 ${mode === 'solo' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Solo Wrapped
          </button>
          <button
            onClick={() => setMode('compare')}
            className={`px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 transition-colors duration-200 ${mode === 'compare' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <Swords className="w-4 h-4" /> Compare With Friend
          </button>
        </motion.div>

        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {mode === 'solo' ? (
              <motion.form
                key="solo-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleGenerateSolo}
                className="w-full relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <div className="relative flex items-center bg-[#0a0a0a] rounded-2xl border border-white/10 p-2 overflow-hidden shadow-2xl">
                  <div className="pl-4 pr-3 text-gray-400">
                    <Github className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter GitHub username"
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm sm:text-lg py-3 focus:ring-0" required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="shrink-0 bg-white text-black px-4 sm:px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"                  >
                    {isLoading ? 'Generating...' : 'Generate'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="compare-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleGenerateCompare}
                className="w-full relative group space-y-4"
              >
                <div className="space-y-3">
                  <div className="relative flex items-center bg-[#0a0a0a] rounded-2xl border border-white/10 p-2 overflow-hidden shadow-xl">
                    <div className="pl-4 pr-3 text-gray-400"><Github className="w-5 h-5" /></div>
                    <input
                      type="text"
                      value={user1}
                      onChange={(e) => setUser1(e.target.value)}
                      placeholder="Your GitHub username"
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg py-2 focus:ring-0"
                      required
                    />
                  </div>
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-[#050505] p-2 rounded-full border border-white/10">
                      <span className="text-red-500 font-black italic">VS</span>
                    </div>
                  </div>
                  <div className="relative flex items-center bg-[#0a0a0a] rounded-2xl border border-white/10 p-2 overflow-hidden shadow-xl">
                    <div className="pl-4 pr-3 text-gray-400"><Github className="w-5 h-5" /></div>
                    <input
                      type="text"
                      value={user2}
                      onChange={(e) => setUser2(e.target.value)}
                      placeholder="Friend's GitHub username"
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg py-2 focus:ring-0"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                >
                  {isLoading ? 'Preparing Arena...' : 'Compare Now ⚔️'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mt-12 md:mt-16"
        >
          {[
            { icon: Activity, title: "Deep Analytics", desc: "Insights into your commits, PRs, and activity patterns." },
            { icon: Code2, title: "Top Languages", desc: "Visualize the stack you've been building with." },
            { icon: Star, title: "Developer Persona", desc: "Are you a Night Owl or an Open Source Warrior?" }
          ].map((feature, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl flex flex-col items-center text-center space-y-4 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-purple-400">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-gray-200">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
