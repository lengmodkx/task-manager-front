'use client'

import { useState, useCallback, useEffect, useId } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { addDays, startOfWeek, format } from 'date-fns'
import { DateNavigator } from './DateNavigator'
import { DayColumn } from './DayColumn'
import { TaskCard } from './TaskCard'
import { TaskEditor } from './TaskEditor'
import { createTask, updateTask, deleteTask, reorderTasks } from '@/lib/actions/tasks'
import type { Task, Tag } from '@/types'

interface BoardViewProps {
  initialTasks: Task[]
  tags: Tag[]
}

export function BoardView({ initialTasks, tags }: BoardViewProps) {
  const dndContextId = useId()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editorDate, setEditorDate] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  // Update tasks when initialTasks changes
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Get week days starting from Monday
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Group tasks by date
  const getTasksForDate = useCallback(
    (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      return tasks
        .filter((task) => task.task_date === dateStr)
        .sort((a, b) => a.sort_order - b.sort_order)
    },
    [tasks]
  )

  // Navigation
  const handlePrevWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Task operations
  const handleAddTask = (date: string) => {
    setEditingTask(null)
    setEditorDate(date)
    setIsEditorOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setEditorDate(null)
    setIsEditorOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('确定要删除这个任务吗？')) return

    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    await deleteTask(taskId)
  }

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    )
    await updateTask(taskId, { status })
  }

  const handleSaveTask = async (data: {
    title: string
    content: string
    status: Task['status']
    task_date: string
    tagIds: string[]
  }) => {
    if (editingTask) {
      // Update existing task
      const result = await updateTask(editingTask.id, data)
      if (result.success && result.data) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === editingTask.id
              ? { ...t, ...result.data, tags: tags.filter((tag) => data.tagIds.includes(tag.id)) }
              : t
          )
        )
      }
    } else {
      // Create new task
      const result = await createTask(data)
      if (result.success && result.data) {
        const newTask: Task = {
          ...result.data,
          tags: tags.filter((tag) => data.tagIds.includes(tag.id)),
        }
        setTasks((prev) => [...prev, newTask])
      }
    }
    setIsEditorOpen(false)
  }

  // Drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // Check if dropped on a date column
    const overId = over.id as string
    const isDateColumn = /^\d{4}-\d{2}-\d{2}$/.test(overId)

    if (isDateColumn) {
      // Dropped on a different date
      const newDate = overId
      if (task.task_date !== newDate) {
        // Get tasks for the new date and calculate sort order
        const targetTasks = tasks.filter((t) => t.task_date === newDate)
        const newSortOrder = targetTasks.length

        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, task_date: newDate, sort_order: newSortOrder }
              : t
          )
        )

        await reorderTasks([
          { id: taskId, task_date: newDate, sort_order: newSortOrder },
        ])
      }
    } else {
      // Dropped on another task - reorder within the same column
      const overTask = tasks.find((t) => t.id === overId)
      if (!overTask || task.id === overTask.id) return

      const dateStr = overTask.task_date
      const dateTasks = tasks
        .filter((t) => t.task_date === dateStr)
        .sort((a, b) => a.sort_order - b.sort_order)

      const oldIndex = dateTasks.findIndex((t) => t.id === task.id)
      const newIndex = dateTasks.findIndex((t) => t.id === overTask.id)

      if (oldIndex === -1) {
        // Moving from different date
        const updatedTasks = [...dateTasks]
        const movedTask = { ...task, task_date: dateStr }
        updatedTasks.splice(newIndex, 0, movedTask)

        const updates = updatedTasks.map((t, i) => ({
          id: t.id,
          task_date: dateStr,
          sort_order: i,
        }))

        setTasks((prev) => {
          const other = prev.filter(
            (t) => t.task_date !== dateStr && t.id !== task.id
          )
          return [
            ...other,
            ...updatedTasks.map((t, i) => ({ ...t, sort_order: i })),
          ]
        })

        await reorderTasks(updates)
      } else if (oldIndex !== newIndex) {
        // Reordering within same date
        const updatedTasks = [...dateTasks]
        const [removed] = updatedTasks.splice(oldIndex, 1)
        updatedTasks.splice(newIndex, 0, removed)

        const updates = updatedTasks.map((t, i) => ({
          id: t.id,
          task_date: dateStr,
          sort_order: i,
        }))

        setTasks((prev) => {
          const other = prev.filter((t) => t.task_date !== dateStr)
          return [
            ...other,
            ...updatedTasks.map((t, i) => ({ ...t, sort_order: i })),
          ]
        })

        await reorderTasks(updates)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <DateNavigator
        currentDate={currentDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
      />

      <DndContext
        id={dndContextId}
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {weekDays.map((date) => (
            <DayColumn
              key={format(date, 'yyyy-MM-dd')}
              date={date}
              tasks={getTasksForDate(date)}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
                onStatusChange={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskEditor
        task={editingTask}
        date={editorDate || undefined}
        tags={tags}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  )
}
