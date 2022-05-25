import { supabase } from '@/utils/supabase-client';

export async function downloadImage(path, type) {
    try {
      if (type === 'avatar') {
        const { data, error } = await supabase.storage
          .from('avatars')
          .download(path);
        if (error) {
          throw error;
        }
        const url = URL.createObjectURL(data);

        return url;

      } else if (type === 'background') {
        const { data, error } = await supabase.storage
          .from('backgrounds')
          .download(path);
        if (error) {
          throw error;
        }
        const url = URL.createObjectURL(data);
        
        return url;
      } else {
        const { data, error } = await supabase.storage
          .from(type)
          .download(path);
        if (error) {
          throw error;
        }
        const url = URL.createObjectURL(data);
        
        return url;
      }
    } catch (error) {
      console.log('Error downloading image: ', path, error.message);
    } finally {
    }
  }