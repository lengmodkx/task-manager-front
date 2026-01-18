# Task Manager - CLAUDE.md

任务管理平台 MVP 项目的开发指南和上下文信息。

## 项目概述

一个用于团队日常任务管理和周报生成的平台。

### 核心功能

- **看板视图**: 按日期/周展示任务，支持拖拽排序
- **任务管理**: 创建、编辑、删除任务，支持标签分类
- **周报生成**: 基于任务数据，使用 AI (DeepSeek) 自动生成周报
- **模板管理**: 管理员可配置周报生成模板

## 技术栈

- **Frontend**: Next.js 15 (App Router) + React 19 + TailwindCSS
- **Backend**: Next.js Server Actions + API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: DeepSeek API
- **Package Manager**: pnpm

## 项目结构

```
task-manager/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证页面 (login, register)
│   ├── (dashboard)/       # 仪表板页面 (board, reports, settings, admin)
│   └── api/               # API Routes
├── components/            # React 组件
│   ├── board/            # 看板相关组件
│   ├── reports/          # 周报相关组件
│   ├── tags/             # 标签管理组件
│   └── common/           # 通用组件 (Sidebar, Navbar)
├── lib/                   # 工具库
│   ├── actions/          # Server Actions
│   ├── supabase/         # Supabase 客户端
│   └── ai/               # DeepSeek API 客户端
├── config/               # 配置文件
├── types/                # TypeScript 类型定义
└── supabase/             # 数据库 migrations
```

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
```

## 数据库

### 主要表结构

- `user_profiles`: 用户配置文件 (昵称、头像、角色)
- `tasks`: 任务 (标题、内容、状态、日期)
- `tags`: 标签 (系统标签、个人标签)
- `task_tags`: 任务-标签关联
- `report_templates`: 周报模板
- `weekly_reports`: 周报记录

### RLS 策略

- 所有表都启用了 Row Level Security
- 用户只能访问和修改自己的数据
- 管理员可以管理系统标签和模板

## 用户角色

- `member`: 普通用户，可以管理自己的任务和周报
- `admin`: 管理员，额外可以管理系统标签和周报模板

## 路由结构

### 公开路由

- `/login`: 登录页
- `/register`: 注册页

### 受保护路由

- `/board`: 看板视图 (默认首页)
- `/reports`: 周报管理
- `/settings`: 用户设置

### 管理员路由

- `/admin/tags`: 标签管理
- `/admin/templates`: 模板管理

## 已知问题

1. **Supabase 用户触发器**: 如果新用户注册后 `user_profiles` 未自动创建，需要手动运行 `supabase/migrations/002_fix_user_trigger.sql`

## 待实现功能

- [ ] 部署到 Vercel
- [ ] 任务搜索功能
- [ ] 周报导出 (PDF/Word)
- [ ] 团队协作功能
