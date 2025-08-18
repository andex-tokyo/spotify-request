import { NextRequest, NextResponse } from 'next/server'
import { addTrackToPlaylist } from '@/lib/spotify'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { trackUri, password, lastRequestTime } = await request.json()

    if (!trackUri || !password) {
      return NextResponse.json(
        { error: 'トラックURIと合言葉が必要です' },
        { status: 400 }
      )
    }

    // 合言葉からプレイリストIDを取得
    const { data: passwordData, error: passwordError } = await supabase
      .from('passwords')
      .select('playlist_id')
      .eq('password', password)
      .single()

    if (passwordError || !passwordData) {
      return NextResponse.json(
        { error: '合言葉が無効です' },
        { status: 401 }
      )
    }

    const playlistId = passwordData.playlist_id

    if (lastRequestTime) {
      const timeDiff = Date.now() - lastRequestTime
      if (timeDiff < 5 * 60 * 1000) {
        return NextResponse.json(
          { error: '連続でのリクエストはできません。しばらくお待ちください' },
          { status: 429 }
        )
      }
    }

    await addTrackToPlaylist(playlistId, trackUri)

    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    await supabase
      .from('request_history')
      .insert([
        {
          client_ip: clientIp,
          track_uri: trackUri,
          playlist_id: playlistId,
        }
      ])

    return NextResponse.json({ success: true, requestTime: Date.now() })
  } catch (error) {
    console.error('Request error:', error)
    return NextResponse.json(
      { error: 'リクエスト処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}