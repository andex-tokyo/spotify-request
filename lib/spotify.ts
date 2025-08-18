import SpotifyWebApi from 'spotify-web-api-node'

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
})

let tokenExpiresAt = 0

export async function getSpotifyClient() {
  const now = Date.now()
  
  if (now >= tokenExpiresAt) {
    try {
      const data = await spotifyApi.refreshAccessToken()
      spotifyApi.setAccessToken(data.body['access_token'])
      tokenExpiresAt = now + (data.body['expires_in'] * 1000) - 60000
    } catch (error) {
      console.error('Error refreshing access token', error)
      throw error
    }
  }
  
  return spotifyApi
}

export async function searchTracks(query: string, limit: number = 20) {
  const client = await getSpotifyClient()
  
  const results = await client.searchTracks(query, { 
    limit, 
    market: 'JP'  // 日本市場を指定
  })
  
  return results.body.tracks?.items || []
}

export async function addTrackToPlaylist(playlistId: string, trackUri: string) {
  const client = await getSpotifyClient()
  await client.addTracksToPlaylist(playlistId, [trackUri])
}