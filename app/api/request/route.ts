import { NextRequest, NextResponse } from 'next/server'
import { addTrackToPlaylist } from '@/lib/spotify'
import { sql } from '@/lib/db'

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
    const passwordResult = await sql`
      SELECT playlist_id FROM passwords WHERE password = ${password} LIMIT 1
    `

    if (!passwordResult[0]) {
      return NextResponse.json(
        { error: '合言葉が無効です' },
        { status: 401 }
      )
    }

    const playlistId = passwordResult[0].playlist_id

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

    await sql`
      INSERT INTO request_history (client_ip, track_uri, playlist_id)
      VALUES (${clientIp}, ${trackUri}, ${playlistId})
    `

    return NextResponse.json({ success: true, requestTime: Date.now() })
  } catch (error) {
    console.error('Request error:', error)
    return NextResponse.json(
      { error: 'リクエスト処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
