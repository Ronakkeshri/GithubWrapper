"use client";

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import Image from 'next/image';
import { Download, Share2, Github, Star, GitFork, Code2, Trophy, Swords, Zap, Activity, Users, Box, Medal, Crown } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import type { GitHubUser } from '@/lib/github';

interface CompareProps {
  user1: { profile: GitHubUser; analytics: any };
  user2: { profile: GitHubUser; analytics: any };
}

export default function CompareClient({ user1, user2 }: CompareProps) {
  const shareRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const handleDownload = async () => {
    if (!shareRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(shareRef.current, { 
        quality: 1, 
        pixelRatio: 3, 
        cacheBust: true,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const link = document.createElement('a');
      link.download = `${user1.profile.login}-vs-${user2.profile.login}-battle.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Developer Battle: ${user1.profile.login} vs ${user2.profile.login}`,
          text: `Check out who won the ultimate developer battle on GitWrapped!`,
          url
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const a1 = user1.analytics;
  const a2 = user2.analytics;

  // Calculate scores for final winner
  let score1 = 0;
  let score2 = 0;

  const compareMetric = (val1: number, val2: number) => {
    if (val1 > val2) {
      score1++;
      return 1;
    }
    if (val2 > val1) {
      score2++;
      return 2;
    }
    return 0; // tie
  };

  // Pre-calculate to highlight winners
  const commitsWinner = compareMetric(a1.eventsApproxCommits, a2.eventsApproxCommits);
  const starsWinner = compareMetric(a1.totalStars, a2.totalStars);
  const streakWinner = compareMetric(
    a1.contribCurrent?.longestStreak || 0,
    a2.contribCurrent?.longestStreak || 0
  );
  const reposWinner = compareMetric(a1.totalRepos, a2.totalRepos);
  const followersWinner = compareMetric(user1.profile.followers, user2.profile.followers);
  const forksWinner = compareMetric(a1.totalForks, a2.totalForks);
  const watchersWinner = compareMetric(a1.totalWatchers, a2.totalWatchers);

  const getWinnerData = () => {
    if (score1 > score2) return { winner: user1.profile, score: score1, color: 'from-blue-500 to-cyan-500' };
    if (score2 > score1) return { winner: user2.profile, score: score2, color: 'from-purple-500 to-pink-500' };
    return { winner: null, score: score1, color: 'from-gray-400 to-gray-600' }; // Tie
  };
  const finalResult = getWinnerData();

  const renderRow = (label: string, icon: any, val1: string | number, val2: string | number, winner: 1 | 2 | 0) => (
    <div className="flex flex-col md:flex-row items-center justify-between py-6 border-b border-white/5 gap-4 relative hover:bg-white/[0.02] transition-colors rounded-xl px-4">
      <div className="w-full md:w-1/3 flex items-center gap-3 text-gray-400 font-bold uppercase tracking-wider text-sm">
        {icon} {label}
      </div>
      <div className="flex w-full md:w-2/3 justify-between items-center text-xl md:text-2xl font-black">
        <div className={`w-1/2 text-left md:text-center ${winner === 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 scale-110 drop-shadow-lg' : 'text-gray-500'} transition-all`}>
          {val1} {winner === 1 && <Crown className="w-4 h-4 inline-block text-yellow-400 ml-1" />}
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className={`w-1/2 text-right md:text-center ${winner === 2 ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 scale-110 drop-shadow-lg' : 'text-gray-500'} transition-all`}>
          {winner === 2 && <Crown className="w-4 h-4 inline-block text-yellow-400 mr-1" />} {val2}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 overflow-x-hidden relative">
      <motion.div style={{ y }} className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <div className="absolute top-[0%] left-[-20%] w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[0%] right-[-20%] w-[60%] h-[60%] bg-purple-600/20 blur-[150px] rounded-full" />
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 space-y-32">
        
        {/* SECTION 1 — HERO BATTLE */}
        <section className="flex flex-col items-center justify-center space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-red-500/30 text-xs font-bold text-red-400 tracking-widest uppercase shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <Swords className="w-4 h-4" /> Developer Battle {new Date().getFullYear()}
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-4xl">
            {/* User 1 */}
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 rounded-full" />
                <Image src={user1.profile.avatar_url} alt={user1.profile.login} width={160} height={160} className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-blue-500 shadow-2xl z-10 object-cover" unoptimized />
              </div>
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{user1.profile.login}</h2>
                <p className="text-gray-400 font-bold">{a1.universalRank}</p>
              </div>
            </motion.div>

            {/* VS Badge */}
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15, delay: 0.2 }}
              className="relative z-20 flex-shrink-0"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#0a0a0a] border-2 border-red-500 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                <span className="text-3xl md:text-4xl font-black italic text-red-500">VS</span>
              </div>
            </motion.div>

            {/* User 2 */}
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-40 rounded-full" />
                <Image src={user2.profile.avatar_url} alt={user2.profile.login} width={160} height={160} className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-purple-500 shadow-2xl z-10 object-cover" unoptimized />
              </div>
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{user2.profile.login}</h2>
                <p className="text-gray-400 font-bold">{a2.universalRank}</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2 — QUICK STATS BATTLE */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-8"
        >
          <div className="flex justify-between items-center text-xs md:text-sm font-black uppercase tracking-widest text-gray-500 px-4 md:px-12">
            <span className="text-blue-400">{user1.profile.login}</span>
            <span>Tale of the Tape</span>
            <span className="text-purple-400">{user2.profile.login}</span>
          </div>

          <div className="glass-card p-4 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-xl">
            {renderRow("Contributions", <Activity className="w-5 h-5" />, a1.eventsApproxCommits, a2.eventsApproxCommits, commitsWinner)}
            {renderRow("Total Stars", <Star className="w-5 h-5" />, a1.totalStars, a2.totalStars, starsWinner)}
            {renderRow("Longest Streak", <Zap className="w-5 h-5" />, `${a1.contribCurrent?.longestStreak || 0}d`, `${a2.contribCurrent?.longestStreak || 0}d`, streakWinner)}
            {renderRow("Followers", <Users className="w-5 h-5" />, user1.profile.followers, user2.profile.followers, followersWinner)}
            {renderRow("Repositories", <Box className="w-5 h-5" />, a1.totalRepos, a2.totalRepos, reposWinner)}
            
            <div className="flex flex-col md:flex-row items-center justify-between py-6 gap-4 px-4 hover:bg-white/[0.02] transition-colors rounded-xl">
              <div className="w-full md:w-1/3 flex items-center gap-3 text-gray-400 font-bold uppercase tracking-wider text-sm">
                <Medal className="w-5 h-5" /> Power Level
              </div>
              <div className="flex w-full md:w-2/3 justify-between items-center text-lg md:text-xl font-black">
                <div className="w-1/2 text-left md:text-center text-blue-400">{a1.powerLevel}</div>
                <div className="w-px h-8 bg-white/10" />
                <div className="w-1/2 text-right md:text-center text-purple-400">{a2.powerLevel}</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 3 — LANGUAGE BATTLE */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-black flex items-center justify-center gap-3"><Code2 className="w-8 h-8 text-yellow-500" /> Language Warfare</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User 1 Languages */}
            <div className="glass p-8 rounded-3xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-6">{user1.profile.login}'s Stack</h3>
              <div className="space-y-5">
                {a1.topLanguages && a1.topLanguages.length > 0 ? a1.topLanguages.slice(0, 4).map((lang: any, idx: number) => (
                  <div key={lang.name} className="space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>{lang.name}</span>
                      <span className="text-blue-400">{lang.percent}%</span>
                    </div>
                    <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} whileInView={{ width: `${lang.percent}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                      />
                    </div>
                  </div>
                )) : <p className="text-gray-500">No language data.</p>}
              </div>
            </div>

            {/* User 2 Languages */}
            <div className="glass p-8 rounded-3xl border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">{user2.profile.login}'s Stack</h3>
              <div className="space-y-5">
                {a2.topLanguages && a2.topLanguages.length > 0 ? a2.topLanguages.slice(0, 4).map((lang: any, idx: number) => (
                  <div key={lang.name} className="space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>{lang.name}</span>
                      <span className="text-purple-400">{lang.percent}%</span>
                    </div>
                    <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} whileInView={{ width: `${lang.percent}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      />
                    </div>
                  </div>
                )) : <p className="text-gray-500">No language data.</p>}
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 4 — DEVELOPER PERSONA BATTLE */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-8"
        >
          <div className="glass-card rounded-[3rem] p-10 md:p-16 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-red-500 to-purple-500" />
            
            <h2 className="text-center text-sm font-black uppercase tracking-widest text-gray-500 mb-12">Clash of Personas</h2>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="w-full md:w-5/12 text-center md:text-right space-y-4">
                <div className="text-blue-400 font-bold uppercase text-xs">{user1.profile.login}</div>
                <h3 className="text-4xl font-black text-white leading-tight">{a1.persona}</h3>
                <p className="text-gray-400 italic">"{a1.personaDesc}"</p>
              </div>
              
              <div className="w-full md:w-2/12 flex justify-center">
                <Swords className="w-12 h-12 text-red-500/50" />
              </div>

              <div className="w-full md:w-5/12 text-center md:text-left space-y-4">
                <div className="text-purple-400 font-bold uppercase text-xs">{user2.profile.login}</div>
                <h3 className="text-4xl font-black text-white leading-tight">{a2.persona}</h3>
                <p className="text-gray-400 italic">"{a2.personaDesc}"</p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <div className="inline-block px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur text-xl md:text-2xl font-medium">
                {score1 > score2 
                  ? <span className="text-blue-400 font-bold">{user1.profile.login}</span>
                  : score2 > score1 
                    ? <span className="text-purple-400 font-bold">{user2.profile.login}</span> 
                    : "Both"} ships code, but {score1 > score2 ? user1.profile.login : user2.profile.login} dominates the open source arena today.
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 5 — FINAL WINNER & SHARE CARD */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center pt-12 pb-24 space-y-16"
        >
          <div className="text-center space-y-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-yellow-500/20 blur-[100px] rounded-full pointer-events-none" />
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
            <h2 className="text-2xl font-bold text-gray-400 uppercase tracking-widest">Ultimate Winner</h2>
            {finalResult.winner ? (
              <h1 className={`text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r ${finalResult.color} drop-shadow-2xl`}>
                {finalResult.winner.login}
              </h1>
            ) : (
              <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl">
                DRAW!
              </h1>
            )}
            <p className="text-xl text-gray-400 font-bold">Score: {score1} - {score2}</p>
          </div>

          <div 
            ref={shareRef}
            className="relative w-full max-w-[600px] bg-[#0a0a0a] rounded-[2rem] overflow-hidden p-8 border border-white/20 shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-1/2 h-full bg-blue-600/10" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-purple-600/10" />
            
            <div className="relative z-10 text-center mb-8">
              <h2 className="text-3xl font-black text-white uppercase tracking-widest">Developer Battle</h2>
              <p className="text-red-500 font-bold">GitWrapped {new Date().getFullYear()}</p>
            </div>

            <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="text-center w-5/12">
                <img src={user1.profile.avatar_url} crossOrigin="anonymous" className={`w-20 h-20 mx-auto rounded-full border-4 ${score1 > score2 ? 'border-yellow-400' : 'border-blue-500/50'} object-cover mb-3`} />
                <h3 className="font-bold text-xl text-white truncate">{user1.profile.login}</h3>
                <p className="text-blue-400 text-sm font-bold">{score1} Points</p>
              </div>
              <div className="w-2/12 text-center text-2xl font-black text-red-500 italic">VS</div>
              <div className="text-center w-5/12">
                <img src={user2.profile.avatar_url} crossOrigin="anonymous" className={`w-20 h-20 mx-auto rounded-full border-4 ${score2 > score1 ? 'border-yellow-400' : 'border-purple-500/50'} object-cover mb-3`} />
                <h3 className="font-bold text-xl text-white truncate">{user2.profile.login}</h3>
                <p className="text-purple-400 text-sm font-bold">{score2} Points</p>
              </div>
            </div>

            <div className="relative z-10 bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <div className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-1">Winner</div>
              <div className="text-3xl font-black text-yellow-400">{finalResult.winner ? finalResult.winner.login : "IT'S A TIE"}</div>
            </div>
            
            <div className="relative z-10 mt-6 text-center text-xs text-gray-500 font-bold tracking-widest flex items-center justify-center gap-2">
              <Github className="w-4 h-4 text-white" /> GitWrapped
            </div>
          </div>

          {!isExporting && (
            <div className="flex gap-4 flex-wrap justify-center">
              <button onClick={handleDownload} className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <Download className="w-5 h-5" /> Download Battle Card
              </button>
              <button onClick={handleShare} className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition-transform hover:scale-105 backdrop-blur">
                <Share2 className="w-5 h-5" /> Share Results
              </button>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
