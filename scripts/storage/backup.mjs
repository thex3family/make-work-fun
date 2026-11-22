// Phase 1 of specs/plans/supabase-free-tier.html: download every object in
// every bucket before anything is changed or deleted.
//
//   node scripts/storage/backup.mjs <backup-dir>
//
// Writes <backup-dir>/<bucket>/<key> plus <backup-dir>/manifest.json with each
// file's size, content type and SHA-256. Safe to rerun: files already on disk
// with the right size are re-hashed, not downloaded again. Exits non-zero
// unless every object is on disk and matches the listing.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { BUCKETS, loadEnv, adminClient, listObjects, download } from './lib.mjs';

const dir = process.argv[2];
if (!dir) throw new Error('usage: node scripts/storage/backup.mjs <backup-dir>');

loadEnv();
const supabase = adminClient();
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

const manifest = [];
const failures = [];
let bytes = 0;

for (const bucket of BUCKETS) {
  const objects = await listObjects(supabase, bucket);
  fs.mkdirSync(path.join(dir, bucket), { recursive: true });
  let done = 0;

  const queue = [...objects];
  async function worker() {
    for (let o = queue.shift(); o; o = queue.shift()) {
      const file = path.join(dir, bucket, o.name);
      try {
        let buf = fs.existsSync(file) ? fs.readFileSync(file) : null;
        if (!buf || buf.length !== o.size) {
          buf = await download(supabase, bucket, o.name);
          fs.writeFileSync(file, buf);
        }
        if (buf.length !== o.size) throw new Error(`size ${buf.length} != listed ${o.size}`);
        manifest.push({ bucket, key: o.name, size: buf.length, mimetype: o.mimetype, sha256: sha256(buf) });
        bytes += buf.length;
      } catch (e) {
        failures.push(`${bucket}/${o.name}: ${e.message}`);
      }
      if (++done % 250 === 0) console.log(`${bucket}: ${done}/${objects.length}`);
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  console.log(`${bucket}: ${done}/${objects.length} done`);
}

manifest.sort((a, b) => (a.bucket + a.key).localeCompare(b.bucket + b.key));
fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 1));

console.log(`\nfiles: ${manifest.length}, bytes: ${bytes} (${(bytes / 1e9).toFixed(2)} GB)`);
if (failures.length) {
  console.log(`${failures.length} FAILED:`);
  for (const f of failures) console.log('  ' + f);
  process.exit(1);
}
console.log('all objects backed up and verified against the listing');
