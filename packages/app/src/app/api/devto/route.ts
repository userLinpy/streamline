import { NextResponse } from 'next/server'
import { fetchDevTo } from '@/lib/devto'

export async function GET() {
  const items = await fetchDevTo()
  return NextResponse.json(items)
}
