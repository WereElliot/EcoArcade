// EcoArcade Popup Script - 1.1.1
// FIXED: Reliable communication and sync storage support

let quizQuestions = [];
let currentQuestion = null;
let currentUserPoints = 0;
let askedQuestionIds = new Set();
let refreshIntervalId = null;
let popupContextInvalidated = false;
const POPUP_TARGET_STORAGE_KEY = 'ecoArcadePopupTarget';
const POPUP_RECOVERY_ATTEMPT_KEY = 'ecoArcadePopupRecoveryAttempted';

const QUIZ_PROMPT_VARIANTS = [
    (scenario) => `${scenario} which choice keeps the digital footprint lower?`,
    (scenario) => `${scenario} which action best reduces unnecessary energy use?`,
    (scenario) => `${scenario} which option is the better low-emission habit?`,
    (scenario) => `${scenario} if you want the greener digital habit, what should you choose?`,
    (scenario) => `${scenario} which option should you pick to keep emissions lower?`
];

const QUIZ_OPTION_VARIANTS = [
    [0, 1, 2],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1]
];

const DIFFICULTY_POINTS = {
    easy: 10,
    medium: 15,
    hard: 20,
    expert: 25
};

const RANK_DIFFICULTY_WEIGHTS = {
    Recruit: { easy: 0.9, medium: 0.1 },
    'Eco Rookie': { easy: 0.45, medium: 0.45, hard: 0.1 },
    'Carbon Crusader': { medium: 0.25, hard: 0.55, expert: 0.2 },
    'Gaia Guardian': { hard: 0.2, expert: 0.8 }
};

window.addEventListener('error', (event) => {
    if (!isExtensionContextInvalidatedError(event?.error || event?.message)) {
        return;
    }

    event.preventDefault();
    handleExtensionContextInvalidated(event.error || new Error(event.message));
});

window.addEventListener('unhandledrejection', (event) => {
    if (!isExtensionContextInvalidatedError(event?.reason)) {
        return;
    }

    event.preventDefault();
    handleExtensionContextInvalidated(event.reason);
});

document.addEventListener('DOMContentLoaded', () => {
    void init().catch((error) => {
        if (isExtensionContextInvalidatedError(error)) {
            handleExtensionContextInvalidated(error);
            return;
        }

        console.error('EcoArcade: popup failed to initialize.', error);
    });
});

async function init() {
    if (!isExtensionContextAvailable()) {
        handleExtensionContextInvalidated();
        return;
    }

    clearPopupRecoveryAttempt();

    console.log("EcoArcade: Popup Initializing...");

    try {
        const quizBank = await fetch(chrome.runtime.getURL('data/quizQuestionBank.json')).then((response) => response.json());
        quizQuestions = buildQuizQuestions(quizBank);
        withExtensionContext(() => {
            chrome.storage.sync.get(['totalPoints'], withSafeExtensionCallback((data) => {
                if (didLastErrorInvalidateContext()) return;

                currentUserPoints = Math.floor(data.totalPoints || 0);
                loadNewQuestion();
            }));
        });
    } catch (error) {
        console.error("Error loading mission data:", error);
        const questionText = document.getElementById('questionText');
        if (questionText) {
            questionText.textContent = 'Quiz questions could not be loaded.';
        }
    }

    updateUI();
    updateTracker();
    consumePopupTarget();

    document.getElementById('openDashboardBtn').addEventListener('click', () => {
        withExtensionContext(() => {
            chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/index.html') });
        });
    });

    document.getElementById('nextQuestionBtn').addEventListener('click', loadNewQuestion);
    document.getElementById('refreshBtn').addEventListener('click', () => {
        updateUI();
        updateTracker();
    });

    refreshIntervalId = window.setInterval(() => {
        updateUI();
        updateTracker();
    }, 2000);

    window.addEventListener('beforeunload', stopRefreshLoop, { once: true });
}

