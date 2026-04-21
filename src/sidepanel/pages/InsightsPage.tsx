import type { DashboardSnapshot } from '../../types/domain';
import { formatCO2 } from '../../features/carbon/formatters';
import { getInsightsFeed, getQuickActionCards } from '../config';
import { FeatureBanner } from '../components/cards/FeatureBanner';
import { FeedCard } from '../components/cards/FeedCard';
import { MetricPanel } from '../components/cards/MetricPanel';

export function InsightsPage({
  snapshot,
  onNavigate,
  onCardAction
}: {
  snapshot: DashboardSnapshot;
  onNavigate: (tab: 'insights' | 'learn' | 'community' | 'rewards' | 'act') => void;
  onCardAction: (message: string) => void;
}) {
  const quickCards = getQuickActionCards(snapshot);
  const feedCards = getInsightsFeed(snapshot);

  return (
    <div className="space-y-5">
      <FeatureBanner
        eyebrow="Never miss a climate action"
        title="Turn your browsing awareness into a calmer daily climate routine."
        body="Get a softer, more focused home feed that combines planet impact, AI guidance, streak momentum, and quick actions in the same editorial rhythm as daily.dev."
        cta="Enable climate routine"
        asideLabel="AI Guardian"
        onCta={() => {
          onNavigate('learn');
          onCardAction('Climate routine enabled. Continue in Learn for your next guided step.');
        }}
      />

      <section className="grid gap-4 lg:grid-cols-4">
        <MetricPanel label="Planet impact" value={formatCO2(snapshot.dailyCO2)} note="Today across your browsing." tone="green" onClick={() => onCardAction(`Today's browsing footprint is ${formatCO2(snapshot.dailyCO2)}.`)} />
        <MetricPanel label="Current tab" value={formatCO2(snapshot.currentTabCO2)} note={snapshot.currentDomain || 'Waiting for active tab'} tone="blue" onClick={() => onCardAction(`Current tab impact: ${formatCO2(snapshot.currentTabCO2)} on ${snapshot.currentDomain || 'the active page'}.`)} />
        <MetricPanel label="Weekly carbon" value={formatCO2(snapshot.weeklyCO2)} note="Rolling seven-day footprint." tone="violet" onClick={() => onNavigate('community')} />
        <MetricPanel label="Rank progress" value={`Lv ${snapshot.level}`} note={`${snapshot.totalPoints} Eco Points collected.`} tone="amber" onClick={() => onNavigate('rewards')} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {quickCards.map((card) => (
          <FeedCard
            key={card.id}
            item={card}
            onOpen={() => {
              if (card.id === 'quick-impact') onNavigate('insights');
              if (card.id === 'quick-streak') onNavigate('community');
              if (card.id === 'quick-reward') onNavigate('rewards');
              onCardAction(card.title);
            }}
            onAction={() => {
              if (card.id === 'quick-impact') onNavigate('act');
              if (card.id === 'quick-streak') onNavigate('community');
              if (card.id === 'quick-reward') onNavigate('rewards');
            }}
            actionLabel="Open"
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {feedCards.map((card) => (
          <FeedCard
            key={card.id}
            item={card}
            onOpen={() => onCardAction(card.summary)}
            onAction={() => onNavigate(card.id === 'insight-guardian' ? 'learn' : 'act')}
            actionLabel="Explore"
          />
        ))}
      </section>
    </div>
  );
}
