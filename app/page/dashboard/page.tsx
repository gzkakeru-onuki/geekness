"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/utils/supabase";
import Link from "next/link";
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from "@/app/contexts/AuthContext";
import {
    UserGroupIcon,
    DocumentTextIcon,
    CalendarIcon,
    ChartBarIcon,
    BuildingOfficeIcon,
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    ClockIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, signOut } = useAuth();
    const [userType, setUserType] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        if (!searchParams) return;

        const type = searchParams.get("type");
        setUserType(type);

        const fetchUserData = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from(type === "applicant" ? "applicant_profiles" : "recruiter_profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;
                setUserData(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, [user, searchParams]);

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

    if (!userType) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">ユーザータイプが指定されていません</h1>
                    <Link href="/" className="text-indigo-600 hover:text-indigo-700">
                        ホームに戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm bg-white/80">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <Link href="/">
                                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                    Geekness
                                </h1>
                            </Link>
                            <p className="text-gray-600 mt-1">
                                {userType === "applicant" ? "採用希望者" : "企業担当者"}ダッシュボード
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href={`/page/dashboard/profile`}
                                className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
                            >
                                <PersonIcon className="mr-2" />
                                プロフィール
                            </Link>
                            <Link
                                href="/page/dashboard/settings"
                                className="flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300"
                            >
                                <SettingsIcon className="mr-2" />
                                設定
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-300"
                            >
                                <LogoutIcon className="mr-2" />
                                ログアウト
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userType === "applicant" ? (
                            <>
                                <Link href="/page/applicant" className="block">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">応募中の求人一覧</h2>
                                        <p className="text-gray-600 mb-4">現在応募中の求人を確認できます。</p>
                                        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                                            求人を確認
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/page/schedule" className="block">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">面接スケジュール</h2>
                                        <p className="text-gray-600 mb-4">面接のスケジュールを確認できます。</p>
                                        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                                            スケジュールを確認
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/page/skilltest/exam" className="block">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">テスト受験画面</h2>
                                        <p className="text-gray-600 mb-4">テスト受験画面を表示できます。</p>
                                        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                                            テストを受ける
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/page/skilltest/result?type=applicant" className="block">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">テスト結果画面</h2>
                                        <p className="text-gray-600 mb-4">テスト結果画面を表示できます。</p>
                                        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                                            結果を確認
                                        </div>
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/page/dashboard/recruiter" className="block">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">応募者一覧</h2>
                                        <p className="text-gray-600 mb-4">応募者の一覧を確認できます。</p>
                                        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                                            応募者を確認
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/page/dashboard/invite" className="block">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">受験者を招待</h2>
                                        <p className="text-gray-600 mb-4">新規受験者に招待メールを送信できます。</p>
                                        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                                            招待メールを送信
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/page/schedule" className="block">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">面接スケジュール管理</h2>
                                        <p className="text-gray-600 mb-4">面接のスケジュールを管理できます。</p>
                                        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                                            スケジュールを管理
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/page/skilltest/create" className="block">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">スキルテスト作成</h2>
                                        <p className="text-gray-600 mb-4">スキルテストを作成できます。</p>
                                        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                                            テストを作成
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/page/skilltest/result?type=recruiter" className="block">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">テスト結果画面</h2>
                                        <p className="text-gray-600 mb-4">テスト結果画面を表示できます。</p>
                                        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                                            結果を確認
                                        </div>
                                    </div>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
