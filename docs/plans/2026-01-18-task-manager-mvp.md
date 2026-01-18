# Task Manager MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a task management platform with kanban-style daily reports and AI-powered weekly report generation.

**Architecture:** Next.js 15 full-stack app with Supabase for database/auth, DeepSeek for AI report generation, deployed on Vercel.

**Tech Stack:** Next.js 15, React 19, TailwindCSS, dnd-kit, Supabase, DeepSeek API

**Design Doc:** `~/notes/Docs/designs/2026-01-18-task-manager-design.md`

---

## Phase 1: Project Setup

### Task 1.1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`

**Step 1: Create Next.js app**

```bash
cd /Users/caixiaohui/workspace/cxhello/task-manager
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```

**Step 2: Verify setup**

```bash
npm run dev
```
Expected: Dev server starts at localhost:3000

**Step 3: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Next.js 15 project"
```

---

### Task 1.2: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Supabase packages**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Step 2: Install UI/UX packages**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install lucide-react date-fns react-markdown
```

**Step 3: Install dev dependencies**

```bash
npm install -D zod
```

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add project dependencies"
```

---

### Task 1.3: Create Environment Config

**Files:**
- Create: `.env.local`
- Create: `.env.example`
- Create: `lib/env.ts`

**Step 1: Create .env.example**

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEEPSEEK_API_KEY=your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
NEXT_PUBLIC_APP_NAME=任务管理平台
```

**Step 2: Create lib/env.ts**

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DEEPSEEK_API_KEY: z.string().min(1),
  DEEPSEEK_BASE_URL: z.string().url().default('https://api.deepseek.com'),
  DEEPSEEK_MODEL: z.string().default('deepseek-chat'),
})

export const env = envSchema.parse(process.env)
```

**Step 3: Add .env.local to .gitignore (should already be there)**

**Step 4: Commit**

```bash
git add .env.example lib/env.ts
git commit -m "chore: add environment configuration"
```

---

### Task 1.4: Create Route Config

**Files:**
- Create: `config/routes.ts`

**Step 1: Create config/routes.ts**

```typescript
export const routeConfig = {
  // Public routes (no auth required)
  public: [
    '/login',
    '/register',
    '/reset-password',
  ],

  // Protected routes (auth required)
  protected: [
    '/board',
    '/reports',
    '/settings',
  ],

  // Admin routes (admin role required)
  admin: [
    '/admin',
    '/admin/tags',
    '/admin/templates',
    '/admin/users',
  ],

  // Redirects
  defaultRedirect: '/board',
  loginRedirect: '/login',
}

export const middlewareConfig = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/health).*)',
  ],
}
```

**Step 2: Commit**

```bash
git add config/routes.ts
git commit -m "chore: add route configuration"
```

---

### Task 1.5: Create App Config

**Files:**
- Create: `config/app.ts`

**Step 1: Create config/app.ts**

```typescript
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || '任务管理平台',

  board: {
    defaultDaysToShow: 7,
    maxTasksPerDay: 50,
    weekStartsOn: 1 as const, // Monday
  },

  report: {
    maxWeeksBack: 12,
  },

  ai: {
    maxTokens: 2000,
    temperature: 0.7,
    timeout: 30000,
    retries: 3,
  },

  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
}
```

**Step 2: Commit**

```bash
git add config/app.ts
git commit -m "chore: add app configuration"
```

---

## Phase 2: Supabase Setup

### Task 2.1: Create Supabase Project

**Step 1: Go to supabase.com and create new project**

- Note down: Project URL, Anon Key, Service Role Key

**Step 2: Update .env.local with actual values**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

---

### Task 2.2: Create Supabase Clients

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`

**Step 1: Create lib/supabase/client.ts (browser client)**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Create lib/supabase/server.ts (server client)**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  )
}
```

**Step 3: Create lib/supabase/middleware.ts**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  return { supabase, user, response: supabaseResponse }
}
```

**Step 4: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase client configurations"
```

---

### Task 2.3: Create Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Create migration file**

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('system', 'personal')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, created_by)
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task-Tag relation
CREATE TABLE task_tags (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- Report templates
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content JSONB NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Weekly reports
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_user_date ON tasks(user_id, task_date);
CREATE INDEX idx_tasks_date ON tasks(task_date);
CREATE INDEX idx_weekly_reports_user ON weekly_reports(user_id);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- User profiles: users can read all, update own
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Tasks: users can CRUD own tasks
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Tags: system tags visible to all, personal tags to owner
CREATE POLICY "Users can view system tags" ON tags FOR SELECT USING (type = 'system' OR created_by = auth.uid());
CREATE POLICY "Users can create personal tags" ON tags FOR INSERT WITH CHECK (type = 'personal' AND created_by = auth.uid());
CREATE POLICY "Admins can create system tags" ON tags FOR INSERT WITH CHECK (
  type = 'system' AND EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Task tags: based on task ownership
CREATE POLICY "Users can view own task tags" ON task_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_id AND tasks.user_id = auth.uid())
);
CREATE POLICY "Users can manage own task tags" ON task_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_id AND tasks.user_id = auth.uid())
);

-- Report templates: all can view, admins can manage
CREATE POLICY "All can view templates" ON report_templates FOR SELECT USING (true);
CREATE POLICY "Admins can manage templates" ON report_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Weekly reports: users can CRUD own
CREATE POLICY "Users can view own reports" ON weekly_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reports" ON weekly_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON weekly_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON weekly_reports FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, nickname)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nickname');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert default template
INSERT INTO report_templates (name, content, is_default) VALUES (
  '标准周报模板',
  '{
    "sections": [
      {"id": "completed", "title": "本周完成工作", "type": "task_list", "filter": {"status": "done"}, "groupBy": "tag", "prompt": "总结本周完成的主要工作，按标签分类"},
      {"id": "in_progress", "title": "进行中工作", "type": "task_list", "filter": {"status": "doing"}, "prompt": "列出当前进行中的工作及进度"},
      {"id": "issues", "title": "问题与风险", "type": "free_text", "prompt": "根据任务内容，分析可能存在的问题和风险"},
      {"id": "next_week", "title": "下周计划", "type": "free_text", "prompt": "根据进行中任务，推断下周可能的工作计划"}
    ]
  }',
  true
);
```

