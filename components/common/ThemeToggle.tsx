'use client'

import { useTheme } from '@/lib/contexts/ThemeContext'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={18} />
      case 'dark':
        return <Moon size={18} />
      case 'system':
        return <Monitor size={18} />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return '浅色模式'
      case 'dark':
        return '深色模式'
      case 'system':
        return '跟随系统'
    }
  }

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
      title={getLabel()}
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  )
}
