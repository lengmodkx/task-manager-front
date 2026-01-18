import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWeeklyReport } from '@/lib/ai/deepseek'
import { getDefaultTemplate } from '@/lib/actions/reports'
import type { TemplateContent } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { weekStart, weekEnd } = await request.json()

    if (!weekStart || !weekEnd) {
      return NextResponse.json({ error: '缺少日期参数' }, { status: 400 })
    }

    // Get tasks for the week
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        title,
        content,
        status,
        tags:task_tags(tag:tags(name))
      `)
      .eq('user_id', user.id)
      .gte('task_date', weekStart)
      .lte('task_date', weekEnd)

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 500 })
    }

    // Flatten tags
    const formattedTasks = (tasks || []).map((task) => ({
      title: task.title,
      content: task.content,
      status: task.status,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tags: (task.tags as any[])?.map((t) => ({ name: t.tag?.name || '' })).filter((t) => t.name) || [],
    }))

    // Get default template
    const templateResult = await getDefaultTemplate()
    const template = templateResult.success ? templateResult.data : null
    const templateContent = template?.content as TemplateContent | null

    const prompts = templateContent?.sections.map((s) => ({
      title: s.title,
      prompt: s.prompt,
    })) || [
      { title: '本周完成工作', prompt: '总结本周完成的主要工作' },
      { title: '进行中工作', prompt: '列出当前进行中的工作' },
      { title: '问题与风险', prompt: '分析可能存在的问题和风险' },
      { title: '下周计划', prompt: '制定下周工作计划' },
    ]

    // Generate report
    const result = await generateWeeklyReport(formattedTasks, prompts)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ content: result.content })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
