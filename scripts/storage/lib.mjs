// Shared helpers for the storage scripts in this folder.
//
// These run locally with the service-role key, never in the app. They read
// SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL from .env.local.

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import heicConvert from 'heic-convert';

export const BUCKETS = ['avatars', 'backgrounds', 'dailies', 'items', 'shopkeepers'];

// Longest edge, in px, that each bucket is shrunk to. Avatars, items and
// shopkeepers render at most ~288px tall; backgrounds are full-width banners;
// dailies are proof-of-habit photos.
export const PRESETS = {
  avatars: 512,
  shopkeepers: 512,
  items: 512,
  backgrounds: 1920,
  dailies: 1600
};

const NOT_IMAGES = new Set(['svg', 'mp4', 'json', 'sprite3', 'enc', 'ico', 'emptyfolderplaceholder']);
const HEIC = new Set(['heic', 'heif']);

// A shrunk file must be at least this much smaller to be worth replacing.
const MIN_SAVING = 0.2;

export function loadEnv(file = '.env.local') {
  const text = fs.readFileSync(path.resolve(file), 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  for (const key of ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
    if (!process.env[key]) throw new Error(`${key} missing from ${file}`);
  }
}

export function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function extOf(name) {
  const m = name.match(/\.([^.]+)$/);
  return m ? m[1].toLowerCase() : '';
}

// Every object at the top of a bucket, as { name, size, mimetype, createdAt }.
// Keys are flat; the one placeholder inside a folder is ignored.
export async function listObjects(supabase, bucket) {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw new Error(`list ${bucket}: ${error.message}`);
    for (const o of data) {
      if (!o.id) continue; // folder placeholder
      out.push({
        name: o.name,
        size: o.metadata?.size ?? 0,
        mimetype: o.metadata?.mimetype ?? '',
        createdAt: o.created_at
      });
    }
    if (data.length < 1000) return out;
  }
}

async function selectAll(supabase, table, column) {
  const values = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from(table)
      .select(column)
      .not(column, 'is', null)
      .range(from, from + 999);
    if (error) throw new Error(`${table}.${column}: ${error.message}`);
    for (const row of data) values.push(row[column]);
    if (data.length < 1000) return values;
  }
}

// The storage keys something still points at, per bucket. Keep this list in
// step with every column the app passes to downloadImage(); anything not in it
// is treated as unused and can be deleted.
export const REFERENCES = [
  ['avatars', 'users', 'avatar_url'],
  ['backgrounds', 'users', 'background_url'],
  ['shopkeepers', 'users', 'shopkeeper_url'],
  ['items', 'item_shop', 'img_url'],
  ['dailies', 'completed_habits', 'details'],
  ['dailies', 'dailies', 'latest_details']
];

export async function usedKeys(supabase) {
  const used = Object.fromEntries(BUCKETS.map((b) => [b, new Set()]));
  for (const [bucket, table, column] of REFERENCES) {
    for (const v of await selectAll(supabase, table, column)) used[bucket].add(v);
  }
  return used;
}

export async function download(supabase, bucket, name) {
  const { data, error } = await supabase.storage.from(bucket).download(name);
  if (error) throw new Error(`download ${bucket}/${name}: ${error.message}`);
  return Buffer.from(await data.arrayBuffer());
}

// Re-encode one stored file for its bucket. Returns
//   { action: 'shrink', buffer, contentType, animated }  -- replace it
//   { action: 'skip', reason }                           -- leave it alone
export async function shrink(input, bucket, name) {
  const ext = extOf(name);
  if (NOT_IMAGES.has(ext)) return { action: 'skip', reason: `not an image (.${ext})` };

  let buf = input;
  const wasHeic = HEIC.has(ext);
  if (wasHeic) {
    // sharp's prebuilt binaries only decode AVIF, not HEIC.
    buf = Buffer.from(await heicConvert({ buffer: input, format: 'JPEG', quality: 0.92 }));
  }

  let meta;
  try {
    meta = await sharp(buf, { animated: true, limitInputPixels: false }).metadata();
  } catch (e) {
    return { action: 'skip', reason: `undecodable: ${e.message}` };
  }
  const animated = (meta.pages || 1) > 1;
  const edge = PRESETS[bucket];

  let img = sharp(buf, { animated, limitInputPixels: false });
  if (!animated) img = img.rotate(); // apply EXIF orientation before resizing
  img = img.resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true });
  const out = await img.webp({ quality: animated ? 75 : 80, effort: 4 }).toBuffer();

  // HEIC is converted regardless: most browsers can't display it at all.
  if (!wasHeic && out.length > input.length * (1 - MIN_SAVING)) {
    return { action: 'skip', reason: 'already small' };
  }
  return { action: 'shrink', buffer: out, contentType: 'image/webp', animated };
}
