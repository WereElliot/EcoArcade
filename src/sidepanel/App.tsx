import { useEffect, useState } from 'react';
import type { DashboardSnapshot, TabId } from '../types/domain';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { InsightsPage } from './pages/InsightsPage';
import { LearnPage } from './pages/LearnPage';
import { ActPage } from './pages/ActPage';
import { CommunityPage } from './pages/CommunityPage';
import { RewardsPage } from './pages/RewardsPage';

const THEME_STORAGE_KEY = 'ecoarcade-theme-mode';

const emptySnapshot: DashboardSnapshot = {
  totalCO2: 0,
  totalPoints: 0,
  ecoTokens: 0,
  badges: [],
  siteStats: {},
  history: { daily: {}, monthly: {} },
  streakDays: 0,
  lastActiveDay: '',
  learnCatalog: [],
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
    const response = await sendMessage<{ success: boolean; snapshot: DashboardSnapshot }>({
      action: 'completeLearnItem',
      itemId
    });
    if (response?.success) {
      setSnapshot(response.snapshot);
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
    setActiveTab(tab);
  };

  const handleCardAction = (message: string) => {
    setActionStatus(message);
  };

  return (
    <div className="eco-shell min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar
          activeTab={activeTab}
          onSelect={setActiveTab}
          onQuickAction={() => {
            setActiveTab('act');
            setActionStatus('Quick action opened the real-world action flow.');
          }}
        />

        <div className="min-w-0 flex-1">
          <TopBar
            snapshot={snapshot}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onBellClick={() => {
              setActiveTab('community');
              setActionStatus('Notifications opened the community missions view.');
            }}
            onLogoClick={() => setActiveTab('insights')}
            onStatClick={setActiveTab}
            activeTab={activeTab}
            onTabSelect={setActiveTab}
            themeMode={themeMode}
            onToggleTheme={() => setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'))}
          />
          <main className="px-4 py-5 sm:px-5">
            <div className="mx-auto max-w-[1080px]">
              {actionStatus ? (
                <div className="eco-toast mb-4 rounded-[18px] border px-4 py-3 text-sm">
                  {actionStatus}
                </div>
              ) : null}
              {activeTab === 'insights' ? (
                <InsightsPage snapshot={snapshot} onNavigate={navigateTo} onCardAction={handleCardAction} />
              ) : null}
              {activeTab === 'learn' ? (
                <LearnPage
                  snapshot={snapshot}
                  onComplete={completeLearnItem}
                  searchQuery={searchQuery}
                  onCardAction={handleCardAction}
                />
              ) : null}
              {activeTab === 'act' ? (
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
              {activeTab === 'community' ? (
                <CommunityPage snapshot={snapshot} onJoin={joinChallenge} onCardAction={handleCardAction} />
              ) : null}
              {activeTab === 'rewards' ? (
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
  );
}
