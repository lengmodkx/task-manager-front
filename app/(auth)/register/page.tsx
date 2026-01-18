'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { verifyInvitationCode, recordInvitationUse } from '@/lib/actions/invitations'
import { CheckCircle, XCircle, Loader2, Mail, Lock, Ticket, Sparkles, UserPlus } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [invitationCode, setInvitationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false) // 注册成功状态

  // Invitation code validation state
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [codeError, setCodeError] = useState('')

  // Get invitation code from URL
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setInvitationCode(code.toUpperCase())
      validateCode(code)
    }
  }, [searchParams])

  const validateCode = async (code: string) => {
    if (!code.trim()) {
      setCodeStatus('idle')
      setCodeError('')
      return
    }

    setCodeStatus('checking')
    const result = await verifyInvitationCode(code)

    if (result.valid) {
      setCodeStatus('valid')
      setCodeError('')
    } else {
      setCodeStatus('invalid')
      setCodeError(result.error || '邀请码无效')
    }
  }

  const handleCodeChange = (value: string) => {
    const upperValue = value.toUpperCase()
    setInvitationCode(upperValue)

    // Debounce validation
    if (upperValue.length >= 6) {
      validateCode(upperValue)
    } else {
      setCodeStatus('idle')
      setCodeError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate invitation code
    if (codeStatus !== 'valid') {
      setError('请输入有效的邀请码')
      return
    }

    // Validate passwords
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码长度至少为6位')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          invitation_code: invitationCode, // 存储邀请码到用户元数据
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message === 'User already registered'
        ? '该邮箱已注册'
        : signUpError.message)
      setLoading(false)
      return
    }

    // Record invitation use
    if (data.user) {
      await recordInvitationUse(invitationCode, data.user.id)
    }

    // 检查是否需要邮件确认
    if (data.user && !data.session) {
      // 需要邮件确认
      setSuccess(true)
      setLoading(false)
      return
    }

    // 直接登录成功，跳转到 board
    router.push('/board')
    router.refresh()
  }

  // 显示注册成功提示
  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
          <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">注册成功！</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          我们已向 <span className="font-semibold text-gray-900 dark:text-gray-100">{email}</span> 发送了一封确认邮件
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          请检查您的邮箱并点击确认链接完成注册
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          返回登录
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 邀请码输入 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          邀请码 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={invitationCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="输入邀请码"
            className={`w-full pl-12 pr-12 py-3.5 bg-white dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
              codeStatus === 'valid'
                ? 'border-green-500 focus:ring-green-500'
                : codeStatus === 'invalid'
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
            }`}
            required
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {codeStatus === 'checking' && (
              <Loader2 size={18} className="text-gray-400 animate-spin" />
            )}
            {codeStatus === 'valid' && (
              <CheckCircle size={18} className="text-green-500" />
            )}
            {codeStatus === 'invalid' && (
              <XCircle size={18} className="text-red-500" />
            )}
          </div>
        </div>
        {codeError && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{codeError}</p>
        )}
        {codeStatus === 'valid' && (
          <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center gap-1">
            <CheckCircle size={12} />
            邀请码有效
          </p>
        )}
      </div>

      {/* 邮箱输入 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          邮箱地址
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      {/* 密码输入 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          密码
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少6位"
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            required
            minLength={6}
          />
        </div>
      </div>

      {/* 确认密码 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          确认密码
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="再次输入密码"
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            required
            minLength={6}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || codeStatus !== 'valid'}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            注册中...
          </>
        ) : (
          <>
            <UserPlus size={18} />
            创建账号
          </>
        )}
      </button>
    </form>
  )
}

export default function RegisterPage() {
  return (
    <div className="relative w-full max-w-md px-4">
      {/* 注册卡片 */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-10">
        {/* Logo 和标题 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/30 mb-4">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            创建账号
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            需要邀请码才能注册
          </p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        }>
          <RegisterForm />
        </Suspense>

        {/* 底部链接 */}
        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          已有账号？
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium ml-1">
            立即登录
          </Link>
        </p>
      </div>

      {/* 版权信息 */}
      <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
        © 2024 任务管理平台. All rights reserved.
      </p>
    </div>
  )
}
