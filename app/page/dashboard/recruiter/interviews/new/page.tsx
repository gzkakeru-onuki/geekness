"use client";
import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import {
    CalendarIcon,
    ClockIcon,
    UserGroupIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface FormData {
    applicantName: string;
    date: string;
    time: string;
    type: string;
}

export default function NewInterviewPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        applicantName: "",
        date: "",
        time: "",
        type: "一次面接"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError("ログインが必要です。");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // デモ用の処理
            console.log("面接スケジュール作成:", formData);
            // 実際の実装ではここでSupabaseにデータを保存

            // 成功時の処理
            window.location.href = "/page/dashboard/recruiter/interviews";
        } catch (error) {
            console.error('Error creating interview:', error);
            setError("面接スケジュールの作成中にエラーが発生しました。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <PageHeader
                title="面接スケジュール作成"
                subtitle="新しい面接スケジュールを作成します"
                showBackButton
                backUrl="/page/dashboard/recruiter/interviews"
                className="bg-white/80 backdrop-blur-lg border-b border-gray-200"
            />

            <main className="max-w-2xl mx-auto p-6">
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 応募者名 */}
                        <div>
                            <label htmlFor="applicantName" className="block text-sm font-medium text-gray-700 mb-1">
                                応募者名
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserGroupIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="applicantName"
                                    name="applicantName"
                                    value={formData.applicantName}
                                    onChange={handleChange}
                                    required
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="例：山田 太郎"
                                />
                            </div>
                        </div>

                        {/* 面接日 */}
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                面接日
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* 面接時間 */}
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                                面接時間
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ClockIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="time"
                                    id="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    required
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* 面接タイプ */}
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                面接タイプ
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="一次面接">一次面接</option>
                                <option value="二次面接">二次面接</option>
                                <option value="最終面接">最終面接</option>
                            </select>
                        </div>

                        {/* 送信ボタン */}
                        <div className="flex justify-end space-x-4">
                            <Link
                                href="/page/dashboard/recruiter/interviews"
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                                キャンセル
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center px-4 py-2 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner />
                                        作成中...
                                    </>
                                ) : (
                                    "面接スケジュールを作成"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
} 