function consumePopupTarget() {
    if (!isExtensionContextAvailable()) {
        handleExtensionContextInvalidated();
        return;
    }

    const hashTarget = window.location.hash.replace('#', '');

    if (chrome.storage?.session?.get) {
        const didRun = withExtensionContext(() => {
            chrome.storage.session.get([POPUP_TARGET_STORAGE_KEY], withSafeExtensionCallback((data) => {
                if (didLastErrorInvalidateContext()) {
                    scrollToPopupTarget(readPopupTargetFallback() || hashTarget);
                    return;
                }

                const targetId = data?.[POPUP_TARGET_STORAGE_KEY] || hashTarget;
                if (data?.[POPUP_TARGET_STORAGE_KEY]) {
                    withExtensionContext(() => {
                        chrome.storage.session.remove(POPUP_TARGET_STORAGE_KEY);
                    });
                }
                scrollToPopupTarget(targetId);
            }));
        });

        if (!didRun) {
            return;
        }
        return;
    }

    scrollToPopupTarget(readPopupTargetFallback() || hashTarget);
}

function readPopupTargetFallback() {
    try {
        const targetId = window.localStorage.getItem(POPUP_TARGET_STORAGE_KEY);
        if (targetId) {
            window.localStorage.removeItem(POPUP_TARGET_STORAGE_KEY);
        }
        return targetId;
    } catch (error) {
        console.warn('EcoArcade: could not read popup target.', error);
        return '';
    }
}

function scrollToPopupTarget(targetId) {
    if (!targetId) return;

    window.requestAnimationFrame(() => {
        const target = document.getElementById(targetId);
        const scrollContainer = document.querySelector('.app-main');

        if (!target || !scrollContainer) return;

        const containerRect = scrollContainer.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const nextTop = targetRect.top - containerRect.top + scrollContainer.scrollTop - 12;

        scrollContainer.scrollTo({
            top: Math.max(nextTop, 0),
            behavior: 'smooth'
        });
    });
}

function updateUI() {
    const didRun = withExtensionContext(() => {
        chrome.runtime.sendMessage({ action: "getStats" }, withSafeExtensionCallback((response) => {
            if (didLastErrorInvalidateContext()) {
                return;
            }

            if (hasRuntimeLastError()) {
                console.warn("Background connection pending. Using local sync fallback.");
                withExtensionContext(() => {
                    chrome.storage.sync.get(['totalCO2', 'totalPoints', 'badges'], withSafeExtensionCallback((data) => {
                        if (didLastErrorInvalidateContext()) return;
                        if (!hasRuntimeLastError()) renderStats(data);
                    }));
                });
                return;
            }

            if (response) renderStats(response);
        }));
    });

    if (!didRun) {
        return;
    }
}

function renderStats(data) {
    const co2Elem = document.getElementById('totalCO2');
    if (co2Elem) co2Elem.textContent = formatCO2(data.totalCO2 || 0);

    const totalPoints = Math.floor(data.totalPoints || 0);
    currentUserPoints = totalPoints;

    const pointsElem = document.getElementById('totalPoints');
    if (pointsElem) pointsElem.textContent = totalPoints;

    const currentRank = getRank(totalPoints);
    applyQuizRankTone(currentRank);
    const rankLabel = document.getElementById('rankLabel');
    if (rankLabel) rankLabel.innerHTML = `Rank: ${formatRankTokenHTML(currentRank)}`;

    const nextBadgeText = document.getElementById('nextBadgeText');
    const pointsToNextBadge = document.getElementById('pointsToNextBadge');
    const nextMilestone = getNextMilestone(totalPoints);
    if (nextBadgeText && pointsToNextBadge) {
        if (nextMilestone) {
            nextBadgeText.innerHTML = `Reach ${nextMilestone.points} points for ${formatRankTokenHTML(nextMilestone.label)}`;
            pointsToNextBadge.textContent = `${nextMilestone.points - totalPoints} points to go`;
        } else {
            nextBadgeText.textContent = 'Top milestone reached';
            pointsToNextBadge.textContent = 'All current badges unlocked';
        }
    }

    const badgesCont = document.getElementById('badgesContainer');
    if (badgesCont && data.badges) {
        if (data.badges.length > 0) {
            badgesCont.innerHTML = data.badges.map((badge) => `
                <div class="badge" data-rank="${getRankTone(badge)}">${badge}</div>
            `).join('');
        } else {
            badgesCont.innerHTML = '<p class="no-badges">No badges yet.</p>';
        }
    }
}

