'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Track {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string; height: number; width: number }[]
  }
  uri: string
  popularity?: number
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [suggestions, setSuggestions] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [message, setMessage] = useState('')
  const [requestedTracks, setRequestedTracks] = useState<Set<string>>(new Set())
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const playlistId = localStorage.getItem('playlistId')
    if (!playlistId) {
      router.push('/')
    }
  }, [router])

  // デバウンス処理でサジェスト検索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) {
        fetchSuggestions(query)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300) // 300ms待ってから検索

    return () => clearTimeout(timer)
  }, [query])

  const fetchSuggestions = async (searchQuery: string) => {
    setLoadingSuggestions(true)
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 8 }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuggestions(data.tracks)
        setShowSuggestions(true)
      }
    } catch (error) {
      // サジェストのエラーは表示しない
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return

    setShowSuggestions(false)
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setTracks(data.tracks)
      } else {
        setMessage(data.error || '検索中にエラーが発生しました')
      }
    } catch (error) {
      setMessage('検索中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (track: Track) => {
    setQuery(`${track.name} - ${track.artists[0].name}`)
    setShowSuggestions(false)
    setTracks([track])
  }

  const handleRequest = async (track: Track) => {
    const playlistId = localStorage.getItem('playlistId')
    if (!playlistId) {
      setMessage('プレイリストIDが見つかりません')
      return
    }

    const lastRequestTime = localStorage.getItem('lastRequestTime')
    const lastRequestTimeNum = lastRequestTime ? parseInt(lastRequestTime) : 0

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackUri: track.uri,
          playlistId,
          lastRequestTime: lastRequestTimeNum,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage(`「${track.name}」をプレイリストに追加しました！`)
        setRequestedTracks(prev => new Set(prev).add(track.id))
        localStorage.setItem('lastRequestTime', data.requestTime.toString())
      } else {
        setMessage(data.error || 'リクエスト中にエラーが発生しました')
      }
    } catch (error) {
      setMessage('リクエスト中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            曲を検索してリクエスト
          </h1>
          
          <form onSubmit={handleSearch} className="relative">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setShowSuggestions(true)}
                placeholder="アーティスト名や曲名を入力..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition duration-200 disabled:opacity-50"
              >
                検索
              </button>
            </div>

            {/* サジェストドロップダウン */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-80 overflow-y-auto z-10">
                {suggestions.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => handleSuggestionClick(track)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    {track.album.images[0] && (
                      <img
                        src={track.album.images[0].url}
                        alt={track.album.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {track.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {track.artists.map(a => a.name).join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {message && (
            <div className={`p-4 rounded-lg mb-4 mt-4 ${
              message.includes('追加しました') 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition duration-200"
            >
              <div className="flex gap-4">
                {track.album.images[0] && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{track.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {track.artists.map(a => a.name).join(', ')}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">{track.album.name}</p>
                  <button
                    onClick={() => handleRequest(track)}
                    disabled={loading || requestedTracks.has(track.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                      requestedTracks.has(track.id)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {requestedTracks.has(track.id) ? 'リクエスト済み' : 'リクエスト'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}