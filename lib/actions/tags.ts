'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Tag } from '@/types'

export async function getTags() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function createTag(input: {
  name: string
  color: string
  type: Tag['type']
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '未登录' }
  }

  const { data, error } = await supabase
    .from('tags')
    .insert({
      name: input.name,
      color: input.color,
      type: input.type,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: '标签名称已存在' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/tags')
  revalidatePath('/board')
  return { success: true, data }
}

export async function updateTag(
  id: string,
  input: Partial<Pick<Tag, 'name' | 'color'>>
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: '标签名称已存在' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/tags')
  revalidatePath('/board')
  return { success: true, data }
}

export async function deleteTag(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/tags')
  revalidatePath('/board')
  return { success: true }
}
