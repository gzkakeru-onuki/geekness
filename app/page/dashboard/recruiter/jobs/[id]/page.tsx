'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/utils/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, MapPin, DollarSign, Clock, Building2, Users, Calendar } from 'lucide-react';
import Image from 'next/image';

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
    const [job, setJob] = useState<JobTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

        const fetchJobData = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;
                if (!session) {
                    router.push('/auth/login');
                    return;
                }

                const { data: recruiterProfile, error: profileError } = await supabase
                    .from('recruiter_profiles')
                    .select('company_id')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) throw profileError;
                if (!recruiterProfile) {
                    throw new Error('採用担当者プロフィールが見つかりません');
                }

                const { data, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('id', jobId)
                    .eq('company_id', recruiterProfile.company_id)
                    .single();

                if (error) throw error;
                if (!data) {
                    throw new Error('求人情報が見つかりません');
                }

                setJob(data);
            } catch (error) {
                console.error('求人取得エラー:', error);
                setError(error instanceof Error ? error.message : '求人の取得に失敗しました');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobData();
    }, [jobId, router]);

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
                                onClick={() => router.push('/page/dashboard/recruiter/jobs')}
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
                        <p className="text-gray-600 mt-1">{job.title}</p>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/page/dashboard/recruiter/jobs/${jobId}/edit`)}
                            className="border-gray-300 hover:bg-gray-100"
                        >
                            編集
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/page/dashboard/recruiter/jobs')}
                            className="border-gray-300 hover:bg-gray-100"
                        >
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
                </div>
            </div>
        </div>
    );
} 