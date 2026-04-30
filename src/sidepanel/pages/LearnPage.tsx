import { useEffect, useMemo, useRef, useState } from 'react';
import type { DashboardSnapshot, LearnItem } from '../../types/domain';
import { toLearnFeed } from '../config';
import { FeedCard } from '../components/cards/FeedCard';
import { FeatureBanner } from '../components/cards/FeatureBanner';

type LearnSubTab = 'articles' | 'videos' | 'trivia';
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

const ARTICLE_PAGE_SIZE = 9;
const VIDEO_PAGE_SIZE = 9;
const TRIVIA_PAGE_SIZE = 6;

function getEmbeddedVideoUrl(item: LearnItem): string | null {
  if (item.embedUrl) {
    return item.embedUrl;
  }

  if (!item.mediaUrl) {
    return null;
  }

  const match = item.mediaUrl.match(/[?&]v=([^&]+)/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1` : null;
}

function hydrateCompletion(item: LearnItem, progress: Record<string, boolean>): LearnItem {
  return {
    ...item,
    completed: item.completed || Boolean(progress[item.id])
  };
}

function getVisibleCategories(items: LearnItem[]): string[] {
  return ['All', ...new Set(items.map((item) => item.category).filter((category): category is string => Boolean(category)))];
}

export function LearnPage({
  snapshot,
  onComplete,
  onSubmitArticle,
  searchQuery,
  onCardAction,
  initialSubTab = 'articles'
}: {
  snapshot: DashboardSnapshot;
  onComplete: (itemId: string) => void;
  onSubmitArticle: (article: {
    title: string;
    summary: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    author: string;
    sectionOneHeading: string;
    sectionOneBody: string;
    sectionTwoHeading: string;
    sectionTwoBody: string;
    bullets: string[];
  }) => void;
  searchQuery: string;
  onCardAction: (message: string) => void;
  initialSubTab?: LearnSubTab;
}) {
  const [activeSubTab, setActiveSubTab] = useState<LearnSubTab>(initialSubTab);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [selectedTriviaId, setSelectedTriviaId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [articleLimit, setArticleLimit] = useState(ARTICLE_PAGE_SIZE);
  const [videoLimit, setVideoLimit] = useState(VIDEO_PAGE_SIZE);
  const [triviaLimit, setTriviaLimit] = useState(TRIVIA_PAGE_SIZE);
  const [showArticleStudio, setShowArticleStudio] = useState(false);
  const [articleDraft, setArticleDraft] = useState({
    title: '',
    summary: '',
    category: 'Community action',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    author: '',
    sectionOneHeading: '',
    sectionOneBody: '',
    sectionTwoHeading: '',
    sectionTwoBody: '',
    bullets: ''
  });
  const featureRef = useRef<HTMLDivElement | null>(null);
  const articleReaderRef = useRef<HTMLDivElement | null>(null);
  const triviaReaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const catalog = useMemo(
    () => snapshot.learnCatalog
      .filter((item) => !item.levelRequirement || item.levelRequirement <= snapshot.level)
      .map((item) => hydrateCompletion(item, snapshot.learnProgress)),
    [snapshot.learnCatalog, snapshot.learnProgress, snapshot.level]
  );

  const articleItems = useMemo(
    () => catalog.filter((item) => item.kind === 'article' || item.kind === 'reflection'),
    [catalog]
  );
  const videoItems = useMemo(() => catalog.filter((item) => item.kind === 'video'), [catalog]);
  const triviaItems = useMemo(() => catalog.filter((item) => item.kind === 'quiz'), [catalog]);

  const currentCategories = useMemo(
    () =>
      activeSubTab === 'articles'
        ? getVisibleCategories(articleItems)
        : activeSubTab === 'videos'
          ? getVisibleCategories(videoItems)
          : getVisibleCategories(triviaItems),
    [activeSubTab, articleItems, triviaItems, videoItems]
  );

  const matchesFilters = (item: LearnItem) => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || item.difficulty === difficultyFilter;
    const haystack = [
      item.title,
      item.summary,
      item.category ?? '',
      item.author ?? '',
      item.sourceName ?? '',
      item.question ?? '',
      ...(item.tags ?? [])
    ]
      .join(' ')
      .toLowerCase();
    const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);

    return matchesCategory && matchesDifficulty && matchesQuery;
  };

  const filteredArticleItems = useMemo(() => articleItems.filter(matchesFilters), [articleItems, categoryFilter, difficultyFilter, normalizedQuery]);
  const filteredVideoItems = useMemo(() => videoItems.filter(matchesFilters), [videoItems, categoryFilter, difficultyFilter, normalizedQuery]);
  const filteredTriviaItems = useMemo(() => triviaItems.filter(matchesFilters), [triviaItems, categoryFilter, difficultyFilter, normalizedQuery]);

  const visibleArticleItems = filteredArticleItems.slice(0, articleLimit);
  const visibleVideoItems = filteredVideoItems.slice(0, videoLimit);
  const visibleTriviaItems = filteredTriviaItems.slice(0, triviaLimit);

  const selectedArticleOrVideo = useMemo(() => {
    const source = activeSubTab === 'videos' ? filteredVideoItems : filteredArticleItems;
    return source.find((item) => item.id === selectedContentId) ?? source[0] ?? null;
  }, [activeSubTab, filteredArticleItems, filteredVideoItems, selectedContentId]);

  const selectedTrivia = useMemo(
    () => filteredTriviaItems.find((item) => item.id === selectedTriviaId) ?? filteredTriviaItems[0] ?? null,
    [filteredTriviaItems, selectedTriviaId]
  );

  const guidedPath = useMemo(() => {
    const firstArticle = articleItems.find((item) => !item.completed) ?? articleItems[0] ?? null;
    const firstVideo = videoItems.find((item) => !item.completed) ?? videoItems[0] ?? null;
    const firstTrivia = triviaItems.find((item) => !item.completed) ?? triviaItems[0] ?? null;

    return [firstArticle, firstVideo, firstTrivia].filter((item): item is LearnItem => Boolean(item));
  }, [articleItems, triviaItems, videoItems]);

  const completedTriviaCount = useMemo(
    () => triviaItems.filter((item) => item.completed).length,
    [triviaItems]
  );

  const changeSubTab = (tab: LearnSubTab) => {
    setActiveSubTab(tab);
    setCategoryFilter('All');
    setDifficultyFilter('all');
    setArticleLimit(ARTICLE_PAGE_SIZE);
    setVideoLimit(VIDEO_PAGE_SIZE);
    setTriviaLimit(TRIVIA_PAGE_SIZE);
  };

  const focusArticles = (item: LearnItem) => {
    setSelectedContentId(item.id);
    requestAnimationFrame(() => {
      articleReaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const focusVideo = (item: LearnItem) => {
    setSelectedContentId(item.id);
    requestAnimationFrame(() => {
      featureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const focusTrivia = (item: LearnItem) => {
    setSelectedTriviaId(item.id);
    requestAnimationFrame(() => {
      triviaReaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleTriviaAnswer = (item: LearnItem, answerIndex: number) => {
    if (typeof item.correctIndex !== 'number') {
      return;
    }

    setSelectedAnswers((current) => ({ ...current, [item.id]: answerIndex }));

    if (answerIndex === item.correctIndex) {
      if (!item.completed) {
        onComplete(item.id);
      }
      onCardAction(item.explanation ?? 'Correct answer recorded.');
      return;
    }

    onCardAction('That answer is off. Try again and look for the strongest climate-aware choice.');
  };

  const activeCount =
    activeSubTab === 'articles'
      ? filteredArticleItems.length
      : activeSubTab === 'videos'
        ? filteredVideoItems.length
        : filteredTriviaItems.length;

  return (
    <div className="space-y-5">
      <FeatureBanner
        eyebrow="Learn hub"
        title="Read, watch, and answer inside EcoArcade without leaving the app."
        body="The Learn hub now runs from the local on-device catalog for a calmer, more reliable experience: in-app articles, embedded video lessons, and answerable trivia cards."
        cta={
          activeSubTab === 'articles'
            ? `Browse ${filteredArticleItems.length} articles`
            : activeSubTab === 'videos'
              ? `Browse ${filteredVideoItems.length} videos`
              : `Browse ${filteredTriviaItems.length} questions`
        }
        asideLabel="Learn"
        onCta={() => {
          if (activeSubTab === 'articles' && selectedArticleOrVideo) {
            focusArticles(selectedArticleOrVideo);
            return;
          }

          if (activeSubTab === 'videos' && selectedArticleOrVideo) {
            focusVideo(selectedArticleOrVideo);
            return;
          }

          if (selectedTrivia) {
            focusTrivia(selectedTrivia);
          }
        }}
      />

      <section className="eco-surface rounded-[24px] border p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-white/40">Article reader</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{articleItems.length}</p>
            <p className="mt-1 text-sm text-white/56">In-app reading items</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-white/40">Video lessons</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{videoItems.length}</p>
            <p className="mt-1 text-sm text-white/56">Embedded climate videos</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-white/40">Trivia complete</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{completedTriviaCount}</p>
            <p className="mt-1 text-sm text-white/56">Quiz wins recorded</p>
          </div>
        </div>
      </section>

      {guidedPath.length ? (
        <section className="eco-surface rounded-[24px] border p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.26em] text-white/40">Suggested path</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Move through one calm learning loop</h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">
            Start with one article, watch one matching lesson, then close the loop with one quiz question to grow points without overwhelming the page.
          </p>
          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            {guidedPath.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.kind === 'video') {
                    changeSubTab('videos');
                    focusVideo(item);
                    return;
                  }

                  if (item.kind === 'quiz') {
                    changeSubTab('trivia');
                    focusTrivia(item);
                    return;
                  }

                  changeSubTab('articles');
                  focusArticles(item);
                }}
                className="rounded-[20px] border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/8"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                  {index === 0 ? '1. Read' : index === 1 ? '2. Watch' : '3. Answer'}
                </p>
                <h4 className="mt-2 text-lg font-semibold text-white">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-white/58">{item.summary}</p>
                <p className="mt-3 text-xs text-white/46">{item.completed ? 'Completed' : `+${item.points} points`}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {(['articles', 'videos', 'trivia'] as LearnSubTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => changeSubTab(tab)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              activeSubTab === tab
                ? 'border-emerald-400/28 bg-emerald-500/12 text-white'
                : 'border-white/10 bg-white/5 text-white/62 hover:bg-white/8'
            }`}
          >
            {tab === 'articles' ? 'Articles' : tab === 'videos' ? 'Videos' : 'Trivia'}
          </button>
        ))}
      </div>

      <section className="eco-surface rounded-[24px] border p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-white/40">Filters</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
              {activeCount} matching {activeSubTab}
            </h3>
            <p className="mt-2 text-sm leading-7 text-white/60">
              Use dropdown filters instead of extra pills so the library stays calmer and easier to scan.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/40">Category</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="h-11 w-full rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-emerald-400/35"
              >
                {currentCategories.map((category) => (
                  <option key={category} value={category} className="bg-[#102016] text-white">
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/40">Difficulty</span>
              <select
                value={difficultyFilter}
                onChange={(event) => setDifficultyFilter(event.target.value as DifficultyFilter)}
                className="h-11 w-full rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-emerald-400/35"
              >
                <option value="all" className="bg-[#102016] text-white">All levels</option>
                <option value="easy" className="bg-[#102016] text-white">Easy</option>
                <option value="medium" className="bg-[#102016] text-white">Medium</option>
                <option value="hard" className="bg-[#102016] text-white">Hard</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {activeSubTab === 'videos' && selectedArticleOrVideo ? (
        <section ref={featureRef} className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
          <div className="eco-surface rounded-[24px] border p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.26em] text-white/40">Featured lesson</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{selectedArticleOrVideo.title}</h3>
            <p className="mt-2 text-sm leading-7 text-white/60">{selectedArticleOrVideo.summary}</p>
            <div className="mt-5 overflow-hidden rounded-[22px] border border-white/10 bg-black/30">
              {getEmbeddedVideoUrl(selectedArticleOrVideo) ? (
                <iframe
                  title={selectedArticleOrVideo.title}
                  src={getEmbeddedVideoUrl(selectedArticleOrVideo) ?? undefined}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="grid aspect-video place-items-center text-sm text-white/50">No embedded video available.</div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {selectedArticleOrVideo.mediaUrl ? (
                <button
                  type="button"
                  onClick={() => window.open(selectedArticleOrVideo.mediaUrl, '_blank', 'noopener,noreferrer')}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/8"
                >
                  Open source
                </button>
              ) : null}
              {!selectedArticleOrVideo.completed ? (
                <button
                  type="button"
                  onClick={() => onComplete(selectedArticleOrVideo.id)}
                  className="eco-cta rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
                >
                  Mark complete +{selectedArticleOrVideo.points}
                </button>
              ) : (
                <button type="button" disabled className="rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white/60">
                  Completed
                </button>
              )}
            </div>
          </div>

          <div className="eco-surface rounded-[24px] border p-4">
            <p className="text-xs uppercase tracking-[0.26em] text-white/40">Video queue</p>
            <div className="mt-4 space-y-3">
              {visibleVideoItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    focusVideo(item);
                    onCardAction(`Displayed ${item.title} in the in-app player.`);
                  }}
                  className={`flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left transition ${
                    selectedArticleOrVideo.id === item.id
                      ? 'border-emerald-400/28 bg-emerald-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/8'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">{item.title}</div>
                    <div className="mt-1 text-xs text-white/42">
                      {item.category ?? 'Video'} / {item.minutes} min / {item.difficulty ?? 'mixed'}
                    </div>
                  </div>
                  <span className="text-xs text-white/48">{item.completed ? 'Done' : `+${item.points}`}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {activeSubTab === 'articles' && selectedArticleOrVideo?.kind === 'article' && selectedArticleOrVideo.articleSections?.length ? (
        <section ref={articleReaderRef} className="eco-surface rounded-[24px] border p-5 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-white/40">Article reader</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{selectedArticleOrVideo.title}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">{selectedArticleOrVideo.summary}</p>
            </div>
            <div className="text-sm text-white/48">
              {selectedArticleOrVideo.minutes} min read / {selectedArticleOrVideo.author ?? selectedArticleOrVideo.sourceName ?? 'EcoArcade'}
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {selectedArticleOrVideo.articleSections.map((section) => (
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

          <div className="mt-5 flex flex-wrap gap-3">
            {selectedArticleOrVideo.mediaUrl ? (
              <button
                type="button"
                onClick={() => window.open(selectedArticleOrVideo.mediaUrl, '_blank', 'noopener,noreferrer')}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/8"
              >
                Open source
              </button>
            ) : null}
            {!selectedArticleOrVideo.completed ? (
              <button
                type="button"
                onClick={() => onComplete(selectedArticleOrVideo.id)}
                className="eco-cta rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
              >
                Mark complete +{selectedArticleOrVideo.points}
              </button>
            ) : (
              <button type="button" disabled className="rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white/60">
                Completed
              </button>
            )}
          </div>
        </section>
      ) : null}

      {activeSubTab === 'trivia' && selectedTrivia ? (
        <section ref={triviaReaderRef} className="eco-surface rounded-[24px] border p-5 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-white/40">Trivia detail</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {selectedTrivia.question ?? selectedTrivia.title}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">{selectedTrivia.summary}</p>
            </div>
            <div className="text-sm text-white/48">
              {selectedTrivia.category ?? 'Trivia'} / {selectedTrivia.difficulty ?? 'mixed'} / +{selectedTrivia.points} points
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {(selectedTrivia.options ?? []).map((option, optionIndex) => {
              const selectedAnswer = selectedAnswers[selectedTrivia.id];
              const selected = selectedAnswer === optionIndex;
              const showCorrect = selectedAnswer !== undefined && optionIndex === selectedTrivia.correctIndex;

              return (
                <button
                  key={`${selectedTrivia.id}-${optionIndex}`}
                  type="button"
                  disabled={selectedTrivia.completed}
                  onClick={() => handleTriviaAnswer(selectedTrivia, optionIndex)}
                  className={`w-full rounded-[18px] border px-4 py-3 text-left text-sm transition ${
                    showCorrect
                      ? 'border-emerald-400/30 bg-emerald-500/10 text-white'
                      : selected
                        ? 'border-rose-400/30 bg-rose-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/72 hover:bg-white/8'
                  } ${selectedTrivia.completed ? 'cursor-default opacity-90' : ''}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-[18px] border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">
              {selectedTrivia.completed
                ? `Completed and earned +${selectedTrivia.points}`
                : selectedAnswers[selectedTrivia.id] === selectedTrivia.correctIndex
                  ? 'Correct'
                  : selectedAnswers[selectedTrivia.id] !== undefined
                    ? 'Try again'
                    : `Worth +${selectedTrivia.points} points`}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/58">
              {selectedAnswers[selectedTrivia.id] !== undefined
                ? selectedTrivia.explanation ?? 'Answer recorded.'
                : 'Answer the question above to earn points and keep your awareness streak moving.'}
            </p>
          </div>
        </section>
      ) : null}

      {activeSubTab === 'articles' ? (
        <section className="eco-surface rounded-[24px] border p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-white/40">Community article desk</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">Crowdsource the next in-app article</h3>
              <p className="mt-2 text-sm leading-7 text-white/60">
                The article form stays tucked away by default so the Learn page remains calmer to navigate.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowArticleStudio((current) => !current)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/78 transition hover:bg-white/8"
            >
              {showArticleStudio ? 'Hide article form' : 'Open article form'}
            </button>
          </div>

          {showArticleStudio ? (
            <form
              className="mt-5 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmitArticle({
                  title: articleDraft.title,
                  summary: articleDraft.summary,
                  category: articleDraft.category,
                  difficulty: articleDraft.difficulty,
                  author: articleDraft.author,
                  sectionOneHeading: articleDraft.sectionOneHeading,
                  sectionOneBody: articleDraft.sectionOneBody,
                  sectionTwoHeading: articleDraft.sectionTwoHeading,
                  sectionTwoBody: articleDraft.sectionTwoBody,
                  bullets: articleDraft.bullets.split(',').map((bullet) => bullet.trim()).filter(Boolean)
                });
                setArticleDraft({
                  title: '',
                  summary: '',
                  category: 'Community action',
                  difficulty: 'easy',
                  author: '',
                  sectionOneHeading: '',
                  sectionOneBody: '',
                  sectionTwoHeading: '',
                  sectionTwoBody: '',
                  bullets: ''
                });
                setShowArticleStudio(false);
              }}
            >
              <input
                value={articleDraft.title}
                onChange={(event) => setArticleDraft((current) => ({ ...current, title: event.target.value }))}
                className="h-11 rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/35"
                placeholder="Article title"
              />
              <input
                value={articleDraft.summary}
                onChange={(event) => setArticleDraft((current) => ({ ...current, summary: event.target.value }))}
                className="h-11 rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/35"
                placeholder="Short summary"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  value={articleDraft.category}
                  onChange={(event) => setArticleDraft((current) => ({ ...current, category: event.target.value }))}
                  className="h-11 rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/35"
                  placeholder="Category"
                />
                <input
                  value={articleDraft.author}
                  onChange={(event) => setArticleDraft((current) => ({ ...current, author: event.target.value }))}
                  className="h-11 rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/35"
                  placeholder="Author name"
                />
                <select
                  value={articleDraft.difficulty}
                  onChange={(event) =>
                    setArticleDraft((current) => ({
                      ...current,
                      difficulty: event.target.value as 'easy' | 'medium' | 'hard'
                    }))
                  }
                  className="h-11 rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-emerald-400/35"
                >
                  <option value="easy" className="bg-[#102016] text-white">Easy</option>
                  <option value="medium" className="bg-[#102016] text-white">Medium</option>
                  <option value="hard" className="bg-[#102016] text-white">Hard</option>
                </select>
              </div>
              <input
                value={articleDraft.sectionOneHeading}
                onChange={(event) => setArticleDraft((current) => ({ ...current, sectionOneHeading: event.target.value }))}
                className="h-11 rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/35"
                placeholder="Section one heading"
              />
              <textarea
                value={articleDraft.sectionOneBody}
                onChange={(event) => setArticleDraft((current) => ({ ...current, sectionOneBody: event.target.value }))}
                className="min-h-[110px] rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/35"
                placeholder="Section one body"
              />
              <input
                value={articleDraft.sectionTwoHeading}
                onChange={(event) => setArticleDraft((current) => ({ ...current, sectionTwoHeading: event.target.value }))}
                className="h-11 rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/35"
                placeholder="Section two heading"
              />
              <textarea
                value={articleDraft.sectionTwoBody}
                onChange={(event) => setArticleDraft((current) => ({ ...current, sectionTwoBody: event.target.value }))}
                className="min-h-[110px] rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/35"
                placeholder="Section two body"
              />
              <input
                value={articleDraft.bullets}
                onChange={(event) => setArticleDraft((current) => ({ ...current, bullets: event.target.value }))}
                className="h-11 rounded-[18px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/35"
                placeholder="Key bullets, separated by commas"
              />
              <button type="submit" className="eco-cta rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5">
                Submit community article
              </button>
            </form>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-3">
        {(activeSubTab === 'articles'
          ? visibleArticleItems
          : activeSubTab === 'videos'
            ? visibleVideoItems
            : visibleTriviaItems
        ).map((item) => (
          <FeedCard
            key={item.id}
            item={toLearnFeed(item)}
            onOpen={() => {
              if (item.kind === 'video') {
                focusVideo(item);
                onCardAction(`Displayed ${item.title} in the in-app player.`);
                return;
              }

              if (item.kind === 'quiz') {
                focusTrivia(item);
                onCardAction(`Displayed ${item.title}.`);
                return;
              }

              focusArticles(item);
              onCardAction(`Displayed ${item.title} in the in-app reader.`);
            }}
            onAction={() => {
              if (item.kind === 'video') {
                focusVideo(item);
                return;
              }

              if (item.kind === 'quiz') {
                focusTrivia(item);
                return;
              }

              focusArticles(item);
            }}
            actionLabel={
              item.kind === 'video'
                ? 'Watch in app'
                : item.kind === 'quiz'
                  ? item.completed ? 'Completed' : 'Open question'
                  : 'Read article'
            }
          />
        ))}
      </section>

      {(activeSubTab === 'articles' && visibleArticleItems.length < filteredArticleItems.length) ||
      (activeSubTab === 'videos' && visibleVideoItems.length < filteredVideoItems.length) ||
      (activeSubTab === 'trivia' && visibleTriviaItems.length < filteredTriviaItems.length) ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (activeSubTab === 'articles') {
                setArticleLimit((current) => current + ARTICLE_PAGE_SIZE);
                return;
              }

              if (activeSubTab === 'videos') {
                setVideoLimit((current) => current + VIDEO_PAGE_SIZE);
                return;
              }

              setTriviaLimit((current) => current + TRIVIA_PAGE_SIZE);
            }}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/78 transition hover:bg-white/8"
          >
            Load more {activeSubTab}
          </button>
        </div>
      ) : null}
    </div>
  );
}
