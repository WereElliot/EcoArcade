import { copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const dashboardAppHtml = path.join(distDir, 'dashboard.app.html');
const popupAppHtml = path.join(distDir, 'popup.app.html');
const dashboardHtml = path.join(distDir, 'dashboard.html');
const popupHtml = path.join(distDir, 'popup.html');
const dashboardBundle = path.join(distDir, 'assets', 'dashboard.js');

await copyFile(dashboardAppHtml, dashboardHtml);
await copyFile(popupAppHtml, popupHtml);

const bundleSource = await readFile(dashboardBundle, 'utf8');

const templateDeclarationPattern =
  /const\s+([A-Za-z_$][\w$]*)\s*=\s*(\[\{ videoId: "ZqiSiX8QD7o", source: "National Geographic", title: "What Is Climate Change\?" \}, \{ videoId: "T4xKThjcKaE", source: "Energy 101", title: "Renewable Energy 101" \}, \{ videoId: "AzJPDCpcbXY", source: "Smart Energy", title: "Solar Energy 101" \}\]),\s*Ie\s*=/;

const templateMatch = bundleSource.match(templateDeclarationPattern);
const functionIndex = bundleSource.indexOf('function Ue(');

if (templateMatch && functionIndex >= 0) {
  const [matchedDeclaration, templateName, templateArray] = templateMatch;
  const declarationStart = templateMatch.index ?? -1;

  if (declarationStart >= 0) {
    const withoutDeclaration =
      bundleSource.slice(0, declarationStart) +
      bundleSource.slice(declarationStart + matchedDeclaration.length).replace(/^Ie\s*=/, 'const Ie =');

    const injectionPoint = withoutDeclaration.indexOf('function Ue(');

    if (injectionPoint >= 0) {
      const repairedSource =
        withoutDeclaration.slice(0, injectionPoint) +
        `const ${templateName} = ${templateArray};\n` +
        withoutDeclaration.slice(injectionPoint);

      await writeFile(dashboardBundle, repairedSource, 'utf8');
    }
  }
}
