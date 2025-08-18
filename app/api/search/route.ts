import { NextRequest, NextResponse } from 'next/server'
import { searchTracks } from '@/lib/spotify'

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 20 } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: '検索クエリを入力してください' },
        { status: 400 }
      )
    }

    const tracks = await searchTracks(query, limit)
    
    return NextResponse.json({ tracks })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '検索中にエラーが発生しました' },
      { status: 500 }
    )
  }
}