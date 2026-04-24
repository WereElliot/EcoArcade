import type { DashboardSnapshot, LearnItem, TabId } from '../types/domain';
import { getRankLabel } from '../features/carbon/scoring';

export interface NavItem {
  id: TabId;
  label: string;
  subtitle: string;
  icon: 'home' | 'learn' | 'act' | 'community' | 'rewards';
}

export interface FeedViewModel {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  meta: string;
  accent: 'ocean' | 'violet' | 'forest' | 'amber' | 'indigo';
  eyebrow?: string;
  imageLabel: string;
  engagement: {
    readTime: string;
    comments: number;
    saves: number;
  };
}

export const navItems: NavItem[] = [
  { id: 'insights', label: 'Home / Insights', subtitle: 'For you', icon: 'home' },
  { id: 'learn', label: 'Learn', subtitle: 'Videos + Articles', icon: 'learn' },
  { id: 'act', label: 'Act', subtitle: 'Real-world actions', icon: 'act' },
  { id: 'community', label: 'Community', subtitle: 'Challenges', icon: 'community' },
  { id: 'rewards', label: 'Rewards', subtitle: 'Tokens + donations', icon: 'rewards' }
];

export function getQuickActionCards(snapshot: DashboardSnapshot): FeedViewModel[] {
  return [
    {
      id: 'quick-impact',
      title: `Keep today under ${Math.max(8, Math.round(snapshot.dailyCO2 + 3))}g`,
      summary: 'Close idle tabs, switch autoplay off, and stay in the lower-emissions band for the day.',
      tags: ['#climate', '#focus'],
      meta: 'Quick Action',
      accent: 'forest',
      eyebrow: 'Planet Impact',
      imageLabel: 'Low Carbon',
      engagement: {
        readTime: '2 min',
        comments: 18,
        saves: 64
      }
    },
    {
      id: 'quick-streak',
      title: `Extend your ${snapshot.streakDays}-day streak`,
      summary: 'Finish one lesson or one community mission to keep your rhythm alive and unlock a smoother climb.',
      tags: ['#streak', '#momentum'],
      meta: 'Daily Streak',
      accent: 'violet',
      eyebrow: 'Momentum',
      imageLabel: 'Streak',
      engagement: {
        readTime: '3 min',
        comments: 9,
        saves: 41
      }
    },
    {
      id: 'quick-reward',
      title: `You have ${snapshot.ecoTokens} ECO ready to use`,
      summary: 'Convert points, hold tokens, or direct them toward verified climate projects in Kenya and East Africa.',
      tags: ['#rewards', '#solana'],
      meta: 'Rewards',
      accent: 'indigo',
      eyebrow: 'EcoTokens',
      imageLabel: 'Rewards',
      engagement: {
        readTime: '4 min',
        comments: 12,
        saves: 28
      }
    }
  ];
}

export function toLearnFeed(item: LearnItem): FeedViewModel {
  const accentMap: Record<string, FeedViewModel['accent']> = {
    shoreline: 'ocean',
    violet: 'violet',
    forest: 'forest',
    aurora: 'indigo'
  };

  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    tags: item.tags ?? ['#climate'],
    meta:
      item.kind === 'video'
        ? `Video / ${item.sourceName ?? 'YouTube'}`
        : item.kind === 'article'
          ? `Article / ${item.sourceName ?? 'Reading'}`
          : item.kind === 'quiz'
            ? 'Trivia'
            : 'Reflection',
    accent: accentMap[item.thumbnailTheme ?? 'forest'] ?? 'forest',
    eyebrow: item.completed ? 'Completed' : item.kind,
    imageLabel:
      item.kind === 'video'
        ? 'Watch'
        : item.kind === 'article'
          ? 'Read'
          : item.kind === 'quiz'
            ? 'Trivia'
            : 'Reflect',
    engagement: {
      readTime: `${item.minutes} min`,
      comments: item.kind === 'video' ? 34 : 18,
      saves: item.points + 12
    }
  };
}

export function getInsightsFeed(snapshot: DashboardSnapshot): FeedViewModel[] {
  return [
    {
      id: 'insight-guardian',
      title: 'Your browsing footprint is telling a clearer story today',
      summary: 'The dashboard now surfaces impact, streak, and guardian advice in one calmer editorial flow instead of scattering the same signal across too many cards.',
      tags: ['#guardian', '#insights'],
      meta: 'AI Guardian',
      accent: 'violet',
      eyebrow: 'Featured',
      imageLabel: 'Guardian',
      engagement: {
        readTime: '5 min',
        comments: 26,
        saves: 87
      }
    },
    {
      id: 'insight-domain',
      title: `Your heaviest current signal is ${snapshot.currentDomain || 'still loading'}`,
      summary: 'Use the live counter to compare passive browsing impact with your daily total and spot when one session starts dominating the whole day.',
      tags: ['#carbon', '#live'],
      meta: 'Carbon Lens',
      accent: 'ocean',
      eyebrow: 'Now',
      imageLabel: 'Live CO2',
      engagement: {
        readTime: '3 min',
        comments: 14,
        saves: 52
      }
    }
  ];
}
