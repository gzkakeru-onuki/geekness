"use client";
import { useState, useEffect, useCallback } from "react";
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
    MagnifyingGlassIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

interface Interview {
    id: string;
    applicantName: string;
    date: string;
    time: string;
    type: string;
    status: string;
}

// デフォルトの面接データ
const defaultInterviews: Interview[] = [
    {
        id: "1",
        applicantName: "山田 太郎",
        date: "2024-03-25",
        time: "10:00",
        type: "一次面接",
        status: "scheduled"
    },
    {
        id: "2",
        applicantName: "鈴木 花子",
        date: "2024-03-25",
        time: "14:00",
        type: "二次面接",
        status: "scheduled"
    },
    {
        id: "3",
        applicantName: "佐藤 一郎",
        date: "2024-03-26",
        time: "11:00",
        type: "最終面接",
        status: "completed"
    },
    {
        id: "4",
        applicantName: "田中 美咲",
        date: "2024-03-26",
        time: "15:00",
        type: "一次面接",
        status: "cancelled"
    }
];

export default function RecruiterInterviewsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const fetchInterviews = useCallback(async () => {
        if (!user) {
            setError("ログインが必要です。");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // デフォルトデータを使用
            setInterviews(defaultInterviews);
        } catch (error) {
            console.error('Error fetching interviews:', error);
            setError("面接データの取得中にエラーが発生しました。");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews]);

    const filteredInterviews = interviews.filter(interview => {
        const matchesSearch = interview.applicantName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchInterviews} />;
    }

    const headerActions = (
        <div className="flex items-center space-x-4">
            <Link
                href="/page/dashboard/recruiter/interviews/new"
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
                <PlusIcon className="w-5 h-5" />
                <span>面接スケジュール作成</span>
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <PageHeader
                title="面接スケジュール"
                subtitle="面接のスケジュールを管理できます"
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
                                <option value="scheduled">予定済み</option>
                                <option value="completed">完了</option>
                                <option value="cancelled">キャンセル</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 面接一覧 */}
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                    <div className="space-y-4">
                        {filteredInterviews.map((interview) => (
                            <div
                                key={interview.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-indigo-100 p-2 rounded-full">
                                        <CalendarIcon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{interview.applicantName}</h3>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <span>{new Date(interview.date).toLocaleDateString('ja-JP')}</span>
                                            <span>•</span>
                                            <span>{interview.time}</span>
                                            <span>•</span>
                                            <span>{interview.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${interview.status === 'scheduled'
                                    ? 'bg-blue-100 text-blue-800'
                                    : interview.status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {interview.status === 'scheduled'
                                        ? '予定済み'
                                        : interview.status === 'completed'
                                            ? '完了'
                                            : 'キャンセル'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
} 