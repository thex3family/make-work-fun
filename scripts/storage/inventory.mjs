// Phase 0 of specs/plans/supabase-free-tier.html: measure, write nothing.
//
// Lists every object, works out which are still used, then shrinks a sample
// of used files in memory and projects the total size after shrinking.
// Nothing is uploaded and nothing is written to disk.
//
//   node scripts/storage/inventory.mjs [--per-group 15]

import { BUCKETS, loadEnv, adminClient, listObjects, usedKeys, download, shrink, extOf } from './lib.mjs';

const perGroup = Number(process.argv[process.argv.indexOf('--per-group') + 1]) || 15;
const MB = (n) => (n / 1e6).toFixed(0).padStart(6) + ' MB';

// Groups shrink very differently, so sample and project each separately.
function groupOf(bucket, name) {
  const ext = extOf(name);
  const kind = ext === 'gif' ? 'gif' : ext === 'heic' || ext === 'heif' ? 'heic' : 'still';
  return `${bucket}/${kind}`;
}

function sample(list, n) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

loadEnv();
const supabase = adminClient();
const used = await usedKeys(supabase);

const groups = new Map();
let totalAll = 0;
console.log('bucket        objects   used  unused     used size   unused size');
for (const bucket of BUCKETS) {
  const objects = await listObjects(supabase, bucket);
  const inUse = objects.filter((o) => used[bucket].has(o.name));
  const sum = (xs) => xs.reduce((a, o) => a + o.size, 0);
  totalAll += sum(objects);
  console.log(
    `${bucket.padEnd(12)} ${String(objects.length).padStart(7)} ${String(inUse.length).padStart(6)} ${String(objects.length - inUse.length).padStart(7)}  ${MB(sum(inUse))}  ${MB(sum(objects) - sum(inUse))}`
  );
  for (const o of inUse) {
    const g = groupOf(bucket, o.name);
    if (!groups.has(g)) groups.set(g, { bucket, files: [] });
    groups.get(g).files.push(o);
  }
}
console.log(`all objects: ${MB(totalAll)}\n`);

console.log('group                  files   used now   sampled  ratio   projected   skipped');
let projected = 0;
let usedNow = 0;
const failures = [];
for (const [g, { bucket, files }] of [...groups].sort()) {
  const bytes = files.reduce((a, o) => a + o.size, 0);
  let before = 0;
  let after = 0;
  let skipped = 0;
  for (const o of sample(files, perGroup)) {
    try {
      const input = await download(supabase, bucket, o.name);
      const r = await shrink(input, bucket, o.name);
      before += input.length;
      after += r.action === 'shrink' ? r.buffer.length : input.length;
      if (r.action === 'skip') skipped++;
    } catch (e) {
      failures.push(`${bucket}/${o.name}: ${e.message}`);
    }
  }
  const ratio = before ? after / before : 1;
  projected += bytes * ratio;
  usedNow += bytes;
  console.log(
    `${g.padEnd(20)} ${String(files.length).padStart(7)} ${MB(bytes)}  ${String(Math.min(perGroup, files.length)).padStart(8)}  ${ratio.toFixed(2)}  ${MB(bytes * ratio)}  ${String(skipped).padStart(8)}`
  );
}
console.log(`\nused files now: ${MB(usedNow)}`);
console.log(`projected after shrinking: ${MB(projected)}  (gate: under 800 MB)`);
if (failures.length) {
  console.log(`\n${failures.length} sample files failed:`);
  for (const f of failures) console.log('  ' + f);
}
