// EcoArcade Popup Script - 1.1.1
// FIXED: Reliable communication and sync storage support

let quizQuestions = [];
let currentQuestion = null;

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    console.log("EcoArcade: Popup Initializing...");
    
    // Load local mission data
    try {
        const quizRes = await fetch(chrome.runtime.getURL('data/quizQuestions.json')).then(r => r.json());
        quizQuestions = quizRes;
        loadNewQuestion();
    } catch (error) {
        console.error("Error loading mission data:", error);
    }

    // Initial Refresh
    updateUI();
    updateTracker();

    // Event Listeners
    document.getElementById('openDashboardBtn').addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
    });

    document.getElementById('nextQuestionBtn').addEventListener('click', loadNewQuestion);

    // Periodic Update
    setInterval(() => {
        updateUI();
        updateTracker();
    }, 2000);
}

/**
 * FIXED: UI Update with Error Handling
 * sendMessage includes a callback that checks for chrome.runtime.lastError.
 * If connection fails, it falls back to direct sync storage read.
 */
function updateUI() {
    chrome.runtime.sendMessage({ action: "getStats" }, (response) => {
        if (chrome.runtime.lastError) {
            console.warn("Background connection pending. Using local sync fallback.");
            // Fallback: Read directly from sync storage if background is unreachable
            chrome.storage.sync.get(['totalCO2', 'totalPoints', 'badges'], (data) => {
                if (!chrome.runtime.lastError) renderStats(data);
            });
            return;
        }
        if (response) renderStats(response);
    });
}

function renderStats(data) {
    const co2Elem = document.getElementById('totalCO2');
    if (co2Elem) co2Elem.textContent = formatCO2(data.totalCO2 || 0);

    const pointsElem = document.getElementById('totalPoints');
    if (pointsElem) pointsElem.textContent = Math.floor(data.totalPoints || 0);

    const badgesCont = document.getElementById('badgesContainer');
    if (badgesCont && data.badges) {
        if (data.badges.length > 0) {
            badgesCont.innerHTML = data.badges.map(badge => `
                <div class="badge">${badge}</div>
            `).join('');
        } else {
            badgesCont.innerHTML = '<p class="no-badges">No badges yet.</p>';
        }
    }
}

function updateTracker() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;
        
        const url = tabs[0].url;
        let domain = "Scanning...";
        try {
            domain = new URL(url).hostname.replace('www.', '');
        } catch (e) {}

        const siteElement = document.getElementById('currentSite');
        if (siteElement) siteElement.textContent = domain;

        chrome.storage.sync.get(['siteStats'], (data) => {
            const stats = data.siteStats?.[domain] || { time: 0, co2: 0 };
            const timeVal = document.getElementById('currentTime');
            if (timeVal) timeVal.textContent = `${Math.floor(stats.time / 60000)}m`;
            
            const emissVal = document.getElementById('currentEmissions');
            if (emissVal) emissVal.textContent = formatCO2(stats.co2);
        });
    });
}

/**
 * Quiz Logic
 */
function loadNewQuestion() {
    if (!quizQuestions.length) return;
    
    const quizContent = document.getElementById('quizContent');
    const quizResult = document.getElementById('quizResult');
    
    if (quizContent) quizContent.classList.remove('hidden');
    if (quizResult) quizResult.classList.add('hidden');
    
    const randomIndex = Math.floor(Math.random() * quizQuestions.length);
    currentQuestion = quizQuestions[randomIndex];

    const questionText = document.getElementById('questionText');
    if (questionText) questionText.textContent = currentQuestion.question;
    
    const grid = document.getElementById('optionsGrid');
    if (grid) {
        grid.innerHTML = '';
        currentQuestion.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quiz-btn';
            btn.textContent = opt;
            btn.onclick = () => showResult(opt === currentQuestion.correctAnswer);
            grid.appendChild(btn);
        });
    }
}

function showResult(correct) {
    const resultMsg = document.getElementById('resultMsg');
    const quizContent = document.getElementById('quizContent');
    const quizResult = document.getElementById('quizResult');

    if (quizContent) quizContent.classList.add('hidden');
    if (quizResult) quizResult.classList.remove('hidden');

    if (correct) {
        if (resultMsg) {
            resultMsg.textContent = `CRITICAL SUCCESS! +${currentQuestion.points} XP`;
            resultMsg.style.color = '#39ff14';
        }
        
        chrome.storage.sync.get(['totalPoints'], (data) => {
            const newXP = (data.totalPoints || 0) + currentQuestion.points;
            chrome.storage.sync.set({ totalPoints: newXP }, () => {
                chrome.runtime.sendMessage({ action: 'checkBadges' }, () => {
                    if (chrome.runtime.lastError) console.warn("Badge check connection pending.");
                    updateUI();
                });
            });
        });
    } else if (resultMsg) {
        resultMsg.textContent = `MISSION FAILED. The answer was: ${currentQuestion.correctAnswer}`;
        resultMsg.style.color = '#ff3333';
    }
}

function formatCO2(grams) {
    return grams >= 1000 ? (grams / 1000).toFixed(2) + ' kg' : grams.toFixed(2) + 'g';
}
