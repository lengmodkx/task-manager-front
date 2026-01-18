'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { verifyInvitationCode, recordInvitationUse } from '@/lib/actions/invitations'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [invitationCode, setInvitationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

    // Redirect to board
    router.push('/board')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          邀请码 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={invitationCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="请输入邀请码"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 ${
              codeStatus === 'valid'
                ? 'border-green-500 focus:ring-green-500'
                : codeStatus === 'invalid'
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
          <p className="text-red-500 text-xs mt-1">{codeError}</p>
        )}
        {codeStatus === 'valid' && (
          <p className="text-green-600 text-xs mt-1">邀请码有效</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          邮箱
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          密码
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="至少6位"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength={6}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          确认密码
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength={6}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || codeStatus !== 'valid'}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '注册中...' : '注册'}
      </button>
    </form>
  )
}

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-2">注册账号</h1>
      <p className="text-gray-500 text-center text-sm mb-6">
        需要邀请码才能注册
      </p>

      <Suspense fallback={<div className="text-center text-gray-500">加载中...</div>}>
        <RegisterForm />
      </Suspense>

      <p className="mt-4 text-center text-sm text-gray-600">
        已有账号？
        <Link href="/login" className="text-blue-500 hover:underline ml-1">
          立即登录
        </Link>
      </p>
    </div>
  )
}
