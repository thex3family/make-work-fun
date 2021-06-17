import { supabase } from '../../utils/supabase-client'

export default function handler(req, res) {
  supabase.auth.api.setAuthCookie(req, res)
}