function updateTracker() {
    const didRun = withExtensionContext(() => {
        chrome.tabs.query({ active: true }, withSafeExtensionCallback((tabs) => {
            if (didLastErrorInvalidateContext()) {
                return;
            }

            if (!tabs || tabs.length === 0) {
                renderUntrackedCurrentTab();
                return;
            }

            const activeTab = pickMostRelevantActiveTab(tabs);
            const domain = getTrackableDomain(activeTab?.url);

            if (!domain) {
                renderUntrackedCurrentTab(activeTab?.url);
                return;
            }

            const siteElement = document.getElementById('currentSite');
            if (siteElement) siteElement.textContent = domain;

            withExtensionContext(() => {
                chrome.storage.sync.get(['siteStats'], withSafeExtensionCallback((data) => {
                    if (didLastErrorInvalidateContext()) return;

                    const stats = data.siteStats?.[domain] || { time: 0, co2: 0 };
                    const timeVal = document.getElementById('currentTime');
                    if (timeVal) timeVal.textContent = `${Math.floor(stats.time / 60000)}m`;

                    const emissVal = document.getElementById('currentEmissions');
                    if (emissVal) emissVal.textContent = formatCO2(stats.co2);

                    updateCurrentSiteSummary(domain, stats);
                }));
            });
        }));
    });

    if (!didRun) {
        return;
    }
}

function getTrackableDomain(url) {
    if (typeof url !== 'string' || !url) {
        return '';
    }

    try {
        const parsedUrl = new URL(url);
        if (!/^https?:$/.test(parsedUrl.protocol)) {
            return '';
        }

        return parsedUrl.hostname.replace('www.', '');
    } catch (error) {
        return '';
    }
}

function pickMostRelevantActiveTab(tabs) {
    if (!Array.isArray(tabs) || !tabs.length) {
        return null;
    }

    const rankedTabs = [...tabs].sort((left, right) => {
        const leftTrackable = Boolean(getTrackableDomain(left?.url));
        const rightTrackable = Boolean(getTrackableDomain(right?.url));

        if (leftTrackable !== rightTrackable) {
            return rightTrackable - leftTrackable;
        }

        return (right?.lastAccessed || 0) - (left?.lastAccessed || 0);
    });

    return rankedTabs[0] || null;
}

function renderUntrackedCurrentTab(url = '') {
    const siteElement = document.getElementById('currentSite');
    if (siteElement) {
        siteElement.textContent = getCurrentTabLabel(url);
    }

    const timeVal = document.getElementById('currentTime');
    if (timeVal) timeVal.textContent = '0m';

    const emissVal = document.getElementById('currentEmissions');
    if (emissVal) emissVal.textContent = formatCO2(0);

    const impactPill = document.getElementById('impactPill');
    if (impactPill) {
        impactPill.className = 'impact-pill neutral';
        impactPill.textContent = 'Not tracked';
    }

    const focusMessage = document.getElementById('focusMessage');
    if (focusMessage) {
        focusMessage.textContent = 'Only normal web pages are tracked. Open an http or https page to measure activity.';
    }

    const alertBanner = document.getElementById('highCarbonAlert');
    if (alertBanner) {
        alertBanner.classList.add('hidden');
    }
}

function getCurrentTabLabel(url = '') {
    if (!url) {
        return 'No web page selected';
    }

    const extensionPrefix = isExtensionContextAvailable() ? chrome.runtime.getURL('') : '';
    if (extensionPrefix && url.startsWith(extensionPrefix)) {
        return 'EcoArcade page';
    }

    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol === 'edge:' || parsedUrl.protocol === 'chrome:' || parsedUrl.protocol === 'about:') {
            return 'Browser page';
        }

        if (parsedUrl.protocol === 'file:') {
            return 'Local file';
        }

        return 'This page';
    } catch (error) {
        return 'Browser page';
    }
}

