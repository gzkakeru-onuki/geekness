"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import { supabase } from "@/app/utils/supabase";
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';

// Chart.jsのコンポーネントを登録
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

function SkillTestResultContent() {
    const [userCode, setUserCode] = useState("// あなたのコードがここに表示されます");
    const [userType, setUserType] = useState<"applicant" | "recruiter">("applicant");
    const [sampleCode, setSampleCode] = useState("// 見本のコードがここに表示されます");
    const [name, setName] = useState("");
    const [score, setScore] = useState(0);
    const [review, setReview] = useState("");
    const [applicants, setApplicants] = useState<Array<{ id: string, name: string }>>([]);
    const [selectedApplicantId, setSelectedApplicantId] = useState<string>("");
    const [activeTab, setActiveTab] = useState<'test' | 'interview'>('test');

    useEffect(() => {
        fetchUserData();
    }, []);

    // 選択された応募者の情報を取得
    useEffect(() => {
        if (userType === "recruiter" && selectedApplicantId) {
            fetchApplicantData(selectedApplicantId);
        }
    }, [selectedApplicantId]);

    const fetchUserData = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) {
                console.error("Error fetching user:", userError);
                return;
            }

            if (user) {
                // applicant_profilesをチェック
                const { data: applicantProfile } = await supabase
                    .from('applicant_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                // recruiter_profilesをチェック
                const { data: recruiterProfile } = await supabase
                    .from('recruiter_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                if (applicantProfile) {
                    setUserType("applicant");
                    setName(applicantProfile.applicant_lastname + applicantProfile.applicant_firstname);
                    await fetchApplicantData(user.id);
                } else if (recruiterProfile) {
                    setUserType("recruiter");
                    // まずは全応募者のデータを取得
                    const { data: applicantsData, error } = await supabase
                        .from('applicant_profiles')
                        .select(`
                            id,
                            applicant_lastname,
                            applicant_firstname
                        `);

                    if (error) {
                        console.error("Error fetching applicants:", error);
                        return;
                    }

                    if (applicantsData) {
                        // セレクトボックス用のデータを整形
                        const formattedApplicants = applicantsData.map(item => ({
                            id: item.id,
                            name: `${item.applicant_lastname} ${item.applicant_firstname}`
                        }));
                        setApplicants(formattedApplicants);
                    }
                }
            }
        } catch (error) {
            console.error("Error in fetchUserData:", error);
        }
    };

    const fetchApplicantData = async (applicantId: string) => {
        try {
            // test_applicantsからtest_idを取得
            const { data: testData } = await supabase
                .from('test_applicants')
                .select('test_id')
                .eq('applicant_id', applicantId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (testData) {
                // test_responsesから解答とスコアを取得
                const { data: responseData } = await supabase
                    .from('test_responses')
                    .select('answer,score')
                    .eq('test_id', testData.test_id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (responseData) {
                    setUserCode(responseData.answer || "// コードが見つかりません");
                    setScore(responseData.score || 0);
                } else {
                    setUserCode("// 解答データが見つかりません");
                    setScore(0);
                }
            }
        } catch (error) {
            console.error("Error fetching applicant data:", error);
        }
    };

    // レーダーチャートのデータ
    const testData = {
        labels: ['コード品質', 'アルゴリズム', '可読性', 'パフォーマンス', '保守性'],
        datasets: [
            {
                label: 'スキル評価',
                data: [80, 65, 90, 75, 85],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 2,
            },
        ],
    };

    const interviewData = {
        labels: ['コミュニケーション', '技術理解', '問題解決', 'チームワーク', '学習意欲'],
        datasets: [
            {
                label: '面談評価',
                data: [85, 90, 75, 80, 95],
                backgroundColor: 'rgba(236, 72, 153, 0.2)',
                borderColor: 'rgb(236, 72, 153)',
                borderWidth: 2,
            },
        ],
    };

    // オプション設定
    const options = {
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20,
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* ヘッダーセクション */}
            <header className="bg-white/90 backdrop-blur-lg shadow-lg p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                        スキルテスト結果
                    </h1>
                    <div className="mt-2 text-sm text-gray-600">
                        {userType === "applicant" ? "あなたのテスト結果" : "受験者のテスト結果"}
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* コード表示エリア */}
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">解答コード</h2>
                            <div className="text-sm text-gray-500">
                                {userType === "applicant" ? "あなたの解答" : "受験者の解答"}
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <Editor
                                value={userCode}
                                onValueChange={setUserCode}
                                highlight={code => highlight(code, languages.js, 'javascript')}
                                padding={10}
                                style={{
                                    fontFamily: '"Fira code", "Fira Mono", monospace',
                                    fontSize: 14,
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    minHeight: '500px',
                                }}
                                readOnly={true}
                            />
                        </div>
                    </div>

                    {/* 結果表示エリア */}
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                        {userType === "recruiter" && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    受験者を選択
                                </label>
                                <select
                                    value={selectedApplicantId}
                                    onChange={(e) => setSelectedApplicantId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                                >
                                    <option value="">選択してください</option>
                                    {applicants.map(applicant => (
                                        <option key={applicant.id} value={applicant.id}>
                                            {applicant.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* 受験者情報 */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">受験者情報</h3>
                                <p className="text-lg font-semibold text-gray-800">
                                    {userType === "applicant" ? name : applicants.find(a => a.id === selectedApplicantId)?.name || "未選択"}
                                </p>
                            </div>

                            {/* スコア表示 */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">スコア</h3>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold text-indigo-600">{score}</div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${score >= 80
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {score >= 80 ? "合格" : "不合格"}
                                    </div>
                                </div>
                            </div>

                            {/* レビュー */}
                            <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">レビューコメント</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {review || "レビューコメントはありません"}
                                </p>
                            </div>

                            {/* スキル評価レーダーチャート */}
                            <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-500">スキル評価</h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setActiveTab('test')}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${activeTab === 'test'
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : 'text-gray-500 hover:bg-gray-100'
                                                }`}
                                        >
                                            テスト結果
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('interview')}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${activeTab === 'interview'
                                                ? 'bg-pink-100 text-pink-700'
                                                : 'text-gray-500 hover:bg-gray-100'
                                                }`}
                                        >
                                            面談結果
                                        </button>
                                    </div>
                                </div>
                                <div className="aspect-square w-full max-w-md mx-auto">
                                    <Radar
                                        data={activeTab === 'test' ? testData : interviewData}
                                        options={options}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function SkillTestResult() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SkillTestResultContent />
        </Suspense>
    );
}
