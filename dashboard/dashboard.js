// EcoArcade Dashboard Script

const THEME_STORAGE_KEY = 'ecoArcadeDashboardTheme';
const POPUP_TARGET_STORAGE_KEY = 'ecoArcadePopupTarget';

const awarenessVideos = [
    {
        id: 'fxNOtVblhWc',
        title: "YouTube's surprising carbon footprint",
        description: 'A short explainer on the emissions behind online video and what the numbers really mean.',
        url: 'https://www.youtube.com/watch?v=fxNOtVblhWc'
    },
    {
        id: 'UFK4hqeRhIc',
        title: 'How are data centers powered sustainably?',
        description: 'A short overview of how data centers use power and why energy sourcing matters for digital emissions.',
        url: 'https://www.youtube.com/watch?v=UFK4hqeRhIc'
    },
    {
        id: 'ozLbD42lcqQ',
        title: 'The Unknown Infrastructure that Powers our World',
        description: 'A concise explainer on the physical infrastructure behind the internet, including the energy and cooling demands of data centers.',
        url: 'https://www.youtube.com/watch?v=ozLbD42lcqQ'
    },
    {
        id: 'a9yO-K8mwL0',
        title: 'Climate Change: Your carbon footprint explained - BBC News',
        description: 'A concise BBC explainer on carbon footprints that helps frame digital emissions in the wider climate conversation.',
        url: 'https://www.youtube.com/watch?v=a9yO-K8mwL0'
    },
    {
        id: 'u5h7AyRLQPA',
        title: 'Digital Carbon footprint: A Climate challenge | Priya Munshi | TEDxBistupur',
        description: 'A talk focused directly on digital carbon footprint as a modern climate challenge.',
        url: 'https://www.youtube.com/watch?v=u5h7AyRLQPA'
    },
    {
        id: 'aBL0f0A3D2g',
        title: 'How to Reduce Your Digital Carbon Footprint',
        description: 'A practical guide to reducing the emissions linked to everyday online habits.',
        url: 'https://www.youtube.com/watch?v=aBL0f0A3D2g'
    },
    {
        id: 'hgLnE9rQB7A',
        title: 'The carbon footprint of the internet-explained',
        description: 'A focused explainer on why the internet has an energy cost and where those emissions come from.',
        url: 'https://www.youtube.com/watch?v=hgLnE9rQB7A'
    },
    {
        id: 'nGU4P243BUI',
        title: 'Reducing our digital carbon footprint one search at a time',
        description: 'A short talk on how ordinary digital behavior adds up and where small changes can help.',
        url: 'https://www.youtube.com/watch?v=nGU4P243BUI'
    },
    {
        id: 'eOPetDY-nss',
        title: "The Internet's Unseen Carbon Footprint",
        description: 'A documentary-style explanation of hidden emissions across networks, devices, and platforms.',
        url: 'https://www.youtube.com/watch?v=eOPetDY-nss'
    },
    {
        id: 'U3ofSXCA_Ts',
        title: 'Does Internet Streaming Impact Your Carbon Footprint?',
        description: 'A direct explainer on streaming emissions and the climate cost of video-heavy habits.',
        url: 'https://www.youtube.com/watch?v=U3ofSXCA_Ts'
    },
    {
        id: 'Ra6z1_C0tqM',
        title: 'Is Cloud Computing Bad For The Environment?',
        description: 'A useful overview of how cloud services connect to the internet carbon footprint.',
        url: 'https://www.youtube.com/watch?v=Ra6z1_C0tqM'
    },
    {
        id: '1elHsKSRqwU',
        title: 'AI Data Centers: The New Climate Threat',
        description: 'A short explainer linking AI growth to data-center expansion and climate pressure.',
        url: 'https://www.youtube.com/watch?v=1elHsKSRqwU'
    },
    {
        id: 'VT6sepITths',
        title: 'Beyond Energy Efficiency - Life Cycle Based Data Centre Sustainability',
        description: 'A broader sustainability view that goes beyond electricity use alone.',
        url: 'https://www.youtube.com/watch?v=VT6sepITths'
    },
    {
        id: 't-8TDOFqkQA',
        title: "Exposing The Dark Side of America's AI Data Center Explosion",
        description: 'A report on the scale and consequences of new AI data-center buildout.',
        url: 'https://www.youtube.com/watch?v=t-8TDOFqkQA'
    },
    {
        id: 'InJsWEoppo8',
        title: 'Data centers seek sustainable solutions to rising water consumption',
        description: 'A practical look at water use and cooling as part of digital infrastructure impact.',
        url: 'https://www.youtube.com/watch?v=InJsWEoppo8'
    },
    {
        id: 'SkWzwoDIGmE',
        title: 'How AI and data centers impact climate change',
        description: 'A plain-language explainer on how computing demand turns into emissions.',
        url: 'https://www.youtube.com/watch?v=SkWzwoDIGmE'
    },
    {
        id: 'XpSIS7xvdb4',
        title: 'Explained: Decarbonization Of Data Centers',
        description: 'A useful summary of the strategies used to cut data-center emissions.',
        url: 'https://www.youtube.com/watch?v=XpSIS7xvdb4'
    },
    {
        id: 'fjNacsyp28s',
        title: "How big is AI's carbon footprint? | BBC News",
        description: 'A short BBC segment on the emissions costs tied to AI systems and infrastructure.',
        url: 'https://www.youtube.com/watch?v=fjNacsyp28s'
    },
    {
        id: 'CMWoA2qmpOE',
        title: 'The carbon footprint of video streaming',
        description: 'A direct explainer about the climate impact of streaming video online.',
        url: 'https://www.youtube.com/watch?v=CMWoA2qmpOE'
    },
    {
        id: 'CojlMxotcWk',
        title: 'The Hidden Carbon Footprint of Streaming, Smartphones, and Social Media',
        description: 'A wider view of emissions across several of the most common digital behaviors.',
        url: 'https://www.youtube.com/watch?v=CojlMxotcWk'
    },
    {
        id: '0rUGnHfExV0',
        title: 'The Dark Side of Streaming: Carbon Footprint Of Your Netflix Binge',
        description: 'A streaming-specific explainer that fits the dashboard home screen well.',
        url: 'https://www.youtube.com/watch?v=0rUGnHfExV0'
    },
    {
        id: 'R_7NNYrdWTs',
        title: 'Can Green Software Push Sustainability Further?',
        description: 'A discussion of how software engineering choices can reduce environmental impact.',
        url: 'https://www.youtube.com/watch?v=R_7NNYrdWTs'
    },
    {
        id: 'iW7xksxQZ3Q',
        title: 'The Need for Green Software',
        description: 'A short explanation of why software design itself matters for sustainability.',
        url: 'https://www.youtube.com/watch?v=iW7xksxQZ3Q'
    },
    {
        id: '_lYT-knNMTI',
        title: 'The Principles of Green Software',
        description: 'A deeper software-focused talk on designing applications with lower energy impact.',
        url: 'https://www.youtube.com/watch?v=_lYT-knNMTI'
    },
    {
        id: 'UfKxubF9ifY',
        title: 'How Does Cloud Computing Impact Energy Use?',
        description: 'A useful infrastructure explainer about cloud workloads and power demand.',
        url: 'https://www.youtube.com/watch?v=UfKxubF9ifY'
    },
    {
        id: '62_GGWKdlic',
        title: 'Green Software Engineering Explained',
        description: 'A practical engineering-level introduction to building more sustainable software.',
        url: 'https://www.youtube.com/watch?v=62_GGWKdlic'
    },
    {
        id: 'fyXtJUd2c3Q',
        title: 'AI can be a climate warrior, but what about its carbon footprint?',
        description: 'A balanced perspective on AI as both a climate tool and an emissions source.',
        url: 'https://www.youtube.com/watch?v=fyXtJUd2c3Q'
    },
    {
        id: 'gr5CG-DZz3w',
        title: 'The environmental impact of AI',
        description: 'A talk on how AI systems affect the environment and what people should understand about that tradeoff.',
        url: 'https://www.youtube.com/watch?v=gr5CG-DZz3w'
    }
];

