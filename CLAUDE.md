# CLAUDE.md - Claude Code Instructions

## Serena MCP サーバーの使用

このプロジェクトでは、Serena MCPサーバーを使用してコードベースを効率的に管理しています。

### Serenaの主な機能

1. **シンボリック検索** - クラス、関数、メソッドなどのコードシンボルを効率的に検索
2. **メモリ管理** - プロジェクトに関する重要な情報をメモリファイルとして保存
3. **効率的なコード読み取り** - ファイル全体を読むのではなく、必要な部分のみを読み取る

### 使用方法

#### コードの探索時
- まず `get_symbols_overview` でファイルの構造を把握
- 必要なシンボルのみ `find_symbol` で詳細を読み取る
- ファイル全体の読み取りは最小限に抑える

#### コードの編集時
- `replace_symbol_body` でシンボル全体を置換
- `insert_before_symbol` / `insert_after_symbol` で新しいコードを挿入
- 参照を確認する場合は `find_referencing_symbols` を使用

#### メモリファイル
以下のメモリファイルが利用可能：
- `project_overview.md` - プロジェクトの概要
- `code_style_conventions.md` - コードスタイルと規約
- `suggested_commands.md` - 開発用コマンド一覧
- `task_completion_checklist.md` - タスク完了時のチェックリスト
- `project_structure.md` - プロジェクト構造

### タスク完了時の手順

1. **リンティングの実行**
   ```bash
   npm run lint
   ```

2. **ビルドの確認**
   ```bash
   npm run build
   ```

3. **開発サーバーでの動作確認**
   ```bash
   npm run dev
   ```

### 重要な注意事項

- ファイル全体を読むのではなく、Serenaのシンボリックツールを優先的に使用する
- 新しいファイルを作成する前に、既存ファイルへの編集を検討する
- TypeScriptの型安全性を維持する（`any`型の使用は最小限に）
- 環境変数やAPIキーをハードコードしない

## プロジェクト固有の情報

### Spotify API
- Refresh Tokenの取得: `node scripts/get-refresh-token.js`
- 認証フロー: パスワード認証 → プレイリストID取得 → 曲の追加

### Supabase
- データベース: `passwords`テーブル（パスワード→プレイリストID）
- レート制限: `requests`テーブルで管理

### 開発環境
- Node.js 18.0以上
- Next.js 15 + React 19
- TypeScript（strictモード）
- Tailwind CSS