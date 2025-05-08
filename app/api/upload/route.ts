import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
    try {
        // 認証ヘッダーを取得
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: '認証トークンが必要です' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');

        // トークンの検証
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('認証エラー:', authError);
            return NextResponse.json(
                { error: '認証に失敗しました' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;

        if (!file || !type) {
            return NextResponse.json(
                { error: 'ファイルとタイプが必要です' },
                { status: 400 }
            );
        }

        // ファイルサイズのチェック（最大10MB）
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'ファイルサイズは10MB以下にしてください' },
                { status: 400 }
            );
        }

        // ファイルタイプのチェック
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: '許可されていないファイル形式です' },
                { status: 400 }
            );
        }

        // ファイル名を生成
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `${type}/${timestamp}.${fileExt}`;

        // Supabase Storageにアップロード
        const { data, error: uploadError } = await supabase.storage
            .from('jobs')
            .upload(fileName, file);

        if (uploadError) {
            console.error('Supabase Storageアップロードエラー:', uploadError);
            return NextResponse.json(
                { error: `アップロードに失敗しました: ${uploadError.message}` },
                { status: 500 }
            );
        }

        // 公開URLを取得
        const { data: { publicUrl } } = supabase.storage
            .from('jobs')
            .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error('アップロードエラー:', error);
        return NextResponse.json(
            { error: `アップロードに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` },
            { status: 500 }
        );
    }
} 