let currentVideoId = null;
let currentVideoLoaded = false;
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

function initDashboard() {
    console.log('EcoArcade: Dashboard initializing...');

    setupThemeToggle();
    setupVideoSection();
    setupSectionNavigation();
    setupSidebarMenu();
    setupTopbarStatusMenu();
    setupInsightShortcuts();
    setupBrandHomeShortcut();
    renderData();

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync') {
            renderData();
        }
    });
}

function setupThemeToggle() {
    const root = document.documentElement;
    const body = document.body;
    const toggleBtn = document.getElementById('themeToggleBtn');
    const icon = toggleBtn?.querySelector('.theme-toggle-icon');

    if (!root || !toggleBtn) return;

    const getStoredTheme = () => {
        try {
            return window.localStorage.getItem(THEME_STORAGE_KEY);
        } catch (error) {
            console.warn('EcoArcade: could not read theme preference.', error);
            return null;
        }
    };

    const saveTheme = (theme) => {
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (error) {
            console.warn('EcoArcade: could not persist theme preference.', error);
        }
    };

    const getInitialTheme = () => {
        const storedTheme = getStoredTheme();
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }

        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    };

    const applyTheme = (theme) => {
        root.setAttribute('data-theme', theme);
        if (body) {
            body.setAttribute('data-theme', theme);
        }

        const nextTheme = theme === 'light' ? 'dark' : 'light';
        const currentThemeLabel = theme === 'light' ? 'Light mode' : 'Dark mode';
        const label = `Switch to ${nextTheme} mode`;
        toggleBtn.setAttribute('aria-pressed', String(theme === 'light'));
        toggleBtn.setAttribute('aria-label', label);
        toggleBtn.title = label;
        toggleBtn.dataset.theme = theme;
        if (icon) {
            icon.textContent = theme === 'light' ? '\u2600' : '\u263E';
        }
        root.style.colorScheme = theme;
        if (body) {
            body.style.colorScheme = theme;
        }
        const liveRegion = toggleBtn.querySelector('.sr-only');
        if (liveRegion) {
            liveRegion.textContent = `${currentThemeLabel}. ${label}.`;
        }
    };

    let currentTheme = getInitialTheme();
    applyTheme(currentTheme);

    toggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
        saveTheme(currentTheme);
    });
}

