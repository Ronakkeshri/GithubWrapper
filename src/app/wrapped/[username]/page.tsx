import { fetchGitHubUser, fetchGitHubRepos, fetchGitHubEvents, fetchContributions, generateAnalytics, YearOption } from '@/lib/github';
import WrappedClient from './WrappedClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await fetchGitHubUser(params.username);
  
  if (!user) {
    return {
      title: 'User Not Found | GitWrapped',
    };
  }

  const currentYear = new Date().getFullYear();

  return {
    title: `${user.name || user.login}'s ${currentYear} GitHub Year in Code | GitWrapped`,
    description: `Check out ${user.login}'s ${currentYear} GitHub Year in Review on GitWrapped! Discover their top languages, universal rank, and developer persona.`,
    openGraph: {
      title: `${user.name || user.login}'s ${currentYear} GitHub Year in Code`,
      description: `Discover ${user.login}'s GitHub Year in Review!`,
      images: [user.avatar_url],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${user.name || user.login}'s ${currentYear} GitHub Year in Code`,
      description: `Discover ${user.login}'s GitHub Year in Review!`,
      images: [user.avatar_url],
    }
  };
}

export default async function WrappedPage({ params }: Props) {
  const { username } = params;

  const user = await fetchGitHubUser(username);

  if (!user) {
    notFound();
  }

  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;
  const prevPrevYear = currentYear - 2;

  // Fetch all data in parallel
  const [repos, events, contribPrevPrev, contribPrev, contribCurrent] = await Promise.all([
    fetchGitHubRepos(username),
    fetchGitHubEvents(username),
    fetchContributions(username, prevPrevYear),
    fetchContributions(username, prevYear),
    fetchContributions(username, currentYear),
  ]);

  // Generate an analytics map for all year options
  const analyticsMap: Record<string, any> = {
    [currentYear.toString()]: generateAnalytics(user, repos, events, contribCurrent, contribPrev, currentYear.toString()),
    [prevYear.toString()]: generateAnalytics(user, repos, events, contribPrev, contribPrevPrev, prevYear.toString()),
    [prevPrevYear.toString()]: generateAnalytics(user, repos, events, contribPrevPrev, null, prevPrevYear.toString()),
    'All Time': generateAnalytics(user, repos, events, null, null, 'All Time')
  };

  return (
    <WrappedClient user={user} analyticsMap={analyticsMap} />
  );
}
