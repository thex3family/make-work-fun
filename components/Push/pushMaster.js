import { supabase } from '@/utils/supabase-client';

export async function pushTitle(title_id, refreshStats, setSaving) {
    try {
        setSaving(true)
      const user = supabase.auth.user();
  
      let { error } = await supabase
      .from('users')
      .update({
        title: title_id
      })
      .eq('id', user.id);
  
      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
        refreshStats()
        setSaving(false)
    }
  }