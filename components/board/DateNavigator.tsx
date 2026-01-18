'use client'

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface DateNavigatorProps {
  currentDate: Date
  onPrevWeek: () => void
  onNextWeek: () => void
  onToday: () => void
}

export function DateNavigator({
  currentDate,
  onPrevWeek,
  onNextWeek,
  onToday,
}: DateNavigatorProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">任务看板</h1>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={18} />
          <span>
            {format(weekStart, 'M月d日', { locale: zhCN })} - {format(weekEnd, 'M月d日', { locale: zhCN })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrevWeek}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          title="上一周"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={onToday}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          今天
        </button>

        <button
          onClick={onNextWeek}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          title="下一周"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
