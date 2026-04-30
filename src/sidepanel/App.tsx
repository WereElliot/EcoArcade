import { useEffect, useState } from 'react';
import type { DashboardSnapshot, TabId } from '../types/domain';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { InsightsPage } from './pages/InsightsPage';
import { LearnPage } from './pages/LearnPage';
import { ActPage } from './pages/ActPage';
import { CommunityPage } from './pages/CommunityPage';
import { RewardsPage } from './pages/RewardsPage';
import { RoutinePage } from './pages/RoutinePage';

const THEME_STORAGE_KEY = 'ecoarcade-theme-mode';

const emptySnapshot: DashboardSnapshot = {
  totalCO2: 0,
  totalPoints: 0,
  ecoTokens: 0,
  badges: [],
  membershipTier: 'premium',
  siteStats: {},
  history: { daily: {}, monthly: {} },
  streakDays: 0,
  lastActiveDay: '',
  routinePlan: {
    dailyCO2Limit: 12,
    articleGoal: 2,
    triviaGoal: 3,
    reflectionGoal: 1,
    enabled: false
  },
  learnCatalog: [],
  learnProgress: {},
  challenges: [],
  donations: [],
  actionProof: {
    status: 'idle',
    summary: '',
    minted: false,
    pointsAwarded: 0
  },
  currentTabCO2: 0,
  dailyCO2: 0,
  weeklyCO2: 0,
  currentDomain: '',
  level: 1,
  nextLevelPoints: 180
};

async function sendMessage<T>(message: object): Promise<T | null> {
  try {
    return (await chrome.runtime.sendMessage(message)) as T;
  } catch {
    return null;
  }
}

