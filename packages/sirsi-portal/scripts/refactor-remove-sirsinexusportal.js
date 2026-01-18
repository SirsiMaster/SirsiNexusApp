#!/usr/bin/env node
/*
  refactor-remove-sirsinexusportal.js
  - Rewrites occurrences of "/" to "/" across the repo
  - Excludes archive/, node_modules/, .git/, .firebase/hosting..cache, and binary files
  - Special handling for _redirects: only rewrite destination paths; keep legacy sources
  - Adds catch-all legacy redirect: "/*  /:splat  301" if missing
*/

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();

const EXCLUDE_DIRS = new Set([
  'archive',
  'node_modules',
  '.git',
  '.firebase',
  '.github',
  '.warp'
]);

const TEXT_EXTENSIONS = new Set([
  '.html','.htm','.js','.mjs','.cjs','.ts','.tsx','.jsx','.css','.scss','.sass','.md','.mdx','.txt','.json','.yml','.yaml','.xml','.svg','.sh','.conf','.ini','.toml'
]);

const TARGET = '/';
const REPLACEMENT = '/';

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

function shouldSkipDir(dirName) {
  return EXCLUDE_DIRS.has(dirName);
}

function walk(dir, onFile) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      walk(full, onFile);
    } else if (entry.isFile()) {
      onFile(full);
    }
  }
}

function processRegularFile(filePath) {
  if (!isTextFile(filePath)) return { changed: false, count: 0 };
  const original = fs.readFileSync(filePath, 'utf8');
  if (!original.includes(TARGET)) return { changed: false, count: 0 };
  const count = (original.match(new RegExp(TARGET.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const updated = original.split(TARGET).join(REPLACEMENT);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    return { changed: true, count };
  }
  return { changed: false, count: 0 };
}

function processRedirects(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split(/\r?\n/);
  let changed = false;
  let hasCatchAll = false;
  const out = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { out.push(line); continue; }
    if (trimmed.startsWith('#')) { out.push(line); continue; }

    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      const source = parts[0];
      let dest = parts[1];
      const rest = parts.slice(2).join(' ');

      // Detect catch-all legacy rule
      if (source === '/*') {
        hasCatchAll = true;
      }

      // Replace only in destination
      if (dest.includes(TARGET)) {
        dest = dest.split(TARGET).join(REPLACEMENT);
        changed = true;
      }

      const rebuilt = [source, dest].concat(rest ? [rest] : []).join('  ');
      out.push(rebuilt);
    } else {
      out.push(line);
    }
  }

  if (!hasCatchAll) {
    out.push('/*  /:splat  301');
    changed = true;
  }

  const updated = out.join('\n');
  if (changed) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }
  return { changed, count: changed ? 1 : 0 };
}

function main() {
  const summary = {
    filesChanged: 0,
    occurrencesReplaced: 0,
    redirectsUpdated: false,
    modifiedFiles: []
  };

  // First pass: regular files excluding _redirects
  walk(repoRoot, (file) => {
    const base = path.basename(file);
    if (base === '_redirects') return; // handle separately
    if (file.includes(`${path.sep}.firebase${path.sep}hosting..cache${path.sep}`)) return; // skip cache files

    try {
      const { changed, count } = processRegularFile(file);
      if (changed) {
        summary.filesChanged += 1;
        summary.occurrencesReplaced += count;
        summary.modifiedFiles.push(path.relative(repoRoot, file));
      }
    } catch (e) {
      // ignore binary or unreadable files
    }
  });

  // Handle _redirects specially if present
  const redirectsPath = path.join(repoRoot, '_redirects');
  if (fs.existsSync(redirectsPath)) {
    const { changed } = processRedirects(redirectsPath);
    if (changed) {
      summary.redirectsUpdated = true;
      summary.modifiedFiles.push('_redirects');
    }
  }

  // Print concise summary
  console.log(JSON.stringify(summary, null, 2));
}

main();

