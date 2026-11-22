// Phase 4 of specs/plans/supabase-free-tier.html: delete files nothing uses.
//
//   node scripts/storage/prune.mjs <backup-dir>         list what would go
//   node scripts/storage/prune.mjs <backup-dir> --yes   delete it
//
// The app has no way to pick a previously uploaded file, so an object no row
// points at is unreachable. A file is deleted only if it is unused right now,
// is in the phase 1 backup with the same size, and is more than 7 days old
// (so an upload whose row hasn't been saved yet is never caught).

import fs from 'node:fs';
import path from 'node:path';
import { BUCKETS, loadEnv, adminClient, listObjects, usedKeys } from './lib.mjs';

const dir = process.argv[2];
if (!dir) throw new Error('usage: node scripts/storage/prune.mjs <backup-dir> [--yes]');
const confirmed = process.argv.includes('--yes');
const WEEK = 7 * 24 * 3600 * 1000;

loadEnv();
const supabase = adminClient();
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
const backedUp = new Map(manifest.map((m) => [`${m.bucket}/${m.key}`, m.size]));
const used = await usedKeys(supabase);

let totalFiles = 0;
let totalBytes = 0;
for (const bucket of BUCKETS) {
  const objects = await listObjects(supabase, bucket);
  const doomed = objects.filter(
    (o) =>
      !used[bucket].has(o.name) &&
      backedUp.has(`${bucket}/${o.name}`) &&
      Date.now() - new Date(o.createdAt).getTime() > WEEK
  );
  const bytes = doomed.reduce((a, o) => a + o.size, 0);
  totalFiles += doomed.length;
  totalBytes += bytes;
  console.log(`${bucket.padEnd(12)} ${String(doomed.length).padStart(5)} unused files, ${(bytes / 1e6).toFixed(0)} MB`);

  if (confirmed) {
    for (let i = 0; i < doomed.length; i += 100) {
      const names = doomed.slice(i, i + 100).map((o) => o.name);
      const { error } = await supabase.storage.from(bucket).remove(names);
      if (error) throw new Error(`remove from ${bucket}: ${error.message}`);
    }
  }
}
console.log(`${confirmed ? 'deleted' : 'would delete'} ${totalFiles} files, ${(totalBytes / 1e6).toFixed(0)} MB`);
