'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  MoreVertical,
  Shield,
  ShieldOff,
  Key,
  Trash2,
  UserCheck,
  UserX,
  X,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  getUsers,
  updateUserRole,
  toggleUserStatus,
  resetUserPassword,
  deleteUser,
  type UserWithStats,
} from '@/lib/actions/users'

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password reset modal state
  const [resetPasswordModal, setResetPasswordModal] = useState<{ userId: string; email: string } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetting, setResetting] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    const result = await getUsers({
      role: roleFilter,
      status: statusFilter,
    })
    if (result.success && result.data) {
      setUsers(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [roleFilter, statusFilter])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin'
    const result = await updateUserRole(userId, newRole)
    if (result.success) {
      showMessage('success', `已将用户角色改为 ${newRole === 'admin' ? '管理员' : '普通用户'}`)
      fetchUsers()
    } else {
      showMessage('error', result.error || '操作失败')
    }
    setOpenMenuId(null)
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const result = await toggleUserStatus(userId, !currentStatus)
    if (result.success) {
      showMessage('success', currentStatus ? '用户已禁用' : '用户已启用')
      fetchUsers()
    } else {
      showMessage('error', result.error || '操作失败')
    }
    setOpenMenuId(null)
  }

  const openResetPasswordModal = (userId: string, email: string) => {
    setResetPasswordModal({ userId, email })
    setNewPassword('')
    setShowPassword(false)
    setOpenMenuId(null)
  }

  const handleResetPassword = async () => {
    if (!resetPasswordModal) return

    if (newPassword.length < 6) {
      showMessage('error', '密码长度至少为6位')
      return
    }

    setResetting(true)
    const result = await resetUserPassword(resetPasswordModal.userId, newPassword)
    setResetting(false)

    if (result.success) {
      showMessage('success', '密码重置成功')
      setResetPasswordModal(null)
      setNewPassword('')
    } else {
      showMessage('error', result.error || '操作失败')
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('确定要删除此用户吗？用户将被禁用且无法登录。')) return

    const result = await deleteUser(userId)
    if (result.success) {
      showMessage('success', '用户已删除')
      fetchUsers()
    } else {
      showMessage('error', result.error || '操作失败')
    }
    setOpenMenuId(null)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '从未'
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">用户管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理系统用户</p>
        </div>
      </div>

      {/* Message */}
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

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部角色</option>
          <option value="admin">管理员</option>
          <option value="member">普通用户</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部状态</option>
          <option value="active">正常</option>
          <option value="disabled">已禁用</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">加载中...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Users size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">暂无用户</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">用户</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">角色</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">邀请码</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">任务数</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">注册时间</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">最后登录</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">状态</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className={!user.is_active ? 'bg-gray-50 dark:bg-gray-900/50' : ''}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.nickname || '-'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {user.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {user.invitation_code ? (
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        {user.invitation_code}
                      </code>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.task_count}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(user.last_login_at)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        user.is_active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {user.is_active ? '正常' : '已禁用'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative flex justify-end">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === user.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 bottom-full mb-1 w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-20 py-1">
                            <button
                              onClick={() => handleRoleChange(user.id, user.role)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              {user.role === 'admin' ? (
                                <>
                                  <ShieldOff size={16} />
                                  降为普通用户
                                </>
                              ) : (
                                <>
                                  <Shield size={16} />
                                  升为管理员
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => openResetPasswordModal(user.id, user.email)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Key size={16} />
                              重置密码
                            </button>

                            <button
                              onClick={() => handleToggleStatus(user.id, user.is_active)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              {user.is_active ? (
                                <>
                                  <UserX size={16} />
                                  禁用用户
                                </>
                              ) : (
                                <>
                                  <UserCheck size={16} />
                                  启用用户
                                </>
                              )}
                            </button>

                            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                            <button
                              onClick={() => handleDelete(user.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={16} />
                              删除用户
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setResetPasswordModal(null)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <button
              onClick={() => setResetPasswordModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              重置密码
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              为 <span className="font-medium text-gray-700 dark:text-gray-300">{resetPasswordModal.email}</span> 设置新密码
            </p>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="输入新密码（至少6位）"
                  className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setResetPasswordModal(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={resetting || newPassword.length < 6}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {resetting ? '重置中...' : '确认重置'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