function setupSidebarMenu() {
    const shell = document.querySelector('.dashboard-shell');
    const sidebar = document.getElementById('sidebarMenu');
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const navLinks = Array.from(document.querySelectorAll('[data-section-link]'));
    const compactMediaQuery = window.matchMedia('(max-width: 860px)');
    const storageKey = 'ecoArcadeDashboardSidebarCollapsed';

    if (!shell || !sidebar || !toggleBtn) return;

    let desktopCollapsed = false;

    try {
        desktopCollapsed = window.localStorage.getItem(storageKey) === 'true';
    } catch (error) {
        console.warn('EcoArcade: could not restore sidebar state.', error);
    }

    const isCompactLayout = () => compactMediaQuery.matches;
    const isCollapsed = () => shell.classList.contains('sidebar-collapsed');

    const setDesktopPreference = (collapsed) => {
        desktopCollapsed = collapsed;

        try {
            window.localStorage.setItem(storageKey, String(collapsed));
        } catch (error) {
            console.warn('EcoArcade: could not persist sidebar state.', error);
        }
    };

    const applySidebarState = (collapsed) => {
        shell.classList.toggle('sidebar-collapsed', collapsed);
        toggleBtn.setAttribute('aria-expanded', String(!collapsed));
        toggleBtn.setAttribute('aria-label', collapsed ? 'Expand navigation menu' : 'Collapse navigation menu');
        sidebar.setAttribute('aria-hidden', String(collapsed));
    };

    const openSidebar = () => {
        if (!isCompactLayout()) {
            setDesktopPreference(false);
        }

        applySidebarState(false);
    };

    const closeSidebar = () => {
        if (!isCompactLayout()) {
            setDesktopPreference(true);
        }

        applySidebarState(true);
    };

    const syncResponsiveState = () => {
        if (isCompactLayout()) {
            applySidebarState(true);
            return;
        }

        applySidebarState(desktopCollapsed);
    };

    const toggleSidebar = () => {
        if (isCollapsed()) {
            openSidebar();
            return;
        }

        closeSidebar();
    };

    toggleBtn.addEventListener('click', toggleSidebar);

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (isCompactLayout()) {
                applySidebarState(true);
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !isCollapsed()) {
            closeSidebar();
        }
    });

    if (typeof compactMediaQuery.addEventListener === 'function') {
        compactMediaQuery.addEventListener('change', syncResponsiveState);
    } else if (typeof compactMediaQuery.addListener === 'function') {
        compactMediaQuery.addListener(syncResponsiveState);
    } else {
        window.addEventListener('resize', syncResponsiveState);
    }

    syncResponsiveState();
}

