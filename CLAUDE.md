# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

团队任务管理与 AI 周报生成平台，基于 Next.js 15 App Router 和 Supabase 构建。

## 技术栈

- **Frontend**: Next.js 16 (App Router) + React 19 + TailwindCSS 4
- **Backend**: Next.js Server Actions (no API routes for CRUD)
- **Database**: Supabase (PostgreSQL) with RLS
- **Authentication**: Supabase Auth with `@supabase/ssr`
- **AI**: DeepSeek API for weekly report generation
- **Drag & Drop**: @dnd-kit for board view task reordering
- **Package Manager**: pnpm

## 开发命令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint
```

## 环境变量

需要在 `.env.local` 中配置：

```
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
DEEPSEEK_API_KEY=<deepseek-api-key>
DEEPSEEK_BASE_URL=<optional-deepseek-base-url>
DEEPSEEK_MODEL=<optional-model-name>
```

## 架构关键点

### 认证流程

认证通过 `middleware.ts` 实现，使用 `lib/supabase/middleware.ts` 的 `updateSession` 函数：

- **公开路由** (无需认证): `/login`, `/register`, `/reset-password`
- **受保护路由** (需要认证): `/board`, `/reports`, `/settings`
- **管理员路由** (需要 admin 角色): `/admin/*`

路由配置在 `config/routes.ts` 中集中管理。

### Supabase 客户端

两个独立的客户端实现：

1. **`lib/supabase/server.ts`** - Server Components 和 Server Actions 使用
   - 使用 Next.js `cookies()` 获取 cookie
   - 在服务端操作中始终使用此客户端

2. **`lib/supabase/middleware.ts`** - Next.js middleware 使用
   - 从 `NextRequest` 读取/写入 cookies
   - 返回 `{ supabase, user, response }` 用于认证检查

### 数据层架构

**Server Actions 模式**: 所有数据操作通过 `lib/actions/` 下的 Server Actions 实现，不使用 API Routes。

- **返回值统一格式**: `{ success: boolean, data?: T, error?: string }`
- **缓存失效**: 使用 `revalidatePath()` 在写操作后刷新路由缓存
- **认证检查**: 在 action 内部通过 `supabase.auth.getUser()` 验证用户

**主要 Actions**:
- `lib/actions/tasks.ts` - 任务 CRUD + 拖拽排序
- `lib/actions/tags.ts` - 标签管理 (系统标签/个人标签)
- `lib/actions/reports.ts` - 周报生成 + 模板管理
- `lib/actions/invitations.ts` - 邀请码验证和使用
- `lib/actions/users.ts` - 管理员用户管理

### RLS (Row Level Security) 策略

所有表都启用 RLS，策略定义在 `supabase/migrations/001_initial_schema.sql`：

- **用户数据隔离**: 用户只能访问自己的 tasks 和 weekly_reports
- **标签共享**: `type='system'` 的标签对所有用户可见，`type='personal'` 仅创建者可见
- **管理员权限**: 通过 `user_profiles.role = 'admin'` 判断，可以管理系统标签和模板

**重要**: 管理员检查在 RLS 策略中使用子查询：
```sql
EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
```

### 看板拖拽逻辑

看板视图使用 `@dnd-kit` 实现拖拽，关键逻辑在 `components/board/BoardView.tsx`：

- **跨日期拖拽**: 任务拖到不同日期列时，更新 `task_date` 并重新计算 `sort_order`
- **同列排序**: 在同一天内拖拽时，重新计算所有任务的 `sort_order`
- **批量更新**: `reorderTasks` action 接受数组参数，批量更新多个任务的位置

### AI 周报生成

周报生成流程在 `lib/ai/deepseek.ts`：

1. 从 `report_templates` 表读取模板配置 (JSONB 格式)
2. 根据模板的 sections 配置筛选任务 (按状态、标签、日期分组)
3. 构建系统提示词和用户提示词
4. 调用 DeepSeek API 生成 Markdown 格式周报
5. 保存到 `weekly_reports` 表

### 数据库触发器

- **`handle_new_user()`**: 新用户注册时自动创建 `user_profiles` 记录
- **`update_updated_at()`**: 自动更新 `updated_at` 字段

### 应用配置

集中配置在 `config/app.ts`：

- **看板**: 默认显示天数、每周起始日 (周一)
- **AI**: maxTokens、temperature、超时时间
- **分页**: 默认/最大每页数量

## 用户角色

- **member**: 普通用户，管理自己的任务、周报和设置
- **admin**: 管理员，额外可访问 `/admin/*` 路由管理标签、模板、邀请码和用户

角色存储在 `user_profiles.role` 字段，通过 RLS 策略强制权限控制。

## 数据库迁移

按顺序执行 `supabase/migrations/` 下的 SQL 文件：

1. `001_initial_schema.sql` - 核心表结构和 RLS 策略
2. `002_fix_user_trigger.sql` - 修复用户触发器
3. `003_invitation_codes.sql` - 邀请码系统
4. `004_user_management.sql` - 用户管理功能
5. `005_fix_user_profiles_rls.sql` - 修复 user_profiles RLS
6. `006_fix_invitation_rls.sql` - 修复邀请码 RLS

## 已知问题

无重大已知问题。如果新用户注册后 `user_profiles` 未自动创建，检查触发器 `handle_new_user()` 是否正确部署。
