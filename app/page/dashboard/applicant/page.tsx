"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase";
import {
    BriefcaseIcon,
    DocumentTextIcon,
    CalendarIcon,
    ChartBarIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    ClockIcon,
    UserIcon
} from '@heroicons/react/24/outline';

export default function ApplicantDashboard() {
    const [stats, setStats] = useState({
        totalApplications: 0,
        pendingResponses: 0,
        upcomingInterviews: 0,
        averageScore: 0
    });

    const [recentApplications, setRecentApplications] = useState([
        {
            id: 1,
            company: "株式会社テクノロジー",
            position: "シニアエンジニア",
            status: "選考中",
            appliedDate: "2024-03-15",
            score: 85
        },
        {
            id: 2,
            company: "株式会社イノベーション",
            position: "フロントエンドエンジニア",
            status: "書類選考",
            appliedDate: "2024-03-14",
            score: 92
        }
    ]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* ヘッダーセクション */}
            <header className="bg-white/90 backdrop-blur-lg shadow-lg p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                        応募者ダッシュボード
                    </h1>
                    <div className="mt-2 text-sm text-gray-600">
                        あなたの応募状況を確認できます
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-7xl mx-auto p-6">
                {/* 統計情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">応募企業数</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalApplications}</p>
                            </div>
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <BriefcaseIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">未返信数</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingResponses}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <ClockIcon className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">今後の面接</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingInterviews}</p>
                            </div>
                            <div className="bg-pink-100 p-3 rounded-full">
                                <CalendarIcon className="w-6 h-6 text-pink-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">平均スコア</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.averageScore}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <ChartBarIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 最近の応募状況 */}
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">最近の応募状況</h2>
                        <a
                            href="/applications"
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                            すべて表示 →
                        </a>
                    </div>
                    <div className="space-y-4">
                        {recentApplications.map((application) => (
                            <div
                                key={application.id}
                                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white p-2 rounded-lg">
                                            <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{application.company}</h3>
                                            <p className="text-sm text-gray-600">{application.position}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">応募日</p>
                                            <p className="font-medium text-gray-800">{application.appliedDate}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${application.status === "選考中"
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {application.status}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">スコア</p>
                                            <p className="font-medium text-gray-800">{application.score}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* アクションボタン */}
                <div className="mt-6 flex justify-end space-x-4">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                        <CalendarIcon className="w-5 h-5" />
                        <span>面接スケジュール</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                        <DocumentTextIcon className="w-5 h-5" />
                        <span>プロフィール編集</span>
                    </button>
                </div>
            </main>
        </div>
    );
} 