function loadNewQuestion() {
    if (!quizQuestions.length) return;

    if (askedQuestionIds.size >= quizQuestions.length) {
        askedQuestionIds = new Set();
    }

    const quizContent = document.getElementById('quizContent');
    const quizResult = document.getElementById('quizResult');

    if (quizContent) quizContent.classList.remove('hidden');
    if (quizResult) quizResult.classList.add('hidden');

    const playableQuestions = quizQuestions.filter(isQuestionPlayable);
    if (!playableQuestions.length) return;

    applyQuizRankTone(getRank(currentUserPoints));

    const unseenQuestions = playableQuestions.filter((question) => !askedQuestionIds.has(question.id));
    const targetDifficulty = pickDifficultyForPoints(currentUserPoints);
    let candidateQuestions = unseenQuestions.filter((question) => question.difficulty === targetDifficulty);

    if (!candidateQuestions.length) {
        candidateQuestions = unseenQuestions.filter((question) => isDifficultyAvailable(question.difficulty, currentUserPoints));
    }

    if (!candidateQuestions.length) {
        candidateQuestions = unseenQuestions;
    }

    const randomIndex = Math.floor(Math.random() * candidateQuestions.length);
    currentQuestion = candidateQuestions[randomIndex];
    askedQuestionIds.add(currentQuestion.id);

    const questionText = document.getElementById('questionText');
    if (questionText) questionText.textContent = currentQuestion.question;

    const questionRewardBadge = document.getElementById('questionRewardBadge');
    if (questionRewardBadge) {
        questionRewardBadge.innerHTML = `${formatRankTokenHTML(getRank(currentUserPoints))} <span class="reward-divider">|</span> <span>${formatDifficulty(currentQuestion.difficulty)}</span> <span class="reward-divider">|</span> <span>+${currentQuestion.points} XP</span>`;
    }

    const grid = document.getElementById('optionsGrid');
    if (grid) {
        grid.innerHTML = '';
        currentQuestion.options.forEach((option) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-btn';
            btn.textContent = option;
            btn.onclick = () => showResult(option === currentQuestion.correctAnswer);
            grid.appendChild(btn);
        });
    }
}

function applyQuizRankTone(rank) {
    const quizContainer = document.getElementById('quizContainer');

    if (!quizContainer) return;

    quizContainer.setAttribute('data-rank', getRankTone(rank));
}

function showResult(correct) {
    const resultMsg = document.getElementById('resultMsg');
    const quizContent = document.getElementById('quizContent');
    const quizResult = document.getElementById('quizResult');

    if (quizContent) quizContent.classList.add('hidden');
    if (quizResult) quizResult.classList.remove('hidden');

    if (correct) {
        if (resultMsg) {
            resultMsg.textContent = `Correct. +${currentQuestion.points} XP\n${currentQuestion.explanation}`;
            resultMsg.style.color = '#39ff14';
        }

        withExtensionContext(() => {
            chrome.storage.sync.get(['totalPoints'], withSafeExtensionCallback((data) => {
                if (didLastErrorInvalidateContext()) return;

                const newXP = (data.totalPoints || 0) + currentQuestion.points;
                currentUserPoints = newXP;
                chrome.storage.sync.set({ totalPoints: newXP }, withSafeExtensionCallback(() => {
                    if (didLastErrorInvalidateContext()) return;

                    chrome.runtime.sendMessage({ action: 'checkBadges' }, withSafeExtensionCallback(() => {
                        if (didLastErrorInvalidateContext()) return;
                        if (hasRuntimeLastError()) console.warn("Badge check connection pending.");
                        updateUI();
                    }));
                }));
            }));
        });
    } else if (resultMsg) {
        resultMsg.textContent = `Not this time. Correct answer: ${currentQuestion.correctAnswer}\n${currentQuestion.explanation}`;
        resultMsg.style.color = '#ff3333';
    }
}

function isExtensionContextAvailable() {
    try {
        return Boolean(chrome?.runtime?.id);
    } catch (error) {
        return false;
    }
}

function isExtensionContextInvalidatedError(error) {
    const message = error?.message || String(error || '');
    return /Extension context invalidated/i.test(message);
}

