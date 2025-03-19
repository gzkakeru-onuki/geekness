"use client";
import { useState } from "react";
import { supabase } from "@/app/utils/supabase"; // Supabaseクライアントをインポート
import { useRouter } from "next/navigation"; // useRouterをインポート

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
        if(confirm("本当にアカウントを削除しますか？")){
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
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">設定</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <div className="mb-6">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="emailNotifications"
                            checked={settings.emailNotifications}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        <span className="text-gray-700">メール通知を受け取る</span>
                    </label>
                </div>
                <div className="mb-6">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="smsNotifications"
                            checked={settings.smsNotifications}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        <span className="text-gray-700">SMS通知を受け取る</span>
                    </label>
                </div>
                <div className="mb-6">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="darkMode"
                            checked={settings.darkMode}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        <span className="text-gray-700">ダークモード</span>
                    </label>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">言語選択</label>
                    <select
                        name="language"
                        value={settings.language}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="日本語">日本語</option>
                        <option value="English">English</option>
                        <option value="中文">中文</option>
                    </select>
                </div>
                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                >
                    設定を保存
                </button>
                <button
                    onClick={handleAccountDelete}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300 mt-4"
                >
                    アカウントを削除する
                </button>
            </div>
        </div>
    );
}
