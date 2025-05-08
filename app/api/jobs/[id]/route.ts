import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        // ユーザーの認証情報を取得
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
        }

        // 採用担当者のプロフィールを取得
        const { data: recruiterProfile } = await supabase
            .from('recruiter_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (!recruiterProfile) {
            return NextResponse.json({ error: '採用担当者プロフィールが見つかりません' }, { status: 404 });
        }

        // 求人が存在するか確認
        const { data: job } = await supabase
            .from('jobs')
            .select('company_id')
            .eq('id', params.id)
            .single();

        if (!job) {
            return NextResponse.json({ error: '求人が見つかりません' }, { status: 404 });
        }

        // 企業の求人か確認
        if (job.company_id !== recruiterProfile.company_id) {
            return NextResponse.json({ error: '権限がありません' }, { status: 403 });
        }

        // 求人を削除
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', params.id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ message: '求人を削除しました' });
    } catch (error) {
        console.error('求人の削除に失敗しました:', error);
        return NextResponse.json(
            { error: '求人の削除に失敗しました' },
            { status: 500 }
        );
    }
} 