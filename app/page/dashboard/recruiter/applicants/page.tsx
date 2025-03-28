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
    ClockIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Applicant {
    id: string;
    name: string;
    score: number;
    status: string;
    date: string;
}

export default function RecruiterApplicantsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const fetchApplicants = useCallback(async () => {
        if (!user) {
            setError("ログインが必要です。");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 企業プロフィールの取得
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

            // 応募データの取得
            const { data: applicationsData, error: applicationsError } = await supabase
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
                .eq('company_id', recruiterProfile.company_id)
                .order('applied_at', { ascending: false });

            if (applicationsError) throw applicationsError;

            const formattedApplicants = (applicationsData || []).map((app: any) => ({
                id: app.id,
                name: `${app.applicant_id?.applicant_lastname || ''} ${app.applicant_id?.applicant_firstname || ''}`,
                score: getAverageScore(app.applicant_id?.test_responses || []),
                status: app.status,
                date: app.applied_at
            }));

            setApplicants(formattedApplicants);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError("データの取得中にエラーが発生しました。");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    const getAverageScore = (testResponses: { score: number }[]) => {
        if (!testResponses || testResponses.length === 0) return 0;
        return Math.round(testResponses.reduce((acc, tr) => acc + tr.score, 0) / testResponses.length);
    };

    const filteredApplicants = applicants.filter(applicant => {
        const matchesSearch = applicant.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || applicant.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchApplicants} />;
    }

    const headerActions = (
        <div className="flex items-center space-x-4">
            <Link
                href="/page/dashboard/recruiter/interviews"
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
                <CalendarIcon className="w-5 h-5" />
                <span>面接スケジュール</span>
            </Link>
            <Link
                href="/page/dashboard/recruiter/jobs/new"
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
                title="応募者一覧"
                subtitle="すべての応募者を確認・管理できます"
                actions={headerActions}
                showBackButton
                backUrl="/page/dashboard/recruiter"
                className="bg-white/80 backdrop-blur-lg border-b border-gray-200"
            />

            <main className="max-w-7xl mx-auto p-6">
                {/* フィルターと検索 */}
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="応募者名で検索..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">すべてのステータス</option>
                                <option value="pending">未レビュー</option>
                                <option value="interview_scheduled">面接予定</option>
                                <option value="rejected">不採用</option>
                                <option value="hired">採用</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 応募者一覧 */}
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                    <div className="space-y-4">
                        {filteredApplicants.map((applicant) => (
                            <div
                                key={applicant.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-indigo-100 p-2 rounded-full">
                                        <UserGroupIcon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{applicant.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            応募日: {new Date(applicant.date).toLocaleDateString('ja-JP')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <ChartBarIcon className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-medium text-indigo-600">
                                            スコア: {applicant.score}
                                        </span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${applicant.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : applicant.status === 'interview_scheduled'
                                                ? 'bg-blue-100 text-blue-800'
                                                : applicant.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : applicant.status === 'hired'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {applicant.status === 'pending'
                                            ? '未レビュー'
                                            : applicant.status === 'interview_scheduled'
                                                ? '面接予定'
                                                : applicant.status === 'rejected'
                                                    ? '不採用'
                                                    : applicant.status === 'hired'
                                                        ? '採用'
                                                        : 'その他'}
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