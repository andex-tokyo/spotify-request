import { NextRequest, NextResponse } from 'next/server'
import { addTrackToPlaylist } from '@/lib/spotify'
import { sql } from '@/lib/db'

const RATE_LIMIT_MS = 5 * 60 * 1000 // 5分

export async function POST(request: NextRequest) {
  try {
    const { trackUri, password } = await request.json()

    if (!trackUri || !password) {
      return NextResponse.json(
        { error: 'トラックURIと合言葉が必要です' },
        { status: 400 }
      )
    }

    // HttpOnly Cookieでレート制限チェック
    const lastRequestCookie = request.cookies.get('last_request')
    if (lastRequestCookie) {
      const lastTime = parseInt(lastRequestCookie.value, 10)
      if (!isNaN(lastTime)) {
        const timeDiff = Date.now() - lastTime
        if (timeDiff < RATE_LIMIT_MS) {
          const remainingSec = Math.ceil((RATE_LIMIT_MS - timeDiff) / 1000)
          const remainingMin = Math.ceil(remainingSec / 60)
          return NextResponse.json(
            { error: `連続でのリクエストはできません。あと約${remainingMin}分お待ちください` },
            { status: 429 }
          )
        }
      }
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

    await addTrackToPlaylist(playlistId, trackUri)

    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    await sql`
      INSERT INTO request_history (client_ip, track_uri, playlist_id)
      VALUES (${clientIp}, ${trackUri}, ${playlistId})
    `

    // レート制限用のHttpOnly Cookieをセット
    const response = NextResponse.json({ success: true })
    response.cookies.set('last_request', Date.now().toString(), {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: RATE_LIMIT_MS / 1000, // 5分後に自動消滅
      path: '/api/request',
    })

    return response
  } catch (error) {
    console.error('Request error:', error)
    return NextResponse.json(
      { error: 'リクエスト処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