function setupTopbarStatusMenu() {
    const shell = document.querySelector('.dashboard-shell');
    const toggleBtn = document.getElementById('topbarProfileToggleBtn');
    const statusPanel = document.getElementById('topbarStatusPanel');
    const compactMediaQuery = window.matchMedia('(max-width: 860px)');

    if (!shell || !toggleBtn || !statusPanel) return;

    const isCompactLayout = () => compactMediaQuery.matches;
    const isOpen = () => shell.classList.contains('topbar-status-open');

    const applyState = (open) => {
        const shouldOpen = isCompactLayout() ? open : false;
        shell.classList.toggle('topbar-status-open', shouldOpen);
        toggleBtn.setAttribute('aria-expanded', String(shouldOpen));
        statusPanel.setAttribute('aria-hidden', String(isCompactLayout() ? !shouldOpen : false));
    };

    const closeMenu = () => applyState(false);
    const openMenu = () => applyState(true);

    toggleBtn.addEventListener('click', (event) => {
        if (!isCompactLayout()) return;

        event.stopPropagation();

        if (isOpen()) {
            closeMenu();
            return;
        }

        openMenu();
    });

    document.addEventListener('click', (event) => {
        if (!isCompactLayout() || !isOpen()) return;
        if (toggleBtn.contains(event.target) || statusPanel.contains(event.target)) return;
        closeMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isOpen()) {
            closeMenu();
        }
    });

    const syncResponsiveState = () => {
        applyState(false);
    };

    if (typeof compactMediaQuery.addEventListener === 'function') {
        compactMediaQuery.addEventListener('change', syncResponsiveState);
    } else if (typeof compactMediaQuery.addListener === 'function') {
        compactMediaQuery.addListener(syncResponsiveState);
    } else {
        window.addEventListener('resize', syncResponsiveState);
    }

    applyState(false);
}

function setupInsightShortcuts() {
    const totalCarbonCard = document.getElementById('totalCarbonCard');
    const ecoPointsCard = document.getElementById('ecoPointsCard');
    const trackedSitesCard = document.getElementById('trackedSitesCard');
    const topSiteCard = document.getElementById('topSiteCard');
    const milestoneCard = document.getElementById('milestoneCard');
    const comparisonCard = document.getElementById('comparisonCard');

    if (totalCarbonCard) {
        totalCarbonCard.addEventListener('click', () => {
            scrollToDashboardTarget('sites');
        });
    }

    if (ecoPointsCard) {
        ecoPointsCard.addEventListener('click', () => {
            openExtensionPopupFromDashboard();
        });
    }

    if (trackedSitesCard) {
        trackedSitesCard.addEventListener('click', () => {
            scrollToDashboardTarget('sites');
        });
    }

    if (topSiteCard) {
        topSiteCard.addEventListener('click', () => {
            scrollToDashboardTarget('sites');
        });
    }

    if (milestoneCard) {
        milestoneCard.addEventListener('click', () => {
            openQuizPopupFromDashboard();
        });
    }

    if (comparisonCard) {
        comparisonCard.addEventListener('click', () => {
            scrollToDashboardTarget('userComparisonRow');
        });
    }
}

function setupBrandHomeShortcut() {
    const brandHomeBtn = document.getElementById('brandHomeBtn');

    if (!brandHomeBtn) return;

    brandHomeBtn.addEventListener('click', () => {
        scrollToDashboardTarget('home');
    });
}

