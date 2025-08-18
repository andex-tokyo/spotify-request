#!/usr/bin/env node

const express = require('express')
const axios = require('axios')
const querystring = require('querystring')
const path = require('path')
const fs = require('fs')

// Load environment variables from .env.local if it exists
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim()
    }
  })
}

// Use environment variables or prompt user to set them
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REDIRECT_URI = 'http://127.0.0.1:8888/callback'
const PORT = 8888

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: Spotify credentials not found!')
  console.error('')
  console.error('Please set the following environment variables in .env.local:')
  console.error('  SPOTIFY_CLIENT_ID=your_client_id')
  console.error('  SPOTIFY_CLIENT_SECRET=your_client_secret')
  console.error('')
  console.error('Or pass them as environment variables:')
  console.error('  SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/get-refresh-token.js')
  process.exit(1)
}

const app = express()

app.get('/login', (req, res) => {
  const scope = 'playlist-modify-public playlist-modify-private'
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI
    }))
})

app.get('/callback', async (req, res) => {
  const code = req.query.code || null

  if (!code) {
    res.send('Error: No code provided')
    return
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      querystring.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      }), {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    const { access_token, refresh_token } = response.data
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify Token Generator</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .container {
              background: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            h1 {
              color: #1db954;
              margin-bottom: 20px;
            }
            .token-box {
              background: #f5f5f5;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
              word-break: break-all;
              font-family: 'Courier New', monospace;
              border: 2px solid #1db954;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffc107;
              padding: 10px;
              border-radius: 5px;
              margin: 20px 0;
            }
            button {
              background: #1db954;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
            }
            button:hover {
              background: #1ed760;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ 認証成功!</h1>
            
            <h2>以下のRefresh Tokenを.env.localファイルに設定してください：</h2>
            
            <div class="token-box" id="token">
              SPOTIFY_REFRESH_TOKEN=${refresh_token}
            </div>
            
            <button onclick="copyToken()">📋 コピー</button>
            
            <div class="warning">
              <strong>⚠️ 重要:</strong> このRefresh Tokenは安全に保管してください。
              他人と共有しないでください。
            </div>
            
            <p>このウィンドウは閉じて構いません。</p>
          </div>
          
          <script>
            function copyToken() {
              const tokenText = document.getElementById('token').innerText;
              navigator.clipboard.writeText(tokenText);
              alert('コピーしました！');
            }
          </script>
        </body>
      </html>
    `)
    
    console.log('\n✅ Token generated successfully!')
    console.log('Check your browser for the refresh token.')
  } catch (error) {
    console.error('Error getting tokens:', error.response?.data || error.message)
    res.send(`
      <h1>Error getting tokens</h1>
      <pre>${JSON.stringify(error.response?.data || error.message, null, 2)}</pre>
    `)
  }
})

console.log('🎵 Spotify Token Generator')
console.log('=' .repeat(50))
console.log('')
console.log('1. Spotify Developer Dashboardで以下のRedirect URIを設定してください:')
console.log(`   ${REDIRECT_URI}`)
console.log('')
console.log('2. 設定後、以下のURLにアクセスしてください:')
console.log(`   http://127.0.0.1:${PORT}/login`)
console.log('')
console.log(`Server running on http://127.0.0.1:${PORT}`)
console.log('')

app.listen(PORT, '127.0.0.1')