'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import Link from 'next/link';
import {
    BriefcaseIcon,
    BuildingOfficeIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/app/utils/supabase';

// Supabaseから取得するデータの型定義
interface JobData {
    id: string;
    title: string;
    status: string;
    created_at: string;
    company_id: string;
    location?: string | null;
    employment_type?: string | null;
    description?: string | null;
    companies: {
        id: string;
        name: string;
    } | null;
}

// フロントエンドで使用する整形後の求人データの型定義
interface JobListing {
    id: string;
    title: string;
    company_name: string;
    location: string;
    employment_type: string;
    status: string;
    created_at: string;
    description: string;
}

export default function JobListingsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [jobListings, setJobListings] = useState<JobListing[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterEmploymentType, setFilterEmploymentType] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobListings = async () => {
            if (!user) return;

            try {
                setIsLoading(true);
                setError(null);

                // 公開中の求人を取得
                const { data: jobsData, error: jobsError } = await supabase
                    .from('jobs')
                    .select(`
                        id,
                        title,
                        status,
                        created_at,
                        company_id,
                        location,
                        employment_type,
                        description,
                        companies (
                            id,
                            name
                        )
                    `)
                    .eq('status', 'published')
                    .order('created_at', { ascending: false });

                if (jobsError) {
                    console.error('求人データ取得エラー:', jobsError);
                    throw jobsError;
                }

                // デバッグ用に取得データを確認
                console.log('取得した求人データ:', jobsData);

                if (!jobsData || jobsData.length === 0) {
                    console.log('公開中の求人が見つかりませんでした');
                    setJobListings([]);
                    setIsLoading(false);
                    return;
                }

                // サンプルデータを確認してcompaniesの構造を把握
                console.log('最初の求人データサンプル:', jobsData[0]);
                console.log('companies構造:', jobsData[0].companies);

                // 求人情報の整形
                const formattedJobs = (jobsData || []).map((job: any) => {
                    // 各求人の会社情報をデバッグ
                    console.log(`求人ID ${job.id} の会社情報:`, job.companies);

                    return {
                        id: job.id,
                        title: job.title,
                        company_name: job.companies?.name || '企業名なし',
                        location: job.location || '',
                        employment_type: job.employment_type || '',
                        status: job.status,
                        created_at: job.created_at,
                        description: job.description || ''
                    };
                });

                setJobListings(formattedJobs);
            } catch (error) {
                console.error('Error fetching job listings:', error);
                setError('求人情報の取得中にエラーが発生しました。');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobListings();
    }, [user]);

    // 日付フォーマット用のヘルパー関数
    const formatDate = (dateString: string | null): string => {
        if (!dateString) return '日付なし';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '無効な日付';
            return date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return '日付エラー';
        }
    };

    // 雇用形態の表示名を取得
    const getEmploymentTypeLabel = (type: string): string => {
        switch (type) {
            case 'full_time':
                return '正社員';
            case 'contract':
                return '契約社員';
            case 'part_time':
                return 'パートタイム';
            case 'intern':
                return 'インターン';
            default:
                return type;
        }
    };

    // 検索とフィルタリングの適用
    const filteredJobs = jobListings.filter(job => {
        // 検索クエリに一致する求人を絞り込み
        const matchesSearch = searchQuery === '' ||
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase());

        // 雇用形態でフィルタリング
        const matchesEmploymentType = !filterEmploymentType || job.employment_type === filterEmploymentType;

        return matchesSearch && matchesEmploymentType;
    });

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <PageHeader
                title="求人一覧"
                subtitle="募集中の求人をチェックして応募しよう"
                showBackButton
                backUrl="/page/dashboard/applicant"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* 検索とフィルター */}
                <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="キーワードで検索..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={filterEmploymentType || ''}
                                onChange={(e) => setFilterEmploymentType(e.target.value || null)}
                            >
                                <option value="">すべての雇用形態</option>
                                <option value="full_time">正社員</option>
                                <option value="contract">契約社員</option>
                                <option value="part_time">パートタイム</option>
                                <option value="intern">インターン</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 求人リスト */}
                <div className="space-y-6">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <Link
                                key={job.id}
                                href={`/page/dashboard/applicant/jobs/${job.id}`}
                                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            募集中
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-500 mb-4">
                                        <div className="flex items-center">
                                            <BuildingOfficeIcon className="w-4 h-4 mr-1 text-gray-400" />
                                            {job.company_name}
                                        </div>
                                        {job.location && (
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                                {job.location}
                                            </div>
                                        )}
                                        {job.employment_type && (
                                            <div className="flex items-center">
                                                <BriefcaseIcon className="w-4 h-4 mr-1 text-gray-400" />
                                                {getEmploymentTypeLabel(job.employment_type)}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {job.description.length > 150
                                            ? `${job.description.substring(0, 150)}...`
                                            : job.description}
                                    </p>
                                    <div className="text-sm text-gray-500">
                                        {formatDate(job.created_at)}
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : searchQuery || filterEmploymentType ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                            <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">検索結果が見つかりませんでした</h3>
                            <p className="text-gray-500 mb-4">検索条件を変更して再度お試しください。</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterEmploymentType(null);
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                検索条件をリセット
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                            <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">現在、募集中の求人はありません</h3>
                            <p className="text-gray-500">また後日チェックしてください。</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
} 