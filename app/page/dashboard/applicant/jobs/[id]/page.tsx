'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/app/utils/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Building2,
    Users,
    Calendar,
    Send,
    CheckCircle,
    AlertCircle,
    ChevronLeft
} from 'lucide-react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { v4 as uuidv4 } from 'uuid';

// 画像URLを取得する関数
const getImageUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/jobs/${path}`;
};

// ファイル名を安全な形式に変換する関数
const sanitizeFileName = (fileName: string) => {
    // 拡張子を取得
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    // ファイル名から拡張子を除去
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
    // 日本語と特殊文字を除去し、スペースをアンダースコアに変換
    const sanitized = nameWithoutExtension
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase();
    // タイムスタンプを追加して一意性を確保
    const timestamp = Date.now();
    return `${sanitized}_${timestamp}.${extension}`;
};

// プレビュー部分の画像表示コンポーネント
const PreviewImage = ({ src, alt, className }: { src: string | null, alt: string, className?: string }) => {
    const imageUrl = getImageUrl(src);
    if (!imageUrl) return null;

    return (
        <Image
            src={imageUrl}
            alt={alt}
            width={1200}
            height={800}
            className={className}
            unoptimized
        />
    );
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { user } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [company, setCompany] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [jobId, setJobId] = useState<string>('');

    useEffect(() => {
        const initializeParams = async () => {
            const resolvedParams = await params;
            setJobId(resolvedParams.id);
        };
        initializeParams();
    }, [params]);

    useEffect(() => {
        if (!jobId) return;

        const fetchJob = async () => {
            try {
                // 求人情報の取得（会社情報も含めて）
                const { data, error } = await supabase
                    .from('jobs')
                    .select(`
                        *,
                        companies (
                            id,
                            name
                        )
                    `)
                    .eq('id', jobId)
                    .single();

                if (error) throw error;
                setJob(data);
                setCompany(data.companies);

                // 既に応募済みかチェック
                if (user && data.company_id) {
                    const { data: applicationData, error: applicationError } = await supabase
                        .from('applications')
                        .select('id')
                        .eq('applicant_id', user.id)
                        .eq('job_id', jobId);

                    if (!applicationError && applicationData && applicationData.length > 0) {
                        setHasApplied(true);
                    }
                }
            } catch (error) {
                console.error('求人取得エラー:', error);
                setError('求人の取得に失敗しました');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJob();
    }, [jobId, user]);

    const handleApply = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        try {
            setIsSubmitting(true);
            setSubmitError(null);

            // 既に応募済みかチェック（簡略化したクエリ）
            console.log('チェック開始:', user.id, jobId);

            const { data: existingApplications, error: checkError } = await supabase
                .from('applications')
                .select('*')
                .eq('applicant_id', user.id)
                .eq('job_id', jobId);

            if (checkError) {
                console.error('重複チェックエラー:', checkError);
                throw new Error('応募チェック中にエラーが発生しました');
            }

            console.log('既存応募:', existingApplications);

            if (existingApplications && existingApplications.length > 0) {
                console.log('応募済み確認: true');
                throw new Error('この求人には既に応募済みです');
            }

            console.log('新規応募を作成します');

            // 応募情報の登録
            const { data: newApplication, error: applicationError } = await supabase
                .from('applications')
                .insert({
                    id: uuidv4(),
                    job_id: jobId,
                    applicant_id: user.id,
                    company_id: job.company_id,
                    status: 'pending',
                    message: message,
                    applied_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (applicationError) {
                console.error('応募登録エラー:', applicationError);
                throw applicationError;
            }

            console.log('応募完了:', newApplication);
            setSubmitSuccess(true);
            setHasApplied(true);
        } catch (error) {
            console.error('応募エラー:', error);
            setSubmitError(error instanceof Error ? error.message : '応募の処理中にエラーが発生しました。再度お試しください。');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-3xl shadow-2xl p-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h1>
                            <p className="text-gray-600 mb-6">{error || '求人情報が見つかりません'}</p>
                            <Button
                                onClick={() => router.push('/page/dashboard/applicant/jobs')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                一覧に戻る
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            求人詳細
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/page/dashboard/applicant/jobs')}
                            className="border-gray-300 hover:bg-gray-100"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            一覧に戻る
                        </Button>
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6">
                    <div className="flex items-start gap-6 mb-6">
                        {job.logo_url && (
                            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                <PreviewImage
                                    src={job.logo_url}
                                    alt="会社ロゴ"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate">{job.title}</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.employment_type && (
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                        {job.employment_type === 'full_time' ? '正社員' :
                                            job.employment_type === 'contract' ? '契約社員' :
                                                job.employment_type === 'part_time' ? 'パートタイム' :
                                                    job.employment_type === 'intern' ? 'インターン' : ''}
                                    </span>
                                )}
                                {job.selected_locations && job.selected_locations.length > 0 && (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        <MapPin className="w-4 h-4 inline-block mr-1" />
                                        {job.selected_locations.join('、')}
                                    </span>
                                )}
                                {job.salary_range && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                        <DollarSign className="w-4 h-4 inline-block mr-1" />
                                        {job.salary_range}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="prose max-w-none">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">求人内容</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>

                        {job.requirements && (
                            <>
                                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">必須要件</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
                            </>
                        )}

                        {job.work_style && (
                            <>
                                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">働き方</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{job.work_style}</p>
                            </>
                        )}

                        {job.company_culture && (
                            <>
                                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">企業文化</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{job.company_culture}</p>
                            </>
                        )}

                        {job.team_description && (
                            <>
                                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">チーム紹介</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{job.team_description}</p>
                            </>
                        )}

                        {job.benefits && (
                            <>
                                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">福利厚生</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{job.benefits}</p>
                            </>
                        )}

                        {/* 会社情報 */}
                        <div className="mt-8">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">会社情報</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    {
                                        url: job.office_photo_url,
                                        alt: 'オフィス写真',
                                        icon: Building2,
                                        label: 'オフィス環境'
                                    },
                                    {
                                        url: job.team_photo_url,
                                        alt: 'チーム写真',
                                        icon: Users,
                                        label: 'チームメンバー'
                                    },
                                    {
                                        url: job.event_photo_url,
                                        alt: 'イベント写真',
                                        icon: Calendar,
                                        label: '社内イベント'
                                    }
                                ].filter(photo => photo.url).map((photo, index) => (
                                    <div key={index} className="relative">
                                        <div className="aspect-video rounded-lg overflow-hidden">
                                            <PreviewImage
                                                src={photo.url}
                                                alt={photo.alt}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
                                            {photo.icon && <photo.icon className="w-4 h-4 text-indigo-600" />}
                                            <span className="text-sm font-medium text-gray-900">{photo.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 応募ボタン（下部） */}
                    <div className="mt-8 flex justify-center">
                        {!hasApplied ? (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                                        <Send className="w-5 h-5 mr-2" />
                                        この求人に応募する
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>応募の確認</DialogTitle>
                                        <DialogDescription>
                                            {job?.title} への応募を確定します。担当者へのメッセージを入力することも可能です。
                                        </DialogDescription>
                                    </DialogHeader>
                                    {submitError && (
                                        <Alert className="my-2 border-red-200 bg-red-50">
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                            <AlertDescription className="text-red-700">{submitError}</AlertDescription>
                                        </Alert>
                                    )}
                                    {submitSuccess && (
                                        <Alert className="my-2 border-green-200 bg-green-50">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <AlertDescription className="text-green-700">応募が完了しました！</AlertDescription>
                                        </Alert>
                                    )}
                                    <div className="space-y-2 mt-4">
                                        <Label htmlFor="message2">担当者へのメッセージ（任意）</Label>
                                        <Textarea
                                            id="message2"
                                            placeholder="志望動機や自己PRなどをご記入ください"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="min-h-[120px]"
                                        />
                                    </div>
                                    <DialogFooter className="mt-4">
                                        <DialogClose asChild>
                                            <Button variant="outline" disabled={isSubmitting}>キャンセル</Button>
                                        </DialogClose>
                                        <Button
                                            onClick={handleApply}
                                            disabled={isSubmitting || submitSuccess}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            {isSubmitting ? '送信中...' : '応募を確定する'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Button variant="outline" disabled className="text-green-700 bg-green-50 border-green-200 mb-2">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    応募済み
                                </Button>
                                <p className="text-sm text-gray-500">この求人には既に応募済みです。応募履歴から確認できます。</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 