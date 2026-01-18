'use server'

import { createClient } from '@/lib/supabase/server'

export async function getTags() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
