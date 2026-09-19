/**
 * Matcha Gallery - POT Translation Template Generator
 *
 * Scans PHP and JS source files for WordPress gettext i18n functions
 * and compiles a standard gettext .pot file in languages/matcha-gallery.pot.
 *
 * @package Matcha_Gallery
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'languages', 'matcha-gallery.pot');
const TEXT_DOMAIN = 'matcha-gallery';

const SCAN_DIRS = [
  'includes',
  'blocks',
  'studio/src',
  'assets/js'
];
const SCAN_FILES = [
  'matcha-gallery.php',
  'uninstall.php'
];

/**
 * Recursively collect files with matching extensions.
 */
function collectFiles(dir, extensions = ['.php', '.js']) {
  const fullPath = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(fullPath)) return [];
  
  let results = [];
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    const resPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectFiles(resPath, extensions));
    } else if (entry.isFile()) {
      if (extensions.some(ext => entry.name.endsWith(ext))) {
        results.push(resPath);
      }
    }
  }

  return results;
}

/**
 * Unescape string literal content
 */
function cleanString(str) {
  return str
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t');
}

/**
 * Format string for PO/POT output
 */
function formatPoString(str) {
  const escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '');

  if (escaped.includes('\n')) {
    const lines = escaped.split('\n');
    let out = '""\n';
    lines.forEach((line, idx) => {
      const suffix = idx < lines.length - 1 ? '\\n"\n' : '"';
      out += `"${line}${suffix}`;
    });
    return out;
  }
  return `"${escaped}"`;
}

// Entries map: key -> { msgid, msgctxt, msgid_plural, references: [ 'file:line' ], comments: [] }
const entries = new Map();

function addEntry({ msgid, msgctxt = '', msgid_plural = '', ref, comment = '' }) {
  if (!msgid) return;
  const key = `${msgctxt}\x04${msgid}`;
  if (!entries.has(key)) {
    entries.set(key, {
      msgid,
      msgctxt,
      msgid_plural,
      references: new Set(),
      comments: new Set()
    });
  }
  const entry = entries.get(key);
  if (ref) entry.references.add(ref);
  if (comment) entry.comments.add(comment);
  if (msgid_plural && !entry.msgid_plural) entry.msgid_plural = msgid_plural;
}

/**
 * Extract strings from PHP & JS content
 */
