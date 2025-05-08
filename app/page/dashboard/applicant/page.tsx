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
    ChartBarIcon,
    BuildingOfficeIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase";

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

interface Company {
    name: string;
}

interface SkillTestWithCompany {
    id: string;
    title: string;
    company_id: string;
    companies: Company;
}

interface Test {
    id: string;
    title: string;
    company_name?: string;
    status: 'upcoming' | 'available';
    scheduled_date?: string;
}

interface TestResult {
    id: string;
    title: string;
    company_name: string;
    score: number;
    updated_at: string;
}

interface JobListing {
    id: string;
    title: string;
    company_name: string;
    status: string;
    created_at: string;
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
    const [upcomingTests, setUpcomingTests] = useState<Test[]>([]);
    const [availableTests, setAvailableTests] = useState<Test[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [jobListings, setJobListings] = useState<JobListing[]>([]);

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

                // 応募中(pending)の求人を取得
                const { data: appData, error: appError } = await supabase
                    .from('applications')
                    .select(`
                        id,
                        job_id,
                        company_id,
                        status,
                        applied_at,
                        updated_at,
                        companies (
                            id,
                            name
                        )
                    `)
                    .eq('applicant_id', user.id)
                    .eq('status', 'pending')
                    .order('applied_at', { ascending: false })
                    .limit(4);

                if (appError) {
                    console.error('応募データ取得エラー:', appError);
                    throw appError;
                }

                // 有効なjob_idのみをフィルタリング
                const validJobIds = appData
                    .filter(app => app.job_id !== null && app.job_id !== undefined)
                    .map(app => app.job_id);

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
                    const jobsMap = new Map(jobsData.map(job => [job.id, job.title]));

                    // 応募データの整形
                    const formattedApplications = appData.map(app => {
                        // companiesが配列ではなくオブジェクトとして返ってくる場合の対応
                        const companyName = app.companies?.name ||
                            (Array.isArray(app.companies) && app.companies[0]?.name) ||
                            '不明な企業';

                        return {
                            id: app.id,
                            companyName: companyName,
                            position: app.job_id ? (jobsMap.get(app.job_id) || '不明な職種') : '求人情報なし',
                            status: app.status as "pending" | "reviewing" | "interview" | "rejected" | "accepted",
                            lastUpdated: app.updated_at || app.applied_at
                        };
                    });

                    setApplications(formattedApplications);
                } else {
                    // 有効なjob_idが存在しない場合は空配列を設定
                    setApplications([]);
                }

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

