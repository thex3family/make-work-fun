-- Cap uploads at 5 MB and to image (and short video) types on every bucket.
--
-- The app resizes still images in the browser before upload
-- (utils/uploadImage.js), but nothing on the server stopped a 42 MB GIF from
-- being stored, which is how storage outgrew the Supabase free plan's 1 GB.
-- This is the server-side backstop. Apply it only after the app that resizes
-- uploads is deployed, or ordinary photo uploads from the old app would fail.
--
-- SVG is left out on purpose: it can carry script, and nothing needs it.

update storage.buckets
   set file_size_limit = 5242880,
       allowed_mime_types = array[
         'image/jpeg', 'image/png', 'image/gif', 'image/webp',
         'image/avif', 'image/bmp', 'video/mp4'
       ]
 where id in ('avatars', 'backgrounds', 'dailies', 'items', 'shopkeepers');
