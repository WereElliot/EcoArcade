import type { DashboardSnapshot } from '../../types/domain';
import { FeatureBanner } from '../components/cards/FeatureBanner';
import { MetricPanel } from '../components/cards/MetricPanel';

export function RewardsPage({
  snapshot,
  onConvert,
  actionStatus,
  onCardAction
}: {
  snapshot: DashboardSnapshot;
  onConvert: () => void;
  actionStatus: string;
  onCardAction: (message: string) => void;
}) {
  return (
    <div className="space-y-5">
      <FeatureBanner
        eyebrow="Rewards marketplace"
        title="Turn points into EcoTokens and back verified projects in one polished flow."
        body="The rewards page now separates wallet summary, conversion, and donation opportunities so the primary action stays obvious and premium."
        cta="Convert 100 points"
        asideLabel="EcoToken"
        onCta={onConvert}
      />

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <MetricPanel label="EcoTokens" value={`${snapshot.ecoTokens}`} note="Available in your wallet balance." tone="violet" onClick={() => onCardAction(`${snapshot.ecoTokens} ECO currently available.`)} />
          <MetricPanel label="Points" value={`${snapshot.totalPoints}`} note="Ready for conversion into ECO." tone="green" onClick={() => onCardAction(`${snapshot.totalPoints} points available for conversion.`)} />
          <div className="rounded-[24px] border border-white/10 bg-[#171c26] p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-white/40">Convert</p>
            <p className="mt-2 text-sm leading-7 text-white/60">Every 100 Eco Points can convert into 1 EcoToken.</p>
            <button
              type="button"
              onClick={onConvert}
              className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#10131c] transition hover:-translate-y-0.5"
            >
              Convert points
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {snapshot.donations.map((project) => (
            <article
              key={project.id}
              className="cursor-pointer rounded-[24px] border border-white/10 bg-[#171c26] p-5 transition hover:-translate-y-0.5 hover:border-white/16"
              onClick={() => onCardAction(`Selected ${project.name} in ${project.region}. Suggested contribution: ${project.tokenCost} ECO.`)}
            >
              <p className="text-xs uppercase tracking-[0.26em] text-white/40">{project.region}</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">{project.name}</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">{project.description}</p>
              <p className="mt-4 text-sm text-white/46">{project.tokenCost} ECO suggested contribution</p>
            </article>
          ))}
          <article className="rounded-[24px] border border-white/10 bg-[#171c26] p-5 xl:col-span-2">
            <p className="text-xs uppercase tracking-[0.26em] text-white/40">Status</p>
            <p className="mt-3 text-sm leading-7 text-white/60">{actionStatus || 'Rewards are ready for conversion and donation flows.'}</p>
          </article>
        </div>
      </section>
    </div>
  );
}
