import { useEffect, useMemo, useState } from 'react';
import { formatCO2 } from '../../features/carbon/formatters';
import type { DashboardSnapshot } from '../../types/domain';
import { FeatureBanner } from '../components/cards/FeatureBanner';
import { MetricPanel } from '../components/cards/MetricPanel';

type LearnFocusMode = 'articles' | 'trivia';

const emissionLimitOptions = [6, 10, 15, 20];
const articleGoalOptions = [1, 2, 3, 4];
const triviaGoalOptions = [2, 3, 5, 8];
const reflectionGoalOptions = [0, 1, 2];

function GoalPill({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active ? 'border-emerald-400/30 bg-emerald-500/12 text-white' : 'border-white/10 bg-white/5 text-white/68 hover:bg-white/8'
      }`}
    >
      {label}
    </button>
  );
}

export function RoutinePage({
  snapshot,
  onSave,
  onOpenLearn,
  onBack,
  onCardAction
}: {
  snapshot: DashboardSnapshot;
  onSave: (routinePlan: DashboardSnapshot['routinePlan']) => Promise<void>;
  onOpenLearn: (mode: LearnFocusMode) => void;
  onBack: () => void;
  onCardAction: (message: string) => void;
}) {
  const [dailyCO2Limit, setDailyCO2Limit] = useState(snapshot.routinePlan.dailyCO2Limit);
  const [articleGoal, setArticleGoal] = useState(snapshot.routinePlan.articleGoal);
  const [triviaGoal, setTriviaGoal] = useState(snapshot.routinePlan.triviaGoal);
  const [reflectionGoal, setReflectionGoal] = useState(snapshot.routinePlan.reflectionGoal);

  useEffect(() => {
    setDailyCO2Limit(snapshot.routinePlan.dailyCO2Limit);
    setArticleGoal(snapshot.routinePlan.articleGoal);
    setTriviaGoal(snapshot.routinePlan.triviaGoal);
    setReflectionGoal(snapshot.routinePlan.reflectionGoal);
  }, [snapshot.routinePlan]);

  const completedArticles = useMemo(
    () =>
      Object.keys(snapshot.learnProgress).filter(
        (itemId) => itemId.startsWith('article-library-') || itemId.startsWith('community-article-') || itemId === 'learn-1' || itemId === 'learn-3' || itemId === 'learn-5'
      ).length,
    [snapshot.learnProgress]
  );
  const completedTrivia = useMemo(
    () => Object.keys(snapshot.learnProgress).filter((itemId) => itemId.startsWith('quiz-bank-')).length,
    [snapshot.learnProgress]
  );

  const projectedMessage =
    snapshot.dailyCO2 <= dailyCO2Limit
      ? `You are within your planned ${dailyCO2Limit}g daily digital budget right now.`
      : `You are ${formatCO2(snapshot.dailyCO2 - dailyCO2Limit)} above your planned daily limit, so the next best move is to reduce heavy browsing and finish a low-bandwidth Learn task.`;

  return (
    <div className="space-y-5">
      <FeatureBanner
        eyebrow="Privacy-first routine"
        title="Set a local climate routine without creating an account."
        body="Everything here stays on this device. Set a daily digital emissions limit, choose how many Learn Hub articles to read, and define how many trivia questions you want to complete each day."
        cta="Back to dashboard"
        asideLabel="No Login"
        onCta={onBack}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <MetricPanel
          label="Today's carbon"
          value={formatCO2(snapshot.dailyCO2)}
          note={`Routine limit: ${dailyCO2Limit}g`}
          tone="green"
          onClick={() => onCardAction(projectedMessage)}
        />
        <MetricPanel
          label="Article progress"
          value={`${completedArticles}/${articleGoal}`}
          note="Completed climate readings today."
          tone="blue"
          onClick={() => onOpenLearn('articles')}
        />
        <MetricPanel
          label="Trivia progress"
          value={`${completedTrivia}/${triviaGoal}`}
          note="Awareness questions answered."
          tone="amber"
          onClick={() => onOpenLearn('trivia')}
        />
      </section>

      <section className="eco-surface rounded-[24px] border p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-white/40">Climate routine planner</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Build a daily mission that fits your digital life</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
              Start with a carbon limit, then pick a small learning routine. A strong privacy-first default is one or two articles and a few trivia questions each day.
            </p>
          </div>
          <div className="rounded-[18px] border border-emerald-400/18 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-100/86">
            Saved locally only
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <p className="text-sm font-medium text-white">1. Set your daily digital emissions limit</p>
            <p className="mt-1 text-sm text-white/58">Choose a realistic cap for today’s browsing footprint.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {emissionLimitOptions.map((option) => (
                <GoalPill
                  key={option}
                  active={dailyCO2Limit === option}
                  label={`${option}g per day`}
                  onClick={() => setDailyCO2Limit(option)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-white">2. Choose your Learn Hub reading target</p>
            <p className="mt-1 text-sm text-white/58">Articles are the calmest way to grow awareness without increasing digital load too much.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {articleGoalOptions.map((option) => (
                <GoalPill
                  key={option}
                  active={articleGoal === option}
                  label={`${option} article${option > 1 ? 's' : ''}`}
                  onClick={() => setArticleGoal(option)}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => onOpenLearn('articles')}
              className="mt-4 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              Open Learn articles
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-white">3. Set how many trivia questions you want to answer</p>
            <p className="mt-1 text-sm text-white/58">Short trivia keeps your routine active and gives you a low-effort daily win.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {triviaGoalOptions.map((option) => (
                <GoalPill
                  key={option}
                  active={triviaGoal === option}
                  label={`${option} question${option > 1 ? 's' : ''}`}
                  onClick={() => setTriviaGoal(option)}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => onOpenLearn('trivia')}
              className="mt-4 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              Open trivia
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-white">4. Decide whether to include a short reflection</p>
            <p className="mt-1 text-sm text-white/58">A one-sentence reflection can help lock in one habit you want to improve this week.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {reflectionGoalOptions.map((option) => (
                <GoalPill
                  key={option}
                  active={reflectionGoal === option}
                  label={option === 0 ? 'Skip reflection' : `${option} reflection`}
                  onClick={() => setReflectionGoal(option)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[20px] border border-white/10 bg-emerald-500/6 p-4">
          <p className="text-sm font-medium text-white">Today's routine preview</p>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Keep your browsing under {dailyCO2Limit}g, read {articleGoal} article{articleGoal > 1 ? 's' : ''}, answer {triviaGoal} trivia question{triviaGoal > 1 ? 's' : ''}, and {reflectionGoal === 0 ? 'skip reflection for today.' : `complete ${reflectionGoal} short reflection${reflectionGoal > 1 ? 's' : ''}.`}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              void onSave({
                dailyCO2Limit,
                articleGoal,
                triviaGoal,
                reflectionGoal,
                enabled: true
              })
            }
            className="eco-cta rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
          >
            Save routine locally
          </button>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            Back to dashboard
          </button>
        </div>
      </section>
    </div>
  );
}
