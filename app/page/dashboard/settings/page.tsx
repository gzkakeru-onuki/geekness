"use client";
import { useState } from "react";
import { supabase } from "@/app/utils/supabase"; // Supabaseクライアントをインポート
import { useRouter } from "next/navigation"; // useRouterをインポート
import Link from "next/link";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LanguageIcon from '@mui/icons-material/Language';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';

export default function Settings() {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        darkMode: false,
        language: "日本語",
    });

    const router = useRouter(); // useRouterを初期化

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, type, checked, value } = e.target as HTMLInputElement | HTMLSelectElement & { checked: boolean };
        setSettings((prevSettings) => ({
            ...prevSettings,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSave = () => {
        // 設定の保存処理をここに追加
        console.log("設定を保存しました", settings);
    };

    const handleAccountDelete = async () => {
        if (confirm("本当にアカウントを削除しますか？")) {
            const { data: user, error: userError } = await supabase.auth.getUser();

            if (userError) {
                console.error("Error fetching user:", userError);
                return;
            }

            if (user) {
                // applicant_profilesテーブルを確認
                const { data: applicantData, error: applicantError } = await supabase
                    .from('applicant_profiles')
                    .delete()
                    .eq('id', user.user?.id);

                if (applicantError) {
                    console.error("プロファイル削除エラー:", applicantError);
                    return;
                }

                // recruiter_profilesテーブルを確認
                const { data: recruiterData, error: recruiterError } = await supabase
                    .from('recruiter_profiles')
                    .delete()
                    .eq('id', user.user?.id);

                if (recruiterError) {
                    console.error("プロファイル削除エラー:", recruiterError);
                    return;
                }

                // APIルートを呼び出してユーザーを削除
                const response = await fetch('/api/deleteUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: user.user?.id }),
                });

                if (!response.ok) {
                    console.error("ユーザー削除エラー:", await response.json());
                } else {
                    console.log("アカウント削除成功");
                    alert("アカウントが削除されました");
                    router.push("/"); // ホームページにリダイレクト
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6">
                    <div className="flex items-center mb-6">
                        <Link
                            href="/page/dashboard"
                            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                        >
                            <ArrowBackIcon className="mr-2" />
                            ダッシュボードに戻る
                        </Link>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                            設定
                        </h1>
                        <p className="text-sm text-gray-600">
                            アカウントの設定を管理できます
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 通知設定 */}
                        <div className="bg-gradient-to-br from-white to-indigo-50 p-4 rounded-xl shadow-lg border border-indigo-100">
                            <div className="flex items-center mb-3">
                                <NotificationsIcon className="text-indigo-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-800">通知設定</h2>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center p-3 bg-white rounded-lg border border-indigo-100 hover:border-indigo-200 transition-colors duration-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="emailNotifications"
                                        checked={settings.emailNotifications}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">メール通知</span>
                                </label>
                                <label className="flex items-center p-3 bg-white rounded-lg border border-indigo-100 hover:border-indigo-200 transition-colors duration-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="smsNotifications"
                                        checked={settings.smsNotifications}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">SMS通知</span>
                                </label>
                            </div>
                        </div>

                        {/* 表示設定 */}
                        <div className="bg-gradient-to-br from-white to-indigo-50 p-4 rounded-xl shadow-lg border border-indigo-100">
                            <div className="flex items-center mb-3">
                                <DarkModeIcon className="text-indigo-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-800">表示設定</h2>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center p-3 bg-white rounded-lg border border-indigo-100 hover:border-indigo-200 transition-colors duration-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="darkMode"
                                        checked={settings.darkMode}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">ダークモード</span>
                                </label>
                            </div>
                        </div>

                        {/* 言語設定 */}
                        <div className="bg-gradient-to-br from-white to-indigo-50 p-4 rounded-xl shadow-lg border border-indigo-100">
                            <div className="flex items-center mb-3">
                                <LanguageIcon className="text-indigo-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-800">言語設定</h2>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-indigo-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">表示言語</label>
                                <select
                                    name="language"
                                    value={settings.language}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                >
                                    <option value="日本語">日本語</option>
                                    <option value="English">English</option>
                                    <option value="中文">中文</option>
                                </select>
                            </div>
                        </div>

                        {/* アカウント削除 */}
                        <div className="bg-gradient-to-br from-white to-red-50 p-4 rounded-xl shadow-lg border border-red-100">
                            <div className="flex items-center mb-3">
                                <DeleteForeverIcon className="text-red-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-800">アカウント削除</h2>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                                アカウントを削除すると、すべてのデータが完全に削除され、復元できなくなります。
                            </p>
                            <button
                                onClick={handleAccountDelete}
                                className="w-full py-2 px-3 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors duration-300 flex items-center justify-center"
                            >
                                <DeleteForeverIcon className="mr-1 text-sm" />
                                アカウントを削除
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full mt-6 py-2.5 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white"
                    >
                        <SaveIcon className="mr-1" />
                        設定を保存
                    </button>
                </div>
            </div>
        </div>
    );
}