function withExtensionContext(action) {
    if (popupContextInvalidated || !isExtensionContextAvailable()) {
        handleExtensionContextInvalidated();
        return false;
    }

    try {
        action();
        return true;
    } catch (error) {
        if (isExtensionContextInvalidatedError(error)) {
            handleExtensionContextInvalidated(error);
            return false;
        }

        throw error;
    }
}

function didLastErrorInvalidateContext() {
    const error = getRuntimeLastError();
    if (!error) return false;

    if (isExtensionContextInvalidatedError(error)) {
        handleExtensionContextInvalidated(error);
        return true;
    }

    return false;
}

function handleExtensionContextInvalidated(error) {
    if (popupContextInvalidated) {
        return;
    }

    popupContextInvalidated = true;
    stopRefreshLoop();

    console.warn('EcoArcade: popup context invalidated. Close and reopen the popup.', error);

    if (attemptPopupRecovery()) {
        return;
    }

    const currentSite = document.getElementById('currentSite');
    if (currentSite) currentSite.textContent = 'Extension reloaded';

    const focusMessage = document.getElementById('focusMessage');
    if (focusMessage) {
        focusMessage.textContent = 'This popup window is no longer connected. Close it and reopen EcoArcade.';
    }

    const questionText = document.getElementById('questionText');
    if (questionText) {
        questionText.textContent = 'This popup is out of date after an extension reload. Close it and reopen EcoArcade.';
    }

    document.querySelectorAll('button').forEach((button) => {
        button.disabled = true;
    });
}

function stopRefreshLoop() {
    if (refreshIntervalId !== null) {
        window.clearInterval(refreshIntervalId);
        refreshIntervalId = null;
    }
}

function withSafeExtensionCallback(callback) {
    return (...args) => {
        if (popupContextInvalidated) {
            return;
        }

        try {
            callback(...args);
        } catch (error) {
            if (isExtensionContextInvalidatedError(error)) {
                handleExtensionContextInvalidated(error);
                return;
            }

            throw error;
        }
    };
}

function getRuntimeLastError() {
    try {
        return chrome?.runtime?.lastError || null;
    } catch (error) {
        if (isExtensionContextInvalidatedError(error)) {
            handleExtensionContextInvalidated(error);
            return error;
        }

        throw error;
    }
}

function hasRuntimeLastError() {
    return Boolean(getRuntimeLastError());
}

function attemptPopupRecovery() {
    try {
        if (window.sessionStorage.getItem(POPUP_RECOVERY_ATTEMPT_KEY) === 'true') {
            return false;
        }

        window.sessionStorage.setItem(POPUP_RECOVERY_ATTEMPT_KEY, 'true');

        const focusMessage = document.getElementById('focusMessage');
        if (focusMessage) {
            focusMessage.textContent = 'Reconnecting EcoArcade after the extension reload...';
        }

        window.setTimeout(() => {
            window.location.reload();
        }, 150);

        return true;
    } catch (recoveryError) {
        console.warn('EcoArcade: popup recovery reload could not be scheduled.', recoveryError);
        return false;
    }
}

function clearPopupRecoveryAttempt() {
    try {
        window.sessionStorage.removeItem(POPUP_RECOVERY_ATTEMPT_KEY);
    } catch (error) {
        console.warn('EcoArcade: popup recovery state could not be cleared.', error);
    }
}

function buildQuizQuestions(questionBank) {
    const generatedQuestions = questionBank.flatMap((seed) =>
        QUIZ_PROMPT_VARIANTS.flatMap((formatPrompt, promptIndex) =>
            QUIZ_OPTION_VARIANTS.map((optionVariant, optionIndex) => ({
                id: `${seed.id}-${promptIndex}-${optionIndex}`,
                difficulty: seed.difficulty,
                question: formatPrompt(seed.scenario),
                options: buildOptionVariant(seed, optionVariant),
                correctAnswer: seed.correctAnswer,
                explanation: seed.explanation,
                points: getDifficultyPoints(seed.difficulty)
            }))
        )
    );

    const normalizedQuestions = generatedQuestions
        .map(normalizeGeneratedQuestion)
        .filter(Boolean);

    if (generatedQuestions.length !== 1000) {
        console.warn(`EcoArcade: Expected 1000 generated questions but created ${generatedQuestions.length}.`);
    }

    if (normalizedQuestions.length !== generatedQuestions.length) {
        console.warn(`EcoArcade: Filtered out ${generatedQuestions.length - normalizedQuestions.length} invalid quiz questions.`);
    }

    return normalizedQuestions;
}

