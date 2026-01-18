'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { updateLastLogin } from '@/lib/actions/users'
import { Mail, Lock, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      // 根据 Supabase Auth 错误代码或消息翻译为中文
      // 注意：某些错误（如 Invalid login credentials）不返回 code，需要同时检查 message
      const errorMessages: Record<string, string> = {
        'invalid_credentials': '邮箱或密码错误',
        'email_not_confirmed': '邮箱未验证，请先验证邮箱',
        'user_not_found': '用户不存在',
        'over_request_rate_limit': '请求过于频繁，请稍后再试',
      }
      let errorMessage = errorMessages[error.code || '']
      // 备选：检查 error.message
      if (!errorMessage && error.message?.includes('Invalid login credentials')) {
        errorMessage = '邮箱或密码错误'
      }
      setError(errorMessage || '登录失败，请重试')
      setLoading(false)
      return
    }

    // 检查用户是否被禁用
    if (data.user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_active')
        .eq('id', data.user.id)
        .single()

      if (profile?.is_active === false) {
        // 用户已被禁用，登出并显示错误
        await supabase.auth.signOut()
        setError('您的账号已被禁用，请联系管理员')
        setLoading(false)
        return
      }

      // Update last login time
      updateLastLogin(data.user.id)
    }

    const redirect = searchParams.get('redirect') || '/board'
    window.location.href = redirect
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          密码
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            登录中...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            登录
          </>
        )}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="relative w-full max-w-md px-4">
      {/* 登录卡片 */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-10">
        {/* Logo 和标题 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            欢迎回来
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            登录任务管理平台
          </p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* 底部链接 */}
        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          还没有账号？
          <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium ml-1">
            立即注册
          </Link>
        </p>
      </div>

      {/* 版权信息 */}
      <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
        © {new Date().getFullYear()} 任务管理平台. All rights reserved.
      </p>
    </div>
  )
}
