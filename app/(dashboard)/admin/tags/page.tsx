import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTags } from '@/lib/actions/tags'
import { TagManager } from '@/components/tags/TagManager'

export default async function AdminTagsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    redirect('/board')
  }

  const tagsResult = await getTags()
  const tags = tagsResult.success ? tagsResult.data || [] : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">标签管理</h1>
        <p className="text-gray-500 mt-1">管理系统标签和个人标签</p>
      </div>

      <TagManager initialTags={tags} isAdmin={isAdmin} />
    </div>
  )
}
