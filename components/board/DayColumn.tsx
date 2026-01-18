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
          ? 'border-blue-400 bg-blue-50/50'
          : isWeekendDay
          ? 'border-gray-200 bg-gray-50/50'
          : 'border-gray-200 bg-white'
      } ${isOver ? 'ring-2 ring-blue-400' : ''}`}
    >
      {/* Header */}
      <div
        className={`p-3 border-b ${
          isCurrentDay ? 'bg-blue-100 border-blue-200' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-sm font-medium ${isCurrentDay ? 'text-blue-700' : 'text-gray-500'}`}>
              {format(date, 'EEEE', { locale: zhCN })}
            </div>
            <div className={`text-lg font-bold ${isCurrentDay ? 'text-blue-900' : 'text-gray-900'}`}>
              {format(date, 'M月d日')}
            </div>
          </div>
          <button
            onClick={() => onAddTask(dateStr)}
            className={`p-1.5 rounded-full ${
              isCurrentDay
                ? 'bg-blue-200 text-blue-700 hover:bg-blue-300'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-1">
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
          <div className="text-center text-gray-400 text-sm py-8">
            暂无任务
          </div>
        )}
      </div>
    </div>
  )
}
