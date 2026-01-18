import { format, startOfWeek, endOfWeek, addDays } from 'date-fns'
import { BoardView } from '@/components/board/BoardView'
import { getTasks } from '@/lib/actions/tasks'
import { getTags } from '@/lib/actions/tags'

export default async function BoardPage() {
  // Get current week range
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  // Fetch initial data for 3 weeks (prev, current, next) to support navigation
  const extendedStart = addDays(weekStart, -7)
  const extendedEnd = addDays(weekEnd, 7)

  const [tasksResult, tagsResult] = await Promise.all([
    getTasks(
      format(extendedStart, 'yyyy-MM-dd'),
      format(extendedEnd, 'yyyy-MM-dd')
    ),
    getTags(),
  ])

  const tasks = tasksResult.success ? tasksResult.data || [] : []
  const tags = tagsResult.success ? tagsResult.data || [] : []

  return (
    <div className="h-[calc(100vh-8rem)]">
      <BoardView initialTasks={tasks} tags={tags} />
    </div>
  )
}
