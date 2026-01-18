'use client'

import { useState } from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Sparkles, Save, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { createReport, updateReport } from '@/lib/actions/reports'
import type { WeeklyReport } from '@/types'

interface ReportGeneratorProps {
  existingReport?: WeeklyReport | null
  onSaved?: () => void
}

export function ReportGenerator({ existingReport, onSaved }: ReportGeneratorProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (existingReport) {
      return new Date(existingReport.week_start)
    }
    return new Date()
  })
  const [content, setContent] = useState(existingReport?.content || '')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [reportId, setReportId] = useState(existingReport?.id || null)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })

  const handlePrevWeek = () => {
    setCurrentDate((prev) => subWeeks(prev, 1))
    setContent('')
    setReportId(null)
  }

  const handleNextWeek = () => {
    setCurrentDate((prev) => addWeeks(prev, 1))
    setContent('')
    setReportId(null)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: format(weekStart, 'yyyy-MM-dd'),
          weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '生成失败')
      }

      setContent(data.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async (status: 'draft' | 'final') => {
    if (!content.trim()) return

    setSaving(true)
    setError('')

    try {
      if (reportId) {
        const result = await updateReport(reportId, { content, status })
        if (!result.success) {
          throw new Error(result.error || '保存失败')
        }
      } else {
        const result = await createReport({
          week_start: format(weekStart, 'yyyy-MM-dd'),
          week_end: format(weekEnd, 'yyyy-MM-dd'),
          content,
          status,
        })
        if (!result.success) {
          throw new Error(result.error || '保存失败')
        }
        if (result.data) {
          setReportId(result.data.id)
        }
      }
      onSaved?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Week Selector */}
      <div className="flex items-center justify-between bg-white rounded-lg border p-4">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <div className="text-lg font-semibold">
            {format(weekStart, 'yyyy年M月d日', { locale: zhCN })} -{' '}
            {format(weekEnd, 'M月d日', { locale: zhCN })}
          </div>
          <div className="text-sm text-gray-500">
            第 {format(weekStart, 'w', { locale: zhCN })} 周
          </div>
        </div>

        <button
          onClick={handleNextWeek}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50"
        >
          <Sparkles size={18} />
          {generating ? 'AI 生成中...' : 'AI 生成周报'}
        </button>

        {content && (
          <>
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Save size={18} />
              保存草稿
            </button>

            <button
              onClick={() => handleSave('final')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              <Check size={18} />
              完成周报
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? '已复制' : '复制'}
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Editor & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-2 border-b bg-gray-50 font-medium text-sm">
            编辑
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 min-h-[500px] resize-none focus:outline-none font-mono text-sm"
            placeholder="点击「AI 生成周报」自动生成，或手动编写..."
          />
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-2 border-b bg-gray-50 font-medium text-sm">
            预览
          </div>
          <div className="p-4 min-h-[500px] prose prose-sm max-w-none">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="text-gray-400">预览将在此显示...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
