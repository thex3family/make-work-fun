// Every image upload goes through here, so files are resized before they leave
// the browser. Uploads used to store originals as-is (a 42 MB avatar GIF, 4 MB
// daily photos), which is what pushed storage past the Supabase free plan.
//
//   const result = await uploadImage('avatars', file);
//   if (result.ok) save(result.path); else alert(result.error);
//
// Still images (JPEG, PNG, WebP, BMP) are redrawn no larger than the bucket's
// longest edge and sent as WebP. Animated GIFs can't keep their animation
// through a canvas, so they are sent unchanged, as long as they fit the 5 MB
// bucket limit. Keep PRESETS in step with scripts/storage/lib.mjs, which
// shrank the files uploaded before this existed.

import { supabase } from '@/utils/supabase-client';

const PRESETS = {
  avatars: 512,
  shopkeepers: 512,
  items: 512,
  backgrounds: 1920,
  dailies: 1600
};

// Matches file_size_limit on the buckets.
const MAX_BYTES = 5 * 1024 * 1024;

const RESIZABLE = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image. Please try a JPEG or PNG.'));
    };
    img.src = url;
  });
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

// Returns { blob, ext } or null when the browser can't produce a smaller file.
async function resize(file, edge) {
  const img = await loadImage(file);
  const scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

  // Older Safari ignores 'image/webp' and hands back a PNG; use JPEG there.
  let blob = await toBlob(canvas, 'image/webp', 0.8);
  let ext = 'webp';
  if (!blob || blob.type !== 'image/webp') {
    blob = await toBlob(canvas, 'image/jpeg', 0.85);
    ext = 'jpg';
  }
  return blob && blob.size < file.size ? { blob, ext } : null;
}

export async function uploadImage(bucket, file) {
  try {
    if (!file) return { ok: false, error: 'You must select an image to upload.' };

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (['heic', 'heif'].includes(ext) || /hei[cf]/.test(file.type)) {
      return { ok: false, error: "iPhone HEIC photos aren't supported. Please upload a JPEG or PNG." };
    }

    let body = file;
    let outExt = ext;
    let contentType = file.type || undefined;

    if (RESIZABLE.includes(file.type)) {
      const resized = await resize(file, PRESETS[bucket]);
      if (resized) {
        body = resized.blob;
        outExt = resized.ext;
        contentType = resized.blob.type;
      }
    }

    if (body.size > MAX_BYTES) {
      return { ok: false, error: 'That file is over 5 MB. Please choose a smaller one.' };
    }

    // Keys are never reused for a different image, so they can be cached hard.
    const path = `${Math.random()}.${outExt}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, body, { contentType, cacheControl: '31536000' });

    if (error) return { ok: false, error: error.message };
    return { ok: true, path };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
