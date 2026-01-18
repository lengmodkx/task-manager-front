'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
  }

  // 服务端和首次客户端渲染时显示空占位符
  if (!mounted) {
    return <div className="w-10 h-10" />
  }

  const icons = {
    light: <Sun size={18} />,
    dark: <Moon size={18} />,
    system: <Monitor size={18} />,
  }

  const labels = {
    light: '浅色模式',
    dark: '深色模式',
    system: '跟随系统',
  }

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
      title={labels[theme]}
      aria-label={labels[theme]}
    >
      {icons[theme]}
    </button>
  )
}
