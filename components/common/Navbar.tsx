'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'

export function Navbar({ userEmail }: { userEmail?: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {userEmail?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-gray-700 max-w-[150px] truncate">
            {userEmail}
          </span>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg border shadow-lg z-20 py-1">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userEmail}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">已登录</p>
              </div>

              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings size={16} />
                设置
              </Link>

              <Link
                href="/board"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User size={16} />
                个人中心
              </Link>

              <div className="border-t my-1" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut size={16} />
                退出登录
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
