'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import type { Task } from '@/types'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: Task['status']) => void
}

const statusColors = {
  todo: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
  doing: 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
  done: 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700',
}

const statusLabels = {
  todo: '待办',
  doing: '进行中',
  done: '已完成',
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const nextStatus = (): Task['status'] => {
    if (task.status === 'todo') return 'doing'
    if (task.status === 'doing') return 'done'
    return 'todo'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group p-3 rounded-lg border-2 ${statusColors[task.status]} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={16} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onStatusChange(task.id, nextStatus())}
              className={`text-xs px-2 py-0.5 rounded-full ${
                task.status === 'done'
                  ? 'bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                  : task.status === 'doing'
                  ? 'bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}
            >
              {statusLabels[task.status]}
            </button>
          </div>

          <h4 className={`font-medium text-gray-900 dark:text-gray-100 ${task.status === 'done' ? 'line-through text-gray-500 dark:text-gray-500' : ''}`}>
            {task.title}
          </h4>

          {task.content && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {task.content}
            </p>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
