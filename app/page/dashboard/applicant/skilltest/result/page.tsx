 "use client";
import { useState, useEffect, Suspense, useCallback } from "react";
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

// 型定義の修正
interface TestAssignment {
    test_id: string;
    skill_tests: {
        id: string;
        title: string;
        company_id: string;
        companies: {
            id: string;
            name: string; // companiesテーブルのカラム名
        };
    };
}

interface ApplicantProfile {
    id: string;
    applicant_lastname: string;
    applicant_firstname: string;
    applicant_email: string;
}

interface Company {
    id: string;
    name: string;
}

interface SkillTest {
    id: string;
    title: string;
}

interface TestData {
    test_id: string;
    skill_tests: {
        title: string;
    };
}

interface DatabaseApplication {
    id: string;
    company_id: string;
    companies: Company;
    test_data: TestData[];
}

interface ApplicationResponse {
    id: string;
    company_id: string;
    companies: Company;
}

interface TestApplicantResponse {
    id: string;
    test_id: string;
    skill_tests: {
        id: string;
        title: string;
    };
}

interface TestResponse {
    id: string;
    test_id: string;
    applicant_id: string;
    answer: string;
    score: number;
    code_quality_score: number;
    maintainability_score: number;
    algorithm_score: number;
    readability_score: number;
    performance_score: number;
    review_comments: string;
}

interface CompanyTest {
    id: string;
    name: string;
    tests: {
        id: string;
        title: string;
    }[];
}

interface Applicant {
    id: string;
    name: string;
    tests: {
        id: string;
        title: string;
    }[];
}

interface FormattedApplicant {
    companyId: string;
    companyName: string;
    tests: {
        id: string;
        title: string;
    }[];
}

