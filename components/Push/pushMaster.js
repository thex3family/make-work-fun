import { supabase } from '@/utils/supabase-client';

export async function pushTitle(title_id, refreshStats, setSaving, user_id) {
    try {
        setSaving(true)  
      let { error } = await supabase
      .from('users')
      .update({
        title: title_id
      })
      .eq('id', user_id);
  
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