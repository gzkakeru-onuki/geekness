"use client";
import { useState, useEffect, useCallback } from "react";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import { supabase } from "@/app/utils/supabase";

// 型定義を追加
interface SkillTest {
    title: string;
    programming_language: string;
    difficulty: string;
}

interface TestApplicant {
    id: string;
    test_id: string;
    skill_tests: SkillTest;
    applicant_id?: string;
    status?: 'pending' | 'completed' | 'cancelled';
}

type DatabaseTestApplicant = Omit<TestApplicant, 'skill_tests'> & {
    skill_tests: {
        title: string;
        programming_language: string;
        difficulty: string;
    };
};

interface TestInfo {
    title: string;
    category: string;
    programming_language: string;
    experience_level: string;
    difficulty: string;
    test_type: string;
    time_limit: number;
}

interface TestSelectionModalProps {
    tests: TestApplicant[];
    onSelect: (testId: string) => void;
    onClose: () => void;
}

// テスト選択用のモーダルコンポーネントを追加
const TestSelectionModal = ({ tests, onSelect, onClose }: TestSelectionModalProps) => {
    return (
        <div
            className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-xl mt-20 mb-8 flex flex-col shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">受験するテストを選択</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-3">
                    {tests.map((test) => (
                        <button
                            key={test.id}
                            onClick={() => onSelect(test.test_id)}
                            className="w-full bg-white/50 backdrop-blur-sm border-2 border-indigo-100 hover:border-indigo-500 rounded-xl p-4 text-left transition-all duration-300 hover:shadow-md"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-base text-gray-800">
                                        {test.skill_tests.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                            </svg>
                                            {test.skill_tests.programming_language}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700">
                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            {test.skill_tests.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="flex justify-end mt-4 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ExamPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [question, setQuestion] = useState("");
    const [testId, setTestId] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(3600); // 60分 = 3600秒
    const [isStarted, setIsStarted] = useState(false); // テスト開始状態
    const [isEditorDisabled, setIsEditorDisabled] = useState(true); // エディタの編集可否
    const [isSubmitting, setIsSubmitting] = useState(false); // 送信中の状態
    const [testInfo, setTestInfo] = useState<TestInfo>({
        title: "",
        category: "",
        programming_language: "",
        experience_level: "",
        difficulty: "",
        test_type: "",
        time_limit: 0
    });
    const [availableTests, setAvailableTests] = useState<TestApplicant[]>([]);
    const [selectedTestId, setSelectedTestId] = useState<string>("");
    const [showTestSelection, setShowTestSelection] = useState(false);

    // ページ読み込み時にプロフィール情報を取得
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) {
                console.error("Error fetching user:", userError);
                return;
            }

            if (!user) {
                console.error("ユーザーが見つかりません");
                return;
            }

            // 1. まず受験者情報を取得
            const { data: profileData, error: profileError } = await supabase
                .from('applicant_profiles')
                .select(`
                    id,
                    applicant_lastname,
                    applicant_firstname,
                    applicant_email
                `)
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error("Error fetching profile:", profileError);
                return;
            }

            if (profileData) {
                setName(profileData.applicant_lastname + profileData.applicant_firstname || '');
                setEmail(profileData.applicant_email || '');
            }

            // 2. 受験可能なテストがあるか確認
            const { data: testApplicants, error: testApplicantError } = await supabase
                .from('test_applicants')
                .select(`
                    id,
                    test_id,
                    skill_tests (
                        title,
                        programming_language,
                        difficulty
                    ),
                    applicant_id,
                    status
                `)
                .eq('applicant_id', user.id)
                .eq('status', 'pending') as { data: DatabaseTestApplicant[] | null, error: any };

            if (testApplicantError) {
                console.error("Error fetching test applicant:", testApplicantError);
                return;
            }

            if (!testApplicants || testApplicants.length === 0) {
                console.error("受験可能なテストが見つかりません");
                return;
            }

            // データを変換して保存
            const formattedTests: TestApplicant[] = testApplicants.map(test => ({
                id: test.id,
                test_id: test.test_id,
                applicant_id: test.applicant_id,
                status: test.status as 'pending' | 'completed' | 'cancelled',
                skill_tests: {
                    title: test.skill_tests.title,
                    programming_language: test.skill_tests.programming_language,
                    difficulty: test.skill_tests.difficulty
                }
            }));

            setAvailableTests(formattedTests);

            if (formattedTests.length > 1) {
                // モーダル表示を削除し、利用可能なテストの情報のみを保存
                setAvailableTests(formattedTests);
            } else {
                // 1つしかない場合は自動的に選択
                setSelectedTestId(formattedTests[0].test_id);
                // テスト情報の取得処理を続行
                const { data: testData, error: testError } = await supabase
                    .from('skill_tests')
                    .select(`
                        title,
                        category,
                        programming_language,
                        experience_level,
                        difficulty,
                        test_type,
                        time_limit
                    `)
                    .eq('id', formattedTests[0].test_id)
                    .single();

                if (testError) {
                    console.error("Error fetching test data:", testError);
                    return;
                }

                if (testData) {
                    setTestId(formattedTests[0].test_id);
                    setTestInfo(testData);
                    setTimeLeft(testData.time_limit * 60);

                    // 問題文を取得
                    const { data: questionData, error: questionError } = await supabase
                        .from('test_questions')
                        .select('question_text')
                        .eq('test_id', formattedTests[0].test_id)
                        .single();

                    if (questionError) {
                        console.error("Error fetching question:", questionError);
                        return;
                    }

                    if (questionData) {
                        setQuestion(questionData.question_text);
                    }
                }
            }
        } catch (error: any) {
            console.error("Error in fetchProfile:", error);
        }
    };

    const handleSubmit = useCallback(async () => {
        try {
            if (!name || !email || !question) {
                alert("すべてのフィールドを入力してください。");
                return;
            }
            if (!window.confirm("解答を送信しますか？")) {
                return;
            }

            setIsSubmitting(true);

            // GeminiAPIを呼び出して採点
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `あなたはプログラミングのスキルテストの採点者です。
                    以下の解答を採点してください：
                    ${question}
                    
                    採点基準:
                    1. コード品質（20点）
                       - コードの一貫性
                       - ベストプラクティスの適用
                    
                    2. 保守性（20点）
                       - コードの構造化
                       - 将来の変更のしやすさ
                    
                    3. アルゴリズム（20点）
                       - 問題解決の適切性
                       - ロジックの正確性
                    
                    4. 可読性（20点）
                       - 命名規則の適切さ
                       - コメントの質と量
                    
                    5. パフォーマンス（20点）
                       - 実行効率
                       - リソース使用の最適化
                    
                    以下の形式でJSONで返答してください：
                    {
                        "code_quality": 数値,
                        "maintainability": 数値,
                        "algorithm": 数値,
                        "readability": 数値,
                        "performance": 数値,
                        "total_score": 数値,
                        "review_comments": "レビューコメント"
                    }
                    `
                })
            });

            if (!response.ok) {
                throw new Error('採点に失敗しました');
            }

            const scoringResult = await response.json();
            console.log('API Response:', scoringResult);

            // APIレスポンスから実際のJSONデータを抽出してパース
            const jsonStr = scoringResult.data.match(/```json\n([\s\S]*)\n```/)[1];
            const scores = JSON.parse(jsonStr);
            console.log('Parsed Scores:', scores);

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) {
                console.error("Error fetching user:", userError);
                alert("ユーザー情報の取得に失敗しました。");
                return;
            }

            if (!user || !testId) {
                alert("テスト情報が見つかりません。");
                return;
            }

            // test_applicantsテーブルから特定のテストの受験者情報を取得
            const { data: testApplicant, error: testApplicantError } = await supabase
                .from('test_applicants')
                .select('id')
                .eq('applicant_id', user.id)
                .eq('test_id', testId)  // 選択されているテストIDで絞り込み
                .eq('status', 'pending')
                .single();

            if (testApplicantError || !testApplicant) {
                console.error("Error fetching test applicant:", testApplicantError);
                alert("受験者情報が見つかりません。");
                return;
            }

            // test_responseテーブルに詳細な採点結果を登録
            const { data, error } = await supabase
                .from('test_responses')
                .insert({
                    id: crypto.randomUUID(),
                    test_id: testId,
                    applicant_id: user.id,
                    answer: question,
                    score: scores.total_score,
                    code_quality_score: scores.code_quality,
                    maintainability_score: scores.maintainability,
                    algorithm_score: scores.algorithm,
                    readability_score: scores.readability,
                    performance_score: scores.performance,
                    review_comments: scores.review_comments,
                    created_at: new Date().toISOString()
                });

            console.log('Supabase Insert Result:', { data, error });

            if (error) {
                console.error("Error submitting response:", error);
                alert("解答の送信に失敗しました。");
                return;
            }

            // テストのステータスを更新
            const { error: updateError } = await supabase
                .from('test_applicants')
                .update({ status: 'completed' })
                .eq('id', testApplicant.id);

            if (updateError) {
                console.error("Error updating test status:", updateError);
            }

            // 送信完了後、ダッシュボードに遷移
            window.location.href = '/page/dashboard/applicant';

        } catch (error) {
            console.error("Error in handleSubmit:", error);
            alert("エラーが発生しました。");
        } finally {
            setIsSubmitting(false);
        }
    }, [name, email, question, testId]);

    // タイマー機能
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isStarted && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit(); // 時間切れ時に自動送信
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [isStarted, timeLeft, handleSubmit]);

    // テスト開始ハンドラー
    const handleStart = () => {
        if (window.confirm('テストを開始しますか？開始後は制限時間内に終了する必要があります。')) {
            setIsStarted(true);
            setIsEditorDisabled(false);
        }
    };

    // 時間のフォーマット関数
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    // テスト選択ハンドラーを追加
    const handleTestSelect = async (testId: string) => {
        setSelectedTestId(testId);
        setShowTestSelection(false);

        // 選択されたテストの情報を取得
        const { data: testData, error: testError } = await supabase
            .from('skill_tests')
            .select(`
                title,
                category,
                programming_language,
                experience_level,
                difficulty,
                test_type,
                time_limit
            `)
            .eq('id', testId)
            .single();

        if (testError) {
            console.error("Error fetching test data:", testError);
            return;
        }

        if (testData) {
            setTestId(testId);
            setTestInfo(testData);
            setTimeLeft(testData.time_limit * 60);

            // 問題文を取得
            const { data: questionData, error: questionError } = await supabase
                .from('test_questions')
                .select('question_text')
                .eq('test_id', testId)
                .single();

            if (questionData) {
                setQuestion(questionData.question_text);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* ヘッダーセクション */}
            <header className="bg-white/90 backdrop-blur-lg shadow-lg p-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                                {testInfo.title || "プログラミングスキルテスト"}
                            </h1>
                            <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-600">受験者:</span>
                                    <span className="ml-2 text-sm font-medium text-gray-800">{name} 様</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-600">メール:</span>
                                    <span className="ml-2 text-sm font-medium text-gray-800">{email}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* テスト選択ボタンを追加 */}
                            {!isStarted && availableTests.length > 1 && (
                                <button
                                    onClick={() => setShowTestSelection(true)}
                                    className="px-4 py-2 bg-white border-2 border-indigo-200 text-indigo-600 rounded-lg font-semibold hover:border-indigo-500 transition-all duration-300"
                                >
                                    テストを選択
                                </button>
                            )}
                            {/* タイマー表示 */}
                            {isStarted && (
                                <div className={`px-4 py-2 rounded-lg bg-white border-2 ${timeLeft < 300 ? 'border-red-500 text-red-600' : 'border-indigo-500 text-indigo-600'} font-bold text-xl`}>
                                    残り時間: {formatTime(timeLeft)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* テスト情報の表示 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs text-gray-500">カテゴリ</span>
                            <p className="font-medium text-gray-800">{testInfo?.category || "未設定"}</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs text-gray-500">使用言語</span>
                            <p className="font-medium text-gray-800">{testInfo?.programming_language || "未設定"}</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs text-gray-500">経験レベル</span>
                            <p className="font-medium text-gray-800">{testInfo?.experience_level || "未設定"}</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs text-gray-500">難易度</span>
                            <p className="font-medium text-gray-800">{testInfo?.difficulty || "未設定"}</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 my-4 rounded-r-lg">
                        <h2 className="text-lg font-semibold text-yellow-800 mb-2">注意事項</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-yellow-700">
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                                開始ボタンを押すとタイマーが作動します
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                                制限時間は{testInfo.time_limit}分です（残り5分で赤く表示されます）
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                                提出後の修正はできません
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                                インターネットの検索は禁止です
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                                時間切れの場合は自動で提出されます
                            </li>
                        </ul>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-7xl mx-auto p-6">
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">問題</h2>
                        {isStarted && (
                            <div className="text-sm text-gray-500">
                                エディタで解答を入力してください
                            </div>
                        )}
                    </div>

                    {!selectedTestId ? (
                        // テスト未選択時の表示
                        <div className="text-center py-12">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4v16m8-16v16m-8 0h8M4 4h16" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">テストを選択してください</h3>
                                <p className="text-gray-600 mb-4">
                                    「テストを選択」ボタンから、受験するテストを選択してください。
                                </p>
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setShowTestSelection(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02]"
                                    >
                                        テストを選択する
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : !isStarted ? (
                        // テスト選択済み・未開始時の表示
                        <div className="text-center py-12">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">テストの準備ができました</h3>
                                <p className="text-gray-600">開始ボタンをクリックしてテストを開始してください</p>
                            </div>
                            <button
                                onClick={handleStart}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-[1.02]"
                            >
                                テストを開始する
                            </button>
                        </div>
                    ) : (
                        // テスト開始後の表示（エディタ部分）
                        <>
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <Editor
                                    value={question}
                                    onValueChange={(code) => setQuestion(code)}
                                    highlight={code => highlight(code, languages.js, 'javascript')}
                                    padding={10}
                                    disabled={isEditorDisabled || isSubmitting}
                                    style={{
                                        fontFamily: '"Fira code", "Fira Mono", monospace',
                                        fontSize: 14,
                                        backgroundColor: isEditorDisabled || isSubmitting ? '#f5f5f5' : '#ffffff',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        minHeight: '400px',
                                        marginBottom: '20px'
                                    }}
                                />
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
                                    disabled={isSubmitting}
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isStarted || isSubmitting}
                                    className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="opacity-0">解答を送信</span>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        </>
                                    ) : (
                                        '解答を送信'
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {showTestSelection && (
                <TestSelectionModal
                    tests={availableTests}
                    onSelect={handleTestSelect}
                    onClose={() => setShowTestSelection(false)}
                />
            )}
        </div>
    );
}