function SkillTestResultContent() {
    const [userCode, setUserCode] = useState("// あなたのコードがここに表示されます");
    const [userType, setUserType] = useState<"applicant" | "recruiter">("applicant");
    const [sampleCode, setSampleCode] = useState("// 見本のコードがここに表示されます");
    const [name, setName] = useState("");
    const [score, setScore] = useState(0);
    const [review, setReview] = useState("");
    const [testResponse, setTestResponse] = useState<TestResponse | null>(null);
    const [selectedTestId, setSelectedTestId] = useState<string>("");
    const [applicants, setApplicants] = useState<CompanyTest[]>([]);
    const [selectedApplicantId, setSelectedApplicantId] = useState<string>("");
    const [activeTab, setActiveTab] = useState<'test' | 'interview'>('test');
    const [applications, setApplications] = useState<DatabaseApplication[]>([]);

    const fetchApplicantData = useCallback(async (testId: string) => {
        try {
            console.log("Fetching test data for testId:", testId);

            const { data: responseData } = await supabase
                .from('test_responses')
                .select(`
                    id,
                    test_id,
                    applicant_id,
                    answer,
                    score,
                    code_quality_score,
                    maintainability_score,
                    algorithm_score,
                    readability_score,
                    performance_score,
                    review_comments
                `)
                .eq('test_id', testId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            console.log("Test response data:", responseData);

            if (responseData) {
                setUserCode(responseData.answer || "// コードが見つかりません");
                setScore(responseData.score || 0);
                setReview(responseData.review_comments || "レビューコメントはありません");
                setTestResponse(responseData as TestResponse);
            } else {
                setUserCode("// 解答データが見つかりません");
                setScore(0);
                setReview("");
                setTestResponse(null);
            }
        } catch (error) {
            console.error("Error fetching applicant data:", error);
        }
    }, []);

    useEffect(() => {
        fetchUserData();
    }, []);

    // テスト選択時の処理を追加
    useEffect(() => {
        if (selectedTestId) {
            fetchApplicantData(selectedTestId);
        }
    }, [selectedTestId, fetchApplicantData]);

    const fetchUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('ユーザー情報が取得できません');
                return;
            }
            console.log("Current user:", user);

            // 企業側の場合は、自社のテストを受けた応募者の情報を取得
            const { data: recruiterData, error: recruiterError } = await supabase
                .from('recruiter_profiles')
                .select('company_id')
                .eq('id', user.id)
                .single();

            console.log("Recruiter data:", recruiterData, "Error:", recruiterError);

            if (recruiterData) {
                // 企業側の場合
                setUserType("recruiter");
                console.log("Setting user type to recruiter, company_id:", recruiterData.company_id);

                // 1. まず企業のテストを受けた応募者の情報を取得
                const { data: testApplicants } = await supabase
                    .from('test_applicants')
                    .select(`
                        id,
                        test_id,
                        applicant_id,
                        skill_tests (
                            id,
                            title
                        ),
                        applicant_profiles (
                            id,
                            applicant_lastname,
                            applicant_firstname
                        )
                    `)
                    .eq('skill_tests.company_id', recruiterData.company_id);

                console.log("Test applicants:", testApplicants);

                if (testApplicants && testApplicants.length > 0) {
                    // 応募者ごとにグループ化
                    const applicantGroups = testApplicants.reduce((groups: any, test: any) => {
                        const applicantId = test.applicant_id;
                        if (!groups[applicantId]) {
                            groups[applicantId] = {
                                id: applicantId,
                                name: `${test.applicant_profiles.applicant_lastname}${test.applicant_profiles.applicant_firstname}`,
                                tests: []
                            };
                        }
                        groups[applicantId].tests.push({
                            id: test.test_id,
                            title: test.skill_tests.title
                        });
                        return groups;
                    }, {});

                    // 配列に変換
                    const formattedData = Object.values(applicantGroups);
                    console.log("Formatted data for recruiter:", formattedData);
                    setApplicants(formattedData as CompanyTest[]);
                }
            } else {
                // 応募者側の場合
                setUserType("applicant");
                console.log("Setting user type to applicant");

                // 1. まず応募者のプロフィール情報を取得
                const { data: profileData } = await supabase
                    .from('applicant_profiles')
                    .select('applicant_lastname, applicant_firstname')
                    .eq('id', user.id)
                    .single();

                if (profileData) {
                    setName(`${profileData.applicant_lastname}${profileData.applicant_firstname}`);
                }

                // 2. 応募者のテスト情報を取得
                const { data: testApplicants } = await supabase
                    .from('test_applicants')
                    .select(`
                        id,
                        test_id,
                        skill_tests (
                            id,
                            title,
                            company_id,
                            companies (
                                id,
                                name
                            )
                        )
                    `)
                    .eq('applicant_id', user.id);

                console.log("Applicant's test data:", testApplicants);

                if (testApplicants && testApplicants.length > 0) {
                    // 企業ごとにテストをグループ化
                    const groupedByCompany = testApplicants.reduce((acc: any, curr: any) => {
                        const companyId = curr.skill_tests.company_id;
                        const companyName = curr.skill_tests.companies.name;
                        if (!acc[companyId]) {
                            acc[companyId] = {
                                id: companyId,
                                name: companyName,
                                tests: []
                            };
                        }
                        acc[companyId].tests.push({
                            id: curr.test_id,
                            title: curr.skill_tests.title
                        });
                        return acc;
                    }, {});

                    const formattedData = Object.values(groupedByCompany);
                    console.log("Formatted data for applicant:", formattedData);
                    setApplicants(formattedData as CompanyTest[]);
                }
            }
        } catch (error) {
            console.error('Error in fetchUserData:', error);
        }
    };

    // レーダーチャートのデータを動的に更新
    const testData = {
        labels: ['コード品質', '保守性', 'アルゴリズム', '可読性', 'パフォーマンス'],
        datasets: [
            {
                label: 'スキル評価',
                data: testResponse ? [
                    testResponse.code_quality_score,
                    testResponse.maintainability_score,
                    testResponse.algorithm_score,
                    testResponse.readability_score,
                    testResponse.performance_score,
                ] : [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 2,
            },
        ],
    };

    // オプション設定
    const options = {
        scales: {
            r: {
                type: 'radialLinear' as const,
                beginAtZero: true,
                max: 20,
                min: 0,
                ticks: {
                    stepSize: 4
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                angleLines: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                pointLabels: {
                    font: {
                        size: 14
                    },
                    color: '#4B5563'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `${context.raw}点 / 20点`;
                    }
                }
            }
        },
        maintainAspectRatio: true
    } as const;

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
                        {userType === "applicant" ? (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    企業を選択
                                </label>
                                <select
                                    value={selectedApplicantId}
                                    onChange={(e) => {
                                        setSelectedApplicantId(e.target.value);
                                        setSelectedTestId("");
                                    }}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                                >
                                    <option value="">選択してください</option>
                                    {applicants.map(company => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>

                                {selectedApplicantId && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            テストを選択
                                        </label>
                                        <select
                                            value={selectedTestId}
                                            onChange={(e) => setSelectedTestId(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                                        >
                                            <option value="">選択してください</option>
                                            {applicants.find(c => c.id === selectedApplicantId)?.tests.map(test => (
                                                <option key={test.id} value={test.id}>
                                                    {test.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    受験者を選択
                                </label>
                                <select
                                    value={selectedApplicantId}
                                    onChange={(e) => {
                                        setSelectedApplicantId(e.target.value);
                                        setSelectedTestId("");
                                    }}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                                >
                                    <option value="">選択してください</option>
                                    {applicants.map(applicant => (
                                        <option key={applicant.id} value={applicant.id}>
                                            {applicant.name}
                                        </option>
                                    ))}
                                </select>

                                {selectedApplicantId && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            テストを選択
                                        </label>
                                        <select
                                            value={selectedTestId}
                                            onChange={(e) => setSelectedTestId(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                                        >
                                            <option value="">選択してください</option>
                                            {applicants.find(a => a.id === selectedApplicantId)?.tests.map(test => (
                                                <option key={test.id} value={test.id}>
                                                    {test.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* 受験情報 */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">受験情報</h3>
                                <div className="space-y-2">
                                    <p className="text-base text-gray-800">
                                        <span className="font-medium">受験者：</span>{name}
                                    </p>
                                    <p className="text-base text-gray-800">
                                        <span className="font-medium">企業：</span>
                                        {applicants.find(c => c.id === selectedApplicantId)?.name || "未選択"}
                                    </p>
                                    <p className="text-base text-gray-800">
                                        <span className="font-medium">テスト：</span>
                                        {applicants.find(c => c.id === selectedApplicantId)?.tests.find(t => t.id === selectedTestId)?.title || "未選択"}
                                    </p>
                                </div>
                            </div>

                            {/* スコア表示 */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">テスト結果</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">総合スコア</p>
                                        <div className="text-3xl font-bold text-indigo-600">{score}<span className="text-base ml-1">点</span></div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${score >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                                        data={activeTab === 'test' ? testData : testData}
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