function scrollToDashboardTarget(targetId) {
    const target = document.getElementById(targetId);

    if (!target) return;

    target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

async function openQuizPopupFromDashboard() {
    await openExtensionPopupFromDashboard('quizContainer');
}

async function openExtensionPopupFromDashboard(targetId = '') {
    const popupHash = targetId ? `#${targetId}` : '';
    const popupUrl = chrome.runtime.getURL(`popup/popup.html${popupHash}`);

    if (targetId) {
        await persistPopupTarget(targetId);
    }

    try {
        if (typeof chrome.action?.openPopup === 'function') {
            await chrome.action.openPopup();
            return;
        }
    } catch (error) {
        console.warn('EcoArcade: could not open the toolbar popup from the dashboard.', error);
    }

    try {
        if (chrome.windows?.create) {
            await chrome.windows.create({
                url: popupUrl,
                type: 'popup',
                width: 620,
                height: 840,
                focused: true
            });
            return;
        }
    } catch (error) {
        console.warn('EcoArcade: could not open popup window fallback.', error);
    }

    chrome.tabs.create({ url: popupUrl });
}

function persistPopupTarget(targetId) {
    if (chrome.storage?.session?.set) {
        return new Promise((resolve) => {
            chrome.storage.session.set({ [POPUP_TARGET_STORAGE_KEY]: targetId }, () => {
                if (chrome.runtime.lastError) {
                    persistPopupTargetFallback(targetId);
                }

                resolve();
            });
        });
    }

    persistPopupTargetFallback(targetId);
    return Promise.resolve();
}

function persistPopupTargetFallback(targetId) {
    try {
        window.localStorage.setItem(POPUP_TARGET_STORAGE_KEY, targetId);
    } catch (error) {
        console.warn('EcoArcade: could not persist popup target.', error);
    }
}

function setupVideoSection() {
    const refreshBtn = document.getElementById('refreshVideoBtn');
    const loadVideoBtn = document.getElementById('loadVideoBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadRandomAwarenessVideo);
    }
    if (loadVideoBtn) {
        loadVideoBtn.addEventListener('click', loadSelectedVideo);
    }

    loadRandomAwarenessVideo();
}

function loadRandomAwarenessVideo() {
    if (!awarenessVideos.length) return;

    const candidates = awarenessVideos.filter((video) => video.id !== currentVideoId);
    const pool = candidates.length ? candidates : awarenessVideos;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    currentVideoId = selected.id;
    currentVideoLoaded = false;

    const iframe = document.getElementById('awarenessVideo');
    const poster = document.getElementById('loadVideoBtn');
    const thumbnail = document.getElementById('videoThumbnail');
    const title = document.getElementById('videoTitle');
    const description = document.getElementById('videoDescription');
    const link = document.getElementById('videoLink');

    if (iframe) {
        iframe.src = '';
        iframe.classList.add('hidden');
    }
    if (poster) {
        poster.classList.remove('hidden');
    }
    if (thumbnail) thumbnail.src = `https://i.ytimg.com/vi/${selected.id}/hqdefault.jpg`;

    if (title) title.textContent = selected.title;
    if (description) description.textContent = selected.description;
    if (link) link.href = selected.url;
}

function loadSelectedVideo() {
    if (!currentVideoId || currentVideoLoaded) return;

    const iframe = document.getElementById('awarenessVideo');
    const poster = document.getElementById('loadVideoBtn');
    const appReferrer = `https://${chrome.runtime.id}.chromiumapp.org/`;

    if (iframe) {
        iframe.src = `https://www.youtube.com/embed/${currentVideoId}?rel=0&playsinline=1&origin=${encodeURIComponent(appReferrer)}&widget_referrer=${encodeURIComponent(appReferrer)}`;
        iframe.classList.remove('hidden');
    }
    if (poster) {
        poster.classList.add('hidden');
    }

    currentVideoLoaded = true;
}

function setupSectionNavigation() {
    const navLinks = Array.from(document.querySelectorAll('[data-section-link]'));
    const sections = Array.from(document.querySelectorAll('[data-section]'));

    if (!navLinks.length || !sections.length) return;

    const updateActiveLink = () => {
        let currentSection = sections[0];

        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 180) {
                currentSection = section;
            }
        });

        navLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.sectionLink === currentSection.dataset.section);
        });
    };

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const target = document.getElementById(link.dataset.sectionLink);
            if (!target) return;

            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    document.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
}

function renderData() {
    chrome.runtime.sendMessage({ action: 'getDashboardData' }, (response) => {
        if (chrome.runtime.lastError || !response) {
            console.warn('EcoArcade: Dashboard snapshot unavailable. Using sync fallback.');
            chrome.storage.sync.get(['totalCO2', 'totalPoints', 'siteStats'], (data) => {
                renderDashboardData({
                    totalCO2: data.totalCO2 || 0,
                    totalPoints: data.totalPoints || 0,
                    siteStats: data.siteStats || {}
                });
            });
            return;
        }

        renderDashboardData(response);
    });
}