function getInitialThemeMode(): 'dark' | 'light' {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('insights');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showRoutinePlanner, setShowRoutinePlanner] = useState(false);
  const [learnInitialSubTab, setLearnInitialSubTab] = useState<'articles' | 'videos' | 'trivia'>('articles');
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(emptySnapshot);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [actionStatus, setActionStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(getInitialThemeMode);

  const refreshSnapshot = async () => {
    const response = await sendMessage<DashboardSnapshot>({ action: 'getDashboardData' });
    if (response) {
      setSnapshot(response);
    }
  };

  useEffect(() => {
    void refreshSnapshot();
    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        void refreshSnapshot();
      }
    }, 12000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  const completeLearnItem = async (itemId: string) => {
    const previousLevel = snapshot.level;
    const previousRank = snapshot.totalPoints;
    const response = await sendMessage<{ success: boolean; snapshot: DashboardSnapshot }>({
      action: 'completeLearnItem',
      itemId
    });
    if (response?.success) {
      setSnapshot(response.snapshot);
      if (response.snapshot.level > previousLevel) {
        setActionStatus(`Rank up. You reached level ${response.snapshot.level} with ${response.snapshot.totalPoints} Eco Points.`);
        return;
      }

      if (response.snapshot.totalPoints > previousRank) {
        setActionStatus(`Progress saved. ${response.snapshot.totalPoints} Eco Points total.`);
      }
    }
  };

  const saveRoutinePlan = async (routinePlan: DashboardSnapshot['routinePlan']) => {
    const response = await sendMessage<{ success: boolean; snapshot: DashboardSnapshot }>({
      action: 'saveRoutinePlan',
      routinePlan
    });
    if (response?.success) {
      setSnapshot(response.snapshot);
      setActionStatus('Climate routine saved locally. No login required, and your plan stays on this device.');
      setShowRoutinePlanner(false);
      setActiveTab('insights');
    }
  };

  const joinChallenge = async (challengeId: string) => {
    const response = await sendMessage<{ success: boolean; snapshot: DashboardSnapshot }>({
      action: 'joinChallenge',
      challengeId
    });
    if (response?.success) {
      setSnapshot(response.snapshot);
    }
  };

  const submitCrowdsourcedArticle = async (article: {
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
  }) => {
    const response = await sendMessage<{ success: boolean; reason?: string; snapshot?: DashboardSnapshot }>({
      action: 'submitCrowdsourcedArticle',
      article
    });
    if (response?.success && response.snapshot) {
      setSnapshot(response.snapshot);
      setActionStatus('Community article submitted and added to the in-app Learn library.');
      return;
    }

    setActionStatus(response?.reason ?? 'The community article could not be submitted.');
  };

  const createCommunityChallenge = async (challenge: {
    title: string;
    description: string;
    target: number;
    category: string;
    collectiveActionType: string;
  }) => {
    const response = await sendMessage<{ success: boolean; reason?: string; snapshot?: DashboardSnapshot }>({
      action: 'createCommunityChallenge',
      challenge
    });
    if (response?.success && response.snapshot) {
      setSnapshot(response.snapshot);
      setActionStatus('Premium community challenge published to the challenge board.');
      return;
    }

    setActionStatus(response?.reason ?? 'The challenge could not be created.');
  };

  const convertPoints = async () => {
    const response = await sendMessage<{ success: boolean; reason?: string; snapshot?: DashboardSnapshot }>({
      action: 'convertPointsToToken',
      points: 100
    });
    if (response?.success && response.snapshot) {
      setSnapshot(response.snapshot);
      setActionStatus('');
      return;
    }

    if (response?.reason) {
      setActionStatus(response.reason);
    }
  };

  const submitProof = async () => {
    if (!proofFile) {
      setActionStatus('Choose a photo first.');
      return;
    }

    setActionStatus('Reviewing proof...');
    const response = await sendMessage<{ success: boolean; snapshot: DashboardSnapshot }>({
      action: 'submitActionProof',
      fileName: proofFile.name,
      hasGps: /\.(jpe?g|heic|png)$/i.test(proofFile.name)
    });
    if (response?.success) {
      setSnapshot(response.snapshot);
      setActionStatus(response.snapshot.actionProof.summary);
    }
  };

  const navigateTo = (tab: TabId) => {
    setShowRoutinePlanner(false);
    setActiveTab(tab);
  };

  const openRoutinePlanner = () => {
    setShowRoutinePlanner(true);
    setActiveTab('insights');
  };

  const openLearnMode = (mode: 'articles' | 'trivia') => {
    setShowRoutinePlanner(false);
    setLearnInitialSubTab(mode);
    setActiveTab('learn');
    setActionStatus(
      mode === 'articles'
        ? 'Learn Hub opened on articles to support your daily reading mission.'
        : 'Learn Hub opened on trivia so you can complete your awareness target.'
    );
  };

  const handleCardAction = (message: string) => {
    setActionStatus(message);
  };

  return (
    <div className="eco-shell h-screen overflow-hidden">
      <div className="flex h-screen flex-col overflow-hidden">
        <TopBar
          snapshot={snapshot}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onBellClick={() => {
            setShowRoutinePlanner(false);
            setActiveTab('community');
            setActionStatus('Notifications opened the community missions view.');
          }}
          onLogoClick={() => {
            setShowRoutinePlanner(false);
            setActiveTab('insights');
          }}
          onStatClick={(tab) => {
            setShowRoutinePlanner(false);
            setActiveTab(tab);
          }}
          activeTab={activeTab}
          onTabSelect={(tab) => {
            setShowRoutinePlanner(false);
            setActiveTab(tab);
          }}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'))}
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidebar
            activeTab={activeTab}
            onSelect={(tab) => {
              setShowRoutinePlanner(false);
              setActiveTab(tab);
            }}
            onQuickAction={() => {
              setShowRoutinePlanner(false);
              setActiveTab('act');
              setActionStatus('Quick action opened the real-world action flow.');
            }}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
          />

          <div className="min-w-0 flex-1 overflow-hidden">
            <main className="h-full overflow-y-auto px-4 py-5 sm:px-5">
              <div className="mx-auto max-w-[1080px]">
                {actionStatus ? (
                  <div className="eco-toast mb-4 rounded-[18px] border px-4 py-3 text-sm">
                    {actionStatus}
                  </div>
                ) : null}
                {showRoutinePlanner ? (
                  <RoutinePage
                    snapshot={snapshot}
                    onSave={saveRoutinePlan}
                    onOpenLearn={openLearnMode}
                    onBack={() => setShowRoutinePlanner(false)}
                    onCardAction={handleCardAction}
                  />
                ) : null}
                {!showRoutinePlanner && activeTab === 'insights' ? (
                  <InsightsPage
                    snapshot={snapshot}
                    onNavigate={navigateTo}
                    onCardAction={handleCardAction}
                    onOpenRoutine={openRoutinePlanner}
                  />
                ) : null}
                {!showRoutinePlanner && activeTab === 'learn' ? (
                  <LearnPage
                    snapshot={snapshot}
                    onComplete={completeLearnItem}
                    onSubmitArticle={submitCrowdsourcedArticle}
                    searchQuery={searchQuery}
                    onCardAction={handleCardAction}
                    initialSubTab={learnInitialSubTab}
                  />
                ) : null}
                {!showRoutinePlanner && activeTab === 'act' ? (
                  <ActPage
                    snapshot={snapshot}
                    proofFile={proofFile}
                    onFileChange={setProofFile}
                    onSubmit={submitProof}
                    actionStatus={actionStatus}
                    onBannerAction={() => {
                      setActionStatus('Pick a proof image below, then verify the action.');
                    }}
                    onCardAction={handleCardAction}
                  />
                ) : null}
                {!showRoutinePlanner && activeTab === 'community' ? (
                  <CommunityPage
                    snapshot={snapshot}
                    onJoin={joinChallenge}
                    onCreateChallenge={createCommunityChallenge}
                    onCardAction={handleCardAction}
                  />
                ) : null}
                {!showRoutinePlanner && activeTab === 'rewards' ? (
                  <RewardsPage
                    snapshot={snapshot}
                    onConvert={convertPoints}
                    actionStatus={actionStatus}
                    onCardAction={handleCardAction}
                  />
                ) : null}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
