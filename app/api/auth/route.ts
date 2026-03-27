import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    const result = await sql`
      SELECT playlist_id FROM passwords WHERE password = ${password} LIMIT 1
    `

    if (!result[0]) {
      return NextResponse.json(
        { error: '合言葉が正しくありません' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
