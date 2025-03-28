"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import {
    BriefcaseIcon,
    DocumentTextIcon,
    CalendarIcon,
    ChartBarIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    ClockIcon,
    UserIcon,
    ArrowRightIcon,
    StarIcon,
    CheckBadgeIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Application {
    id: string;
    company: string;
    position: string;
    status: string;
    appliedDate: string;
    nextStep: string;
    nextDate: string;
    score: number;
    tags: string[];
}

export default function ApplicationsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user) {
                setError("ログインが必要です。");
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // 応募データの取得
                const { data: applicationsData, error: applicationsError } = await supabase
                    .from('applications')
                    .select('*')
                    .eq('applicant_id', user.id)
                    .order('applied_at', { ascending: false });

                if (applicationsError) throw applicationsError;

                // 企業データの取得
                const companyIds = applicationsData.map(app => app.company_id);
                const { data: companiesData, error: companiesError } = await supabase
                    .from('companies')
                    .select('id,name')
                    .in('id', companyIds);

                if (companiesError) throw companiesError;

                // 企業データをマップに変換
                const companiesMap = new Map(companiesData.map(company => [company.id, company.name]));

                // 応募データを整形
                const formattedApplications = applicationsData.map(app => ({
                    id: app.id,
                    company: companiesMap.get(app.company_id) || '',
                    position: app.position || '',
                    status: app.status || '',
                    appliedDate: app.applied_at || '',
                    nextStep: app.next_step || '',
                    nextDate: app.next_date || '',
                    score: app.score || 0,
                    tags: app.tags || []
                }));

                setApplications(formattedApplications);
            } catch (error) {
                console.error('Error fetching applications:', error);
                setError("応募データの取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, [user]);

    const filteredApplications = applications.filter(application => {
        const matchesSearch =
            application.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            application.position.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || application.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    const headerActions = (
        <Link href="/page/dashboard/profile" className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            <UserIcon className="w-5 h-5" />
            <span>プロフィール</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <PageHeader
                title="応募一覧"
                subtitle="すべての応募状況を確認できます"
                actions={headerActions}
                showBackButton
                backUrl="/page/applicant"
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
                                    placeholder="企業名または職種で検索..."
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
                                <option value="pending">書類選考</option>
                                <option value="interview_scheduled">面接予定</option>
                                <option value="rejected">不採用</option>
                                <option value="hired">採用</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 応募一覧 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredApplications.map((application) => (
                        <div
                            key={application.id}
                            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-200"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{application.position}</h3>
                                    <p className="text-gray-600 mt-1">{application.company}</p>
                                </div>
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${application.status === "pending"
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : application.status === "interview_scheduled"
                                        ? 'bg-blue-100 text-blue-800'
                                        : application.status === "rejected"
                                            ? 'bg-red-100 text-red-800'
                                            : application.status === "hired"
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    <CheckBadgeIcon className="w-4 h-4" />
                                    <span>
                                        {application.status === "pending"
                                            ? '書類選考'
                                            : application.status === "interview_scheduled"
                                                ? '面接予定'
                                                : application.status === "rejected"
                                                    ? '不採用'
                                                    : application.status === "hired"
                                                        ? '採用'
                                                        : 'その他'}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <CalendarIcon className="w-4 h-4 mr-1" />
                                    <span>応募日: {new Date(application.appliedDate).toLocaleDateString('ja-JP')}</span>
                                </div>
                                <div className="flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-1" />
                                    <span>次のステップ: {application.nextStep}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <ChartBarIcon className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-medium text-indigo-600">スコア: {application.score}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {application.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
} 