function buildOptionVariant(seed, order) {
    const optionPool = [seed.correctAnswer, ...seed.wrongAnswers];
    return order.map((index) => optionPool[index]);
}

function normalizeGeneratedQuestion(question) {
    const correctAnswer = normalizeOptionText(question.correctAnswer);
    const options = Array.from(new Set(
        (question.options || [])
            .map(normalizeOptionText)
            .filter(Boolean)
    ));

    if (!correctAnswer) {
        return null;
    }

    if (!options.includes(correctAnswer)) {
        options.unshift(correctAnswer);
    }

    const normalizedOptions = options.slice(0, 3);
    if (!normalizedOptions.includes(correctAnswer)) {
        normalizedOptions[0] = correctAnswer;
    }

    if (normalizedOptions.length < 2) {
        return null;
    }

    return {
        ...question,
        correctAnswer,
        options: normalizedOptions
    };
}

function normalizeOptionText(value) {
    return String(value || '').trim();
}

function isQuestionPlayable(question) {
    return Boolean(
        question &&
        question.correctAnswer &&
        Array.isArray(question.options) &&
        question.options.length >= 2 &&
        question.options.includes(question.correctAnswer)
    );
}

function getDifficultyPoints(difficulty) {
    return DIFFICULTY_POINTS[difficulty] || 10;
}

function pickDifficultyForPoints(points) {
    const difficultyWeights = getDifficultyWeights(points);
    const roll = Math.random();
    let cumulative = 0;

    for (const [difficulty, weight] of Object.entries(difficultyWeights)) {
        cumulative += weight;
        if (roll <= cumulative) return difficulty;
    }

    return 'easy';
}

function getDifficultyWeights(points) {
    return RANK_DIFFICULTY_WEIGHTS[getRank(points)] || RANK_DIFFICULTY_WEIGHTS.Recruit;
}

function isDifficultyAvailable(difficulty, points) {
    return Object.prototype.hasOwnProperty.call(getDifficultyWeights(points), difficulty);
}

function formatDifficulty(difficulty) {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function formatCO2(grams) {
    return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${grams.toFixed(2)}g`;
}

function updateCurrentSiteSummary(domain, stats) {
    const impactPill = document.getElementById('impactPill');
    const focusMessage = document.getElementById('focusMessage');
    const alertBanner = document.getElementById('highCarbonAlert');
    const funFactText = document.getElementById('funFactText');

    let level = 'low';
    let label = 'Low impact';
    let message = `You're on ${domain}. This session is currently in a light usage range.`;
    let funFact = 'Shorter sessions and lighter pages keep digital emissions lower.';

    if (stats.co2 >= 10 || stats.time >= 30 * 60000) {
        level = 'medium';
        label = 'Watch usage';
        message = `You've spent a while on ${domain}. Consider wrapping up or switching to a lighter task flow.`;
        funFact = 'Long sessions, autoplay media, and repeated reloads tend to increase digital energy use.';
    }

    if (stats.co2 >= 50 || stats.time >= 60 * 60000) {
        level = 'high';
        label = 'Higher impact';
        message = `This site has become one of your heavier browsing sessions. Opening fewer tabs or reducing media time can help.`;
        funFact = 'Streaming, cloud-heavy tools, and ad-dense pages often push emissions up faster than static sites.';
    }

    if (impactPill) {
        impactPill.className = `impact-pill ${level}`;
        impactPill.textContent = label;
    }

    if (focusMessage) focusMessage.textContent = message;

    if (alertBanner && funFactText) {
        if (level === 'high') {
            alertBanner.classList.remove('hidden');
            funFactText.textContent = funFact;
        } else {
            alertBanner.classList.add('hidden');
        }
    }
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
