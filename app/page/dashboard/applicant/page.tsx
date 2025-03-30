"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import {
    UserCircleIcon,
    CalendarIcon,
    BellIcon,
    DocumentTextIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
    totalApplications: number;
    pendingReviews: number;
    upcomingInterviews: number;
    completedInterviews: number;
}

interface RecentNotification {
    id: string;
    title: string;
    message: string;
    date: string;
    type: "interview" | "application" | "profile";
}

export default function ApplicantDashboardPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalApplications: 0,
        pendingReviews: 0,
        upcomingInterviews: 0,
        completedInterviews: 0
    });
    const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;

            try {
                // デモ用のデータ
                setStats({
                    totalApplications: 3,
                    pendingReviews: 1,
                    upcomingInterviews: 2,
                    completedInterviews: 1
                });

                setRecentNotifications([
                    {
                        id: "1",
                        title: "面接スケジュールが確定しました",
                        message: "株式会社〇〇との面接が3月20日14:00に確定しました。",
                        date: "2024-03-15",
                        type: "interview"
                    },
                    {
                        id: "2",
                        title: "応募書類が確認されました",
                        message: "株式会社△△があなたの応募書類を確認しました。",
                        date: "2024-03-14",
                        type: "application"
                    },
                    {
                        id: "3",
                        title: "プロフィールの更新を推奨",
                        message: "スキル情報を更新すると、より多くの企業からスカウトを受けられる可能性があります。",
                        date: "2024-03-13",
                        type: "profile"
                    }
                ]);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError("データの取得中にエラーが発生しました。");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

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
                title="応募者ダッシュボード"
                subtitle="あなたの応募状況と面接スケジュールを管理します"
                showBackButton
                backUrl="/page/dashboard"
                className="bg-white/80 backdrop-blur-lg border-b border-gray-200"
                actions={
                    <Link
                        href="/page/dashboard/profile"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <PencilSquareIcon className="w-5 h-5 mr-2" />
                        プロフィールを編集
                    </Link>
                }
            />

            <main className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* 統計情報 */}
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">応募総数</div>
                                <div className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <DocumentTextIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">審査中</div>
                                <div className="text-2xl font-semibold text-gray-900">{stats.pendingReviews}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <CalendarIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">面接予定</div>
                                <div className="text-2xl font-semibold text-gray-900">{stats.upcomingInterviews}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <CalendarIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">完了済み</div>
                                <div className="text-2xl font-semibold text-gray-900">{stats.completedInterviews}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 最近の通知 */}
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <BellIcon className="w-5 h-5 text-gray-400" />
                                <h2 className="text-lg font-medium text-gray-900">最近の通知</h2>
                            </div>
                            <Link
                                href="/page/dashboard/applicant/notifications"
                                className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                                すべて表示
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex-shrink-0">
                                        {notification.type === "interview" ? (
                                            <CalendarIcon className="w-5 h-5 text-blue-500" />
                                        ) : notification.type === "application" ? (
                                            <DocumentTextIcon className="w-5 h-5 text-yellow-500" />
                                        ) : (
                                            <UserCircleIcon className="w-5 h-5 text-green-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900">
                                            {notification.title}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {notification.message}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {new Date(notification.date).toLocaleDateString('ja-JP')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 面接スケジュール */}
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                                <h2 className="text-lg font-medium text-gray-900">面接スケジュール</h2>
                            </div>
                            <Link
                                href="/page/dashboard/applicant/interviews"
                                className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                                すべて表示
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {stats.upcomingInterviews > 0 ? (
                                <div className="text-sm text-gray-500">
                                    次の面接は3月20日14:00に予定されています。
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">
                                    現在、予定されている面接はありません。
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 