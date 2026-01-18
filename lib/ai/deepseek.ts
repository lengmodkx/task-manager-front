import { appConfig } from '@/config/app'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatCompletionResponse {
  id: string
  choices: {
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function generateCompletion(
  messages: ChatMessage[],
  options?: {
    maxTokens?: number
    temperature?: number
  }
): Promise<{ success: boolean; content?: string; error?: string }> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

  if (!apiKey) {
    return { success: false, error: 'DeepSeek API key not configured' }
  }

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options?.maxTokens || appConfig.ai.maxTokens,
        temperature: options?.temperature || appConfig.ai.temperature,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error: `API error: ${response.status} - ${error}` }
    }

    const data: ChatCompletionResponse = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return { success: false, error: 'No content in response' }
    }

    return { success: true, content }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function generateWeeklyReport(
  tasks: {
    title: string
    content: string | null
    status: string
    tags: { name: string }[]
  }[],
  templatePrompts: { title: string; prompt: string }[]
): Promise<{ success: boolean; content?: string; error?: string }> {
  // Prepare task summary
  const taskSummary = tasks
    .map((task) => {
      const tags = task.tags.map((t) => t.name).join(', ')
      return `- [${task.status === 'done' ? '已完成' : task.status === 'doing' ? '进行中' : '待办'}] ${task.title}${tags ? ` (${tags})` : ''}${task.content ? `\n  ${task.content}` : ''}`
    })
    .join('\n')

  // Build prompts from template
  const sectionPrompts = templatePrompts
    .map((s) => `## ${s.title}\n${s.prompt}`)
    .join('\n\n')

  const systemPrompt = `你是一个专业的工作周报撰写助手。请根据用户提供的任务列表，生成一份结构清晰、内容详实的周报。

要求：
1. 使用 Markdown 格式
2. 内容要专业、简洁
3. 突出重点工作和成果
4. 如果有问题或风险，要明确指出
5. 下周计划要具体可行`

  const userPrompt = `请根据以下任务列表生成周报：

### 本周任务
${taskSummary || '（无任务记录）'}

### 周报结构要求
${sectionPrompts}`

  return generateCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ])
}
