import { useMemo, useRef, useState } from 'react';
import type { DashboardSnapshot, LearnItem } from '../../types/domain';
import { toLearnFeed } from '../config';
import { FeedCard } from '../components/cards/FeedCard';
import { FeatureBanner } from '../components/cards/FeatureBanner';

type LearnSubTab = 'articles' | 'videos' | 'trivia';

interface TriviaQuestion {
  itemId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const triviaQuestions: TriviaQuestion[] = [
  {
    itemId: 'trivia-1',
    question: 'Which browsing habit usually raises digital emissions the fastest?',
    options: ['Reading plain text pages', 'Streaming high-resolution video for long periods', 'Bookmarking an article', 'Using dark mode'],
    correctIndex: 1,
    explanation: 'Long high-resolution streaming sessions typically use much more data than lightweight browsing tasks.'
  },
  {
    itemId: 'trivia-2',
    question: 'What is the main cause of modern global warming?',
    options: ['Natural lunar cycles', 'Greenhouse gas emissions from human activity', 'The ozone hole alone', 'Volcanic eruptions every year'],
    correctIndex: 1,
    explanation: 'Human-driven greenhouse gas emissions are the main driver of current long-term warming.'
  },
  {
    itemId: 'trivia-3',
    question: 'Which is usually the best immediate digital habit for lowering your browsing footprint?',
    options: ['Keeping many autoplay tabs open', 'Downloading the same files repeatedly', 'Closing idle tabs and reducing unnecessary streaming quality', 'Refreshing pages constantly'],
    correctIndex: 2,
    explanation: 'Closing idle tabs and avoiding unnecessary bandwidth-heavy settings is one of the fastest useful wins.'
  }
];

function getFeaturedItem(contentItems: LearnItem[]): LearnItem | null {
  return (
    contentItems.find((item) => item.kind === 'article') ??
    contentItems.find((item) => item.kind === 'video') ??
    contentItems[0] ??
    null
  );
}

function openExternal(url?: string) {
  if (!url) {
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

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
  const [activeSubTab, setActiveSubTab] = useState<LearnSubTab>('articles');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedTriviaId, setSelectedTriviaId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const articleFeedRef = useRef<HTMLDivElement | null>(null);
  const videoFeedRef = useRef<HTMLDivElement | null>(null);
  const triviaRef = useRef<HTMLDivElement | null>(null);
  const featuredResourceRef = useRef<HTMLDivElement | null>(null);
  const articleReaderRef = useRef<HTMLDivElement | null>(null);
  const triviaDetailRef = useRef<HTMLDivElement | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const articleItems = useMemo(
    () => snapshot.learnCatalog.filter((item) => item.kind === 'article' || item.kind === 'reflection'),
    [snapshot.learnCatalog]
  );

  const videoItems = useMemo(
    () => snapshot.learnCatalog.filter((item) => item.kind === 'video'),
    [snapshot.learnCatalog]
  );

  const triviaItems = useMemo(
    () => snapshot.learnCatalog.filter((item) => item.kind === 'quiz'),
    [snapshot.learnCatalog]
  );

  const filterItems = (items: LearnItem[]) => {
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      const haystack = [item.title, item.summary, item.kind, item.sourceName ?? '', ...(item.tags ?? [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  };

  const filteredArticleItems = useMemo(() => filterItems(articleItems), [articleItems, normalizedQuery]);
  const filteredVideoItems = useMemo(() => filterItems(videoItems), [videoItems, normalizedQuery]);

  const filteredTrivia = useMemo(() => {
    const activeQuestions = triviaQuestions.filter((question) =>
      triviaItems.some((item) => item.id === question.itemId)
    );

    if (!normalizedQuery) {
      return activeQuestions;
    }

    return activeQuestions.filter((question) =>
      [question.question, question.explanation, ...question.options].join(' ').toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery, triviaItems]);

  const featuredItem = useMemo(() => {
    const sourceItems =
      activeSubTab === 'videos'
        ? filteredVideoItems.length > 0
          ? filteredVideoItems
          : videoItems
        : filteredArticleItems.length > 0
          ? filteredArticleItems
          : articleItems;
    const fallbackItems = activeSubTab === 'videos' ? videoItems : articleItems;
    const defaultItem = getFeaturedItem(sourceItems);
    if (!defaultItem) {
      return null;
    }

    return (
      sourceItems.find((item) => item.id === selectedItemId) ??
      fallbackItems.find((item) => item.id === selectedItemId) ??
      defaultItem
    );
  }, [activeSubTab, articleItems, filteredArticleItems, filteredVideoItems, selectedItemId, videoItems]);

  const selectedTrivia = useMemo(() => {
    const defaultQuestion = filteredTrivia[0] ?? triviaQuestions.find((question) =>
      triviaItems.some((item) => item.id === question.itemId)
    );

    if (!defaultQuestion) {
      return null;
    }

    return (
      filteredTrivia.find((question) => question.itemId === selectedTriviaId) ??
      triviaQuestions.find((question) => question.itemId === selectedTriviaId && triviaItems.some((item) => item.id === question.itemId)) ??
      defaultQuestion
    );
  }, [filteredTrivia, selectedTriviaId, triviaItems]);

  const selectedTriviaItem = useMemo(
    () => (selectedTrivia ? triviaItems.find((item) => item.id === selectedTrivia.itemId) ?? null : null),
    [selectedTrivia, triviaItems]
  );

  const focusArticleReader = (item: LearnItem) => {
    setSelectedItemId(item.id);
    window.requestAnimationFrame(() => {
      articleReaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const focusFeaturedResource = (item: LearnItem) => {
    setSelectedItemId(item.id);
    window.requestAnimationFrame(() => {
      featuredResourceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const focusTriviaQuestion = (itemId: string) => {
    setSelectedTriviaId(itemId);
    window.requestAnimationFrame(() => {
      triviaDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleContentAction = (item: LearnItem) => {
    if (item.kind === 'article') {
      focusArticleReader(item);
      onCardAction(`Loaded ${item.title} for in-app reading.`);
      return;
    }

    if (item.kind === 'reflection') {
      onComplete(item.id);
      onCardAction('Reflection marked complete. Try writing down the habit you want to change this week.');
      return;
    }

    openExternal(item.mediaUrl);
    onCardAction(`Opened ${item.title}${item.sourceName ? ` from ${item.sourceName}` : ''}.`);
  };

  const handleTriviaAnswer = (question: TriviaQuestion, answerIndex: number) => {
    setSelectedAnswers((current) => ({ ...current, [question.itemId]: answerIndex }));

    if (answerIndex === question.correctIndex) {
      const item = triviaItems.find((entry) => entry.id === question.itemId);
      if (item && !item.completed) {
        onComplete(item.id);
      }
      onCardAction(question.explanation);
      return;
    }

    onCardAction('Not quite. Try again and look for the habit that reduces wasted energy and bandwidth.');
  };

  return (
    <div className="space-y-5">
      <FeatureBanner
        eyebrow="Learn without leaving your flow"
        title="Read climate explainers first, then move into videos or trivia when you want to go deeper."
        body="The Learn dashboard now opens on an article-first reading flow. Videos and trivia still exist, but they live in their own tabs so the main learning surface stays calmer."
        cta={
          activeSubTab === 'trivia'
            ? 'Open trivia'
          : activeSubTab === 'videos'
              ? 'Open videos'
              : 'Open articles'
        }
        asideLabel="Learn Hub"
        onCta={() => {
          const target =
            activeSubTab === 'trivia'
              ? triviaRef.current
              : activeSubTab === 'videos'
                ? videoFeedRef.current
                : articleFeedRef.current;
          target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          onCardAction(
            activeSubTab === 'trivia'
              ? 'Jumped to the trivia awareness questions.'
              : activeSubTab === 'videos'
                ? 'Jumped to the video lessons.'
                : 'Jumped to the article reader and article feed.'
          );
        }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('articles')}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            activeSubTab === 'articles'
              ? 'border-violet-400/28 bg-violet-500/12 text-white'
              : 'border-white/10 bg-white/5 text-white/62 hover:bg-white/8'
          }`}
        >
          Articles
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('videos')}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            activeSubTab === 'videos'
              ? 'border-violet-400/28 bg-violet-500/12 text-white'
              : 'border-white/10 bg-white/5 text-white/62 hover:bg-white/8'
          }`}
        >
          Videos
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('trivia')}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            activeSubTab === 'trivia'
              ? 'border-violet-400/28 bg-violet-500/12 text-white'
              : 'border-white/10 bg-white/5 text-white/62 hover:bg-white/8'
          }`}
        >
          Trivia Awareness Questions
        </button>
      </div>

      {activeSubTab === 'articles' || activeSubTab === 'videos' ? (
        <div ref={activeSubTab === 'videos' ? videoFeedRef : articleFeedRef} className="space-y-5">
          {featuredItem ? (
            <section ref={featuredResourceRef} className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_340px]">
              <div className="rounded-[24px] border border-white/10 bg-[#171c26] p-4">
                <div className="aspect-video overflow-hidden rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.45),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.22),transparent_24%),linear-gradient(180deg,#111827_0%,#0f172a_100%)] p-6">
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-white/72">
                        {featuredItem.kind === 'video' ? 'YouTube lesson' : featuredItem.kind === 'article' ? 'Reading' : 'Reflection'}
                      </span>
                      <span className="text-xs uppercase tracking-[0.28em] text-white/42">{featuredItem.sourceName ?? 'EcoArcade'}</span>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-violet-200/70">Featured resource</p>
                      <h3 className="mt-3 max-w-lg text-3xl font-semibold tracking-tight text-white">
                        {featuredItem.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-white/62">{featuredItem.summary}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-white/40">
                      {featuredItem.kind} / {featuredItem.minutes} min
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{featuredItem.title}</h2>
                    <p className="mt-2 text-sm text-white/60">
                      {featuredItem.tags?.join(' ')}{featuredItem.sourceName ? ` / ${featuredItem.sourceName}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleContentAction(featuredItem)}
                      className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                    >
                      {featuredItem.kind === 'article' ? 'Read article' : featuredItem.kind === 'video' ? 'Watch on YouTube' : 'Complete reflection'}
                    </button>
                    {featuredItem.kind === 'article' && featuredItem.mediaUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          openExternal(featuredItem.mediaUrl);
                          onCardAction(`Opened the original source for ${featuredItem.title}.`);
                        }}
                        className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                      >
                        Open source
                      </button>
                    ) : null}
                    {!featuredItem.completed ? (
                      <button
                        type="button"
                        onClick={() => onComplete(featuredItem.id)}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#10131c] transition hover:-translate-y-0.5"
                      >
                        Mark complete +{featuredItem.points}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white/60"
                      >
                        Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#171c26] p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-white/40">Queue</p>
                <div className="mt-4 space-y-3">
                  {(activeSubTab === 'videos' ? videoItems : articleItems).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.kind === 'article') {
                          focusArticleReader(item);
                          onCardAction(`Opened ${item.title} in the article reader.`);
                          return;
                        }

                        focusFeaturedResource(item);
                        onCardAction(`Selected ${item.title}.`);
                      }}
                      className={`flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left transition ${
                        featuredItem.id === item.id
                          ? 'border-violet-400/28 bg-violet-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/8'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{item.title}</div>
                        <div className="mt-1 text-xs text-white/42">
                          {item.kind} / {item.minutes} min{item.sourceName ? ` / ${item.sourceName}` : ''}
                        </div>
                      </div>
                      <span className="text-xs text-white/48">{item.completed ? 'Done' : `+${item.points}`}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {activeSubTab === 'articles' && featuredItem?.kind === 'article' && featuredItem.articleSections?.length ? (
            <section
              ref={articleReaderRef}
              className="rounded-[24px] border border-white/10 bg-[#171c26] p-5 sm:p-6"
            >
              <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-white/40">Article Reader</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{featuredItem.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">{featuredItem.summary}</p>
                </div>
                <div className="text-sm text-white/48">
                  {featuredItem.minutes} min read{featuredItem.sourceName ? ` / ${featuredItem.sourceName}` : ''}
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {featuredItem.articleSections.map((section) => (
                  <article key={section.heading} className="space-y-3">
                    <h4 className="text-lg font-semibold tracking-tight text-white">{section.heading}</h4>
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-white/68">
                        {paragraph}
                      </p>
                    ))}
                    {section.bullets?.length ? (
                      <div className="grid gap-3 sm:grid-cols-3">
                        {section.bullets.map((bullet) => (
                          <div key={bullet} className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/68">
                            {bullet}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-3">
            {(activeSubTab === 'videos' ? filteredVideoItems : filteredArticleItems).map((item) => (
              <FeedCard
                key={item.id}
                item={toLearnFeed(item)}
                onOpen={() => {
                  if (item.kind === 'article') {
                    focusArticleReader(item);
                    onCardAction(`Opened ${item.title} in the article reader.`);
                    return;
                  }

                  focusFeaturedResource(item);
                  onCardAction(`Displayed ${item.title}.`);
                }}
                onAction={() => handleContentAction(item)}
                actionLabel={
                  item.kind === 'article'
                    ? 'Read article'
                    : item.kind === 'video'
                      ? 'View lesson'
                      : item.completed
                        ? 'Completed'
                        : `Earn +${item.points}`
                }
              />
            ))}
          </section>
        </div>
      ) : (
        <div ref={triviaRef} className="space-y-5">
          {selectedTrivia && selectedTriviaItem ? (
            <section ref={triviaDetailRef} className="rounded-[24px] border border-white/10 bg-[#171c26] p-5 sm:p-6">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-white/40">Selected Trivia</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{selectedTrivia.question}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">{selectedTriviaItem.summary}</p>
                </div>
                <div className="text-sm text-white/48">
                  {selectedTriviaItem.minutes} min challenge / +{selectedTriviaItem.points} points
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {selectedTrivia.options.map((option, optionIndex) => {
                  const selectedAnswer = selectedAnswers[selectedTrivia.itemId];
                  const selected = selectedAnswer === optionIndex;
                  const showCorrect = selectedAnswer !== undefined && optionIndex === selectedTrivia.correctIndex;

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={selectedTriviaItem.completed}
                      onClick={() => handleTriviaAnswer(selectedTrivia, optionIndex)}
                      className={`w-full rounded-[18px] border px-4 py-3 text-left text-sm transition ${
                        showCorrect
                          ? 'border-emerald-400/30 bg-emerald-500/10 text-white'
                          : selected
                            ? 'border-rose-400/30 bg-rose-500/10 text-white'
                            : 'border-white/10 bg-white/5 text-white/72 hover:bg-white/8'
                      } ${selectedTriviaItem.completed ? 'cursor-default opacity-90' : ''}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[18px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">
                  {selectedTriviaItem.completed
                    ? `Completed and earned +${selectedTriviaItem.points}`
                    : selectedAnswers[selectedTrivia.itemId] === selectedTrivia.correctIndex
                      ? 'Correct'
                      : selectedAnswers[selectedTrivia.itemId] !== undefined
                        ? 'Try again'
                        : `Worth +${selectedTriviaItem.points} points`}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/58">
                  {selectedAnswers[selectedTrivia.itemId] !== undefined
                    ? selectedTrivia.explanation
                    : 'Click one of the options above to answer this trivia card and earn points.'}
                </p>
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-3">
            {filteredTrivia.map((question) => {
              const item = triviaItems.find((entry) => entry.id === question.itemId);
              if (!item) {
                return null;
              }

              return (
                <FeedCard
                  key={question.itemId}
                  item={toLearnFeed(item)}
                  onOpen={() => {
                    focusTriviaQuestion(question.itemId);
                    onCardAction(`Displayed trivia: ${item.title}.`);
                  }}
                  onAction={() => {
                    focusTriviaQuestion(question.itemId);
                    onCardAction(`Opened question: ${item.title}.`);
                  }}
                  actionLabel={item.completed ? 'Completed' : 'Open question'}
                />
              );
            })}
          </section>
        </div>
      )}
    </div>
  );
}
