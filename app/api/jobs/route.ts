import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
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

        // 企業の求人一覧を取得
        const { data: jobs, error } = await supabase
            .from('jobs')
            .select(`
        *,
        applications:applications(count)
      `)
            .eq('company_id', recruiterProfile.company_id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // 応募者数を計算
        const jobsWithCount = jobs.map(job => ({
            ...job,
            applied_count: job.applications[0].count || 0,
        }));

        return NextResponse.json(jobsWithCount);
    } catch (error) {
        console.error('求人一覧の取得に失敗しました:', error);
        return NextResponse.json(
            { error: '求人一覧の取得に失敗しました' },
            { status: 500 }
        );
    }
}

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

        // リクエストボディを取得
        const body = await request.json();
        console.log('リクエストボディ:', body);

        // 採用担当者のプロフィールを取得
        const { data: recruiterProfile, error: profileError } = await supabase
            .from('recruiter_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('採用担当者プロフィール取得エラー:', profileError);
            return NextResponse.json(
                { error: `採用担当者プロフィールの取得に失敗しました: ${profileError.message}` },
                { status: 500 }
            );
        }

        if (!recruiterProfile) {
            return NextResponse.json(
                { error: '採用担当者プロフィールが見つかりません' },
                { status: 404 }
            );
        }

        // 求人データを作成
        const jobData = {
            ...body,
            company_id: recruiterProfile.company_id,
            selected_benefits: body.selectedBenefits || [],
            selected_locations: body.selectedLocations || [],
            selected_requirements: body.selectedRequirements || [],
            work_style: body.work_style || '',
            company_culture: body.company_culture || '',
            team_description: body.team_description || '',
            logo_url: body.logo_url || '',
            office_photo_url: body.office_photo_url || '',
            team_photo_url: body.team_photo_url || '',
            event_photo_url: body.event_photo_url || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // 不要なフィールドを削除
        delete jobData.selectedBenefits;
        delete jobData.selectedLocations;
        delete jobData.selectedRequirements;

        console.log('求人データ:', jobData);

        const { data, error } = await supabase
            .from('jobs')
            .insert([jobData])
            .select()
            .single();

        if (error) {
            console.error('求人作成エラー:', error);
            return NextResponse.json(
                { error: `求人の作成に失敗しました: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('予期せぬエラー:', error);
        return NextResponse.json(
            { error: `予期せぬエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}` },
            { status: 500 }
        );
    }
} 