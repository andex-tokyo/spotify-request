import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    const { data, error } = await supabase
      .from('passwords')
      .select('playlist_id')
      .eq('password', password)
      .single()

    if (error || !data) {
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