import { fetchGitHubUser, fetchGitHubRepos, fetchGitHubEvents, fetchContributions, generateAnalytics } from '@/lib/github';
import CompareClient from './CompareClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [user1Login, user2Login] = params.slug.split('-vs-');
  if (!user1Login || !user2Login) return { title: 'Invalid Comparison' };

  return {
    title: `${user1Login} vs ${user2Login} - Developer Battle | GitWrapped`,
    description: `See who wins the ultimate developer battle between ${user1Login} and ${user2Login}!`,
  };
}

export default async function ComparePage({ params }: Props) {
  const [user1Login, user2Login] = params.slug.split('-vs-');

  if (!user1Login || !user2Login) {
    notFound();
  }

  // Fetch users first to fail fast
  const [user1, user2] = await Promise.all([
    fetchGitHubUser(user1Login),
    fetchGitHubUser(user2Login)
  ]);

  if (!user1 || !user2) {
    notFound();
  }

  // Fetch heavy data in parallel for both users
  const [
    repos1, events1, contrib1,
    repos2, events2, contrib2
  ] = await Promise.all([
    fetchGitHubRepos(user1Login), fetchGitHubEvents(user1Login), fetchContributions(user1Login, new Date().getFullYear()),
    fetchGitHubRepos(user2Login), fetchGitHubEvents(user2Login), fetchContributions(user2Login, new Date().getFullYear())
  ]);

  // We'll use "All Time" equivalent stats for the overall battle, or current year.
  // The prompt says "Developer Battle 2026" (or current year). Let's use the current year.
  const currentYear = new Date().getFullYear().toString();
  
  // Note: Since the prompt example is 2026, we will just use the current year dynamically if needed, 
  // but generateAnalytics accepts specific literal strings. 
  // Let's pass 'All Time' so we capture their entire lifetime power, but the UI says Developer Battle.
  const analytics1 = generateAnalytics(user1, repos1, events1, contrib1, null, 'All Time');
  const analytics2 = generateAnalytics(user2, repos2, events2, contrib2, null, 'All Time');

  return (
    <CompareClient 
      user1={{ profile: user1, analytics: analytics1 }} 
      user2={{ profile: user2, analytics: analytics2 }} 
    />
  );
}
