"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import Link from 'next/link';
import {
    BuildingOfficeIcon,
    BriefcaseIcon,
    CalendarIcon,
    ClockIcon,
    EyeIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/app/utils/supabase';
import { Button } from '@/components/ui/button';

interface Company {
    id: string;
    name: string;
}

interface ApplicationData {
    id: string;
    job_id: string;
    company_id: string;
    status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
    applied_at: string;
    message?: string;
    companies: Company[];
}

interface Application {
    id: string;
    job_id: string;
    company_id: string;
    status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
    applied_at: string;
    message?: string;
    companies?: Company[];
    job?: {
        title: string;
    };
    company?: {
        name: string;
    };
}

export default function ApplicationsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user) return;

            try {
                setIsLoading(true);
                setError(null);

                // ユーザーの応募情報を取得
                const { data: appData, error: appError } = await supabase
                    .from('applications')
                    .select(`
                        id,
                        job_id,
                        company_id,
                        status,
                        applied_at,
                        message,
                        companies (
                            id,
                            name
                        )
                    `)
                    .eq('applicant_id', user.id)
                    .order('applied_at', { ascending: false });

                if (appError) {
                    console.error('応募データ取得エラー:', appError);
                    throw appError;
                }

                // 有効なjob_idのみをフィルタリング
                const validJobIds = (appData as ApplicationData[])
                    .filter(app => app.job_id !== null && app.job_id !== undefined)
                    .map(app => app.job_id);

                let jobsMap = new Map();

                if (validJobIds.length > 0) {
                    // 応募に関連する求人情報を取得
                    const { data: jobsData, error: jobsError } = await supabase
                        .from('jobs')
                        .select('id, title')
                        .in('id', validJobIds);

                    if (jobsError) {
                        console.error('求人データ取得エラー:', jobsError);
                        throw jobsError;
                    }

                    // 求人情報をマッピング
                    jobsMap = new Map(jobsData.map(job => [job.id, job.title]));
                }

                // 応募データの整形
                const formattedApplications = (appData as ApplicationData[]).map(app => {
                    // companiesが配列またはオブジェクトとして返ってくる場合の対応
                    const companyName = (() => {
                        if (!app.companies) return '不明な企業';
                        if (Array.isArray(app.companies)) {
                            return app.companies[0]?.name || '不明な企業';
                        }
                        return (app.companies as Company).name || '不明な企業';
                    })();

                    return {
                        id: app.id,
                        job_id: app.job_id,
                        company_id: app.company_id,
                        status: app.status,
                        applied_at: app.applied_at,
                        message: app.message,
                        job: {
                            title: app.job_id ? (jobsMap.get(app.job_id) || '不明な求人') : '求人情報なし'
                        },
                        company: {
                            name: companyName
                        }
                    };
                });

                setApplications(formattedApplications);
            } catch (error) {
                console.error('Error fetching applications:', error);
                setError('応募情報の取得中にエラーが発生しました。');
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
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

    // 応募ステータスに応じたスタイルを取得
    const getStatusStyle = (status: Application['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-gray-100 text-gray-800';
            case 'reviewing':
                return 'bg-yellow-100 text-yellow-800';
            case 'interview':
                return 'bg-blue-100 text-blue-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
        }
    };

    // 応募ステータスのラベルを取得
    const getStatusLabel = (status: Application['status']) => {
        switch (status) {
            case 'pending':
                return '応募済み';
            case 'reviewing':
                return '審査中';
            case 'interview':
                return '面接中';
            case 'rejected':
                return '不採用';
            case 'accepted':
                return '採用';
        }
    };

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
                title="応募履歴"
                subtitle="あなたが応募した求人の履歴と現在のステータスを確認できます"
                showBackButton
                backUrl="/page/dashboard/applicant"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {applications.length > 0 ? (
                    <div className="space-y-6">
                        {applications.map((application) => (
                            <div
                                key={application.id}
                                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                                                {application.job?.title || '不明な求人'}
                                            </h2>
                                            <div className="flex items-center text-gray-500">
                                                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                                <span>{application.company?.name || '不明な企業'}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-2 md:items-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${getStatusStyle(application.status)}`}>
                                                {getStatusLabel(application.status)}
                                            </span>
                                            <span className="text-sm text-gray-500 flex items-center">
                                                <CalendarIcon className="h-4 w-4 mr-1" />
                                                {formatDate(application.applied_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-4">
                                        <Link href={`/page/dashboard/applicant/jobs/${application.job_id}`} passHref>
                                            <Button
                                                variant="outline"
                                                className="inline-flex items-center text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                            >
                                                <EyeIcon className="h-4 w-4 mr-2" />
                                                求人詳細を見る
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">まだ応募履歴がありません</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            興味のある求人に応募すると、ここに応募履歴が表示されます。
                        </p>
                        <Link href="/page/dashboard/applicant/jobs" passHref>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                求人一覧を見る
                            </Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
} 