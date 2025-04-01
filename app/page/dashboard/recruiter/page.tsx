"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import {
    UserGroupIcon,
    DocumentTextIcon,
    CalendarIcon,
    ChartBarIcon,
    BellIcon,
    ArrowRightIcon,
    ClockIcon,
    MapPinIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    UserPlusIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

interface Notification {
    id: string;
    type: 'application' | 'interview' | 'test' | 'system';
    title: string;
    content: string;
    date: string;
    isRead: boolean;
    applicantName?: string;
}

interface RecentApplicant {
    id: string;
    name: string;
    position: string;
    appliedDate: string;
    status: string;
}

interface UpcomingInterview {
    id: string;
    applicantName: string;
    position: string;
    date: string;
    time: string;
    type: 'online' | 'offline';
    location?: string;
}

export default function RecruiterDashboard() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalApplicants: 0,
        pendingReviews: 0,
        upcomingInterviews: 0,
        averageScore: 0
    });
    const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [upcomingInterviews, setUpcomingInterviews] = useState<UpcomingInterview[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // ダミーデータ
                setStats({
                    totalApplicants: 45,
                    pendingReviews: 12,
                    upcomingInterviews: 5,
                    averageScore: 85
                });

                setRecentApplicants([
                    {
                        id: "1",
                        name: "山田 太郎",
                        position: "シニアフロントエンドエンジニア",
                        appliedDate: "2024-03-15",
                        status: "interview"
                    },
                    {
                        id: "2",
                        name: "佐藤 一郎",
                        position: "バックエンドエンジニア",
                        appliedDate: "2024-03-14",
                        status: "reviewing"
                    }
                ]);

                // ダミーの今後の面接データ
                setUpcomingInterviews([
                    {
                        id: "1",
                        applicantName: "山田 太郎",
                        position: "シニアフロントエンドエンジニア",
                        date: "2024-03-20",
                        time: "14:00",
                        type: "online",
                        location: "Zoom"
                    },
                    {
                        id: "2",
                        applicantName: "鈴木 花子",
                        position: "フロントエンドエンジニア",
                        date: "2024-03-21",
                        time: "15:30",
                        type: "offline",
                        location: "本社オフィス 3F 会議室A"
                    }
                ]);

                // ダミーの通知データ
                setNotifications([
                    {
                        id: "1",
                        type: "application",
                        title: "新規応募",
                        content: "シニアフロントエンドエンジニアのポジションに新規応募がありました",
                        date: "2024-03-15T10:30:00",
                        isRead: false,
                        applicantName: "山田 太郎"
                    },
                    {
                        id: "2",
                        type: "interview",
                        title: "面接スケジュール",
                        content: "明日の面接スケジュールが確定しました",
                        date: "2024-03-15T09:00:00",
                        isRead: true,
                        applicantName: "佐藤 一郎"
                    },
                    {
                        id: "3",
                        type: "test",
                        title: "テスト結果",
                        content: "技術テストの採点が完了しました",
                        date: "2024-03-14T15:45:00",
                        isRead: false,
                        applicantName: "鈴木 花子"
                    },
                    {
                        id: "4",
                        type: "system",
                        title: "システムメンテナンス",
                        content: "システムの定期メンテナンスを実施します",
                        date: "2024-03-14T14:00:00",
                        isRead: true
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
    }, []);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <PageHeader
                title="リクルーターダッシュボード"
                subtitle="求人応募の管理と面接スケジュールの確認"
                showBackButton
                backUrl="/page/dashboard"
                actions={
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/page/dashboard/recruiter/profile"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <UserCircleIcon className="h-5 w-5 mr-2" />
                            プロフィール
                        </Link>
                        <Link
                            href="/page/dashboard/recruiter/settings"
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
                {/* 統計情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">総応募者数</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalApplicants}</p>
                            </div>
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <UserGroupIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">未レビュー</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.pendingReviews}</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <DocumentTextIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">今後の面接</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.upcomingInterviews}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <CalendarIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">平均スコア</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.averageScore}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <ChartBarIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 最近の応募者 */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">最近の応募者</h2>
                            <Link
                                href="/page/dashboard/recruiter/applicants"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                すべて表示
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Link>
                    </div>
                    <div className="space-y-4">
                        {recentApplicants.map((applicant) => (
                            <div
                                key={applicant.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                        <div>
                                        <h3 className="font-medium text-gray-900">{applicant.name}</h3>
                                        <p className="text-sm text-gray-500">{applicant.position}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${applicant.status === 'interview'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {applicant.status === 'interview' ? '面接中' : '審査中'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 今後の面接 */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">今後の面接</h2>
                            <Link
                                href="/page/dashboard/recruiter/interviews"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                すべて表示
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Link>
                                        </div>
                        <div className="space-y-4">
                            {upcomingInterviews.map((interview) => (
                                <div
                                    key={interview.id}
                                    className="p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-gray-900">{interview.applicantName}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${interview.type === 'online'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                            }`}>
                                            {interview.type === 'online' ? 'オンライン' : '対面'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{interview.position}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <CalendarIcon className="w-4 h-4 mr-1" />
                                            {new Date(interview.date).toLocaleDateString('ja-JP')}
                                        </div>
                                        <div className="flex items-center">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            {interview.time}
                                        </div>
                                        {interview.location && (
                                            <div className="flex items-center">
                                                <MapPinIcon className="w-4 h-4 mr-1" />
                                                {interview.location}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 通知 */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">通知</h2>
                            <Link
                                href="/page/dashboard/recruiter/notifications"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                すべて表示
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-start space-x-4 p-4 rounded-lg ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full ${notification.type === 'application'
                                        ? 'bg-indigo-100'
                                        : notification.type === 'interview'
                                            ? 'bg-purple-100'
                                            : notification.type === 'test'
                                                ? 'bg-green-100'
                                                : 'bg-gray-100'
                                        }`}>
                                        <BellIcon className={`w-5 h-5 ${notification.type === 'application'
                                            ? 'text-indigo-600'
                                            : notification.type === 'interview'
                                                ? 'text-purple-600'
                                                : notification.type === 'test'
                                                    ? 'text-green-600'
                                                    : 'text-gray-600'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                                        {notification.applicantName && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                対象者: {notification.applicantName}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(notification.date).toLocaleString('ja-JP')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 受験者招待 */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">受験者招待</h2>
                            <Link
                                href="/page/dashboard/recruiter/invite"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                招待する
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <div className="font-medium text-gray-900">招待済み</div>
                                    <div className="text-sm text-gray-500">5名</div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    未受験: 3名
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <div className="font-medium text-gray-900">受験済み</div>
                                    <div className="text-sm text-gray-500">2名</div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    完了
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* テスト関連セクション */}
                <div className="mt-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">テスト関連</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* スキルテスト作成 */}
                        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-2">
                                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-900">スキルテスト</h3>
                                </div>
                                <Link
                                    href="/page/dashboard/recruiter/skilltest/create"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    テストを作成
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-gray-900">技術テスト</div>
                                        <div className="text-sm text-gray-500">問題数: 10問</div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        編集可能
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-gray-900">適性テスト</div>
                                        <div className="text-sm text-gray-500">問題数: 15問</div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        公開中
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
                                    href="/page/dashboard/recruiter/skilltest/result"
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
                                        <div className="text-sm text-gray-500">平均点: 85点</div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-lg font-semibold text-indigo-600">2名</span>
                                        <span className="text-sm text-gray-500">受験済み</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-gray-900">適性テスト</div>
                                        <div className="text-sm text-gray-500">平均点: 92点</div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-lg font-semibold text-indigo-600">2名</span>
                                        <span className="text-sm text-gray-500">受験済み</span>
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