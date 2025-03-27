import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email, invitationId, companyId } = await request.json();

        // 基本URLの設定（localhost:3000 をデフォルトとして使用）
        const baseUrl = 'http://localhost:3000';

        // 招待リンクの生成
        const invitationUrl = `${baseUrl}/auth/register?invitation=${invitationId}&company_id=${companyId}`;

        console.log('Generated invitation URL:', invitationUrl); // デバッグ用

        // メール送信
        const data = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: '【招待】求人応募システムへの招待',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #4F46E5;">求人応募システムへの招待</h1>
                    <p>以下のリンクから登録を完了してください：</p>
                    <a href="${invitationUrl}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                        登録ページへ進む
                    </a>
                    <p style="color: #666; font-size: 14px;">
                        このリンクの有効期限は24時間です。<br>
                        このメールに心当たりがない場合は、無視してください。
                    </p>
                </div>
            `
        });

        return NextResponse.json({
            success: true,
            data,
            debug: { invitationUrl } // デバッグ用
        });
    } catch (error) {
        console.error('Error sending invitation email:', error);
        return NextResponse.json(
            { error: 'メール送信に失敗しました' },
            { status: 500 }
        );
    }
} 