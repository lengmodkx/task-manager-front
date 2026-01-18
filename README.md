# 任务管理平台

团队任务管理与 AI 周报生成平台。

## 功能特性

- **看板视图** - 按日期/周展示任务，支持拖拽排序
- **任务管理** - 创建、编辑、删除任务，支持标签分类
- **周报生成** - 基于任务数据，使用 AI 自动生成周报
- **模板管理** - 管理员可配置周报生成模板
- **邀请码注册** - 通过邀请码控制用户注册

## 技术栈

- **Frontend**: Next.js 15 + React 19 + TailwindCSS
- **Backend**: Next.js Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: DeepSeek API
- **Deployment**: Vercel

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

需要配置的变量：

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 |

### 3. 初始化数据库

在 Supabase SQL Editor 中依次执行：

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_fix_user_trigger.sql
supabase/migrations/003_invitation_codes.sql
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证页面
│   ├── (dashboard)/       # 仪表板页面
│   └── api/               # API Routes
├── components/            # React 组件
├── lib/                   # 工具库
│   ├── actions/          # Server Actions
│   ├── supabase/         # Supabase 客户端
│   └── ai/               # DeepSeek API
├── types/                # TypeScript 类型
└── supabase/             # 数据库迁移脚本
```

## 用户角色

- **member** - 普通用户，管理自己的任务和周报
- **admin** - 管理员，额外可管理系统标签、模板和邀请码

## 部署

项目已配置 Vercel 部署，推送到 main 分支后自动部署。

## License

MIT
