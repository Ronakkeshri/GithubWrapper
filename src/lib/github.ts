import { cache } from 'react';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  default_branch: string;
}

export interface GitHubEvent {
  type: string;
  created_at: string;
  repo: {
    name: string;
  };
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
  weekday: number;
}

export interface ContributionData {
  totalContributions: number;
  days: ContributionDay[];
  longestStreak: number;
  activeDay: string;
  activeMonth: string;
}

const getHeaders = () => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  const token = process.env.GITHUB_TOKEN?.replace('your_github_token_here', '');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const fetchGitHubUser = cache(async (username: string): Promise<GitHubUser | null> => {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: getHeaders(),
      next: { revalidate: 3600 }
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMIT");
      throw new Error(`GitHub API error: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    if (error instanceof Error) throw error;
    return null;
  }
});

export const fetchGitHubRepos = cache(async (username: string): Promise<GitHubRepo[]> => {
  try {
    let repos: GitHubRepo[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 5) {
      const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`, {
        headers: getHeaders(),
        next: { revalidate: 3600 }
      });
      
      if (!res.ok) {
        if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMIT");
        break;
      }
      
      const data = await res.json();
      if (data.length === 0) {
        hasMore = false;
      } else {
        repos = repos.concat(data);
        page++;
        if (data.length < 100) hasMore = false;
      }
    }
    return repos;
  } catch (error) {
    if (error instanceof Error) throw error;
    return [];
  }
});

export const fetchGitHubEvents = cache(async (username: string): Promise<GitHubEvent[]> => {
  try {
    let events: GitHubEvent[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 3) {
      const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`, {
        headers: getHeaders(),
        next: { revalidate: 3600 }
      });
      
      if (!res.ok) {
        if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMIT");
        break;
      }
      
      const data = await res.json();
      if (data.length === 0) {
        hasMore = false;
      } else {
        events = events.concat(data);
        page++;
        if (data.length < 100) hasMore = false;
      }
    }
    return events;
  } catch (error) {
    if (error instanceof Error) throw error;
    return [];
  }
});

export const fetchContributions = cache(async (username: string, year: number): Promise<ContributionData | null> => {
  const token = process.env.GITHUB_TOKEN?.replace('your_github_token_here', '');
  if (!token) return null;

  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                weekday
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { username, from, to } }),
      next: { revalidate: 3600 }
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (json.errors) return null;

    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) return null;

    let days: ContributionDay[] = [];
    for (const week of calendar.weeks) {
      for (const day of week.contributionDays) {
        days.push(day);
      }
    }

    let longestStreak = 0;
    let currentStreak = 0;
    for (const day of days) {
      if (day.contributionCount > 0) {
        currentStreak++;
        if (currentStreak > longestStreak) longestStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    }

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayCounts = new Array(7).fill(0);
    const monthCounts = new Array(12).fill(0);

    for (const day of days) {
      if (day.contributionCount > 0) {
        const d = new Date(day.date);
        dayCounts[d.getDay()] += day.contributionCount;
        monthCounts[d.getMonth()] += day.contributionCount;
      }
    }

    const maxDayIdx = dayCounts.indexOf(Math.max(...dayCounts));
    const maxMonthIdx = monthCounts.indexOf(Math.max(...monthCounts));

    return {
      totalContributions: calendar.totalContributions,
      days,
      longestStreak,
      activeDay: Math.max(...dayCounts) > 0 ? weekdays[maxDayIdx] : 'N/A',
      activeMonth: Math.max(...monthCounts) > 0 ? months[maxMonthIdx] : 'N/A'
    };

  } catch (error) {
    return null;
  }
});

export type YearOption = string;

export function generateAnalytics(
  user: GitHubUser, 
  repos: GitHubRepo[], 
  events: GitHubEvent[], 
  contribCurrent: ContributionData | null, 
  contribPrev: ContributionData | null,
  selectedYear: YearOption
) {
  // Filter repos by year if not All Time
  let filteredRepos = repos;
  if (selectedYear !== 'All Time') {
    filteredRepos = repos.filter(r => {
      const createdYear = new Date(r.created_at).getFullYear().toString();
      const updatedYear = new Date(r.updated_at).getFullYear().toString();
      return createdYear === selectedYear || updatedYear === selectedYear;
    });
  }

  // If filteredRepos is empty (no activity that year), fallback to all repos just to not break the UI completely
  if (filteredRepos.length === 0) filteredRepos = repos;

  const totalStars = filteredRepos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
  const totalForks = filteredRepos.reduce((acc, repo) => acc + repo.forks_count, 0);
  const totalWatchers = filteredRepos.reduce((acc, repo) => acc + repo.watchers_count, 0);
  
  const languages: Record<string, number> = {};
  filteredRepos.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });
  
  const topLanguages = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, percent: Math.round((count / filteredRepos.length) * 100) }));

  const mostStarred = [...filteredRepos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0] || null;
  const newestRepo = [...filteredRepos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;
  const oldestRepo = [...filteredRepos].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0] || null;

  const commitCount = events.filter(e => e.type === 'PushEvent').length;

  let totalCommits = contribCurrent ? contribCurrent.totalContributions : commitCount;
  
  // Power Level
  let powerLevel = "Initiate";
  if (totalStars > 1000 || totalCommits > 2000) powerLevel = "God Tier";
  else if (totalStars > 500 || totalCommits > 1000) powerLevel = "Grandmaster";
  else if (totalStars > 100 || totalCommits > 500) powerLevel = "Expert";
  else if (totalStars > 20 || totalCommits > 100) powerLevel = "Adept";

  // Universal Rank Calculation
  const rankScore = (totalStars * 10) + (totalCommits * 2) + (user.followers * 5) + (filteredRepos.length * 2);
  let universalRank = "Top 50%";
  if (rankScore > 20000) universalRank = "Top 0.1%";
  else if (rankScore > 10000) universalRank = "Top 1%";
  else if (rankScore > 5000) universalRank = "Top 5%";
  else if (rankScore > 1000) universalRank = "Top 10%";
  else if (rankScore > 500) universalRank = "Top 25%";

  // Persona
  let persona = "Silent Builder";
  let personaDesc = "You prefer to let your code do the talking.";
  
  if (totalCommits > 1500) {
    persona = "Commit Machine";
    personaDesc = "Your keyboard must be on fire. Incredible contribution rate!";
  } else if (totalStars > 500) {
    persona = "Open Source Warrior";
    personaDesc = "Your code is loved by many. A true community pillar.";
  } else if (topLanguages.some(l => l.name === 'TypeScript') && (topLanguages[0]?.name === 'TypeScript')) {
    persona = "TypeScript Wizard";
    personaDesc = "You weave strict types and interfaces into pure magic.";
  } else if (filteredRepos.length > 50) {
    persona = "Indie Hacker";
    personaDesc = "So many ideas, so many repos. Always building something new.";
  } else if (filteredRepos.length === 0) {
    persona = "The Observer";
    personaDesc = "Taking it all in. Exploring the open source world.";
  }

  return {
    totalStars,
    totalForks,
    totalWatchers,
    topLanguages,
    mostStarred,
    newestRepo,
    oldestRepo,
    persona,
    personaDesc,
    universalRank,
    powerLevel,
    totalRepos: filteredRepos.length,
    contribCurrent,
    contribPrev,
    eventsApproxCommits: commitCount,
  };
}
