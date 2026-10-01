import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const distDir = path.resolve('dist');
if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist. Run npm run build first.');
  process.exit(1);
}

const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gh-pages-deploy-'));

console.log(`Copying dist files to temporary staging area: ${tempDir}`);
fs.cpSync(distDir, tempDir, { recursive: true });

try {
  console.log('Initializing git repository in staging area...');
  execSync('git init', { cwd: tempDir, stdio: 'inherit' });
  execSync('git checkout -b gh-pages', { cwd: tempDir, stdio: 'inherit' });
  execSync('git add -A', { cwd: tempDir, stdio: 'inherit' });
  execSync('git commit -m "Deploy to GitHub Pages"', { cwd: tempDir, stdio: 'inherit' });
  console.log(`Pushing to ${remoteUrl} gh-pages branch...`);
  execSync(`git push -f ${remoteUrl} gh-pages`, { cwd: tempDir, stdio: 'inherit' });
  console.log('Successfully deployed to gh-pages branch!');
} finally {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {
    // ignore cleanup errors
  }
}
