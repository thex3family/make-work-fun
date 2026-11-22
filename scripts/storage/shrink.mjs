// Phase 3 of specs/plans/supabase-free-tier.html: shrink every image still in
// use, overwriting it under the same key so no database row has to change.
//
//   node scripts/storage/shrink.mjs <backup-dir> --dry-run   projected sizes only
//   node scripts/storage/shrink.mjs <backup-dir>             shrink and upload
//   node scripts/storage/shrink.mjs <backup-dir> --verify    check every used key
//   node scripts/storage/shrink.mjs <backup-dir> --restore all|<bucket>/<key>
//
// Restoring an original over 5 MB needs the bucket limit lifted first (see
// supabase/migrations/20261123130000_storage_bucket_limits.sql).
//
// Reads originals from the phase 1 backup, never from storage, so a rerun
// can't shrink an already-shrunk file. Progress goes to <backup-dir>/shrink-log.jsonl;
// a rerun skips keys already logged. Stops at the first upload error.
//
// The stored key keeps its old extension (a .gif may now hold animated WebP).
// Browsers choose the decoder from the bytes and the Content-Type, not the name.

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { loadEnv, adminClient, usedKeys, shrink, extOf } from './lib.mjs';

const args = process.argv.slice(2);
const dir = args[0];
if (!dir) throw new Error('usage: node scripts/storage/shrink.mjs <backup-dir> [--dry-run|--verify|--restore all|bucket/key]');
const dryRun = args.includes('--dry-run');
const verify = args.includes('--verify');
const restore = args.includes('--restore') ? args[args.indexOf('--restore') + 1] : null;

loadEnv();
const supabase = adminClient();
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
const original = (m) => fs.readFileSync(path.join(dir, m.bucket, m.key));
const MB = (n) => (n / 1e6).toFixed(0) + ' MB';

async function put(bucket, key, buffer, contentType) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(key, buffer, { upsert: true, contentType: contentType || 'application/octet-stream', cacheControl: '31536000' });
  if (error) throw new Error(`upload ${bucket}/${key}: ${error.message}`);
}

const logFile = path.join(dir, 'shrink-log.jsonl');
function readLog() {
  if (!fs.existsSync(logFile)) return [];
  const entries = [];
  for (const line of fs.readFileSync(logFile, 'utf8').split('\n')) {
    try {
      if (line) entries.push(JSON.parse(line));
    } catch {
      // a line cut short by a crash; that key is simply redone
    }
  }
  return entries;
}

if (restore) {
  // "all" puts back only what this script replaced. It must not re-upload the
  // whole backup: that would revive every file prune.mjs deleted and overflow
  // the free plan's 1 GB.
  const shrunk = new Set(readLog().filter((r) => r.action === 'shrink').map((r) => `${r.bucket}/${r.key}`));
  const targets =
    restore === 'all'
      ? manifest.filter((m) => shrunk.has(`${m.bucket}/${m.key}`))
      : manifest.filter((m) => `${m.bucket}/${m.key}` === restore);
  if (!targets.length) throw new Error(`nothing in the backup matches ${restore}`);
  for (const m of targets) await put(m.bucket, m.key, original(m), m.mimetype);
  console.log(`restored ${targets.length} file(s) from the backup`);
  process.exit(0);
}

const used = await usedKeys(supabase);
const targets = manifest.filter((m) => used[m.bucket].has(m.key));

if (verify) {
  // Shrunk files must be served as WebP; everything else must decode as an
  // image. SVG and MP4 are never touched and aren't decoded here.
  const shrunk = new Set(readLog().filter((r) => r.action === 'shrink').map((r) => `${r.bucket}/${r.key}`));
  const SKIP = new Set(['svg', 'mp4']);
  const failures = [];
  let total = 0;
  let notDecoded = 0;
  for (const m of targets) {
    const id = `${m.bucket}/${m.key}`;
    try {
      const { data, error } = await supabase.storage.from(m.bucket).download(m.key);
      if (error) throw new Error(error.message);
      const buf = Buffer.from(await data.arrayBuffer());
      total += buf.length;
      if (shrunk.has(id) && data.type !== 'image/webp') throw new Error(`served as ${data.type}, expected image/webp`);
      if (SKIP.has(extOf(m.key))) notDecoded++;
      else await sharp(buf, { animated: true }).metadata();
    } catch (e) {
      failures.push(`${id}: ${e.message}`);
    }
  }
  console.log(`checked ${targets.length} used files, ${MB(total)} in total (${notDecoded} SVG/MP4 not decoded)`);
  if (failures.length) {
    console.log(`${failures.length} FAILED:`);
    for (const f of failures) console.log('  ' + f);
    process.exit(1);
  }
  console.log('every used file downloads and decodes');
  process.exit(0);
}

const done = new Set(readLog().map((r) => `${r.bucket}/${r.key}`));

let before = 0;
let after = 0;
const counts = { shrink: 0, skip: 0, already: 0 };
for (const m of targets) {
  const id = `${m.bucket}/${m.key}`;
  if (!dryRun && done.has(id)) {
    counts.already++;
    continue;
  }
  const input = original(m);
  let r;
  try {
    r = await shrink(input, m.bucket, m.key);
  } catch (e) {
    // A corrupt file is left as it is and logged, so it doesn't block every rerun.
    r = { action: 'skip', reason: `error: ${e.message}` };
  }
  const size = r.action === 'shrink' ? r.buffer.length : input.length;
  before += input.length;
  after += size;
  counts[r.action]++;

  if (!dryRun) {
    if (r.action === 'shrink') await put(m.bucket, m.key, r.buffer, r.contentType);
    fs.appendFileSync(
      logFile,
      JSON.stringify({ bucket: m.bucket, key: m.key, action: r.action, reason: r.reason, before: input.length, after: size }) + '\n'
    );
  }
  if ((counts.shrink + counts.skip) % 100 === 0) console.log(`${counts.shrink + counts.skip}/${targets.length - counts.already}`);
}

console.log(`\n${dryRun ? 'DRY RUN: ' : ''}${targets.length} used files`);
console.log(`shrunk ${counts.shrink}, left as-is ${counts.skip}, done in an earlier run ${counts.already}`);
console.log(`this run: ${MB(before)} -> ${MB(after)}`);
