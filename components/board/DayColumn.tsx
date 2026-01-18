'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { format, isToday, isWeekend } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { TaskCard } from './TaskCard'
import type { Task } from '@/types'

interface DayColumnProps {
  date: Date
  tasks: Task[]
  onAddTask: (date: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onStatusChange: (taskId: string, status: Task['status']) => void
}

export function DayColumn({
  date,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: DayColumnProps) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const { setNodeRef, isOver } = useDroppable({ id: dateStr })

  const isCurrentDay = isToday(date)
  const isWeekendDay = isWeekend(date)

  const taskIds = tasks.map((t) => t.id)

  return (
    <div
      className={`flex-shrink-0 w-72 flex flex-col rounded-lg border ${
        isCurrentDay
          ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
          : isWeekendDay
          ? 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      } ${isOver ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}`}
    >
      {/* Header */}
      <div
        className={`p-3 border-b ${
          isCurrentDay
            ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-sm font-medium ${isCurrentDay ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {format(date, 'EEEE', { locale: zhCN })}
            </div>
            <div className={`text-lg font-bold ${isCurrentDay ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
              {format(date, 'M月d日')}
            </div>
          </div>
          <button
            onClick={() => onAddTask(dateStr)}
            className={`p-1.5 rounded-full ${
              isCurrentDay
                ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-300 dark:hover:bg-blue-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {tasks.length} 个任务
        </div>
      </div>

      {/* Task List */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
            暂无任务
          </div>
        )}
      </div>
    </div>
  )
}
