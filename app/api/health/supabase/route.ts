import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // APIキーのチェック（オプション：セキュリティ強化）
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.HEALTH_CHECK_API_KEY;
  
  if (apiKey && authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Supabase configuration missing' },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 簡単なクエリを実行してデータベースの接続を確認
    const { data: passwordCheck, error: passwordError } = await supabase
      .from('passwords')
      .select('id')
      .limit(1);

    const { data: requestCheck, error: requestError } = await supabase
      .from('requests')
      .select('id')
      .limit(1);

    const timestamp = new Date().toISOString();
    
    // ヘルスチェックの記録を保存（オプション）
    await supabase
      .from('requests')
      .insert({
        ip_address: 'health-check',
        song_name: 'HEALTH_CHECK',
        artist_name: 'GitHub Actions',
        requested_at: timestamp
      });

    const status = {
      healthy: !passwordError && !requestError,
      timestamp,
      checks: {
        passwords_table: passwordError ? 'failed' : 'ok',
        requests_table: requestError ? 'failed' : 'ok'
      },
      errors: {
        passwords: passwordError?.message || null,
        requests: requestError?.message || null
      }
    };

    return NextResponse.json(status, {
      status: status.healthy ? 200 : 503
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}