const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'dashboard');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const newNavInner = `
                    <a class="nav-link" href="index.html" data-href="index.html" data-section-link="home">
                        <span class="nav-icon" style="font-size:18px; margin-right:10px;">🏠</span><span class="nav-label">Home</span>
                    </a>
                    <a class="nav-link" href="insights.html" data-href="insights.html" data-section-link="insights">
                        <span class="nav-icon" style="font-size:18px; margin-right:10px;">📊</span><span class="nav-label">Impact & Insights</span>
                    </a>
                    <a class="nav-link" href="explainer.html" data-href="explainer.html" data-section-link="explainer">
                        <span class="nav-icon" style="font-size:18px; margin-right:10px;">📚</span><span class="nav-label">Explainer</span>
                    </a>
                    <a class="nav-link" href="stewardship.html" data-href="stewardship.html" data-section-link="stewardship">
                        <span class="nav-icon" style="font-size:18px; margin-right:10px;">🌿</span><span class="nav-label">Stewardship</span>
                    </a>
                    <a class="nav-link" href="wallet.html" data-href="wallet.html" data-section-link="wallet">
                        <span class="nav-icon" style="font-size:18px; margin-right:10px;">💳</span><span class="nav-label">Web3 Wallet</span>
                    </a>
`;

const sitesHtml = fs.readFileSync(path.join(dir, 'sites.html'), 'utf8');
const contextHtml = fs.readFileSync(path.join(dir, 'context.html'), 'utf8');

const getMainInner = (htmlStr) => {
   const start = htmlStr.indexOf('<main class="dashboard-main" id="dashboardMain">');
   const end = htmlStr.lastIndexOf('</main>');
   return htmlStr.substring(start + 48, end);
};

const sitesInner = getMainInner(sitesHtml);
const contextInner = getMainInner(contextHtml);

let insightsHtml = fs.readFileSync(path.join(dir, 'insights.html'), 'utf8');
const insightsEnd = insightsHtml.lastIndexOf('</main>');

const chartHtml = `
                <section class="panel" style="margin-top:20px;">
                    <div class="panel-header">
                        <div>
                            <p class="section-kicker">Visualized</p>
                            <h2>CO2 Emissions by Domain</h2>
                        </div>
                    </div>
                    <div style="max-height: 350px; display: flex; justify-content: center; margin: 20px auto;">
                        <canvas id="emissionsChart"></canvas>
                    </div>
                </section>
`;

insightsHtml = insightsHtml.substring(0, insightsEnd) + chartHtml + sitesInner + contextInner + insightsHtml.substring(insightsEnd);

// Ensure Chart.js is imported
if (!insightsHtml.includes('chart.umd.js')) {
    insightsHtml = insightsHtml.replace('<script src="dashboard.js"></script>', '<script src="../assets/lib/chart.umd.js"></script>\n    <script src="dashboard.js"></script>');
}

fs.writeFileSync(path.join(dir, 'insights.html'), insightsHtml);

files.forEach(file => {
   if (file === 'sites.html' || file === 'context.html') return;
   
   let content = fs.readFileSync(path.join(dir, file), 'utf8');
   
   const navStart = content.indexOf('<nav id="sidebarNav"');
   const navEnd = content.indexOf('</nav>') + 6;
   let beforeNav = content.substring(0, navStart);
   let afterNav = content.substring(navEnd);
   
   const newNavBlock = `<nav id="sidebarNav" class="sidebar-nav" aria-label="Dashboard sections">` + newNavInner + `</nav>`;
   
   content = beforeNav + newNavBlock + afterNav;
   
   // Clean up blockchainMock references if any are lingering from prev files
   content = content.replace('<script src="../services/blockchainMock.js"></script>', '');

   fs.writeFileSync(path.join(dir, file), content);
});

fs.unlinkSync(path.join(dir, 'sites.html'));
fs.unlinkSync(path.join(dir, 'context.html'));
console.log('Merge complete!');
