# 🎵 Spotify Request App

合言葉認証によって異なるプレイリストに曲をリクエストできるWebアプリケーション。パーティーやイベントで参加者が簡単に曲をリクエストできます。

## ✨ 主な機能

- 🔐 **合言葉認証** - 異なる合言葉で異なるプレイリストにアクセス
- 🔍 **リアルタイム検索** - 入力中にサジェスト表示
- 🇯🇵 **日本市場優先** - 日本の人気曲を優先表示
- ⏱️ **レート制限** - 同一端末から5分間の再リクエスト制限
- 📱 **レスポンシブデザイン** - スマートフォンでも快適に利用可能

## 📋 必要な環境

- Node.js 18.0以上
- npm または yarn
- Spotify Developer アカウント
- Neonアカウント（https://neon.tech）

## 🔧 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/andex-tokyo/spotify-request.git
cd spotify-request
npm install
```

### 2. Spotify APIの設定

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)でアプリを作成
2. Redirect URIに `http://127.0.0.1:8888/callback` を追加
3. Client IDとClient Secretを取得

### 3. Refresh Tokenの取得

```bash
node scripts/get-refresh-token.js
# ブラウザで http://127.0.0.1:8888/login にアクセス
# Spotifyでログインして表示されるRefresh Tokenを保存
```

### 4. Neonデータベースの設定

1. [Neon](https://neon.tech)でプロジェクトを作成
2. SQL Editorで以下を実行してテーブルを作成:

```sql
CREATE TABLE IF NOT EXISTS passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  password VARCHAR(255) UNIQUE NOT NULL,
  playlist_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS request_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_ip VARCHAR(255) NOT NULL,
  track_uri VARCHAR(255) NOT NULL,
  playlist_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

3. 合言葉とプレイリストIDを登録:
```sql
INSERT INTO passwords (password, playlist_id) VALUES
('さくら', 'YOUR_PLAYLIST_ID_1'),
('なつまつり', 'YOUR_PLAYLIST_ID_2');
```

### 5. 環境変数の設定

`.env.local.example`を`.env.local`にコピーして編集:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

### 6. 開発サーバーの起動

```bash
npm run dev
# http://localhost:3000 でアクセス
```

## 📦 デプロイ

### Vercelへのデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/andex-tokyo/spotify-request)

1. 上記ボタンをクリック
2. 環境変数を設定
3. デプロイ

## 🏗️ 技術スタック

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Neon (Serverless Postgres)
- **API**: Spotify Web API
- **Deployment**: Vercel

## 📚 プロジェクト構成

```
spotify-request/
├── app/                    # Next.js App Router
│   ├── api/               # APIルート
│   ├── search/            # 検索ページ
│   └── page.tsx           # ログインページ
├── lib/                   # ユーティリティ
│   ├── spotify.ts         # Spotify API
│   └── db.ts              # Neon DBクライアント
├── scripts/               # 開発用スクリプト
│   └── get-refresh-token.js  # Spotify token取得
├── docs/                  # ドキュメント
│   └── DATABASE.md        # DB設計詳細
└── public/                # 静的ファイル
```

## 🤝 コントリビューション

詳細は[CONTRIBUTING.md](CONTRIBUTING.md)をご覧ください。

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルをご覧ください。

## 📞 サポート

問題が発生した場合は、[Issues](https://github.com/andex-tokyo/spotify-request/issues)でお知らせください。