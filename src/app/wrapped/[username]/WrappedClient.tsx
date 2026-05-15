"use client";

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import Image from 'next/image';
import { Download, Share2, Github, Star, GitFork, Code2, Trophy, Calendar, Zap, TrendingUp, Activity, Box, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import type { GitHubUser, ContributionData, YearOption } from '@/lib/github';

interface Analytics {
  totalStars: number;
  totalForks: number;
  totalWatchers: number;
  topLanguages: { name: string; count: number; percent: number }[];
  mostStarred: any;
  newestRepo: any;
  oldestRepo: any;
  persona: string;
  personaDesc: string;
  universalRank: string;
  powerLevel: string;
  totalRepos: number;
  contribCurrent: ContributionData | null;
  contribPrev: ContributionData | null;
  eventsApproxCommits: number;
}

interface Props {
  user: GitHubUser;
  analyticsMap: Record<YearOption, Analytics>;
}

export default function WrappedClient({ user, analyticsMap }: Props) {
  const shareRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const currentYear = new Date().getFullYear().toString();
  const prevYear = (new Date().getFullYear() - 1).toString();
  const prevPrevYear = (new Date().getFullYear() - 2).toString();
  const yearOptions = [currentYear, prevYear, prevPrevYear, 'All Time'];

  const [selectedYear, setSelectedYear] = useState<YearOption>(currentYear);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const analytics = analyticsMap[selectedYear];

  const handleDownload = async () => {
    if (!shareRef.current) return;

    setIsExporting(true);

    try {
      const node = shareRef.current;

      const clone = node.cloneNode(true) as HTMLElement;

      clone.style.width = `${node.scrollWidth}px`;
      clone.style.height = `${node.scrollHeight}px`;
      clone.style.position = 'fixed';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.overflow = 'visible';
      clone.style.maxHeight = 'none';
      clone.style.transform = 'none';

      document.body.appendChild(clone);

      const dataUrl = await toPng(clone, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
        width: clone.scrollWidth,
        height: clone.scrollHeight
      });

      document.body.removeChild(clone);

      const link = document.createElement('a');
      link.download = `${user.login}-gitwrapped-${selectedYear}.png`;
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
          title: `${user.login}'s GitWrapped`,
          text: `Check out ${user.login}'s ${selectedYear} GitHub Year in Code! Rank: ${analytics.universalRank}`,
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

  const hasLanguages = analytics.topLanguages && analytics.topLanguages.length > 0;
  const cCurrent = analytics.contribCurrent;
  const cPrev = analytics.contribPrev;

  const totalCommitsCurrent = cCurrent ? cCurrent.totalContributions : analytics.eventsApproxCommits;
  const totalCommitsPrev = cPrev ? cPrev.totalContributions : 0;

  const streakCurrent = cCurrent ? cCurrent.longestStreak : 0;
  const streakPrev = cPrev ? cPrev.longestStreak : 0;

  const renderHeatmap = (contrib: ContributionData | null) => {
    if (!contrib || !contrib.days) {
      if (selectedYear === 'All Time') {
        return (
          <div className="w-full h-32 flex items-center justify-center text-gray-500 border border-white/5 rounded-xl bg-white/5">
            Heatmap not available for All Time view.
          </div>
        );
      }
      return (
        <div className="w-full h-32 flex items-center justify-center text-gray-500 border border-white/5 rounded-xl bg-white/5">
          Detailed heatmap data unavailable (Token required)
        </div>
      );
    }

    const weeks: any[] = [];
    let currentWeek: any[] = [];
    contrib.days.forEach((day, i) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || i === contrib.days.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    const getLevel = (count: number) => {
      if (count === 0) return 'bg-[#161b22] border-white/5';
      if (count <= 3) return 'bg-[#0e4429] border-[#0e4429]';
      if (count <= 6) return 'bg-[#006d32] border-[#006d32]';
      if (count <= 9) return 'bg-[#26a641] border-[#26a641]';
      return 'bg-[#39d353] border-[#39d353]';
    };

    return (
      <div className="flex gap-1 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1">
            {week.map((day: any, j: number) => (
              <div
                key={j}
                className={`w-3 h-3 md:w-4 md:h-4 rounded-[2px] border ${getLevel(day.contributionCount)}`}
                title={`${day.date}: ${day.contributionCount} contributions`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderComparisonRow = (label: string, valPrev: string | number, valCurrent: string | number, isBetter: boolean) => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 border-b border-white/5 gap-4">
      <div className="text-gray-400 font-medium text-lg w-full md:w-1/3">{label}</div>
      <div className="flex items-center justify-between w-full md:w-2/3">
        <div className="text-gray-500 text-xl w-1/2">{valPrev || '-'}</div>
        <div className={`text-xl font-bold w-1/2 flex items-center gap-2 ${isBetter ? 'text-green-400' : 'text-white'}`}>
          {valCurrent || '-'}
          {isBetter && <TrendingUp className="w-4 h-4" />}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden relative">
      <motion.div style={{ y }} className="fixed inset-0 pointer-events-none opacity-50 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full" />
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pt-16 md:pb-32 relative z-10">
        {/* Year Selector */}
        <div className="flex justify-center mb-16 md:mb-24">
          <div className="glass flex items-center gap-1 p-1.5 rounded-full border border-white/10 shadow-2xl backdrop-blur-xl">
            {(yearOptions as YearOption[]).map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${selectedYear === year ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
              >
                {selectedYear === year && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-white/10 border border-white/20 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{year}</span>
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedYear}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-32"
          >
            {/* SECTION 1 — HERO ANALYTICS DASHBOARD */}
            <section className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <Image
                  src={user.avatar_url}
                  alt={user.login}
                  width={120}
                  height={120}
                  className="rounded-2xl border border-white/10 shadow-2xl"
                  unoptimized
                />
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-white/10 text-xs font-semibold text-purple-400 tracking-widest uppercase">
                    {selectedYear === 'All Time' ? 'All Time Code Journey' : `${selectedYear} Year in Code`}
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight">{user.name || user.login}</h1>
                  <p className="text-gray-400 text-lg md:text-xl">@{user.login}</p>
                </div>
              </div>

              {selectedYear !== 'All Time' && (
                <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Activity className="w-6 h-6 text-green-400" />
                      Contribution Activity
                    </h2>
                    <span className="text-gray-400 font-medium">{totalCommitsCurrent} contributions in {selectedYear}</span>
                  </div>
                  {renderHeatmap(cCurrent)}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="glass p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group border border-white/5 hover:border-purple-500/30 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Trophy className="w-16 h-16" /></div>
                  <span className="text-gray-400 text-sm font-medium mb-2">Universal Rank</span>
                  <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{analytics.universalRank}</span>
                </div>

                <div className="glass p-6 rounded-2xl flex flex-col justify-center border border-white/5 hover:border-blue-500/30 transition-colors">
                  <span className="text-gray-400 text-sm font-medium mb-2">Power Level</span>
                  <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{analytics.powerLevel}</span>
                </div>

                <div className="glass p-6 rounded-2xl flex flex-col justify-center border border-white/5 hover:border-green-500/30 transition-colors">
                  <span className="text-gray-400 text-sm font-medium mb-2">Longest Streak</span>
                  <span className="text-2xl md:text-3xl font-black text-white">{selectedYear === 'All Time' ? 'N/A' : `${streakCurrent} days`}</span>
                </div>

                <div className="glass p-6 rounded-2xl flex flex-col justify-center border border-white/5 hover:border-pink-500/30 transition-colors">
                  <span className="text-gray-400 text-sm font-medium mb-2">Total Stars</span>
                  <span className="text-2xl md:text-3xl font-black text-white">{analytics.totalStars}</span>
                </div>

                <div className="glass p-6 rounded-2xl flex flex-col justify-center border border-white/5">
                  <span className="text-gray-400 text-sm font-medium mb-2">Top Language</span>
                  <span className="text-xl md:text-2xl font-bold text-white truncate">{hasLanguages ? analytics.topLanguages[0].name : 'N/A'}</span>
                </div>

                <div className="glass p-6 rounded-2xl flex flex-col justify-center border border-white/5">
                  <span className="text-gray-400 text-sm font-medium mb-2">Most Active Month</span>
                  <span className="text-xl md:text-2xl font-bold text-white">{selectedYear === 'All Time' ? 'N/A' : (cCurrent?.activeMonth || 'N/A')}</span>
                </div>

                <div className="glass p-6 rounded-2xl flex flex-col justify-center border border-white/5">
                  <span className="text-gray-400 text-sm font-medium mb-2">Most Active Day</span>
                  <span className="text-xl md:text-2xl font-bold text-white">{selectedYear === 'All Time' ? 'N/A' : (cCurrent?.activeDay || 'N/A')}</span>
                </div>

                <div className="glass p-6 rounded-2xl flex flex-col justify-center border border-white/5">
                  <span className="text-gray-400 text-sm font-medium mb-2">Total Commits ({selectedYear})</span>
                  <span className="text-xl md:text-2xl font-bold text-white">{selectedYear === 'All Time' ? 'N/A' : totalCommitsCurrent}</span>
                </div>
              </div>
            </section>

            {/* SECTION 2 — YEAR COMPARISON */}
            {selectedYear !== 'All Time' && cPrev && (
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-purple-400" />
                  <h2 className="text-3xl md:text-4xl font-black">{parseInt(selectedYear) - 1} vs {selectedYear}</h2>
                </div>

                <div className="glass-card p-6 md:p-10 rounded-3xl border border-white/10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-white/10 gap-4 mb-4">
                    <div className="w-full md:w-1/3 text-sm text-gray-500 uppercase tracking-widest font-bold">Metric</div>
                    <div className="flex w-full md:w-2/3">
                      <div className="w-1/2 text-sm text-gray-500 uppercase tracking-widest font-bold">{parseInt(selectedYear) - 1}</div>
                      <div className="w-1/2 text-sm text-purple-400 uppercase tracking-widest font-bold">{selectedYear}</div>
                    </div>
                  </div>

                  {renderComparisonRow("Total Contributions", totalCommitsPrev, totalCommitsCurrent, totalCommitsCurrent > totalCommitsPrev)}
                  {renderComparisonRow("Longest Streak", `${streakPrev} days`, `${streakCurrent} days`, streakCurrent > streakPrev)}
                  {renderComparisonRow("Most Active Month", cPrev.activeMonth || '-', cCurrent?.activeMonth || '-', false)}
                  {renderComparisonRow("Most Active Day", cPrev.activeDay || '-', cCurrent?.activeDay || '-', false)}
                </div>
              </section>
            )}

            {/* SECTION 3 — LANGUAGE INSIGHTS */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <Code2 className="w-8 h-8 text-blue-400" />
                <h2 className="text-3xl md:text-4xl font-black">Language Insights</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
                  <h3 className="text-xl font-bold text-gray-300">Usage Breakdown</h3>
                  <div className="space-y-5">
                    {hasLanguages ? analytics.topLanguages.map((lang, idx) => (
                      <div key={lang.name} className="space-y-2">
                        <div className="flex justify-between text-lg font-medium">
                          <span>{lang.name}</span>
                          <span className="text-blue-400">{lang.percent}%</span>
                        </div>
                        <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${lang.percent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                          />
                        </div>
                      </div>
                    )) : <p className="text-gray-500">No language data found.</p>}
                  </div>
                </div>

                <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col justify-center h-full min-h-[300px]">
                  {hasLanguages && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.topLanguages} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 30 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 14 }} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {analytics.topLanguages.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#color${index})`} />
                          ))}
                        </Bar>
                        <defs>
                          {analytics.topLanguages.map((_, index) => (
                            <linearGradient key={`color${index}`} id={`color${index}`} x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          ))}
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 4 — REPOSITORY INSIGHTS */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <Box className="w-8 h-8 text-orange-400" />
                <h2 className="text-3xl md:text-4xl font-black">Repository Insights</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-8 rounded-3xl border border-white/10 space-y-4 hover:border-yellow-500/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-bold">Most Starred Repo</div>
                  <div className="text-2xl font-bold truncate" title={analytics.mostStarred?.name}>{analytics.mostStarred?.name || 'N/A'}</div>
                  <div className="text-yellow-400 font-semibold">{analytics.mostStarred?.stargazers_count || 0} Stars</div>
                </div>

                <div className="glass p-8 rounded-3xl border border-white/10 space-y-4 hover:border-green-500/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-bold">Newest Repo</div>
                  <div className="text-2xl font-bold truncate" title={analytics.newestRepo?.name}>{analytics.newestRepo?.name || 'N/A'}</div>
                  <div className="text-gray-400">{analytics.newestRepo ? new Date(analytics.newestRepo.created_at).getFullYear() : '-'}</div>
                </div>

                <div className="glass p-8 rounded-3xl border border-white/10 space-y-4 hover:border-blue-500/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                    <Clock className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-bold">Oldest Repo</div>
                  <div className="text-2xl font-bold truncate" title={analytics.oldestRepo?.name}>{analytics.oldestRepo?.name || 'N/A'}</div>
                  <div className="text-gray-400">{analytics.oldestRepo ? new Date(analytics.oldestRepo.created_at).getFullYear() : '-'}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="glass-card p-6 text-center rounded-2xl border border-white/5">
                  <div className="text-4xl font-black text-white mb-2">{analytics.totalRepos}</div>
                  <div className="text-sm text-gray-400 font-medium">Total Repos</div>
                </div>
                <div className="glass-card p-6 text-center rounded-2xl border border-white/5">
                  <div className="text-4xl font-black text-white mb-2">{analytics.totalForks}</div>
                  <div className="text-sm text-gray-400 font-medium">Total Forks</div>
                </div>
                <div className="glass-card p-6 text-center rounded-2xl border border-white/5">
                  <div className="text-4xl font-black text-white mb-2">{analytics.totalWatchers}</div>
                  <div className="text-sm text-gray-400 font-medium">Total Watchers</div>
                </div>
              </div>
            </section>

            {/* SECTION 5 — DEVELOPER PERSONA */}
            <section className="glass-card relative overflow-hidden rounded-[3rem] p-10 md:p-16 text-center border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.1)]">
              <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[100%] bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-red-500/5 blur-[100px] pointer-events-none" />

              <Trophy className="w-20 h-20 md:w-24 md:h-24 mx-auto text-yellow-500 mb-8" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-400 uppercase tracking-widest mb-4">Developer Persona</h2>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 drop-shadow-2xl mb-8">
                {analytics.persona}
              </h1>
              <p className="text-xl md:text-3xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                "{analytics.personaDesc}"
              </p>
            </section>

            {/* SECTION 6 — SHARE CARD */}
            <section className="flex flex-col items-center justify-center pt-12 pb-24 space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-black">Share Your Year</h2>
                <p className="text-gray-400">Download your GitWrapped {selectedYear} card and share it with the world.</p>
              </div>

              <div
                ref={shareRef}
                className="relative w-full max-w-[420px] aspect-[4/5] bg-[#050505] rounded-[2rem] overflow-hidden p-8 flex flex-col justify-between border border-white/20 shadow-2xl"
              >
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-600/40 blur-[80px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/30 blur-[80px] rounded-full" />

                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1 truncate max-w-[200px]">{user.login}</h2>
                    <p className="text-purple-400 font-bold tracking-wide">GitWrapped {selectedYear}</p>
                  </div>
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    crossOrigin="anonymous"
                    className="w-16 h-16 rounded-full border-2 border-white/20 shadow-lg object-cover"
                  />
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-center py-6 space-y-6">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Persona</div>
                    <div className="text-4xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                      {analytics.persona}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-md">
                      <div className="text-xs text-gray-400 mb-1">Contributions</div>
                      <div className="text-xl font-bold text-white">{selectedYear === 'All Time' ? 'N/A' : totalCommitsCurrent}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-md">
                      <div className="text-xs text-gray-400 mb-1">Universal Rank</div>
                      <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{analytics.universalRank}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-md">
                      <div className="text-xs text-gray-400 mb-1">Top Language</div>
                      <div className="text-xl font-bold text-white truncate">{hasLanguages ? analytics.topLanguages[0].name : 'N/A'}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-md">
                      <div className="text-xs text-gray-400 mb-1">Total Stars</div>
                      <div className="text-xl font-bold text-white">{analytics.totalStars}</div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex justify-between items-center pt-5 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm text-gray-400 font-medium tracking-wide">
                    <Github className="w-5 h-5 text-white" />
                    <span className="text-white">GitWrapped</span>
                  </div>
                </div>
              </div>

              {!isExporting && (
                <div className="flex gap-4 flex-wrap justify-center">
                  <button onClick={handleDownload} className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    <Download className="w-5 h-5" /> Download Card
                  </button>
                  <button onClick={handleShare} className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition-transform hover:scale-105 backdrop-blur">
                    <Share2 className="w-5 h-5" /> Share Link
                  </button>
                </div>
              )}
            </section>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
