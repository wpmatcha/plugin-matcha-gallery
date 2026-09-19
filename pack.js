const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pluginSlug = 'matcha-gallery';
const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const stageDir = path.join(distDir, pluginSlug);
const zipFile = path.join(rootDir, '..', `${pluginSlug}.zip`);
const localZip = path.join(rootDir, `${pluginSlug}.zip`);

console.log('🍵 Step 1: Building production JavaScript & CSS assets...');
execSync('node build.js', { stdio: 'inherit', cwd: rootDir });

console.log('🍵 Step 1b: Generating translation template (.pot)...');
execSync('node bin/make-pot.js', { stdio: 'inherit', cwd: rootDir });

console.log('🍵 Step 2: Preparing clean staging directory...');
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
if (fs.existsSync(zipFile)) {
    fs.rmSync(zipFile, { force: true });
}
if (fs.existsSync(localZip)) {
    fs.rmSync(localZip, { force: true });
}
fs.mkdirSync(stageDir, { recursive: true });

// Read ignore patterns from .distignore
const ignorePatterns = [
    'node_modules',
    '.git',
    '.gitignore',
    '.distignore',
    'package.json',
    'package-lock.json',
    'build.js',
    'pack.js',
    'studio/src',
    'bin',
    '.wordpress-org',
    'dist',
    '*.zip',
    '.DS_Store',
    'Thumbs.db'
];

function shouldIgnore(relPath) {
    const norm = relPath.replace(/\\/g, '/');
    for (const pat of ignorePatterns) {
        if (pat.endsWith('/')) {
            const p = pat.slice(0, -1);
            if (norm === p || norm.startsWith(p + '/')) return true;
        } else if (pat.startsWith('*.')) {
            const ext = pat.slice(1);
            if (norm.endsWith(ext)) return true;
        } else {
            if (norm === pat || norm.startsWith(pat + '/')) return true;
        }
    }
    return false;
}

function copyRecursive(src, dest, base = '') {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const rel = base ? `${base}/${entry.name}` : entry.name;
        if (shouldIgnore(rel)) {
            continue;
        }
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyRecursive(srcPath, destPath, rel);
        } else if (entry.isFile()) {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('🍵 Step 3: Copying production runtime files...');
copyRecursive(rootDir, stageDir);

console.log('🍵 Step 4: Generating pristine distribution ZIP (POSIX forward-slash compliant)...');
const psCommand = `powershell -ExecutionPolicy Bypass -File bin/create-zip.ps1 -StageDir "${stageDir}" -ZipFile "${zipFile}"`;
execSync(psCommand, { stdio: 'inherit', cwd: rootDir });

console.log('🍵 Step 5: Validating package hygiene...');
const stat = fs.statSync(zipFile);
const sizeKb = Math.round(stat.size / 1024);
const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);

console.log(`✅ Success: ${pluginSlug}.zip generated!`);
console.log(`📦 File Size: ${sizeKb} KB (${sizeMb} MB)`);
console.log(`📁 Root Entry: ${pluginSlug}/`);
console.log(`🚀 Ready for upload at https://wordpress.org/plugins/developers/add/`);

// Cleanup staging dist folder
fs.rmSync(distDir, { recursive: true, force: true });
