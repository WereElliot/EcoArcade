// EcoArcade Dashboard Script - Statistical Analysis Edition

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

function initDashboard() {
    console.log("EcoArcade: Dashboard initializing with global and regional analysis...");
    
    // Initial data load
    renderData();

    // Listen for storage changes to update UI in real-time
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            renderData();
        }
    });
}

function renderData() {
    chrome.storage.local.get(['totalCO2', 'totalPoints', 'badges', 'siteStats'], (data) => {
        const totalCO2 = data.totalCO2 || 0;
        const totalPoints = data.totalPoints || 0;
        const siteStats = data.siteStats || {};

        // 1. Update Top Stats
        const co2Display = document.getElementById('totalCO2');
        if (co2Display) co2Display.textContent = formatCO2(totalCO2);
        
        const pointsDisplay = document.getElementById('totalPoints');
        if (pointsDisplay) pointsDisplay.textContent = Math.floor(totalPoints);
        
        // 2. Update Rank
        let rank = "RECRUIT";
        if (totalPoints >= 100) rank = "ECO ROOKIE";
        if (totalPoints >= 500) rank = "CARBON CRUSADER";
        if (totalPoints >= 1000) rank = "GAIA GUARDIAN";
        
        const rankDisplay = document.getElementById('currentRank');
        if (rankDisplay) rankDisplay.textContent = rank;

        // 3. User Impact Comparison Logic
        // Daily Averages (Estimated for scale)
        const globalDailyAvgGrams = 12500; // 12.5 kg
        const kenyaDailyAvgGrams = 1800;   // 1.8 kg
        
        const userCompVal = document.getElementById('userCompVal');
        const userCompBar = document.getElementById('userCompBar');
        
        if (userCompVal && userCompBar) {
            userCompVal.textContent = formatCO2(totalCO2);
            // Calculate width relative to global average
            const barWidth = Math.max((totalCO2 / globalDailyAvgGrams) * 100, 2); // min 2% for visibility
            userCompBar.style.width = Math.min(barWidth, 100) + '%';
        }

        // 4. Render Site Stats Table
        const tableBody = document.getElementById('siteStatsBody');
        if (tableBody) {
            tableBody.innerHTML = '';
            const domains = Object.keys(siteStats).sort((a, b) => siteStats[b].co2 - siteStats[a].co2);
            
            if (domains.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No tracking data yet. Start your mission!</td></tr>';
            } else {
                domains.forEach(domain => {
                    const stats = siteStats[domain];
                    const row = document.createElement('tr');
                    
                    const timeStr = formatTime(stats.time);
                    const co2Str = formatCO2(stats.co2);
                    const impactRank = stats.co2 > 50 ? 'S-RANK' : (stats.co2 > 10 ? 'A-RANK' : 'B-RANK');

                    row.innerHTML = `
                        <td>${domain}</td>
                        <td>${timeStr}</td>
                        <td>${co2Str}</td>
                        <td style="color: ${impactRank === 'S-RANK' ? '#ff3333' : '#39ff14'}">${impactRank}</td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        }
    });
}

// Helpers
function formatCO2(grams) {
    if (grams >= 1000) {
        return (grams / 1000).toFixed(2) + ' kg';
    }
    return grams.toFixed(2) + 'g';
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
}
