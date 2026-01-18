'use client'

import { useState, useEffect } from 'react'
import { Plus, ArrowLeft } from 'lucide-react'
import { ReportGenerator, ReportList } from '@/components/reports'
import type { WeeklyReport } from '@/types'

type ViewMode = 'list' | 'create' | 'edit' | 'view'

export default function ReportsPage() {
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null)

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleEdit = (report: WeeklyReport) => {
    setSelectedReport(report)
    setViewMode('edit')
  }

  const handleView = (report: WeeklyReport) => {
    setSelectedReport(report)
    setViewMode('view')
  }

  const handleBack = () => {
    setViewMode('list')
    setSelectedReport(null)
    fetchReports()
  }

  const handleCreate = () => {
    setSelectedReport(null)
    setViewMode('create')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div>
      {viewMode === 'list' ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">周报管理</h1>
              <p className="text-gray-500 mt-1">创建和管理您的工作周报</p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={18} />
              新建周报
            </button>
          </div>

          <ReportList
            reports={reports}
            onEdit={handleEdit}
            onView={handleView}
          />
        </>
      ) : (
        <>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={18} />
            返回列表
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {viewMode === 'create' ? '新建周报' : viewMode === 'edit' ? '编辑周报' : '查看周报'}
            </h1>
          </div>

          <ReportGenerator
            existingReport={selectedReport}
            onSaved={handleBack}
          />
        </>
      )}
    </div>
  )
}
