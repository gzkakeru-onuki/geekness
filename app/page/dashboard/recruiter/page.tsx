"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/app/utils/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import {
    UserGroupIcon,
    DocumentTextIcon,
    CalendarIcon,
    ChartBarIcon,
    BuildingOfficeIcon,
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface Application {
    id: string;
    status: string;
    applied_at: string;
    applicant_id: {
        id: string;
        applicant_lastname: string;
        applicant_firstname: string;
        test_responses: {
            score: number;
        }[];
    };
}

interface RecentApplicant {
    id: string;
    name: string;
    score: number;
    status: string;
    date: string;
}

export default function RecruiterDashboard() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalApplicants: 0,
        pendingReviews: 0,
        upcomingInterviews: 0,
        averageScore: 0
    });

    const [applications, setApplications] = useState<Application[]>([]);
    const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([]);

    const fetchApplications = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    id,
                    status,
                    applied_at,
                    applicant_id (
                        id,
                        applicant_lastname,
                        applicant_firstname,
                        test_responses (
                            score
                        )
                    )
                `)
                .eq('company_id', user.id)
                .order('applied_at', { ascending: false });

            if (error) throw error;
            setApplications((data || []) as unknown as Application[]);

            const recent = (data || []).map((app: any) => ({
                id: app.id,
                name: `${app.applicant_id?.applicant_lastname || ''} ${app.applicant_id?.applicant_firstname || ''}`,
                score: getAverageScore(app.applicant_id?.test_responses || []),
                status: app.status,
                date: app.applied_at
            }));
            setRecentApplicants(recent);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError("応募者データの取得に失敗しました。");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setError("ログインが必要です。");
                return;
            }

            try {
                const { data: recruiterProfile, error: recruiterError } = await supabase
                    .from('recruiter_profiles')
                    .select('company_id')
                    .eq('id', user.id)
                    .single();

                if (recruiterError) throw recruiterError;
                if (!recruiterProfile) {
                    setError("企業プロフィールが見つかりません。");
                    return;
                }

                const { count: totalApplicants, error: applicantsError } = await supabase
                    .from('applications')
                    .select('*', { count: 'exact' })
                    .eq('company_id', recruiterProfile.company_id);

                if (applicantsError) throw applicantsError;

                const totalScore = recentApplicants.reduce((sum, applicant) => sum + applicant.score, 0);
                const applicantsWithScore = recentApplicants.filter(app => app.score > 0).length;
                const overallAverageScore = applicantsWithScore > 0
                    ? Math.round(totalScore / applicantsWithScore)
                    : 0;

                setStats(prev => ({
                    ...prev,
                    totalApplicants: totalApplicants || 0,
                    averageScore: overallAverageScore
                }));
            } catch (error) {
                console.error('Error fetching data:', error);
                setError("データの取得中にエラーが発生しました。");
            }
        };

        fetchData();
    }, [recentApplicants, user]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const getAverageScore = (testResponses: { score: number }[]) => {
        if (!testResponses || testResponses.length === 0) return 0;
        return testResponses.reduce((acc, tr) => acc + tr.score, 0) / testResponses.length;
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
    }

    const headerActions = (
        <div className="flex items-center space-x-4">
            <Link
                href="/dashboard/recruiter/interviews"
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
                <CalendarIcon className="w-5 h-5" />
                <span>面接スケジュール</span>
            </Link>
            <Link
                href="/dashboard/recruiter/jobs/new"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
                <DocumentTextIcon className="w-5 h-5" />
                <span>新規求人作成</span>
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <PageHeader
                title="採用担当者ダッシュボード"
                subtitle="応募者の状況を確認・管理できます"
                actions={headerActions}
                showBackButton
                className="bg-white/80 backdrop-blur-lg border-b border-gray-200"
            />

            <main className="max-w-7xl mx-auto p-6">
                {/* 統計情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">総応募者数</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalApplicants}</p>
                            </div>
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <UserGroupIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">未レビュー数</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingReviews}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">今後の面接</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingInterviews}</p>
                            </div>
                            <div className="bg-pink-100 p-3 rounded-full">
                                <CalendarIcon className="w-6 h-6 text-pink-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">平均スコア</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.averageScore}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <ChartBarIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 最近の応募者 */}
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">最近の応募者</h2>
                        <Link
                            href="/applicants"
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                            すべて表示 →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentApplicants.map((applicant) => (
                            <div
                                key={applicant.id}
                                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white p-2 rounded-lg">
                                            <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{applicant.name}</h3>
                                            <p className="text-sm text-gray-600">{applicant.status}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">応募日</p>
                                            <p className="font-medium text-gray-800">{applicant.date}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${applicant.status === "選考中"
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {applicant.status}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">スコア</p>
                                            <p className="font-medium text-gray-800">{applicant.score}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}