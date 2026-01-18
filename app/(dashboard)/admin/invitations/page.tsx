'use client'

import { useState, useEffect } from 'react'
import { Plus, Copy, Trash2, ToggleLeft, ToggleRight, Loader2, Link as LinkIcon } from 'lucide-react'
import {
  getInvitations,
  createInvitation,
  toggleInvitation,
  deleteInvitation,
} from '@/lib/actions/invitations'
import type { InvitationCode } from '@/types'

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationCode[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Create form state
  const [maxUses, setMaxUses] = useState(1)
  const [expiresInDays, setExpiresInDays] = useState(7)
  const [note, setNote] = useState('')

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchInvitations = async () => {
    const result = await getInvitations()
    if (result.success && result.data) {
      setInvitations(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchInvitations()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setMessage(null)

    const result = await createInvitation({
      max_uses: maxUses,
      expires_in_days: expiresInDays,
      note: note || undefined,
    })

    if (result.success) {
      setMessage({ type: 'success', text: '邀请码已创建' })
      setShowCreateForm(false)
      setMaxUses(1)
      setExpiresInDays(7)
      setNote('')
      await fetchInvitations()
    } else {
      setMessage({ type: 'error', text: result.error || '创建失败' })
    }
    setCreating(false)
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const result = await toggleInvitation(id, !currentStatus)
    if (result.success) {
      await fetchInvitations()
    } else {
      alert(result.error || '操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此邀请码吗？')) return

    const result = await deleteInvitation(id)
    if (result.success) {
      await fetchInvitations()
    } else {
      alert(result.error || '删除失败')
    }
  }

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/register?code=${code}`
    navigator.clipboard.writeText(url)
    setMessage({ type: 'success', text: '链接已复制到剪贴板' })
    setTimeout(() => setMessage(null), 2000)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setMessage({ type: 'success', text: '邀请码已复制' })
    setTimeout(() => setMessage(null), 2000)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '永不过期'
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">邀请码管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">创建和管理用户注册邀请码</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={18} />
          生成邀请码
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">生成邀请码</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  最大使用次数
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxUses}
                  onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">设置为 0 表示不限次数</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  有效期（天）
                </label>
                <input
                  type="number"
                  min={0}
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">设置为 0 表示永不过期</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  备注（可选）
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="例如：发给张三"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  生成
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invitations List */}
      {invitations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">暂无邀请码</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            创建第一个邀请码
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">邀请码</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">使用情况</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">过期时间</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">备注</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">状态</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {invitations.map((inv) => {
                const expired = isExpired(inv.expires_at)
                const exhausted = inv.max_uses > 0 && inv.used_count >= inv.max_uses
                const inactive = !inv.is_active || expired || exhausted

                return (
                  <tr key={inv.id} className={inactive ? 'bg-gray-50 dark:bg-gray-700/30' : ''}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className={`text-sm font-mono ${inactive ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                          {inv.code}
                        </code>
                        <button
                          onClick={() => copyCode(inv.code)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                          title="复制邀请码"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => copyLink(inv.code)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                          title="复制邀请链接"
                        >
                          <LinkIcon size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {inv.used_count} / {inv.max_uses === 0 ? '∞' : inv.max_uses}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={expired ? 'text-red-500 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}>
                        {formatDate(inv.expires_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {inv.note || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {expired ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          已过期
                        </span>
                      ) : exhausted ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          已用尽
                        </span>
                      ) : inv.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          有效
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          已禁用
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(inv.id, inv.is_active)}
                          className={`p-2 rounded ${
                            inv.is_active
                              ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title={inv.is_active ? '禁用' : '启用'}
                        >
                          {inv.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="删除"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
