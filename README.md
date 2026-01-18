# 任务管理平台

<div align="center">

![任务管理平台](https://img.shields.io/badge/任务管理-平台-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8)

一个现代化的团队任务管理与 AI 周报生成平台，支持看板视图、智能周报生成、深色模式等功能。

</div>

## ✨ 功能特性

### 📋 核心功能
- **看板视图** - 按日期/周展示任务，支持拖拽排序
- **任务管理** - 创建、编辑、删除任务，支持标签分类和状态管理
- **AI 周报生成** - 基于任务数据，使用 DeepSeek API 自动生成周报
- **模板管理** - 管理员可配置周报生成模板，自定义章节结构

### 🎨 用户体验
- **深色模式** - 支持浅色/深色/跟随系统三种主题模式
- **响应式设计** - 完美适配桌面和移动设备
- **实时状态** - 拖拽任务时实时更新排序
- **智能验证** - 邀请码实时验证，自动检查有效性

### 🔐 安全与权限
- **邀请码注册** - 通过邀请码控制用户注册
- **角色权限** - 普通用户/管理员权限分离
- **RLS 策略** - 数据库级别的行级安全控制
- **Supabase Auth** - 企业级身份认证

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 16 (App Router)
- **UI 库**: React 19
- **样式**: TailwindCSS 4
- **状态管理**: React Hooks
- **拖拽**: @dnd-kit
- **图标**: lucide-react
- **日期处理**: date-fns

### 后端
- **API**: Next.js Server Actions
- **认证**: Supabase Auth (@supabase/ssr)
- **数据库**: Supabase (PostgreSQL)
- **AI**: DeepSeek API

### 开发工具
- **语言**: TypeScript
- **包管理**: pnpm
- **代码规范**: ESLint
- **样式检查**: Stylelint

## 📦 项目结构

```
├── app/                              # Next.js App Router
│   ├── (auth)/                       # 认证页面组
│   │   ├── layout.tsx               # 认证布局（渐变背景）
│   │   ├── login/                  # 登录页面
│   │   └── register/               # 注册页面
│   ├── (dashboard)/                  # 仪表板页面组
│   │   ├── board/                  # 看板页面
│   │   ├── reports/                # 周报页面
│   │   ├── settings/               # 设置页面
│   │   └── admin/                  # 管理员页面
│   │       ├── invitations/        # 邀请码管理
│   │       ├── tags/               # 标签管理
│   │       ├── templates/          # 模板管理
│   │       └── users/              # 用户管理
│   ├── globals.css                 # 全局样式（深色模式变量）
│   └── layout.tsx                  # 根布局（ThemeProvider）
├── components/                       # React 组件
│   ├── common/                      # 通用组件
│   │   ├── Navbar.tsx              # 导航栏（主题切换器）
│   │   ├── Sidebar.tsx             # 侧边栏
│   │   └── ThemeToggle.tsx         # 主题切换按钮
│   ├── board/                       # 看板组件
│   │   ├── BoardView.tsx           # 看板主视图
│   │   ├── DayColumn.tsx           # 日期列
│   │   ├── TaskCard.tsx            # 任务卡片
│   │   ├── DateNavigator.tsx       # 日期导航器
│   │   └── TaskEditor.tsx          # 任务编辑器
│   ├── reports/                     # 周报组件
│   │   ├── ReportGenerator.tsx     # 周报生成器
│   │   └── ReportList.tsx          # 周报列表
│   └── tags/                        # 标签组件
│       ├── TagManager.tsx          # 标签管理器
│       ├── TagSelector.tsx          # 标签选择器
│       └── TagBadge.tsx             # 标签徽章
├── lib/                             # 工具库
│   ├── actions/                     # Server Actions
│   │   ├── tasks.ts                # 任务 CRUD
│   │   ├── tags.ts                 # 标签管理
│   │   ├── reports.ts              # 周报生成
│   │   ├── invitations.ts          # 邀请码管理
│   │   └── users.ts                # 用户管理
│   ├── contexts/                    # React Context
│   │   └── ThemeContext.tsx        # 主题上下文（深色模式）
│   ├── supabase/                    # Supabase 客户端
│   │   ├── client.ts               # 浏览器端客户端
│   │   ├── middleware.ts           # 中间件客户端
│   │   └── server.ts              # 服务端客户端
│   └── ai/                         # AI 集成
│       └── deepseek.ts             # DeepSeek API 调用
├── types/                           # TypeScript 类型
│   └── index.ts                    # 全局类型定义
├── config/                          # 配置文件
│   ├── routes.ts                   # 路由配置
│   └── app.ts                      # 应用配置
└── supabase/                        # 数据库迁移
    ├── 001_initial_schema.sql      # 初始架构
    ├── 002_fix_user_trigger.sql     # 修复用户触发器
    ├── 003_invitation_codes.sql     # 邀请码系统
    ├── 004_user_management.sql      # 用户管理
    ├── 005_fix_user_profiles_rls.sql # 修复用户配置 RLS
    └── 006_fix_invitation_rls.sql    # 修复邀请码 RLS
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+
- Supabase 账号

### 1. 克隆项目

```bash
git clone <repository-url>
cd task-manager-front
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

需要配置的变量：

| 变量 | 说明 | 示例 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | `sk-xxx` |
| `DEEPSEEK_BASE_URL` | DeepSeek API 地址（可选） | `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 模型名称（可选） | `deepseek-chat` |

### 4. 初始化数据库

在 Supabase Dashboard 的 SQL Editor 中依次执行：

```sql
-- 1. 初始架构和 RLS 策略
supabase/migrations/001_initial_schema.sql

-- 2. 修复用户触发器
supabase/migrations/002_fix_user_trigger.sql

-- 3. 邀请码系统
supabase/migrations/003_invitation_codes.sql

-- 4. 用户管理功能
supabase/migrations/004_user_management.sql

-- 5. 修复 user_profiles RLS
supabase/migrations/005_fix_user_profiles_rls.sql

-- 6. 修复邀请码 RLS
supabase/migrations/006_fix_invitation_rls.sql
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 6. 创建邀请码

首次使用需要创建邀请码才能注册，可以通过 Supabase SQL Editor 直接插入：

```sql
INSERT INTO invitation_codes (code, max_uses, created_by)
VALUES ('ADMIN2024', 100, (SELECT id FROM auth.users WHERE email = 'your@email.com'));
```

## 🎯 用户角色

### 普通用户 (member)
- ✅ 查看和管理任务
- ✅ 创建和管理个人标签
- ✅ 生成和管理周报
- ✅ 修改个人信息

### 管理员 (admin)
- ✅ 所有普通用户权限
- ✅ 管理系统标签
- ✅ 管理周报模板
- ✅ 创建邀请码
- ✅ 管理用户

设置为管理员：
```sql
UPDATE user_profiles SET role = 'admin' WHERE email = 'user@example.com';
```

## 🎨 界面预览

### 登录页面
- 简约大气的渐变背景
- 毛玻璃效果卡片
- 带图标的输入框
- 平滑的过渡动画

### 看板视图
- 按日期列展示任务
- 拖拽任务排序
- 不同状态的颜色标识
- 响应式布局

### 深色模式
- 护眼的深色配色方案
- 自动跟随系统主题
- 手动切换选项

## 📦 构建生产版本

```bash
pnpm build
pnpm start
```

## 🚢 部署

### Vercel 部署

项目已配置 Vercel，推荐使用 Vercel 部署：

```bash
vercel
```

或连接 Git 仓库后自动部署。

### 环境变量配置

在 Vercel 项目设置中添加环境变量。

### 数据库迁移

部署后记得在 Supabase 中执行数据库迁移脚本。

## 🔧 常见问题

### 深色模式下输入框看不清

已优化所有输入框的深色模式样式，使用 `dark:bg-gray-800` 背景和 `dark:text-gray-100` 文字。

### 主题切换后页面闪烁

已在 `layout.tsx` 中添加 `suppressHydrationWarning` 避免水合警告。

### 任务拖拽不工作

确保 `@dnd-kit` 核心包已正确安装。

### 周报生成失败

检查 DeepSeek API 密钥是否正确配置，以及是否有足够的额度。

## 📝 开发规范

### 代码风格

项目使用 ESLint 和 TypeScript 进行类型检查：

```bash
pnpm lint
```

### 提交规范

使用 Conventional Commits 规范：

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试
chore: 构建/工具链更新
```

### 分支策略

- `main` - 生产环境
- `develop` - 开发环境
- `feature/*` - 功能分支

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [DeepSeek](https://www.deepseek.com/)
- [dnd-kit](https://docs.dndkit.com/)
- [lucide-react](https://lucide.dev/)
