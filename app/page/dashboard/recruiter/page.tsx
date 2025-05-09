"use client";
import { useState, useEffect, useCallback } from "react";
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
import { supabase } from "@/app/utils/supabase";

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

interface TestResult {
    id: string;
    title: string;
    applicant_name: string;
    score: number;
    completed_at: string;
}

interface TestResponseData {
    id: string;
    score: number;
    updated_at: string;
    applicant_id: string;
    skill_tests: {
        id: string;
        title: string;
        company_id: string;
    };
}

interface ApplicantProfile {
    id: string;
    applicant_firstname: string;
    applicant_lastname: string;
}

interface Job {
    id: string;
    title: string;
    status: 'draft' | 'published' | 'closed';
    created_at: string;
}

// 日付フォーマット用のヘルパー関数を追加
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
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([]);
    const [upcomingInterviews, setUpcomingInterviews] = useState<UpcomingInterview[]>([]);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [recentJobs, setRecentJobs] = useState<Job[]>([]);

    const fetchTestResults = useCallback(async () => {
        try {
            // まず企業のIDを取得
            const { data: companyData, error: companyError } = await supabase
                .from('recruiter_profiles')
                .select('id, company_id')
                .eq('id', user?.id)
                .single();

            if (companyError) {
                console.error('Error fetching company data:', companyError);
                return;
            }

            // 企業のテスト結果を取得
            const { data: resultsData, error: resultsError } = await supabase
                .from('test_responses')
                .select(`
                    id,
                    score,
                    updated_at,
                    applicant_id,
                    skill_tests!inner (
                        id,
                        title,
                        company_id
                    )
                `)
                .eq('skill_tests.company_id', companyData.company_id)
                .eq('skill_tests.status', false)
                .order('updated_at', { ascending: false })
                .limit(5);

            if (resultsError || !resultsData) {
                console.error('Error fetching test results:', resultsError);
                return;
            }

            // テスト結果の応募者情報を取得
            const applicantIds = resultsData.map(result => result.applicant_id).filter(Boolean);
            const { data: applicantData, error: applicantError } = await supabase
                .from('applicant_profiles')
                .select('id, applicant_firstname, applicant_lastname')
                .in('id', applicantIds);

            if (applicantError || !applicantData) {
                console.error('Error fetching applicant data:', applicantError);
                return;
            }

            // 応募者情報をマップに変換
            const applicantMap = new Map(applicantData.map(applicant => [applicant.id, applicant]));

            const formattedResults: TestResult[] = resultsData.map(result => {
                const applicant = applicantMap.get(result.applicant_id);
                return {
                    id: result.id,
                    title: result.skill_tests.title,
                    applicant_name: applicant ? `${applicant.applicant_lastname} ${applicant.applicant_firstname}` : '不明な応募者',
                    score: result.score || 0,
                    completed_at: result.updated_at || ''
                };
            });

            setTestResults(formattedResults);
        } catch (error) {
            console.error('Error fetching test results:', error);
        }
    }, [user?.id]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;

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

                // 企業IDの取得
                const { data: companyData, error: companyError } = await supabase
                    .from('recruiter_profiles')
                    .select('company_id')
                    .eq('id', user.id)
                    .single();

                if (companyError) throw companyError;

                // 最新の求人情報を4件取得
                const { data: jobsData, error: jobsError } = await supabase
                    .from('jobs')
                    .select('id, title, status, created_at')
                    .eq('company_id', companyData.company_id)
                    .order('created_at', { ascending: false })
                    .limit(4);

                if (jobsError) throw jobsError;

                setRecentJobs(jobsData || []);

                await fetchTestResults();
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError("データの取得中にエラーが発生しました。");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, fetchTestResults]);

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

                    {/* 求人管理 */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">求人管理</h2>
                            <Link
                                href="/page/dashboard/recruiter/jobs"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                全て表示
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentJobs.map((job) => (
                                <Link
                                    key={job.id}
                                    href={`/page/dashboard/recruiter/jobs/${job.id}/edit`}
                                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900">{job.title}</div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                作成日: {formatDate(job.created_at)}
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${job.status === 'published' ? 'bg-green-100 text-green-800' :
                                            job.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {job.status === 'published' ? '公開中' :
                                                job.status === 'draft' ? '下書き' : '終了'}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* テスト関連セクション */}
                <div className="mt-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">テスト関連</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* スキルテスト作成 */}
                        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-indigo-100 p-2 rounded-lg">
                                        <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">スキルテスト</h3>
                                        <p className="text-sm text-gray-500">技術スキルを評価するテストを作成</p>
                                    </div>
                                </div>
                                <Link
                                    href="/page/dashboard/recruiter/skilltest/create"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                                >
                                    テストを作成
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm font-medium text-gray-900">作成済みテスト</div>
                                    <div className="text-2xl font-bold text-indigo-600 mt-1">12</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm font-medium text-gray-900">受験者数</div>
                                    <div className="text-2xl font-bold text-indigo-600 mt-1">45</div>
                                </div>
                            </div>
                        </div>

                        {/* テスト結果 */}
                        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <ChartBarIcon className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">テスト結果</h3>
                                        <p className="text-sm text-gray-500">受験者のスコアを確認</p>
                                    </div>
                                </div>
                                <Link
                                    href="/page/dashboard/recruiter/skilltest/result"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                                >
                                    すべて表示
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {testResults.length > 0 ? (
                                    testResults.map((result) => (
                                        <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                                    <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{result.title}</div>
                                                    <div className="text-sm text-gray-500">{result.applicant_name}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="text-lg font-semibold text-indigo-600">{result.score}点</div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(result.completed_at).toLocaleDateString('ja-JP')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <div className="text-sm text-gray-500">
                                            現在、テスト結果はありません。
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}