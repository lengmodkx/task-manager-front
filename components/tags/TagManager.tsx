'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { createTag, updateTag, deleteTag } from '@/lib/actions/tags'
import type { Tag } from '@/types'

interface TagManagerProps {
  initialTags: Tag[]
  isAdmin: boolean
}

const colorOptions = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#14B8A6', // teal
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#6B7280', // gray
]

export function TagManager({ initialTags, isAdmin }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [isEditing, setIsEditing] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(colorOptions[0])
  const [type, setType] = useState<Tag['type']>('system')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = () => {
    setName('')
    setColor(colorOptions[0])
    setType('system')
    setEditingTag(null)
    setIsEditing(false)
    setError('')
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setName(tag.name)
    setColor(tag.color)
    setType(tag.type)
    setIsEditing(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError('')

    if (editingTag) {
      const result = await updateTag(editingTag.id, { name: name.trim(), color })
      if (result.success && result.data) {
        setTags((prev) =>
          prev.map((t) => (t.id === editingTag.id ? result.data! : t))
        )
        resetForm()
      } else {
        setError(result.error || '更新失败')
      }
    } else {
      const result = await createTag({ name: name.trim(), color, type })
      if (result.success && result.data) {
        setTags((prev) => [...prev, result.data!])
        resetForm()
      } else {
        setError(result.error || '创建失败')
      }
    }

    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？已关联的任务将取消关联。')) return

    const result = await deleteTag(id)
    if (result.success) {
      setTags((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const systemTags = tags.filter((t) => t.type === 'system')
  const personalTags = tags.filter((t) => t.type === 'personal')

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {editingTag ? '编辑标签' : '添加标签'}
            </h3>
            {isEditing && (
              <button onClick={resetForm} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  标签名称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="输入标签名称"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  颜色
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full ${
                        color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {!editingTag && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    类型
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Tag['type'])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="system">系统标签（所有人可见）</option>
                    <option value="personal">个人标签（仅自己可见）</option>
                  </select>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                {editingTag ? (
                  <>
                    <Pencil size={16} />
                    更新
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    添加
                  </>
                )}
              </button>
              {editingTag && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  取消
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* System Tags */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-medium mb-4 text-gray-900 dark:text-gray-100">系统标签</h3>
        {systemTags.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">暂无系统标签</p>
        ) : (
          <div className="space-y-2">
            {systemTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </span>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personal Tags */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-medium mb-4 text-gray-900 dark:text-gray-100">个人标签</h3>
        {personalTags.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">暂无个人标签</p>
        ) : (
          <div className="space-y-2">
            {personalTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
