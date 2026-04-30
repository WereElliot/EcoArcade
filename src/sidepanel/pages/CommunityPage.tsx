import { useMemo, useRef, useState } from 'react';
import type { DashboardSnapshot } from '../../types/domain';
import { FeatureBanner } from '../components/cards/FeatureBanner';

export function CommunityPage({
  snapshot,
  onJoin,
  onCreateChallenge,
  onCardAction
}: {
  snapshot: DashboardSnapshot;
  onJoin: (challengeId: string) => void;
  onCreateChallenge: (challenge: {
    title: string;
    description: string;
    target: number;
    category: string;
    collectiveActionType: string;
  }) => void;
  onCardAction: (message: string) => void;
}) {
  const challengesRef = useRef<HTMLDivElement | null>(null);
  const createRef = useRef<HTMLElement | null>(null);
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    target: 250,
    category: 'Community action',
    collectiveActionType: 'Collective action'
  });

  const totals = useMemo(() => {
    const totalParticipants = snapshot.challenges.reduce((sum, challenge) => sum + challenge.progress, 0);
    const totalTargets = snapshot.challenges.reduce((sum, challenge) => sum + challenge.target, 0);
    const premiumCreated = snapshot.challenges.filter((challenge) => challenge.premiumOnly).length;
    return { totalParticipants, totalTargets, premiumCreated };
  }, [snapshot.challenges]);

  return (
    <div className="space-y-5">
      <FeatureBanner
        eyebrow="Collective action studio"
        title="Join community missions and let premium members publish new climate challenges."
        body="Community now combines the live challenge board with a premium challenge composer, so collective action can grow inside the same calmer dashboard flow."
        cta={snapshot.membershipTier === 'premium' ? 'Create challenge' : 'Explore challenges'}
        asideLabel="Community"
        onCta={() => {
          if (snapshot.membershipTier === 'premium') {
            createRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            onCardAction('Jumped to the premium community challenge composer.');
            return;
          }

          challengesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          onCardAction('Jumped to the live challenge board.');
        }}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="eco-surface rounded-[22px] border p-4">
          <p className="text-xs uppercase tracking-[0.26em] text-white/40">Active challenges</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{snapshot.challenges.length}</p>
          <p className="mt-2 text-sm text-white/56">Live climate missions currently visible on the board.</p>
        </div>
        <div className="eco-surface rounded-[22px] border p-4">
          <p className="text-xs uppercase tracking-[0.26em] text-white/40">Community joins</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{totals.totalParticipants}</p>
          <p className="mt-2 text-sm text-white/56">Combined visible progress across all listed collective actions.</p>
        </div>
        <div className="eco-surface rounded-[22px] border p-4">
          <p className="text-xs uppercase tracking-[0.26em] text-white/40">Premium-created</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{totals.premiumCreated}</p>
          <p className="mt-2 text-sm text-white/56">Challenge posts added by premium members in this privacy-first local profile.</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_340px]">
        <div ref={challengesRef} className="space-y-4">
          {snapshot.challenges.map((challenge) => (
            <article
              key={challenge.id}
              className="eco-surface eco-surface-hover cursor-pointer rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:border-white/16"
              onClick={() =>
                onCardAction(
                  `${challenge.title}: ${challenge.description} / ${challenge.category ?? 'Community action'} / ${challenge.collectiveActionType ?? 'Challenge'}`
                )
              }
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/72">
                  {challenge.category ?? 'Community action'}
                </span>
                {challenge.collectiveActionType ? (
                  <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/58">
                    {challenge.collectiveActionType}
                  </span>
                ) : null}
                {challenge.premiumOnly ? (
                  <span className="rounded-full border border-emerald-400/24 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100/82">
                    Premium created
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">{challenge.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">{challenge.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-white/48">
                <span>Created by {challenge.createdBy ?? 'EcoArcade'}</span>
                <span>Reward {challenge.rewardPoints} pts</span>
              </div>
              <div className="mt-5 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
                  style={{ width: `${Math.min(100, (challenge.progress / challenge.target) * 100)}%` }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-white/50">
                <span>
                  {challenge.progress}/{challenge.target}
                </span>
                <span>{Math.round((challenge.progress / challenge.target) * 100)}% complete</span>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onJoin(challenge.id);
                }}
                className="eco-cta mt-5 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
              >
                Join challenge
              </button>
            </article>
          ))}
        </div>

        <aside ref={createRef} className="space-y-4">
          <div className="eco-surface rounded-[24px] border p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-white/40">Community studio</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
              {snapshot.membershipTier === 'premium' ? 'Publish a new challenge' : 'Premium required'}
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/60">
              {snapshot.membershipTier === 'premium'
                ? 'Premium members can add community challenges and other collective climate actions directly from this board.'
                : 'Upgrade to premium to create community challenges and collective actions.'}
            </p>
          </div>

          <form
            className="eco-surface rounded-[24px] border p-5"
            onSubmit={(event) => {
              event.preventDefault();
              onCreateChallenge(draft);
            }}
          >
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.26em] text-white/40">Challenge title</span>
                <input
                  value={draft.title}
                  disabled={snapshot.membershipTier !== 'premium'}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  className="h-11 w-full rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/35"
                  placeholder="Plant 500 native seedlings"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.26em] text-white/40">Collective action type</span>
                <input
                  value={draft.collectiveActionType}
                  disabled={snapshot.membershipTier !== 'premium'}
                  onChange={(event) => setDraft((current) => ({ ...current, collectiveActionType: event.target.value }))}
                  className="h-11 w-full rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/35"
                  placeholder="Tree planting"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.26em] text-white/40">Category</span>
                <input
                  value={draft.category}
                  disabled={snapshot.membershipTier !== 'premium'}
                  onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                  className="h-11 w-full rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/35"
                  placeholder="Restoration"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.26em] text-white/40">Description</span>
                <textarea
                  value={draft.description}
                  disabled={snapshot.membershipTier !== 'premium'}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-[120px] w-full rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/35"
                  placeholder="Describe the mission, proof expectations, and the climate outcome the community should drive."
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.26em] text-white/40">Target participants</span>
                <input
                  type="number"
                  min={10}
                  max={50000}
                  value={draft.target}
                  disabled={snapshot.membershipTier !== 'premium'}
                  onChange={(event) => setDraft((current) => ({ ...current, target: Number(event.target.value) || 10 }))}
                  className="h-11 w-full rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-emerald-400/35"
                />
              </label>

              <button
                type="submit"
                disabled={snapshot.membershipTier !== 'premium'}
                className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition ${
                  snapshot.membershipTier === 'premium'
                    ? 'eco-cta hover:-translate-y-0.5'
                    : 'bg-white/10 text-white/38'
                }`}
              >
                {snapshot.membershipTier === 'premium' ? 'Publish community challenge' : 'Premium required'}
              </button>
            </div>
          </form>

          <div className="eco-surface rounded-[24px] border p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-white/40">Board totals</p>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Combined challenge target: {totals.totalTargets.toLocaleString()} participants across visible community actions.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
