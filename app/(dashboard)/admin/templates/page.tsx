'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Star, Loader2, X } from 'lucide-react'
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '@/lib/actions/reports'
import type { ReportTemplate, TemplateSection, TemplateContent } from '@/types'

type EditMode = 'list' | 'create' | 'edit'

const DEFAULT_SECTION: TemplateSection = {
  id: crypto.randomUUID(),
  title: '',
  type: 'task_list',
  prompt: '',
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState<EditMode>('list')
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [sections, setSections] = useState<TemplateSection[]>([{ ...DEFAULT_SECTION }])

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchTemplates = async () => {
    const result = await getTemplates()
    if (result.success && result.data) {
      setTemplates(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const resetForm = () => {
    setName('')
    setIsDefault(false)
    setSections([{ ...DEFAULT_SECTION, id: crypto.randomUUID() }])
    setSelectedTemplate(null)
  }

  const handleCreate = () => {
    resetForm()
    setEditMode('create')
  }

  const handleEdit = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    setName(template.name)
    setIsDefault(template.is_default)
    const content = template.content as TemplateContent
    setSections(content.sections.length > 0 ? content.sections : [{ ...DEFAULT_SECTION, id: crypto.randomUUID() }])
    setEditMode('edit')
  }

  const handleBack = () => {
    setEditMode('list')
    resetForm()
    setMessage(null)
  }

  const handleAddSection = () => {
    setSections([...sections, { ...DEFAULT_SECTION, id: crypto.randomUUID() }])
  }

  const handleRemoveSection = (index: number) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index))
    }
  }

  const handleSectionChange = (index: number, field: keyof TemplateSection, value: string) => {
    const updated = [...sections]
    updated[index] = { ...updated[index], [field]: value }
    setSections(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setMessage({ type: 'error', text: '请输入模板名称' })
      return
    }

    if (sections.some(s => !s.title.trim() || !s.prompt.trim())) {
      setMessage({ type: 'error', text: '请填写所有章节的标题和提示词' })
      return
    }

    setSaving(true)
    setMessage(null)

    const content: TemplateContent = { sections }

    let result
    if (editMode === 'create') {
      result = await createTemplate({
        name,
        content,
        is_default: isDefault,
      })
    } else if (selectedTemplate) {
      result = await updateTemplate(selectedTemplate.id, {
        name,
        content,
        is_default: isDefault,
      })
    }

    if (result?.success) {
      setMessage({ type: 'success', text: editMode === 'create' ? '模板已创建' : '模板已更新' })
      await fetchTemplates()
      setTimeout(() => {
        handleBack()
      }, 1000)
    } else {
      setMessage({ type: 'error', text: result?.error || '操作失败' })
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此模板吗？')) return

    const result = await deleteTemplate(id)
    if (result.success) {
      await fetchTemplates()
    } else {
      alert(result.error || '删除失败')
    }
  }

  const handleSetDefault = async (id: string) => {
    const result = await updateTemplate(id, { is_default: true })
    if (result.success) {
      await fetchTemplates()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    )
  }

  if (editMode !== 'list') {
    return (
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {editMode === 'create' ? '新建模板' : '编辑模板'}
          </h1>
          <button
            onClick={handleBack}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            返回列表
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                模板名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：标准周报模板"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300">
                设为默认模板
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">章节配置</h2>
              <button
                type="button"
                onClick={handleAddSection}
                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <Plus size={16} />
                添加章节
              </button>
            </div>

            {sections.map((section, index) => (
              <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">章节 {index + 1}</span>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(index)}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    标题
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                    placeholder="例如：本周完成工作"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    类型
                  </label>
                  <select
                    value={section.type}
                    onChange={(e) => handleSectionChange(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="task_list">任务列表</option>
                    <option value="free_text">自由文本</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    AI 提示词
                  </label>
                  <textarea
                    value={section.prompt}
                    onChange={(e) => handleSectionChange(index, 'prompt', e.target.value)}
                    placeholder="例如：根据本周完成的任务，总结主要工作成果"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editMode === 'create' ? '创建模板' : '保存修改'}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">模板管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理周报生成模板</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={18} />
          新建模板
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">暂无模板，创建一个吧</p>
          <button
            onClick={handleCreate}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            创建模板
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => {
            const content = template.content as TemplateContent
            return (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {template.is_default && (
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {content.sections.length} 个章节
                      {template.is_default && ' · 默认模板'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!template.is_default && (
                    <button
                      onClick={() => handleSetDefault(template.id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400"
                      title="设为默认"
                    >
                      <Star size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
                    title="编辑"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                    title="删除"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
