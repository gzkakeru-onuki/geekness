"use client";
import { useState } from "react";

export default function Settings() {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        darkMode: false,
        language: "日本語",
    });

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
            </div>
        </div>
    );
}