function renderDashboardData(data) {
    const totalCO2 = data.totalCO2 || 0;
    const totalPoints = data.totalPoints || 0;
    const siteStats = data.siteStats || {};
    const domains = Object.keys(siteStats).sort((a, b) => siteStats[b].co2 - siteStats[a].co2);
    const topDomain = domains[0];
    const topDomainStats = topDomain ? siteStats[topDomain] : null;
    const trackedSites = domains.length;

    const co2Display = document.getElementById('totalCO2');
    if (co2Display) co2Display.textContent = formatCO2(totalCO2);

    const pointsDisplay = document.getElementById('totalPoints');
    if (pointsDisplay) pointsDisplay.textContent = Math.floor(totalPoints);

    const topbarPointsDisplay = document.getElementById('topbarPoints');
    if (topbarPointsDisplay) topbarPointsDisplay.textContent = Math.floor(totalPoints);

    const trackedSitesDisplay = document.getElementById('trackedSites');
    if (trackedSitesDisplay) trackedSitesDisplay.textContent = trackedSites;

    const rank = getRank(totalPoints);
    const nextMilestone = getNextMilestone(totalPoints);

    const rankDisplay = document.getElementById('currentRank');
    if (rankDisplay) {
        rankDisplay.textContent = rank;
        applyRankTone(rankDisplay, rank);
    }

    const nextBadgeText = document.getElementById('nextBadgeText');
    const milestoneTitle = document.getElementById('milestoneTitle');
    const milestoneDetails = document.getElementById('milestoneDetails');
    if (nextBadgeText && milestoneTitle && milestoneDetails) {
        if (nextMilestone) {
            const remaining = nextMilestone.points - totalPoints;
            nextBadgeText.innerHTML = `Next badge: ${formatRankTokenHTML(nextMilestone.label)} at ${nextMilestone.points} points`;
            milestoneTitle.textContent = nextMilestone.label;
            applyRankTone(milestoneTitle, nextMilestone.label);
            milestoneDetails.textContent = `${remaining} more points needed to unlock it.`;
        } else {
            nextBadgeText.textContent = 'All current badges unlocked';
            milestoneTitle.textContent = 'Top milestone reached';
            clearRankTone(milestoneTitle);
            milestoneDetails.textContent = 'You have unlocked every badge currently defined in the extension.';
        }
    }

    updateHeroSummary(totalCO2, trackedSites);
    updateComparison(totalCO2);
    updateTopSite(topDomain, topDomainStats);
    renderSiteStatsTable(domains, siteStats);
}

function updateComparison(totalCO2) {
    const globalDailyAvgGrams = 12500;
    const kenyaDailyAvgGrams = 1800;

    const userCompVal = document.getElementById('userCompVal');
    const userCompBar = document.getElementById('userCompBar');
    const comparisonHeadline = document.getElementById('comparisonHeadline');
    const comparisonText = document.getElementById('comparisonText');

    if (userCompVal) userCompVal.textContent = formatCO2(totalCO2);
    if (userCompBar) {
        const barWidth = Math.max((totalCO2 / globalDailyAvgGrams) * 100, 2);
        userCompBar.style.width = `${Math.min(barWidth, 100)}%`;
    }

    if (!comparisonHeadline || !comparisonText) return;

    if (totalCO2 < kenyaDailyAvgGrams) {
        comparisonHeadline.textContent = 'Well below a typical daily footprint';
        comparisonText.textContent = 'Your tracked browsing is lower than both the Kenya and global daily averages shown here.';
        return;
    }

    if (totalCO2 < globalDailyAvgGrams) {
        comparisonHeadline.textContent = 'Above Kenya average, below global average';
        comparisonText.textContent = 'Your tracked browsing has moved past the Kenya daily average but remains below the global daily average.';
        return;
    }

    comparisonHeadline.textContent = 'Above the global daily comparison';
    comparisonText.textContent = 'Your tracked browsing alone is now larger than the global daily comparison benchmark shown on this page.';
}

