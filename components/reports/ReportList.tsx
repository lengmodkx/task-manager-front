'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { FileText, Trash2, Eye, Edit } from 'lucide-react'
import { deleteReport } from '@/lib/actions/reports'
import type { WeeklyReport } from '@/types'

interface ReportListProps {
  reports: WeeklyReport[]
  onEdit: (report: WeeklyReport) => void
  onView: (report: WeeklyReport) => void
}

export function ReportList({ reports, onEdit, onView }: ReportListProps) {
  const [items, setItems] = useState(reports)

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这份周报吗？')) return

    const result = await deleteReport(id)
    if (result.success) {
      setItems((prev) => prev.filter((r) => r.id !== id))
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p>暂无周报记录</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((report) => (
        <div
          key={report.id}
          className="bg-white rounded-lg border p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-2 h-2 rounded-full ${
                report.status === 'final' ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
            <div>
              <div className="font-medium">
                {format(new Date(report.week_start), 'yyyy年M月d日', { locale: zhCN })} -{' '}
                {format(new Date(report.week_end), 'M月d日', { locale: zhCN })}
              </div>
              <div className="text-sm text-gray-500">
                {report.status === 'final' ? '已完成' : '草稿'} ·{' '}
                {format(new Date(report.created_at), 'M月d日 HH:mm')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(report)}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
              title="查看"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => onEdit(report)}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
              title="编辑"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDelete(report.id)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
              title="删除"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
