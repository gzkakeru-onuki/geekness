"use client";
import { useState, useEffect, useCallback } from "react";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import { supabase } from "@/app/utils/supabase";


export default function ExamPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [question, setQuestion] = useState("");
    const [testId, setTestId] = useState(null);
    const [timeLeft, setTimeLeft] = useState(3600); // 60分 = 3600秒
    const [isStarted, setIsStarted] = useState(false); // テスト開始状態
    const [isEditorDisabled, setIsEditorDisabled] = useState(true); // エディタの編集可否
    const [testInfo, setTestInfo] = useState({
        title: "",
        category: "",
        programming_language: "",
        experience_level: "",
        difficulty: "",
        test_type: "",
        time_limit: 0
    });

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
            const { data: testApplicant, error: testApplicantError } = await supabase
                .from('test_applicants')
                .select('id, test_id')
                .eq('applicant_id', user.id)
                .eq('status', 'pending')
                .single();

            if (testApplicantError) {
                console.error("Error fetching test applicant:", testApplicantError);
                return;
            }

            if (!testApplicant) {
                console.error("受験可能なテストが見つかりません");
                return;
            }

            // 3. テスト情報を取得
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
                .eq('id', testApplicant.test_id)
                .single();

            if (testError) {
                console.error("Error fetching test data:", testError);
                return;
            }

            if (testData) {
                setTestId(testApplicant.test_id);
                setTestInfo(testData);
                setTimeLeft(testData.time_limit * 60); // 分を秒に変換

                // 4. 問題文を取得
                const { data: questionData, error: questionError } = await supabase
                    .from('test_questions')
                    .select('question_text')
                    .eq('test_id', testApplicant.test_id)
                    .single();

                if (questionError) {
                    console.error("Error fetching question:", questionError);
                    return;
                }

                if (questionData) {
                    setQuestion(questionData.question_text);
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
            window.confirm("解答を送信しますか？");
            alert("採点します...");

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

            // test_applicantsテーブルから受験者情報を取得
            const { data: testApplicant, error: testApplicantError } = await supabase
                .from('test_applicants')
                .select('id')
                .eq('applicant_id', user.id)
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
                    applicant_id: testApplicant.id,
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
            alert("採点完了しました!");

        } catch (error) {
            console.error("Error in handleSubmit:", error);
            alert("エラーが発生しました。");
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* ヘッダーセクション - stickyで固定 */}
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
                        {/* タイマー表示 */}
                        {isStarted && (
                            <div className={`px-4 py-2 rounded-lg bg-white border-2 ${timeLeft < 300 ? 'border-red-500 text-red-600' : 'border-indigo-500 text-indigo-600'} font-bold text-xl`}>
                                残り時間: {formatTime(timeLeft)}
                            </div>
                        )}
                    </div>

                    {/* テスト情報の追加 */}
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

                    {!isStarted ? (
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
                        <>
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <Editor
                                    value={question}
                                    onValueChange={(code) => setQuestion(code)}
                                    highlight={code => highlight(code, languages.js, 'javascript')}
                                    padding={10}
                                    disabled={isEditorDisabled}
                                    style={{
                                        fontFamily: '"Fira code", "Fira Mono", monospace',
                                        fontSize: 14,
                                        backgroundColor: isEditorDisabled ? '#f5f5f5' : '#ffffff',
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
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isStarted}
                                    className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    解答を送信
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
