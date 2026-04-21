import { createRoot } from 'react-dom/client';
import { FloatingCounter } from './overlay/FloatingCounter';
import type { OverlaySnapshot } from '../types/domain';
import overlayCss from './overlay/overlay.css?inline';

const ROOT_ID = 'ecoarcade-overlay-root';

const emptySnapshot: OverlaySnapshot = {
  trackingEnabled: true,
  currentDomain: '',
  currentTabCO2: 0,
  dailyCO2: 0,
  weeklyCO2: 0,
  totalPoints: 0
};

async function getSnapshot(): Promise<OverlaySnapshot> {
  try {
    const response = (await chrome.runtime.sendMessage({
      action: 'getOverlaySnapshot',
      pageUrl: window.location.href
    })) as OverlaySnapshot;

    return response ?? emptySnapshot;
  } catch {
    return emptySnapshot;
  }
}

async function mount(): Promise<void> {
  if (window.top !== window.self || document.getElementById(ROOT_ID)) {
    return;
  }

  const host = document.createElement('div');
  host.id = ROOT_ID;
  document.documentElement.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'open' });
  const styleElement = document.createElement('style');
  styleElement.textContent = overlayCss;
  shadowRoot.appendChild(styleElement);

  const appRoot = document.createElement('div');
  shadowRoot.appendChild(appRoot);

  const reactRoot = createRoot(appRoot);

  const render = async () => {
    const snapshot = await getSnapshot();
    reactRoot.render(
      <FloatingCounter
        snapshot={snapshot}
        onOpenDashboard={() => {
          void chrome.runtime.sendMessage({ action: 'openEcoArcadeDashboard' });
        }}
      />
    );
  };

  await render();
  let intervalId: number | null = window.setInterval(() => {
    if (!document.hidden) {
      void render();
    }
  }, 10000);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
      return;
    }

    if (intervalId === null) {
      void render();
      intervalId = window.setInterval(() => {
        if (!document.hidden) {
          void render();
        }
      }, 10000);
    }
  });
}

void mount();
