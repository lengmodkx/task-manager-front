'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { WeeklyReport, ReportTemplate } from '@/types'

export async function getReports() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekly_reports')
    .select('*')
    .order('week_start', { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getReport(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekly_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function createReport(input: {
  week_start: string
  week_end: string
  template_id?: string
  content: string
  status?: WeeklyReport['status']
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '未登录' }
  }

  const { data, error } = await supabase
    .from('weekly_reports')
    .insert({
      user_id: user.id,
      week_start: input.week_start,
      week_end: input.week_end,
      template_id: input.template_id || null,
      content: input.content,
      status: input.status || 'draft',
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/reports')
  return { success: true, data }
}

export async function updateReport(
  id: string,
  input: Partial<Pick<WeeklyReport, 'content' | 'status'>>
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekly_reports')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/reports')
  return { success: true, data }
}

export async function deleteReport(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('weekly_reports')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/reports')
  return { success: true }
}

export async function getTemplates() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('report_templates')
    .select('*')
    .order('is_default', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getDefaultTemplate() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('report_templates')
    .select('*')
    .eq('is_default', true)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
