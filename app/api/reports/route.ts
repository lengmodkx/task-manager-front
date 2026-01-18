import { NextResponse } from 'next/server'
import { getReports } from '@/lib/actions/reports'

export async function GET() {
  const result = await getReports()

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json(result.data)
}