function updateTopSite(topDomain, topDomainStats) {
    const topSiteName = document.getElementById('topSiteName');
    const topSiteDetails = document.getElementById('topSiteDetails');

    if (!topSiteName || !topSiteDetails) return;

    if (!topDomain || !topDomainStats) {
        topSiteName.textContent = 'No data yet';
        topSiteDetails.textContent = 'Tracked sites will appear here once you have browsing activity.';
        return;
    }

    topSiteName.textContent = topDomain;
    topSiteDetails.textContent = `${formatCO2(topDomainStats.co2)} over ${formatTime(topDomainStats.time)}. ${describeImpact(topDomainStats.co2)}.`;
}

function renderSiteStatsTable(domains, siteStats) {
    const tableBody = document.getElementById('siteStatsBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!domains.length) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No tracking data yet. Visit a few sites and come back.</td></tr>';
        return;
    }

    domains.forEach((domain) => {
        const stats = siteStats[domain];
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${domain}</td>
            <td>${formatTime(stats.time)}</td>
            <td>${formatCO2(stats.co2)}</td>
            <td>${getImpactLevel(stats.co2)}</td>
        `;

        tableBody.appendChild(row);
    });
}

function updateHeroSummary(totalCO2, trackedSites) {
    const impactHeadline = document.getElementById('impactHeadline');
    const impactSummary = document.getElementById('impactSummary');
    const impactChip = document.getElementById('impactChip');

    if (!impactHeadline || !impactSummary || !impactChip) return;

    let headline = 'Your footprint is still light.';
    let summary = trackedSites === 0
        ? 'Browse as usual and check back after a few minutes of activity.'
        : `You have started building a picture across ${trackedSites} tracked site${trackedSites === 1 ? '' : 's'}.`;
    let chip = 'Low impact';
    let chipClass = '';

    if (totalCO2 >= 1000) {
        headline = 'Your tracked browsing is adding up.';
        summary = 'You have moved into a noticeably larger footprint. Focus on the sites with the biggest totals first.';
        chip = 'High impact';
        chipClass = 'high';
    } else if (totalCO2 >= 100) {
        headline = 'Your footprint is growing.';
        summary = 'The total is still manageable, but a few longer sessions are starting to dominate your results.';
        chip = 'Medium impact';
        chipClass = 'medium';
    }

    impactHeadline.textContent = headline;
    impactSummary.textContent = summary;
    impactChip.className = `hero-chip ${chipClass}`.trim();
    impactChip.textContent = chip;
}

function getRank(points) {
    if (points >= 1000) return 'Gaia Guardian';
    if (points >= 500) return 'Carbon Crusader';
    if (points >= 100) return 'Eco Rookie';
    return 'Recruit';
}

function getRankTone(rank) {
    const rankMap = {
        Recruit: 'recruit',
        'Eco Rookie': 'eco-rookie',
        'Carbon Crusader': 'carbon-crusader',
        'Gaia Guardian': 'gaia-guardian'
    };

    return rankMap[rank] || 'recruit';
}

function applyRankTone(element, rank) {
    if (!element) return;
    element.dataset.rank = getRankTone(rank);
}

function clearRankTone(element) {
    if (!element) return;
    delete element.dataset.rank;
}

function formatRankTokenHTML(rank) {
    return `<span class="rank-token" data-rank="${getRankTone(rank)}">${rank}</span>`;
}

function getNextMilestone(points) {
    const milestones = [
        { points: 100, label: 'Eco Rookie' },
        { points: 500, label: 'Carbon Crusader' },
        { points: 1000, label: 'Gaia Guardian' }
    ];

    return milestones.find((milestone) => points < milestone.points) || null;
}

function getImpactLevel(co2) {
    if (co2 >= 50) return 'High';
    if (co2 >= 10) return 'Medium';
    return 'Low';
}

function describeImpact(co2) {
    if (co2 >= 50) return 'This is currently one of your heavier browsing patterns';
    if (co2 >= 10) return 'This site is starting to become a noticeable part of your footprint';
    return 'This site is still a relatively light part of your footprint';
}

function formatCO2(grams) {
    if (grams >= 1000) {
        return `${(grams / 1000).toFixed(2)} kg`;
    }

    return `${grams.toFixed(2)}g`;
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
        return `${hours}h ${remainingMinutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
}
