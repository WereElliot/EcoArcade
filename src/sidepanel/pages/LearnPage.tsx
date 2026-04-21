import { useMemo } from 'react';
import type { DashboardSnapshot } from '../../types/domain';
import { toLearnFeed } from '../config';
import { FeedCard } from '../components/cards/FeedCard';
import { FeatureBanner } from '../components/cards/FeatureBanner';

const fallbackVideo = {
  title: 'What Is Climate Change?',
  embedUrl: 'https://www.youtube-nocookie.com/embed/ZqiSiX8QD7o?rel=0',
  watchUrl: 'https://www.youtube.com/watch?v=ZqiSiX8QD7o'
};

export function LearnPage({
  snapshot,
  onComplete,
  searchQuery,
  onCardAction
}: {
  snapshot: DashboardSnapshot;
  onComplete: (itemId: string) => void;
  searchQuery: string;
  onCardAction: (message: string) => void;
}) {
  const videoItem = useMemo(
    () => snapshot.learnCatalog.find((item) => item.kind === 'video'),
    [snapshot.learnCatalog]
  );
  const filteredCatalog = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return snapshot.learnCatalog;
    }

    return snapshot.learnCatalog.filter((item) => {
      const haystack = [item.title, item.summary, item.kind, ...(item.tags ?? [])].join(' ').toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [searchQuery, snapshot.learnCatalog]);

  return (
    <div className="space-y-5">
      <FeatureBanner
        eyebrow="Learn without leaving your flow"
        title="Watch, read, and complete climate lessons in the same editorial card layout."
        body="The Learn section now behaves like a real content feed, with a featured playable lesson on top and daily.dev-style cards below for articles, quizzes, and reflections."
        cta="Start learning"
        asideLabel="Lesson Feed"
        onCta={() => onCardAction('Featured lesson ready to play. Use the queue or the cards below to continue learning.')}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <div className="rounded-[24px] border border-white/10 bg-[#171c26] p-4">
          <div className="aspect-video overflow-hidden rounded-[18px] border border-white/10 bg-black">
            <iframe
              className="h-full w-full"
              src={fallbackVideo.embedUrl}
              title={fallbackVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-white/40">Featured Video</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{videoItem?.title ?? fallbackVideo.title}</h2>
              <p className="mt-2 text-sm text-white/60">{videoItem?.summary ?? 'A short explainer that opens the Learn journey with something immediately watchable.'}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.open(fallbackVideo.watchUrl, '_blank', 'noopener,noreferrer')}
                className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
              >
                Open on YouTube
              </button>
              {videoItem ? (
                <button
                  type="button"
                  onClick={() => onComplete(videoItem.id)}
                  disabled={videoItem.completed}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#10131c] transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-60"
                >
                  {videoItem.completed ? 'Completed' : `Mark watched +${videoItem.points}`}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#171c26] p-4">
          <p className="text-xs uppercase tracking-[0.26em] text-white/40">Queue</p>
          <div className="mt-4 space-y-3">
            {snapshot.learnCatalog.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.kind === 'video') {
                    window.open(fallbackVideo.watchUrl, '_blank', 'noopener,noreferrer');
                    onCardAction(`Opened ${item.title} on YouTube.`);
                    return;
                  }

                  onComplete(item.id);
                }}
                className="flex w-full items-center justify-between rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/8"
              >
                <div>
                  <div className="text-sm font-medium text-white">{item.title}</div>
                  <div className="mt-1 text-xs text-white/42">{item.kind} / {item.minutes} min</div>
                </div>
                <span className="text-xs text-white/48">{item.completed ? 'Done' : `+${item.points}`}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {filteredCatalog.map((item) => (
          <FeedCard
            key={item.id}
            item={toLearnFeed(item)}
            onOpen={() => {
              if (item.kind === 'video' && item.mediaUrl) {
                window.open(item.mediaUrl, '_blank', 'noopener,noreferrer');
                onCardAction(`Opened ${item.title}.`);
                return;
              }

              onCardAction(item.summary);
            }}
            onAction={() => {
              if (item.kind === 'video') {
                window.open(item.mediaUrl ?? fallbackVideo.watchUrl, '_blank', 'noopener,noreferrer');
                return;
              }

              onComplete(item.id);
            }}
            actionLabel={item.completed ? 'Completed' : `Earn +${item.points}`}
          />
        ))}
      </section>
    </div>
  );
}
