'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Settings, Tags, FileCode, UserPlus, Users } from 'lucide-react'

const menuItems = [
  { href: '/board', label: '看板', icon: LayoutDashboard },
  { href: '/reports', label: '周报', icon: FileText },
  { href: '/settings', label: '设置', icon: Settings },
]

const adminItems = [
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/tags', label: '标签管理', icon: Tags },
  { href: '/admin/templates', label: '模板管理', icon: FileCode },
  { href: '/admin/invitations', label: '邀请码管理', icon: UserPlus },
]

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4">
      <div className="text-xl font-bold mb-8 px-2 text-gray-900 dark:text-gray-100">任务管理平台</div>

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
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">
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
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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
