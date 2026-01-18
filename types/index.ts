export interface Task {
  id: string
  user_id: string
  title: string
  content: string | null
  status: 'todo' | 'doing' | 'done'
  task_date: string
  sort_order: number
  created_at: string
  updated_at: string
  tags?: Tag[]
}

export interface Tag {
  id: string
  name: string
  color: string
  type: 'system' | 'personal'
  created_by: string | null
}

export interface TaskTag {
  task_id: string
  tag_id: string
}

export interface ReportTemplate {
  id: string
  name: string
  content: TemplateContent
  is_default: boolean
  created_by: string | null
}

export interface TemplateSection {
  id: string
  title: string
  type: 'task_list' | 'free_text'
  filter?: { status?: string }
  groupBy?: 'tag' | 'date'
  prompt: string
}

export interface TemplateContent {
  sections: TemplateSection[]
}

export interface WeeklyReport {
  id: string
  user_id: string
  week_start: string
  week_end: string
  template_id: string | null
  content: string
  status: 'draft' | 'final'
  created_at: string
}

export interface UserProfile {
  id: string
  nickname: string | null
  avatar_url: string | null
  role: 'admin' | 'member'
}

export interface InvitationCode {
  id: string
  code: string
  created_by: string
  max_uses: number
  used_count: number
  expires_at: string | null
  is_active: boolean
  note: string | null
  created_at: string
}

export interface InvitationUse {
  id: string
  invitation_id: string
  used_by: string
  used_at: string
}
