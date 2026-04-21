import { BookmarkIcon, CommentIcon } from '../icons';
import type { FeedViewModel } from '../../config';

const accentClasses: Record<FeedViewModel['accent'], string> = {
  ocean:
    'bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.55),transparent_26%),linear-gradient(160deg,#172534_10%,#11314d_55%,#0f1724_100%)]',
  violet:
    'bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.65),transparent_28%),linear-gradient(160deg,#241436_12%,#3a175e_52%,#101622_100%)]',
  forest:
    'bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.55),transparent_26%),linear-gradient(160deg,#13251e_12%,#164e3c_54%,#11161d_100%)]',
  amber:
    'bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.55),transparent_26%),linear-gradient(160deg,#2d2415_12%,#62451c_54%,#11161d_100%)]',
  indigo:
    'bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.58),transparent_26%),linear-gradient(160deg,#171d34_12%,#22316e_54%,#11161d_100%)]'
};

export function FeedCard({
  item,
  onAction,
  actionLabel,
  onOpen
}: {
  item: FeedViewModel;
  onAction?: () => void;
  actionLabel?: string;
  onOpen?: () => void;
}) {
  return (
    <article
      className={`group rounded-[24px] border border-white/10 bg-[#171c26] p-4 transition duration-200 hover:-translate-y-1 hover:border-white/16 hover:bg-[#1a202b] ${
        onOpen ? 'cursor-pointer' : ''
      }`}
      onClick={onOpen}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={
        onOpen
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-violet-500/12 px-3 py-1 text-xs font-medium text-violet-200">{item.meta}</span>
        <span className="text-xs text-white/42">{item.engagement.readTime}</span>
      </div>

      <div className="mt-4">
        {item.eyebrow ? <p className="text-xs uppercase tracking-[0.24em] text-white/38">{item.eyebrow}</p> : null}
        <h3 className="mt-2 text-[30px]/[1.08] text-lg font-semibold tracking-tight text-white">{item.title}</h3>
        <p className="mt-3 text-sm leading-6 text-white/60">{item.summary}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 bg-white/4 px-2.5 py-1 text-xs text-white/52">
            {tag}
          </span>
        ))}
      </div>

      <div className={`mt-5 h-36 rounded-[18px] border border-white/10 ${accentClasses[item.accent]} p-4`}>
        <div className="flex h-full items-end">
          <p className="text-3xl font-semibold tracking-tight text-white/95">{item.imageLabel}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <CommentIcon className="h-4 w-4" />
            {item.engagement.comments}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookmarkIcon className="h-4 w-4" />
            {item.engagement.saves}
          </span>
        </div>
        {onAction && actionLabel ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAction();
            }}
            className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-medium text-white/78 transition hover:bg-white/10"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}
