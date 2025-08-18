import { NextRequest, NextResponse } from 'next/server'
import { addTrackToPlaylist } from '@/lib/spotify'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { trackUri, playlistId, lastRequestTime } = await request.json()

    if (!trackUri || !playlistId) {
      return NextResponse.json(
        { error: 'トラックURIとプレイリストIDが必要です' },
        { status: 400 }
      )
    }

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