**Step 2: Run migration in Supabase Dashboard SQL Editor**

**Step 3: Commit**

```bash
mkdir -p supabase/migrations
git add supabase/
git commit -m "feat: add database schema and RLS policies"
```

---

## Phase 3: Authentication

### Task 3.1: Create Middleware

**Files:**
- Create: `middleware.ts`

**Step 1: Create middleware.ts**

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { routeConfig } from '@/config/routes'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { user, response } = await updateSession(request)

  // Check if public route
  const isPublicRoute = routeConfig.public.some(
    route => pathname.startsWith(route)
  )

  if (isPublicRoute) {
    // Logged in user accessing login page -> redirect to board
    if (user) {
      return NextResponse.redirect(new URL(routeConfig.defaultRedirect, request.url))
    }
    return response
  }

  // Not logged in accessing protected route
  if (!user) {
    const loginUrl = new URL(routeConfig.loginRedirect, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
```

**Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add authentication middleware"
```

---

### Task 3.2: Create Login Page

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/layout.tsx`

**Step 1: Create app/(auth)/layout.tsx**

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {children}
    </div>
  )
}
```

**Step 2: Create app/(auth)/login/page.tsx**

```typescript
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('邮箱或密码错误')
      setLoading(false)
      return
    }

    const redirect = searchParams.get('redirect') || '/board'
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-8">任务管理平台</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            邮箱
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        没有账号？联系管理员获取邀请
      </p>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/\(auth\)/
git commit -m "feat: add login page"
```

---

## Phase 4: Dashboard Layout

### Task 4.1: Create Common Components

**Files:**
- Create: `components/common/Sidebar.tsx`
- Create: `components/common/Navbar.tsx`

**Step 1: Create components/common/Sidebar.tsx**

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Settings, Tags, FileCode } from 'lucide-react'

const menuItems = [
  { href: '/board', label: '看板', icon: LayoutDashboard },
  { href: '/reports', label: '周报', icon: FileText },
  { href: '/settings', label: '设置', icon: Settings },
]

const adminItems = [
  { href: '/admin/tags', label: '标签管理', icon: Tags },
  { href: '/admin/templates', label: '模板管理', icon: FileCode },
]

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="text-xl font-bold mb-8 px-2">任务管理平台</div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase">
              管理
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>
    </aside>
  )
}
```

**Step 2: Create components/common/Navbar.tsx**

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User } from 'lucide-react'

export function Navbar({ userEmail }: { userEmail?: string }) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} />
          {userEmail}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <LogOut size={16} />
          退出
        </button>
      </div>
    </header>
  )
}
```

**Step 3: Commit**

```bash
git add components/common/
git commit -m "feat: add Sidebar and Navbar components"
```

---

### Task 4.2: Create Dashboard Layout

**Files:**
- Create: `app/(dashboard)/layout.tsx`

**Step 1: Create app/(dashboard)/layout.tsx**

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/common/Sidebar'
import { Navbar } from '@/components/common/Navbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col">
        <Navbar userEmail={user.email} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(dashboard\)/layout.tsx
git commit -m "feat: add dashboard layout"
```

---

## Phase 5: Board (Core Feature)

### Task 5.1: Create TypeScript Types

**Files:**
- Create: `types/index.ts`

**Step 1: Create types/index.ts**

```typescript
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
```

**Step 2: Commit**

```bash
git add types/
git commit -m "feat: add TypeScript type definitions"
```

---

### Task 5.2: Create Task Actions

**Files:**
- Create: `lib/actions/tasks.ts`

**Step 1: Create lib/actions/tasks.ts**

```typescript
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
```

**Step 2: Commit**

```bash
git add lib/actions/tasks.ts
git commit -m "feat: add task server actions"
```

---

## Remaining Phases (Summary)

Due to length, the remaining tasks are summarized:

### Phase 5 Continued: Board Components
- Task 5.3: Create BoardView component
- Task 5.4: Create DayColumn component
- Task 5.5: Create TaskCard component
- Task 5.6: Create TaskEditor modal
- Task 5.7: Create DateNavigator component
- Task 5.8: Integrate dnd-kit drag and drop
- Task 5.9: Create Board page

### Phase 6: Tags
- Task 6.1: Create tag actions
- Task 6.2: Create TagSelector component
- Task 6.3: Create TagBadge component
- Task 6.4: Create admin tags page

### Phase 7: Weekly Reports
- Task 7.1: Create report actions
- Task 7.2: Create DeepSeek client
- Task 7.3: Create prompt utilities
- Task 7.4: Create ReportGenerator component
- Task 7.5: Create TemplateEditor component
- Task 7.6: Create report pages

### Phase 8: Deployment
- Task 8.1: Configure Vercel
- Task 8.2: Set environment variables
- Task 8.3: Deploy and test

---

**Plan saved to `docs/plans/2026-01-18-task-manager-mvp.md`**

**Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
