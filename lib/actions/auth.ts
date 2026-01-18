'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { verifyInvitationCode, recordInvitationUse } from './invitations'

export async function registerUser(input: {
  email: string
  password: string
  invitationCode: string
}): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // 1. 验证邀请码
    const codeResult = await verifyInvitationCode(input.invitationCode)
    if (!codeResult.valid) {
      return { success: false, error: codeResult.error || '邀请码无效' }
    }

    // 2. 使用 Admin API 创建用户（跳过邮件确认）
    const adminClient = createAdminClient()
    const { data, error: createError } = await adminClient.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true, // 直接确认邮箱
      user_metadata: {
        invitation_code: input.invitationCode,
      },
    })

    if (createError) {
      if (createError.message.includes('already been registered')) {
        return { success: false, error: '该邮箱已注册' }
      }
      return { success: false, error: createError.message }
    }

    if (!data.user) {
      return { success: false, error: '创建用户失败' }
    }

    // 3. 记录邀请码使用
    await recordInvitationUse(input.invitationCode, data.user.id)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '注册失败',
    }
  }
}
