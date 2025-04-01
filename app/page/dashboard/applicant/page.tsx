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
    PencilSquareIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    ArrowRightIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

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

interface CompanyApplication {
    id: string;
    companyName: string;
    position: string;
    status: "pending" | "reviewing" | "interview" | "rejected" | "accepted";
    lastUpdated: string;
}

export default function ApplicantDashboardPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalApplications: 0,
        pendingReviews: 0,
        upcomingInterviews: 0,
        completedInterviews: 0
    });
    const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([]);
    const [applications, setApplications] = useState<CompanyApplication[]>([]);

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

                setApplications([
                    {
                        id: "1",
                        companyName: "株式会社〇〇",
                        position: "フロントエンドエンジニア",
                        status: "interview",
                        lastUpdated: "2024-03-15"
                    },
                    {
                        id: "2",
                        companyName: "株式会社△△",
                        position: "バックエンドエンジニア",
                        status: "reviewing",
                        lastUpdated: "2024-03-14"
                    },
                    {
                        id: "3",
                        companyName: "株式会社□□",
                        position: "フルスタックエンジニア",
                        status: "pending",
                        lastUpdated: "2024-03-13"
                    }
                ]);

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

    const handleSignOut = async () => {
        try {
            const confirmed = confirm("ログアウトしますか？");
            if (confirmed) {
                await signOut();
                router.push("/");
            }
        } catch (error) {
            console.error("Error signing out:", error);
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

    const getStatusColor = (status: CompanyApplication["status"]) => {
        switch (status) {
            case "pending":
                return "bg-gray-100 text-gray-800";
            case "reviewing":
                return "bg-yellow-100 text-yellow-800";
            case "interview":
                return "bg-blue-100 text-blue-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            case "accepted":
                return "bg-green-100 text-green-800";
        }
    };

    const getStatusLabel = (status: CompanyApplication["status"]) => {
        switch (status) {
            case "pending":
                return "応募済み";
            case "reviewing":
                return "審査中";
            case "interview":
                return "面接中";
            case "rejected":
                return "不採用";
            case "accepted":
                return "採用";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <PageHeader
                title="応募者ダッシュボード"
                subtitle="あなたの求人応募状況を確認できます"
                showBackButton
                backUrl="/page/dashboard"
                actions={
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/page/dashboard/applicant/profile"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <UserCircleIcon className="h-5 w-5 mr-2" />
                            プロフィール
                        </Link>
                        <Link
                            href="/page/dashboard/applicant/settings"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            <Cog6ToothIcon className="h-5 w-5 mr-2" />
                            設定
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                            ログアウト
                        </button>
                    </div>
                }
            />

            <main className="max-w-7xl mx-auto p-6 mt-32">
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
                    <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">通知</h2>
                            <Link
                                href="/page/dashboard/applicant/notifications"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                すべて表示
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
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
                    <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">面接スケジュール</h2>
                            <Link
                                href="/page/dashboard/applicant/interviews"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                すべて表示
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
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

                {/* 応募中の企業 */}
                <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">応募中の企業</h2>
                        <Link
                            href="/page/dashboard/applicant/applications"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            すべて表示
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {applications.map((application) => (
                            <div
                                key={application.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {application.companyName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {application.position}
                                    </div>
                                </div>
                                    <div className="flex items-center space-x-4">
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                        {getStatusLabel(application.status)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(application.lastUpdated).toLocaleDateString('ja-JP')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* テスト関連セクション */}
                <div className="mt-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">テスト関連</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 受験予定のテスト */}
                        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-2">
                                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-900">受験予定のテスト</h3>
                                </div>
                                <Link
                                    href="/page/dashboard/applicant/skilltest/exam"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    テストを受験
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-gray-900">技術テスト</div>
                                        <div className="text-sm text-gray-500">株式会社ABC</div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        未受験
                                    </span>
                                        </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                        <div className="font-medium text-gray-900">適性テスト</div>
                                        <div className="text-sm text-gray-500">株式会社XYZ</div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        完了
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* テスト結果 */}
                        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-2">
                                    <ChartBarIcon className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-900">テスト結果</h3>
                                </div>
                                <Link
                                    href="/page/dashboard/applicant/skilltest/result"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    すべて表示
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Link>
                                        </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-gray-900">技術テスト</div>
                                        <div className="text-sm text-gray-500">株式会社ABC</div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-lg font-semibold text-indigo-600">85点</span>
                                        <span className="text-sm text-gray-500">2024/03/15</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-gray-900">適性テスト</div>
                                        <div className="text-sm text-gray-500">株式会社XYZ</div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-lg font-semibold text-indigo-600">92点</span>
                                        <span className="text-sm text-gray-500">2024/03/14</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 