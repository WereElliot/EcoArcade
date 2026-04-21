import { useRef } from 'react';
import type { DashboardSnapshot } from '../../types/domain';
import { FeatureBanner } from '../components/cards/FeatureBanner';

export function CommunityPage({
  snapshot,
  onJoin,
  onCardAction
}: {
  snapshot: DashboardSnapshot;
  onJoin: (challengeId: string) => void;
  onCardAction: (message: string) => void;
}) {
  const challengesRef = useRef<HTMLElement | null>(null);

  return (
    <div className="space-y-5">
      <FeatureBanner
        eyebrow="Collective impact"
        title="Join live climate challenges without losing the premium editorial feel."
        body="Community missions now sit in spacious campaign cards with clearer progress, simpler join actions, and the same dark modern rhythm as the home feed."
        cta="Explore challenges"
        asideLabel="Community"
        onCta={() => {
          challengesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          onCardAction('Jumped to the live challenge list.');
        }}
      />

      <section ref={challengesRef} className="grid gap-4 xl:grid-cols-2">
        {snapshot.challenges.map((challenge) => (
          <article
            key={challenge.id}
            className="cursor-pointer rounded-[24px] border border-white/10 bg-[#171c26] p-5 transition hover:-translate-y-0.5 hover:border-white/16"
            onClick={() => onCardAction(`${challenge.title}: ${challenge.description}`)}
          >
            <p className="text-xs uppercase tracking-[0.26em] text-white/40">Campaign</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{challenge.title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/60">{challenge.description}</p>
            <div className="mt-5 h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-sky-400"
                style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-white/50">
              <span>{challenge.progress}/{challenge.target}</span>
              <span>Reward {challenge.rewardPoints} pts</span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onJoin(challenge.id);
              }}
              className="mt-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#10131c] transition hover:-translate-y-0.5"
            >
              Join challenge
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
