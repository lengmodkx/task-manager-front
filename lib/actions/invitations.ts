'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { InvitationCode } from '@/types'

// Generate a random invitation code
function generateCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Avoid confusing chars like 0/O, 1/I
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function getInvitations(): Promise<{
  success: boolean
  data?: InvitationCode[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '未登录' }
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: '无权限' }
    }

    const { data, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取邀请码失败',
    }
  }
}

export async function createInvitation(input: {
  max_uses?: number
  expires_in_days?: number
  note?: string
}): Promise<{
  success: boolean
  data?: InvitationCode
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '未登录' }
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: '无权限' }
    }

    // Generate unique code
    let code = generateCode()
    let attempts = 0
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('invitation_codes')
        .select('id')
        .eq('code', code)
        .single()

      if (!existing) break
      code = generateCode()
      attempts++
    }

    // Calculate expiration date
    let expires_at = null
    if (input.expires_in_days && input.expires_in_days > 0) {
      const date = new Date()
      date.setDate(date.getDate() + input.expires_in_days)
      expires_at = date.toISOString()
    }

    const { data, error } = await supabase
      .from('invitation_codes')
      .insert({
        code,
        created_by: user.id,
        max_uses: input.max_uses || 1,
        expires_at,
        note: input.note || null,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/invitations')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建邀请码失败',
    }
  }
}

export async function toggleInvitation(
  id: string,
  is_active: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '未登录' }
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: '无权限' }
    }

    const { error } = await supabase
      .from('invitation_codes')
      .update({ is_active })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/invitations')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新邀请码失败',
    }
  }
}

export async function deleteInvitation(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '未登录' }
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: '无权限' }
    }

    const { error } = await supabase
      .from('invitation_codes')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/invitations')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除邀请码失败',
    }
  }
}

// Verify invitation code (for registration)
export async function verifyInvitationCode(code: string): Promise<{
  success: boolean
  valid: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data: invitation, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !invitation) {
      return { success: true, valid: false, error: '邀请码不存在' }
    }

    // Check if active
    if (!invitation.is_active) {
      return { success: true, valid: false, error: '邀请码已禁用' }
    }

    // Check if expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return { success: true, valid: false, error: '邀请码已过期' }
    }

    // Check usage limit
    if (invitation.max_uses > 0 && invitation.used_count >= invitation.max_uses) {
      return { success: true, valid: false, error: '邀请码已达到使用上限' }
    }

    return { success: true, valid: true }
  } catch (error) {
    return {
      success: false,
      valid: false,
      error: error instanceof Error ? error.message : '验证邀请码失败',
    }
  }
}

// Record invitation use after successful registration
export async function recordInvitationUse(
  code: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('invitation_codes')
      .select('id, used_count')
      .eq('code', code.toUpperCase())
      .single()

    if (fetchError || !invitation) {
      return { success: false, error: '邀请码不存在' }
    }

    // Update used count
    const { error: updateError } = await supabase
      .from('invitation_codes')
      .update({ used_count: invitation.used_count + 1 })
      .eq('id', invitation.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Record usage
    const { error: insertError } = await supabase
      .from('invitation_uses')
      .insert({
        invitation_id: invitation.id,
        used_by: userId,
      })

    if (insertError) {
      // Non-critical error, just log
      console.error('Failed to record invitation use:', insertError)
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '记录邀请码使用失败',
    }
  }
}
