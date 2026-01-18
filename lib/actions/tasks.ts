'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Task } from '@/types'

export async function getTasks(startDate: string, endDate: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      tags:task_tags(tag:tags(*))
    `)
    .gte('task_date', startDate)
    .lte('task_date', endDate)
    .order('sort_order', { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  // Flatten tags
  const tasks = data.map(task => ({
    ...task,
    tags: task.tags?.map((t: { tag: unknown }) => t.tag) || []
  }))

  return { success: true, data: tasks }
}

export async function createTask(input: {
  title: string
  content?: string
  task_date: string
  status?: Task['status']
  tagIds?: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '未登录' }
  }

  // Get max sort_order for the date
  const { data: maxOrder } = await supabase
    .from('tasks')
    .select('sort_order')
    .eq('task_date', input.task_date)
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sort_order = (maxOrder?.sort_order ?? -1) + 1

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: input.title,
      content: input.content || null,
      task_date: input.task_date,
      status: input.status || 'todo',
      sort_order,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Add tags
  if (input.tagIds?.length) {
    await supabase
      .from('task_tags')
      .insert(input.tagIds.map(tag_id => ({ task_id: task.id, tag_id })))
  }

  revalidatePath('/board')
  return { success: true, data: task }
}

export async function updateTask(
  id: string,
  input: Partial<Pick<Task, 'title' | 'content' | 'status' | 'task_date' | 'sort_order'>> & {
    tagIds?: string[]
  }
) {
  const supabase = await createClient()

  const { tagIds, ...taskData } = input

  const { data: task, error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Update tags if provided
  if (tagIds !== undefined) {
    await supabase.from('task_tags').delete().eq('task_id', id)
    if (tagIds.length) {
      await supabase
        .from('task_tags')
        .insert(tagIds.map(tag_id => ({ task_id: id, tag_id })))
    }
  }

  revalidatePath('/board')
  return { success: true, data: task }
}

export async function deleteTask(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/board')
  return { success: true }
}

export async function reorderTasks(updates: { id: string; sort_order: number; task_date: string }[]) {
  const supabase = await createClient()

  for (const update of updates) {
    await supabase
      .from('tasks')
      .update({ sort_order: update.sort_order, task_date: update.task_date })
      .eq('id', update.id)
  }

  revalidatePath('/board')
  return { success: true }
}
