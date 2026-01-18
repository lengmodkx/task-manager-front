'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export interface UserWithStats {
  id: string
  email: string
  nickname: string | null
  role: 'admin' | 'member'
  is_active: boolean
  created_at: string
  last_login_at: string | null
  task_count: number
  invitation_code: string | null
}

async function checkAdminRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { authorized: false, error: '未登录', userId: null }
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { authorized: false, error: '无权限', userId: user.id }
  }

  return { authorized: true, error: null, userId: user.id }
}

export async function getUsers(filters?: {
  role?: string
  status?: string
}): Promise<{
  success: boolean
  data?: UserWithStats[]
  error?: string
}> {
  try {
    const auth = await checkAdminRole()
    if (!auth.authorized) {
      return { success: false, error: auth.error! }
    }

    const supabase = await createClient()

    // Get all users from auth.users via service role would be ideal,
    // but we'll work with user_profiles and join with auth data
    let query = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.role && filters.role !== 'all') {
      query = query.eq('role', filters.role)
    }

    if (filters?.status === 'active') {
      query = query.eq('is_active', true)
    } else if (filters?.status === 'disabled') {
      query = query.eq('is_active', false)
    }

    const { data: profiles, error: profilesError } = await query

    if (profilesError) {
      return { success: false, error: profilesError.message }
    }

    // Get task counts for each user
    const userIds = profiles?.map(p => p.id) || []

    const { data: taskCounts } = await supabase
      .from('tasks')
      .select('user_id')
      .in('user_id', userIds)

    const taskCountMap: Record<string, number> = {}
    taskCounts?.forEach(t => {
      taskCountMap[t.user_id] = (taskCountMap[t.user_id] || 0) + 1
    })

    // Get invitation codes used by each user
    const { data: invitationUses } = await supabase
      .from('invitation_uses')
      .select('used_by, invitation_id, invitation_codes(code)')
      .in('used_by', userIds)

    const invitationMap: Record<string, string> = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invitationUses?.forEach((u: any) => {
      const code = u.invitation_codes?.code
      if (code) {
        invitationMap[u.used_by] = code
      }
    })

    // 使用 Admin 客户端获取用户邮箱
    const adminClient = createAdminClient()
    const { data: authUsers } = await adminClient.auth.admin.listUsers()

    const emailMap: Record<string, string> = {}
    authUsers?.users?.forEach(u => {
      emailMap[u.id] = u.email || ''
    })

    const users: UserWithStats[] = (profiles || []).map(p => ({
      id: p.id,
      email: emailMap[p.id] || '',
      nickname: p.nickname,
      role: p.role,
      is_active: p.is_active ?? true,
      created_at: p.created_at,
      last_login_at: p.last_login_at,
      task_count: taskCountMap[p.id] || 0,
      invitation_code: invitationMap[p.id] || null,
    }))

    return { success: true, data: users }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户列表失败',
    }
  }
}

export async function updateUserRole(
  userId: string,
  role: 'admin' | 'member'
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await checkAdminRole()
    if (!auth.authorized) {
      return { success: false, error: auth.error! }
    }

    // 使用 Admin 客户端绑过 RLS
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('user_profiles')
      .update({ role })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新角色失败',
    }
  }
}

export async function toggleUserStatus(
  userId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await checkAdminRole()
    if (!auth.authorized) {
      return { success: false, error: auth.error! }
    }

    // Cannot disable yourself
    if (userId === auth.userId) {
      return { success: false, error: '不能禁用自己的账号' }
    }

    // 使用 Admin 客户端绑过 RLS
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('user_profiles')
      .update({ is_active: isActive })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新状态失败',
    }
  }
}

export async function resetUserPassword(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await checkAdminRole()
    if (!auth.authorized) {
      return { success: false, error: auth.error! }
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: '密码长度至少为6位' }
    }

    // 使用 Admin API 直接设置新密码
    const trimmedPassword = newPassword.trim()
    console.log('Setting password, length:', trimmedPassword.length)

    const adminClient = createAdminClient()
    const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
      password: trimmedPassword,
      email_confirm: true, // 同时确认邮箱
    })

    console.log('Reset password result:', { userId, data, error })

    if (error) {
      console.error('Reset password error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '重置密码失败',
    }
  }
}

export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await checkAdminRole()
    if (!auth.authorized) {
      return { success: false, error: auth.error! }
    }

    // Cannot delete yourself
    if (userId === auth.userId) {
      return { success: false, error: '不能删除自己的账号' }
    }

    const supabase = await createClient()

    // Check if target user is admin
    const { data: targetUser } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (targetUser?.role === 'admin') {
      return { success: false, error: '不能删除管理员账号，请先将其降级为普通用户' }
    }

    // Soft delete: set is_active to false
    // 使用 Admin 客户端绑过 RLS
    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('user_profiles')
      .update({ is_active: false })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除用户失败',
    }
  }
}

export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId)
  } catch {
    // Silent fail for login tracking
  }
}
