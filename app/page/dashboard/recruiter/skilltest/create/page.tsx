"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Editor from 'react-simple-code-editor';
import { highlight, languages as prismLanguages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; // シンタックスハイライトのスタイル
import 'prismjs/components/prism-markdown';
import { supabase } from "@/app/utils/supabase";

interface Applicant {
    id: string;
    name: string;
}

interface ApplicantProfile {
    id: string;
    applicant_lastname: string;
    applicant_firstname: string;
}

interface Application {
    id: string;
    applicant_id: string;
    applicant_profiles: ApplicantProfile;
}

interface DatabaseApplication {
    id: string;
    applicant_id: string;
    applicant_profiles: {
        id: string;
        applicant_lastname: string;
        applicant_firstname: string;
    }[];
}

export default function SkillTestCreation() {
    const [prompt, setPrompt] = useState("");
    const [category, setCategory] = useState("general");
    const [experience, setExperience] = useState("entry");
    const [language, setLanguage] = useState("javascript");
    const [difficulty, setDifficulty] = useState("medium");
    const [questionCount, setQuestionCount] = useState(5);
    const [testType, setTestType] = useState("coding");
    const [generatedQuestions, setGeneratedQuestions] = useState<string>("");
    const [title, setTitle] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [timeLimit, setTimeLimit] = useState(0);
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [applicants, setApplicants] = useState<Array<{ id: string, name: string }>>([]);
    const [activeTab, setActiveTab] = useState("basic");
    const router = useRouter();

    // useEffectを追加して、コンポーネントのマウント時に応募者データを取得
    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                // 現在ログインしているユーザー（企業）の情報を取得
                const { data: { user } } = await supabase.auth.getUser();
                console.log('👤 ログイン中のユーザー情報:', user);
                if (!user) {
                    console.error('❌ ユーザー情報が取得できません');
                    return;
                }

                // まず、recruiter_profilesからcompany_idを取得
                const { data: recruiterData, error: recruiterError } = await supabase
                    .from('recruiter_profiles')
                    .select('company_id')
                    .eq('id', user.id)
                    .single();

                if (recruiterError) {
                    console.error('❌ 企業情報の取得エラー:', recruiterError);
                    throw recruiterError;
                }

                // applicationsテーブルから企業の応募者を取得
                const { data: applications, error } = await supabase
                    .from('applications')
                    .select(`
                        id,
                        applicant_id,
                        auth_users:applicant_id (
                            id,
                            applicant_email,
                            applicant_firstname,
                            applicant_lastname
                        )
                    `)
                    .eq('company_id', recruiterData.company_id)
                    .eq('status', 'pending');

                console.log('📝 取得した応募者データ:', applications);
                if (error) {
                    console.error('❌ 応募者データの取得エラー:', error);
                    throw error;
                }

                // 応募者データを整形
                const formattedApplicants = (applications || [])
                    .map((app: any) => ({
                        id: app.applicant_id,
                        name: `${app.auth_users?.applicant_lastname || ''} ${app.auth_users?.applicant_firstname || ''}`
                    }));

                setApplicants(formattedApplicants);
            } catch (error) {
                console.error('❌ fetchApplicants エラー:', error);
            }
        };

        fetchApplicants();
    }, [router]);

    const handleCreateTest = async () => {
        if (prompt.trim() === "") {
            alert("プロンプトを入力してください。");
            return;
        }

        setLoading(true);
        try {
            console.log('🚀 テスト作成開始', {
                category,
                language,
                experience,
                difficulty,
                questionCount,
                prompt
            });

            // GeminiAPIを呼び出し
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `あなたはとても優秀なプログラミングのスキルテストの作成者です。
                    以下の条件でプログラミングのスキルテスト問題を${questionCount}問作成してください：

                    【テスト情報】
                    - カテゴリ: ${categories.find(cat => cat.value === category)?.label}
                    - 開発言語: ${languages.find(lang => lang.value === language)?.label}
                    - 経験レベル: ${experienceLevels.find(exp => exp.value === experience)?.label}
                    - 難易度: ${difficulties.find(diff => diff.value === difficulty)?.label}
                    - テストタイプ: ${testTypes.find(type => type.value === testType)?.label}
                    
                    【追加指示】
                    ${prompt}

                    【出力形式】
                    - 問題ごとに番号をつけて、markdown形式で出力
                    - 各問題には問題文と空の解答欄を含める
                    - 制限時間は${timeLimit}分です`
                }),
            });

            console.log('📡 Gemini API レスポンス状態:', response.status);

            if (!response.ok) {
                throw new Error('問題の生成に失敗しました');
            }

            const data = await response.json();
            console.log('✨ 生成された問題データ:', data);

            if (data.success) {
                setGeneratedQuestions(data.data);
            }
            else {
                throw new Error(data.error || '問題の生成に失敗しました');
            }
        } catch (error: any) {
            console.error('❌ テスト作成エラー:', error);
            alert('エラーが発生しました。');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmTest = async () => {
        setConfirm(true);
        const confirm = window.confirm("テストを確定しますか？");
        if (!confirm) {
            console.log('❌ テスト確定がキャンセルされました');
            alert("テストを確定しませんでした。");
            return;
        }

        try {
            console.log('🔄 テスト確定処理開始');

            // ログイン中の企業IDを取得
            const { data: { user } } = await supabase.auth.getUser();
            console.log('👤 確定処理 - ユーザー情報:', user);

            if (!user) {
                throw new Error('ユーザー情報が取得できません');
            }

            // 企業のIDを取得
            const { data: recruiterData, error: recruiterError } = await supabase
                .from('recruiter_profiles')
                .select('company_id')
                .eq('id', user.id)
                .single();

            if (recruiterError) {
                console.error('企業情報の取得に失敗しました:', recruiterError);
                throw new Error('企業情報の取得に失敗しました');
            }

            // スキルテストをDBに保存
            const { data: testData, error: testError } = await supabase
                .from('skill_tests')
                .insert({
                    id: crypto.randomUUID(),
                    title: title,
                    category: category,
                    programming_language: language,
                    experience_level: experience,
                    difficulty: difficulty,
                    test_type: testType,
                    question_count: questionCount,
                    time_limit: timeLimit,
                    company_id: recruiterData.company_id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (testError) {
                console.error('テストの作成に失敗しました:', testError);
                throw testError;
            }

            // テスト問題をDBに保存
            const { error: questionError } = await supabase
                .from('test_questions')
                .insert({
                    id: crypto.randomUUID(),
                    test_id: testData.id,
                    question_text: generatedQuestions,
                    prompt: prompt,
                    created_at: new Date().toISOString()
                });

            if (questionError) {
                console.error('問題の保存に失敗しました:', questionError);
                throw questionError;
            }

            // テスト受験者の割り当てを保存
            const { error: assignmentError } = await supabase
                .from('test_applicants')
                .insert({
                    id: crypto.randomUUID(),
                    test_id: testData.id,
                    applicant_id: selectedUser,
                    status: 'pending',
                    score: null,
                    started_at: null,
                    completed_at: null,
                    created_at: new Date().toISOString()
                });

            if (assignmentError) {
                console.error('受験者の割り当てに失敗しました:', assignmentError);
                throw assignmentError;
            }

            console.log('✅ テスト作成完了:', testData);
            alert('テストが正常に作成されました');
            router.push('/page/dashboard/?type=recruiter');

        } catch (error: any) {
            console.error('❌ テスト確定エラー:', error);
            alert('テストの作成中にエラーが発生しました');
        }
    };

    // カテゴリの選択肢
    const categories = [
        { value: "general", label: "一般プログラミング" },
        { value: "frontend", label: "フロントエンド開発" },
        { value: "backend", label: "バックエンド開発" },
        { value: "mobile", label: "モバイル開発" },
        { value: "devops", label: "DevOps/インフラ" },
        { value: "database", label: "データベース" },
        { value: "security", label: "セキュリティ" }
    ];

    // 経験レベルの選択肢
    const experienceLevels = [
        { value: "entry", label: "初級（0-2年）" },
        { value: "intermediate", label: "中級（3-5年）" },
        { value: "senior", label: "上級（6年以上）" }
    ];

    // 開発言語の選択肢
    const languages = [
        { value: "javascript", label: "JavaScript" },
        { value: "typescript", label: "TypeScript" },
        { value: "python", label: "Python" },
        { value: "java", label: "Java" },
        { value: "php", label: "PHP" },
        { value: "ruby", label: "Ruby" },
        { value: "go", label: "Go" }
    ];

    // 難易度の選択肢
    const difficulties = [
        { value: "easy", label: "初級" },
        { value: "medium", label: "中級" },
        { value: "hard", label: "上級" }
    ];

    // テストタイプの選択肢
    const testTypes = [
        { value: "coding", label: "コーディング問題" },
        { value: "algorithm", label: "アルゴリズム問題" },
        { value: "system", label: "システム設計" },
        { value: "debugging", label: "デバッグ問題" }
    ];

    // タブの定義
    const tabs = [
        { id: "basic", label: "基本情報" },
        { id: "test", label: "テスト設定" },
        { id: "candidate", label: "受験者" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
                                スキルテスト作成
                            </h1>
                            <p className="text-gray-600 text-lg">
                                受験者のスキルを評価するためのテストを作成します
                            </p>
                        </div>
                    </div>

                    {/* タブ */}
                    <div className="flex space-x-6 mb-12 border-b border-indigo-100">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-8 py-4 font-semibold transition-all duration-300 relative ${activeTab === tab.id
                                    ? "text-indigo-600"
                                    : "text-gray-500 hover:text-indigo-500"
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* プレビュー画面 */}
                        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-8 shadow-xl border border-indigo-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">プレビュー</h2>
                            <div className="h-[calc(100vh-400px)] overflow-auto">
                                <Editor
                                    placeholder="ここに生成された問題が表示されます。"
                                    value={generatedQuestions}
                                    onValueChange={(code) => setGeneratedQuestions(code)}
                                    highlight={code => highlight(code, prismLanguages.clike, 'clike')}
                                    padding={16}
                                    style={{
                                        fontFamily: '"Fira code", "Fira Mono", monospace',
                                        fontSize: 14,
                                        backgroundColor: '#ffffff',
                                        borderRadius: '12px',
                                        border: '2px solid #e2e8f0',
                                        minHeight: '100%',
                                        width: '100%',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    textareaClassName="editor-textarea"
                                />
                            </div>
                        </div>

                        {/* 設定画面 */}
                        <div className="space-y-8">
                            {/* 基本情報タブ */}
                            {activeTab === "basic" && (
                                <div className="bg-gradient-to-br from-white to-indigo-50 p-8 rounded-2xl shadow-xl border border-indigo-100">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">基本情報</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-3">テストタイトル</label>
                                            <input
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full px-6 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                                placeholder="例: フロントエンド開発者向けJavaScriptテスト"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-3">カテゴリ</label>
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    className="w-full px-6 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                                >
                                                    {categories.map((cat) => (
                                                        <option key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-3">開発言語</label>
                                                <select
                                                    value={language}
                                                    onChange={(e) => setLanguage(e.target.value)}
                                                    className="w-full px-6 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                                >
                                                    {languages.map((lang) => (
                                                        <option key={lang.value} value={lang.value}>
                                                            {lang.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* テスト設定タブ */}
                            {activeTab === "test" && (
                                <div className="bg-gradient-to-br from-white to-indigo-50 p-8 rounded-2xl shadow-xl border border-indigo-100">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">テスト設定</h2>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-3">対象経験年数</label>
                                            <select
                                                value={experience}
                                                onChange={(e) => setExperience(e.target.value)}
                                                className="w-full px-6 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                            >
                                                {experienceLevels.map((exp) => (
                                                    <option key={exp.value} value={exp.value}>
                                                        {exp.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-3">難易度</label>
                                            <select
                                                value={difficulty}
                                                onChange={(e) => setDifficulty(e.target.value)}
                                                className="w-full px-6 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                            >
                                                {difficulties.map((diff) => (
                                                    <option key={diff.value} value={diff.value}>
                                                        {diff.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-3">問題タイプ</label>
                                            <select
                                                value={testType}
                                                onChange={(e) => setTestType(e.target.value)}
                                                className="w-full px-6 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                            >
                                                {testTypes.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-3">問題数</label>
                                            <input
                                                type="number"
                                                value={questionCount}
                                                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                                min="1"
                                                max="10"
                                                className="w-full px-6 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-3">制限時間（分）</label>
                                            <input
                                                type="number"
                                                value={timeLimit}
                                                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                                                min="1"
                                                className="w-full px-6 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 受験者タブ */}
                            {activeTab === "candidate" && (
                                <div className="bg-gradient-to-br from-white to-indigo-50 p-8 rounded-2xl shadow-xl border border-indigo-100">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">受験者設定</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-3">受験者</label>
                                            <select
                                                value={selectedUser}
                                                onChange={(e) => setSelectedUser(e.target.value)}
                                                className="w-full px-6 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                            >
                                                <option value="">受験者を選択してください</option>
                                                {applicants.map((applicant) => (
                                                    <option key={applicant.id} value={applicant.id}>
                                                        {applicant.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-3">プロンプト（追加の指示）</label>
                                            <textarea
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                                className="w-full px-6 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                                rows={4}
                                                placeholder="追加の指示や注意点があれば入力してください..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ボタン */}
                            <div className="space-y-4">
                                <button
                                    onClick={handleCreateTest}
                                    disabled={loading || !title || !selectedUser || !category || !prompt}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] ${loading || !title || !selectedUser || !category || !prompt
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white"
                                        }`}
                                >
                                    {loading ? "生成中..." : "テストを作成"}
                                </button>
                                <button
                                    onClick={handleConfirmTest}
                                    disabled={!generatedQuestions}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] ${!generatedQuestions
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white"
                                        }`}
                                >
                                    テストを確定する
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}