function extractStrings(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  // Regex patterns matching gettext functions
  // 1. __, _e, esc_html__, esc_attr__, esc_html_e, esc_attr_e: ('msg', 'domain')
  const simpleRegex = /(?:__|esc_html__|esc_attr__|_e|esc_html_e|esc_attr_e)\s*\(\s*(['"])(.*?)(?<!\\)\1\s*,\s*['"]matcha-gallery['"]\s*\)/g;

  // 2. _x, _ex, esc_html_x, esc_attr_x: ('msg', 'context', 'domain')
  const contextRegex = /(?:_x|_ex|esc_html_x|esc_attr_x)\s*\(\s*(['"])(.*?)(?<!\\)\1\s*,\s*(['"])(.*?)(?<!\\)\3\s*,\s*['"]matcha-gallery['"]\s*\)/g;

  // 3. _n: ('single', 'plural', number, 'domain')
  const pluralRegex = /_n\s*\(\s*(['"])(.*?)(?<!\\)\1\s*,\s*(['"])(.*?)(?<!\\)\3\s*,\s*[^,]+\s*,\s*['"]matcha-gallery['"]\s*\)/g;

  // 4. _nx: ('single', 'plural', number, 'context', 'domain')
  const pluralContextRegex = /_nx\s*\(\s*(['"])(.*?)(?<!\\)\1\s*,\s*(['"])(.*?)(?<!\\)\3\s*,\s*[^,]+\s*,\s*(['"])(.*?)(?<!\\)\5\s*,\s*['"]matcha-gallery['"]\s*\)/g;

  // Normalize path separators to forward slash for POT format
  const normPath = filePath.replace(/\\/g, '/');

  // Helper to find line number of match index
  function getLineNumber(index) {
    let currentPos = 0;
    for (let i = 0; i < lines.length; i++) {
      currentPos += lines[i].length + 1;
      if (currentPos > index) {
        return i + 1;
      }
    }
    return 1;
  }

  // Find translator comments before line
  function getTranslatorComment(lineNum) {
    if (lineNum > 1) {
      const prevLine = lines[lineNum - 2];
      const match = prevLine.match(/\/\*\s*translators:\s*(.*?)\s*\*\//i) || prevLine.match(/\/\/\s*translators:\s*(.*)/i);
      if (match) {
        return match[1].trim();
      }
    }
    return '';
  }

  let match;
  while ((match = simpleRegex.exec(content)) !== null) {
    const lineNum = getLineNumber(match.index);
    const comment = getTranslatorComment(lineNum);
    addEntry({
      msgid: cleanString(match[2]),
      ref: `${normPath}:${lineNum}`,
      comment
    });
  }

  while ((match = contextRegex.exec(content)) !== null) {
    const lineNum = getLineNumber(match.index);
    const comment = getTranslatorComment(lineNum);
    addEntry({
      msgid: cleanString(match[2]),
      msgctxt: cleanString(match[4]),
      ref: `${normPath}:${lineNum}`,
      comment
    });
  }

  while ((match = pluralRegex.exec(content)) !== null) {
    const lineNum = getLineNumber(match.index);
    const comment = getTranslatorComment(lineNum);
    addEntry({
      msgid: cleanString(match[2]),
      msgid_plural: cleanString(match[4]),
      ref: `${normPath}:${lineNum}`,
      comment
    });
  }

  while ((match = pluralContextRegex.exec(content)) !== null) {
    const lineNum = getLineNumber(match.index);
    const comment = getTranslatorComment(lineNum);
    addEntry({
      msgid: cleanString(match[2]),
      msgid_plural: cleanString(match[4]),
      msgctxt: cleanString(match[6]),
      ref: `${normPath}:${lineNum}`,
      comment
    });
  }
}

// 1. Collect all files
let allFiles = [...SCAN_FILES];
for (const dir of SCAN_DIRS) {
  allFiles = allFiles.concat(collectFiles(dir));
}

console.log(`Scanning ${allFiles.length} files for text domain "${TEXT_DOMAIN}"...`);

for (const file of allFiles) {
  extractStrings(file);
}

console.log(`Found ${entries.size} unique translatable strings.`);

// Generate POT output
const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + '+00:00';

let potOutput = `# Copyright (C) 2026 WP Matcha
# This file is distributed under the GPL v2 or later.
msgid ""
msgstr ""
"Project-Id-Version: Matcha Gallery 1.0.0\\n"
"Report-Msgid-Bugs-To: https://wordpress.org/support/plugin/matcha-gallery\\n"
"Last-Translator: WP Matcha <support@wpmatcha.com>\\n"
"Language-Team: English <support@wpmatcha.com>\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"POT-Creation-Date: ${now}\\n"
"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"
"X-Generator: WP Matcha Make-POT 1.0\\n"
"X-Domain: ${TEXT_DOMAIN}\\n"

`;

// Sort entries alphabetically by msgid
const sortedEntries = Array.from(entries.values()).sort((a, b) => a.msgid.localeCompare(b.msgid));

for (const entry of sortedEntries) {
  // References
  const refs = Array.from(entry.references).join(' ');
  potOutput += `#: ${refs}\n`;

  // Comments
  for (const comment of entry.comments) {
    potOutput += `#. translators: ${comment}\n`;
  }

  // Context
  if (entry.msgctxt) {
    potOutput += `msgctxt ${formatPoString(entry.msgctxt)}\n`;
  }

  // Msgid & Msgstr
  potOutput += `msgid ${formatPoString(entry.msgid)}\n`;
  if (entry.msgid_plural) {
    potOutput += `msgid_plural ${formatPoString(entry.msgid_plural)}\n`;
    potOutput += `msgstr[0] ""\n`;
    potOutput += `msgstr[1] ""\n\n`;
  } else {
    potOutput += `msgstr ""\n\n`;
  }
}

// Ensure languages directory exists
const languagesDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(languagesDir)) {
  fs.mkdirSync(languagesDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, potOutput, 'utf-8');
console.log(`POT file successfully generated at: ${OUTPUT_FILE}`);
