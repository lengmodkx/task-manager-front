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

  const handleResetPassword = async (userId: string, email: string) => {
    if (!confirm(`确定要向 ${email} 发送密码重置邮件吗？`)) return

    const result = await resetUserPassword(userId)
    if (result.success) {
      showMessage('success', '密码重置邮件已发送')
    } else {
      showMessage('error', result.error || '操作失败')
    }
    setOpenMenuId(null)
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
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-gray-500 mt-1">管理系统用户</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
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
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部角色</option>
          <option value="admin">管理员</option>
          <option value="member">普通用户</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部状态</option>
          <option value="active">正常</option>
          <option value="disabled">已禁用</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无用户</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">用户</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">角色</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">邀请码</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">任务数</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">注册时间</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">最后登录</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">状态</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className={!user.is_active ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.nickname || '-'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.invitation_code ? (
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                        {user.invitation_code}
                      </code>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.task_count}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(user.last_login_at)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        user.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.is_active ? '正常' : '已禁用'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative flex justify-end">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === user.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border shadow-lg z-20 py-1">
                            <button
                              onClick={() => handleRoleChange(user.id, user.role)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
                              onClick={() => handleResetPassword(user.id, user.email)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Key size={16} />
                              重置密码
                            </button>

                            <button
                              onClick={() => handleToggleStatus(user.id, user.is_active)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
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

                            <div className="border-t my-1" />

                            <button
                              onClick={() => handleDelete(user.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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
    </div>
  )
}
