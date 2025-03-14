"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';

function DashboardContent() {
    const searchParams = useSearchParams();
    const [userType, setUserType] = useState<"applicant" | "recruiter">("applicant");
    const router = useRouter();

    useEffect(() => {
        // URLパラメータからユーザー種別を取得
        const type = searchParams.get("type");
        if (type === "recruiter") {
            setUserType("recruiter");
        } else {
            setUserType("applicant");
        }
    }, [searchParams]);

    const handleLogout = () => {
        // ログアウト処理
        console.log("ログアウトします");
        // 本当にログアウトするか確認
        const confirmLogout = window.confirm("本当にログアウトしますか？");
        if (confirmLogout) {
            // ログアウト処理を実行
            console.log("ログアウトします");
            // ログアウト後のリダイレクト
            router.push("/");
        }
    };

    return (
        <div className="flex h-screen">
            <div className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-transform transform md:relative md:translate-x-0 md:w-64`}>
                <nav className="p-6">
                    <ul className="space-y-4">
                        <li>
                            <a href="/" className="flex items-center py-2 px-4 rounded hover:bg-gray-700">
                                <HomeIcon className="mr-2" />Home
                            </a>
                        </li>
                        <li>
                            <Link href="/page/dashboard/profile" className="flex items-center py-2 px-4 rounded hover:bg-gray-700">
                                <PersonIcon className="mr-2" />Profile
                            </Link>
                        </li>
                        <li>
                            <Link href="/page/dashboard/settings" className="flex items-center py-2 px-4 rounded hover:bg-gray-700">
                                <SettingsIcon className="mr-2" />Settings
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full text-left py-2 px-4 rounded hover:bg-gray-700"
                            >
                                <LogoutIcon className="mr-2" />Logout
                            </button>                            
                        </li>
                    </ul>
                </nav>
            </div>

            {/* メインコンテンツ */}
            <div className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 p-8 ml-0">
                {/* パンくずリスト */}
                <div className="mb-4 text-gray-600">
                    <Link href="/"><span className="text-blue-600">ホーム</span></Link> &gt; <span className="text-blue-600">{userType === "applicant" ? "応募者ダッシュボード" : "採用担当者ダッシュボード"}</span>
                </div>

                <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">ダッシュボード</h1>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userType === "applicant" && (
                        <>
                            <Link href="/page/dashboard/recruiter" className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <h2 className="text-2xl font-bold mb-2 text-blue-800">応募中の求人一覧</h2>
                                <p className="text-gray-700">現在応募中の求人を確認できます。</p>
                            </Link>
                            <Link href="/page/schedule" className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <h2 className="text-2xl font-bold mb-2 text-blue-800">面接スケジュール</h2>
                                <p className="text-gray-700">面接のスケジュールを確認できます。</p>
                            </Link>
                            <Link href="/page/skilltest/exam" className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <h2 className="text-2xl font-bold mb-2 text-blue-800">テスト受験画面</h2>
                                <p className="text-gray-700">テスト受験画面を表示できます。</p>
                            </Link>
                            <Link href="/page/skilltest/result?type=applicant" className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <h2 className="text-2xl font-bold mb-2 text-blue-800">テスト結果画面</h2>
                                <p className="text-gray-700">テスト結果画面を表示できます。</p>
                            </Link>
                        </>
                    )}

                    {userType === "recruiter" && (
                        <>
                            <Link href="/page/applicant" className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <h2 className="text-2xl font-bold mb-2 text-green-800">応募者一覧</h2>
                                <p className="text-gray-700">応募者の一覧を確認できます。</p>
                            </Link>
                            <Link href="/page/schedule" className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <h2 className="text-2xl font-bold mb-2 text-green-800">面接スケジュール管理</h2>
                                <p className="text-gray-700">面接のスケジュールを管理できます。</p>
                            </Link>
                            <Link href="/page/skilltest/create" className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <h2 className="text-2xl font-bold mb-2 text-green-800">スキルテスト作成</h2>
                                <p className="text-gray-700">スキルテストを作成できます。</p>
                            </Link>
                            <Link href="/page/skilltest/result?type=recruiter" className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <h2 className="text-2xl font-bold mb-2 text-green-800">テスト結果画面</h2>
                                <p className="text-gray-700">テスト結果画面を表示できます。</p>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
