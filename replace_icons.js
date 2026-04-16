const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'dashboard');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const svgStyle = 'width:20px; height:20px; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; fill:none;';

const homeSvg = `<svg style="${svgStyle}" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
const chartSvg = `<svg style="${svgStyle}" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`;
const bookSvg = `<svg style="${svgStyle}" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`;
const leafSvg = `<svg style="${svgStyle}" viewBox="0 0 24 24"><path d="M12 22a10 10 0 0 0 10-10C22 5 12 2 12 2S2 5 2 12a10 10 0 0 0 10 10z"></path><path d="M12 22V12"></path></svg>`;
const walletSvg = `<svg style="${svgStyle}" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;

const newNavInner = `
                    <a class="nav-link" href="index.html" data-href="index.html" data-section-link="home">
                        <span class="nav-icon" style="display:flex; align-items:center; margin-right:10px;">${homeSvg}</span><span class="nav-label">Home</span>
                    </a>
                    <a class="nav-link" href="insights.html" data-href="insights.html" data-section-link="insights">
                        <span class="nav-icon" style="display:flex; align-items:center; margin-right:10px;">${chartSvg}</span><span class="nav-label">Impact & Insights</span>
                    </a>
                    <a class="nav-link" href="explainer.html" data-href="explainer.html" data-section-link="explainer">
                        <span class="nav-icon" style="display:flex; align-items:center; margin-right:10px;">${bookSvg}</span><span class="nav-label">Explainer</span>
                    </a>
                    <a class="nav-link" href="stewardship.html" data-href="stewardship.html" data-section-link="stewardship">
                        <span class="nav-icon" style="display:flex; align-items:center; margin-right:10px;">${leafSvg}</span><span class="nav-label">Stewardship</span>
                    </a>
                    <a class="nav-link" href="wallet.html" data-href="wallet.html" data-section-link="wallet">
                        <span class="nav-icon" style="display:flex; align-items:center; margin-right:10px;">${walletSvg}</span><span class="nav-label">Web3 Wallet</span>
                    </a>
`;

files.forEach(file => {
   let content = fs.readFileSync(path.join(dir, file), 'utf8');
   
   const navStart = content.indexOf('<nav id="sidebarNav"');
   if (navStart === -1) return;
   
   const navEnd = content.indexOf('</nav>') + 6;
   let beforeNav = content.substring(0, navStart);
   let afterNav = content.substring(navEnd);
   
   const newNavBlock = `<nav id="sidebarNav" class="sidebar-nav" aria-label="Dashboard sections">` + newNavInner + `</nav>`;
   
   content = beforeNav + newNavBlock + afterNav;
   
   // Make sure we keep the 'active' class on the matching link correctly instead of a global state.
   // This will be fixed dynamically in javascript anyway via exact url regex match.
   
   fs.writeFileSync(path.join(dir, file), content);
});

console.log('SVG replacement complete!');
