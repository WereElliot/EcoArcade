import { useRef } from 'react';
import type { DashboardSnapshot } from '../../types/domain';
import { FeatureBanner } from '../components/cards/FeatureBanner';
import { MetricPanel } from '../components/cards/MetricPanel';

export function ActPage({
  snapshot,
  proofFile,
  onFileChange,
  onSubmit,
  actionStatus,
  onBannerAction,
  onCardAction
}: {
  snapshot: DashboardSnapshot;
  proofFile: File | null;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
  actionStatus: string;
  onBannerAction: () => void;
  onCardAction: (message: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-5">
      <FeatureBanner
        eyebrow="Real-world proof"
        title="Upload a climate action and move it from evidence to reward."
        body="This page now mirrors the same premium editorial spacing as the main feed, while keeping the upload step, verification summary, and reward state clearly separated."
        cta="Prepare proof"
        asideLabel="Action Mint"
        onCta={() => {
          onBannerAction();
          fileInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          fileInputRef.current?.focus();
        }}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
        <div className="eco-surface rounded-[24px] border p-5">
          <p className="text-xs uppercase tracking-[0.26em] text-white/40">Upload evidence</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Verify a real-world climate action</h2>
          <p className="mt-3 text-sm leading-7 text-white/60">
            Upload one photo from a cleanup, tree planting, or restoration moment. The next integration pass will connect Gemini verification and Solana minting into this same flow.
          </p>

          <div className="mt-6 rounded-[20px] border border-dashed border-white/12 bg-emerald-500/6 p-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500/16 file:px-4 file:py-2 file:text-sm file:text-white"
            />
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-white/50">{proofFile ? proofFile.name : 'No file selected yet.'}</p>
              <button
                type="button"
                onClick={onSubmit}
                className="eco-cta rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
              >
                Verify action
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[20px] border border-white/10 bg-emerald-500/6 p-4">
            <p className="text-sm font-medium text-white">Verification status</p>
            <p className="mt-2 text-sm leading-6 text-white/60">{actionStatus || snapshot.actionProof.summary}</p>
          </div>
        </div>

        <div className="space-y-4">
          <MetricPanel label="Proof state" value={snapshot.actionProof.status.replace('_', ' ')} note={snapshot.actionProof.minted ? 'Ready for NFT minting.' : 'Waiting for verified metadata.'} tone="violet" onClick={() => onCardAction(snapshot.actionProof.summary || 'Proof state ready.')} />
          <MetricPanel label="Reward" value={`+${snapshot.actionProof.pointsAwarded}`} note="Eco Points on successful verification." tone="green" onClick={() => onCardAction(`Verified actions can award up to ${snapshot.actionProof.pointsAwarded} points in the current flow.`)} />
        </div>
      </section>
    </div>
  );
}