                await fetchTests(user.id);
                await fetchTestResults(user.id);
                await fetchJobListings();
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError("データの取得中にエラーが発生しました。");
            } finally {
                setIsLoading(false);
            }
        };

        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };

        fetchUser();
        fetchDashboardData();
    }, [user]);

    const fetchTests = async (userId: string) => {
        try {
            // 受験可能なテストを取得（statusがtrueのもの）
            const { data: availableData, error: availableError } = await supabase
                .from('skill_tests')
                .select(`
                    id,
                    title,
                    company_id,
                    companies!inner (
                        name
                    )
                `)
                .eq('status', true)
                .order('created_at', { ascending: false })
                .limit(5);

            if (availableError) {
                console.error('Error fetching available tests:', availableError);
                return;
            }

            // テスト一覧を整形
            const tests = availableData as unknown as SkillTestWithCompany[];

            // 受験予定（申し込み済み）のテスト一覧を取得
            const { data: applicantTests, error: applicantError } = await supabase
                .from('test_applicants')
                .select(`
                    id,
                    test_id,
                    status,
                    scheduled_date,
                    skill_tests (
                        id,
                        title,
                        company_id,
                        companies (
                            name
                        )
                    )
                `)
                .eq('applicant_id', userId)
                .eq('status', 'scheduled')
                .order('scheduled_date', { ascending: true });

            if (applicantError) {
                console.error('Error fetching applicant tests:', applicantError);
                return;
            }

            // 受験予定のテスト一覧を整形
            const upcomingTestsList = applicantTests?.map(test => {
                const testInfo = test.skill_tests;
                const companyName = testInfo?.companies?.name ||
                    (Array.isArray(testInfo?.companies) && testInfo.companies[0]?.name) ||
                    '不明な企業';

                return {
                    id: test.test_id,
                    title: testInfo?.title || '不明なテスト',
                    company_name: companyName,
                    status: 'upcoming' as const,
                    scheduled_date: test.scheduled_date
                };
            }) || [];

            setUpcomingTests(upcomingTestsList);

            // 受験可能なテスト一覧（ユーザーがまだ申し込んでいないテスト）
            const appliedTestIds = new Set(applicantTests?.map(test => test.test_id) || []);
            const availableTestsList = tests
                .filter(test => !appliedTestIds.has(test.id))
                .map(test => ({
                    id: test.id,
                    title: test.title,
                    company_name: test.companies?.name || '不明な企業',
                    status: 'available' as const
                }));

            setAvailableTests(availableTestsList);
        } catch (error) {
            console.error('Error fetching tests:', error);
        }
    };

    const fetchTestResults = async (userId: string) => {
        try {
            // ユーザーが受験完了したテスト結果
            const { data: responseData, error: responseError } = await supabase
                .from('test_responses')
                .select(`
                    id,
                    test_id,
                    score,
                    updated_at,
                    skill_tests (
                        id,
                        title,
                        company_id,
                        companies (
                            name
                        )
                    )
                `)
                .eq('applicant_id', userId)
                .order('updated_at', { ascending: false })
                .limit(5);

            if (responseError) {
                console.error('Error fetching test results:', responseError);
                return;
            }

            // テスト結果を整形
            const resultsList = responseData.map(response => {
                const testInfo = response.skill_tests;
                const companyName = testInfo?.companies?.name ||
                    (Array.isArray(testInfo?.companies) && testInfo.companies[0]?.name) ||
                    '不明な企業';

                return {
                    id: response.test_id,
                    title: testInfo?.title || '不明なテスト',
                    company_name: companyName,
                    score: response.score || 0,
                    updated_at: response.updated_at
                };
            });

            setTestResults(resultsList);
        } catch (error) {
            console.error('Error fetching test results:', error);
        }
    };

    const fetchJobListings = async () => {
        try {
            // 公開中の求人を取得
            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select(`
                    id,
                    title,
                    status,
                    created_at,
                    company_id,
                    companies (
                        name
                    )
                `)
                .eq('status', 'published')
                .order('created_at', { ascending: false })
                .limit(4);

            if (jobsError) {
                console.error('Error fetching job listings:', jobsError);
                return;
            }

            // 求人情報の整形
            const formattedJobs = jobsData?.map(job => {
                // companiesが配列ではなくオブジェクトとして返ってくる場合の対応
                const companyName = job.companies?.name ||
                    (Array.isArray(job.companies) && job.companies[0]?.name) ||
                    '企業名なし';

                return {
                    id: job.id,
                    title: job.title,
                    company_name: companyName,
                    status: job.status,
                    created_at: job.created_at
                };
            }) || [];

            setJobListings(formattedJobs);
        } catch (error) {
            console.error('Error fetching job listings:', error);
        }
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
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

            <main className="flex-1 max-w-7xl mx-auto p-6 w-full">
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
                                            {formatDate(notification.date)}
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
                        {applications.length > 0 ? (
                            applications.map((application) => (
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
                                            {formatDate(application.lastUpdated)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <div className="text-sm text-gray-500">
                                    現在、応募中の企業はありません。
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 求人募集中の企業 */}
                <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">求人募集中の企業</h2>
                        <Link
                            href="/page/dashboard/applicant/jobs"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            すべて表示
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {jobListings.length > 0 ? (
                            jobListings.map((job) => (
                                <Link
                                    key={job.id}
                                    href={`/page/dashboard/applicant/jobs/${job.id}`}
                                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <BriefcaseIcon className="w-4 h-4 text-indigo-500" />
                                                <div className="font-medium text-gray-900">{job.title}</div>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                <div className="flex items-center space-x-2">
                                                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                                                    <span>{job.company_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatDate(job.created_at)}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <div className="text-sm text-gray-500">
                                    現在、募集中の求人はありません。
                                </div>
                            </div>
                        )}
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
                                    すべて表示
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {availableTests.length > 0 ? (
                                    availableTests.map((test) => (
                                        <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-medium text-gray-900">{test.title}</div>
                                                <div className="text-sm text-gray-500">{test.company_name}</div>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                                未受験
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        現在、受験予定のテストはありません。
                                    </div>
                                )}
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
                                {testResults.length > 0 ? (
                                    testResults.map((result) => (
                                        <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-medium text-gray-900">{result.title}</div>
                                                <div className="text-sm text-gray-500">{result.company_name}</div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-lg font-semibold text-indigo-600">{result.score}点</span>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(result.updated_at)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        現在、テスト結果はありません。
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* スキルチャレンジテスト */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">スキルチャレンジテスト</h3>
                            </div>
                            <Link
                                href="/page/dashboard/applicant/skilltest/challenge"
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                            >
                                すべて表示
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* チャレンジテストカード */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border border-purple-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        開催中
                                    </span>
                                    <span className="text-sm text-gray-500">残り3日</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">フロントエンドチャレンジ</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Reactを使用したモダンなUIコンポーネントの実装に挑戦
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-purple-600">難易度:</span>
                                        <span className="text-sm text-gray-600">中級</span>
                                    </div>
                                    <Link
                                        href="/page/dashboard/applicant/skilltest/challenge/1"
                                        className="inline-flex items-center px-4 py-2 bg-white text-purple-600 text-sm font-medium rounded-lg hover:bg-purple-50 transition-colors border border-purple-200"
                                    >
                                        挑戦する
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border border-purple-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        開催予定
                                    </span>
                                    <span className="text-sm text-gray-500">5日後開始</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">バックエンドチャレンジ</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Node.jsとExpressを使用したRESTful APIの設計と実装
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-purple-600">難易度:</span>
                                        <span className="text-sm text-gray-600">上級</span>
                                    </div>
                                    <button
                                        disabled
                                        className="inline-flex items-center px-4 py-2 bg-white text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed border border-gray-200"
                                    >
                                        近日公開
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border border-purple-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        終了
                                    </span>
                                    <span className="text-sm text-gray-500">結果発表済み</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">データベースチャレンジ</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    PostgreSQLを使用した効率的なデータベース設計とクエリ最適化
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-purple-600">難易度:</span>
                                        <span className="text-sm text-gray-600">初級</span>
                                    </div>
                                    <Link
                                        href="/page/dashboard/applicant/skilltest/challenge/3"
                                        className="inline-flex items-center px-4 py-2 bg-white text-purple-600 text-sm font-medium rounded-lg hover:bg-purple-50 transition-colors border border-purple-200"
                                    >
                                        結果を見る
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 