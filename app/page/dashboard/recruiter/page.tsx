"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase";
import {
    UserGroupIcon,
    DocumentTextIcon,
    CalendarIcon,
    ChartBarIcon,
    BuildingOfficeIcon,
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

export default function RecruiterDashboard() {
    const [stats, setStats] = useState({
        totalApplicants: 0,
        pendingReviews: 0,
        upcomingInterviews: 0,
        averageScore: 0
    });

    const [recentApplicants, setRecentApplicants] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            // ログイン中のユーザー情報を取得
            const { data: { user } } = await supabase.auth.getUser();
            console.log('1. ログインユーザー情報:', user);
            if (!user) {
                console.log('ログインユーザーが見つかりません');
                return;
            }

            // まず、ユーザーIDに紐づく recruiter_profile を取得
            const { data: recruiterProfile, error: recruiterError } = await supabase
                .from('recruiter_profiles')
                .select('company_id')
                .eq('id', user.id)
                .single();

            console.log('2. Recruiter Profile取得結果:', { recruiterProfile, error: recruiterError });

            if (recruiterError) {
                console.log('Recruiter Profile取得エラー:', recruiterError);
                return;
            }
            if (!recruiterProfile) {
                console.log('Recruiter Profileが見つかりません');
                return;
            }

            // 総応募者数を取得
            const { count: totalApplicants, error: applicantsError } = await supabase
                .from('applications')
                .select('*', { count: 'exact' })
                .eq('company_id', recruiterProfile.company_id);

            console.log('3. 総応募者数取得結果:', { totalApplicants, error: applicantsError });

            // 最近の応募者リストを取得
            const { data: applicants, error: recentError } = await supabase
                .from('applications')
                .select(`
                    id,
                    applied_at,
                    status,
                    applicant_id (
                        id,
                        applicant_firstname,
                        applicant_lastname,
                        test_responses (
                            score
                        )
                    )
                `)
                .eq('company_id', recruiterProfile.company_id)
                .order('applied_at', { ascending: false })
                .limit(10);

            console.log('4. 応募者リスト取得結果:', {
                applicants,
                error: recentError
            });

            // 応募者リストを整形して設定
            const formattedApplicants = applicants?.map(app => {
                console.log('個別の応募データ:', app);

                const lastname = app?.applicant_id?.applicant_lastname || '';
                const firstname = app?.applicant_id?.applicant_firstname || '';

                // test_responsesからスコアを取得（複数ある場合は平均値を計算）
                const scores = app?.applicant_id?.test_responses?.map(tr => tr.score) || [];
                const averageScore = scores.length > 0
                    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                    : 0;

                return {
                    id: app.id,
                    name: lastname && firstname ? `${lastname} ${firstname}` : '応募者',
                    position: "応募者",
                    status: app.status || '書類選考',
                    appliedDate: new Date(app.applied_at).toLocaleDateString('ja-JP'),
                    score: averageScore
                };
            }) || [];

            // 全体の平均スコアを計算
            const totalScore = formattedApplicants.reduce((sum, applicant) => sum + applicant.score, 0);
            const applicantsWithScore = formattedApplicants.filter(app => app.score > 0).length;
            const overallAverageScore = applicantsWithScore > 0
                ? Math.round(totalScore / applicantsWithScore)
                : 0;

            console.log('整形後のデータ:', formattedApplicants);

            // 状態を更新
            setStats(prev => ({
                ...prev,
                totalApplicants: totalApplicants || 0,
                averageScore: overallAverageScore
            }));

            setRecentApplicants(formattedApplicants);
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* ヘッダーセクション */}
            <header className="bg-white/90 backdrop-blur-lg shadow-lg p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                        採用担当者ダッシュボード
                    </h1>
                    <div className="mt-2 text-sm text-gray-600">
                        応募者の状況を確認・管理できます
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
                                <p className="text-sm font-medium text-gray-600">総応募者数</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalApplicants}</p>
                            </div>
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <UserGroupIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">未レビュー数</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingReviews}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
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

                {/* 最近の応募者 */}
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">最近の応募者</h2>
                        <a
                            href="/applicants"
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                            すべて表示 →
                        </a>
                    </div>
                    <div className="space-y-4">
                        {recentApplicants.map((applicant) => (
                            <div
                                key={applicant.id}
                                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white p-2 rounded-lg">
                                            <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{applicant.name}</h3>
                                            <p className="text-sm text-gray-600">{applicant.position}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">応募日</p>
                                            <p className="font-medium text-gray-800">{applicant.appliedDate}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${applicant.status === "選考中"
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {applicant.status}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">スコア</p>
                                            <p className="font-medium text-gray-800">{applicant.score}</p>
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
                        <span>新規求人作成</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
