# Supabase Keep Alive設定ガイド

このドキュメントでは、Supabase Free Tierのプロジェクトが非アクティブによりサスペンドされるのを防ぐためのGitHub Actions設定について説明します。

## 概要

Supabaseの無料プランでは、7日間データベースへのアクセスがないとプロジェクトが一時停止されます。これを防ぐため、定期的にデータベースにアクセスするGitHub Actionsワークフローを設定しています。

## 仕組み

1. **定期実行**: 月・水・金の日本時間午前10時に自動実行
2. **ヘルスチェック**: Supabaseデータベースへの簡単なクエリを実行
3. **エラー通知**: 失敗時にGitHub Issueを自動作成

## セットアップ手順

### 1. GitHub Secretsの設定

GitHubリポジトリの設定画面から以下のSecretsを追加してください：

1. リポジトリの **Settings** タブを開く
2. 左メニューの **Secrets and variables** → **Actions** を選択
3. **New repository secret** をクリック
4. 以下の2つのSecretを追加：

#### SUPABASE_URL
- Name: `SUPABASE_URL`
- Value: Supabaseプロジェクトの URL（例: `https://xxxxx.supabase.co`）
- SupabaseダッシュボードのProject Settings → APIから取得

#### SUPABASE_ANON_KEY
- Name: `SUPABASE_ANON_KEY`
- Value: Supabaseプロジェクトの anon/public キー
- SupabaseダッシュボードのProject Settings → API → anon publicから取得

### 2. ワークフローの有効化

1. リポジトリの **Actions** タブを開く
2. **Supabase Keep Alive** ワークフローが表示されていることを確認
3. 初回は手動実行でテスト：
   - ワークフローをクリック
   - **Run workflow** ボタンをクリック
   - **Run workflow** を実行

### 3. 動作確認

#### 成功時
- Actions タブで緑色のチェックマークが表示
- ログに以下のメッセージが表示：
  ```
  ✅ Successfully pinged Supabase (HTTP 200)
  ✅ Successfully accessed requests table (HTTP 200)
  ```

#### 失敗時
- Actions タブで赤色のXマークが表示
- 自動的にIssueが作成される
- Issue内容：
  - エラーの詳細
  - 確認すべき項目のリスト
  - ワークフロー実行へのリンク

## オプション設定

### APIルートのセキュリティ強化

ヘルスチェックAPIルートを外部から保護したい場合：

1. `.env.local`に以下を追加：
   ```
   HEALTH_CHECK_API_KEY=your-secret-key-here
   ```

2. GitHub Secretsに追加：
   - Name: `HEALTH_CHECK_API_KEY`
   - Value: 上記と同じキー

3. ワークフローファイルを更新して、APIキーを使用するように修正

### 実行頻度の変更

`.github/workflows/supabase-keepalive.yml`のcron設定を変更：

```yaml
schedule:
  # 毎日実行する場合
  - cron: '0 1 * * *'
  
  # 週2回（火・金）の場合
  - cron: '0 1 * * 2,5'
```

### ヘルスチェック記録の無効化

データベースにヘルスチェックの記録を残したくない場合は、`app/api/health/supabase/route.ts`の以下の部分をコメントアウト：

```typescript
// ヘルスチェックの記録を保存（オプション）
// await supabase
//   .from('requests')
//   .insert({
//     ip_address: 'health-check',
//     song_name: 'HEALTH_CHECK',
//     artist_name: 'GitHub Actions',
//     requested_at: timestamp
//   });
```

## トラブルシューティング

### ワークフローが実行されない
- GitHub ActionsがリポジトリでORM有効になっているか確認
- Secretsが正しく設定されているか確認
- ワークフローファイルの構文エラーがないか確認

### Supabaseへの接続エラー
- SUPABASE_URLとSUPABASE_ANON_KEYが正しいか確認
- Supabaseプロジェクトがアクティブか確認
- Supabaseダッシュボードでプロジェクトステータスを確認

### 頻繁にIssueが作成される
- Supabaseの無料枠の制限に達していないか確認
- ネットワークの問題がないか確認
- 一時的にcron頻度を減らして様子を見る

## 注意事項

- このワークフローはSupabase Free Tierの制限内で動作します
- 月間のGitHub Actions実行時間に注意してください（無料枠: 2000分/月）
- 本番環境では有料プランへのアップグレードを検討してください

## 関連ファイル

- `.github/workflows/supabase-keepalive.yml` - GitHub Actionsワークフロー
- `app/api/health/supabase/route.ts` - ヘルスチェックAPIエンドポイント