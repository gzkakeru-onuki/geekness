"use client";
import { useState, useEffect, useCallback } from "react";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import { supabase } from "@/app/utils/supabase";
import { useRouter } from 'next/navigation';

// モックデータ
const MOCK_TEST_INFO = {
    title: "フロントエンドチャレンジ",
    description: "Reactを使用したモダンなUIコンポーネントの実装に挑戦します。コンポーネントの設計、状態管理、パフォーマンス最適化など、実践的なスキルを評価します。",
    programming_language: "JavaScript / React",
    difficulty: "中級",
    time_limit: 60,
    start_date: "2024-03-15",
    end_date: "2024-03-22",
    status: 'active' as const
};

const MOCK_QUESTION = `/**
 * チャレンジ: カスタムフックの作成
 * 
 * 以下の要件に従って、カスタムフックを作成してください。
 * 
 * 要件:
 * 1. useLocalStorageというカスタムフックを作成する
 * 2. キーと初期値を引数として受け取る
 * 3. ローカルストレージにデータを保存・取得する
 * 4. 値が変更されたときに自動的にローカルストレージを更新する
 * 5. 型安全性を確保する
 * 
 * 例:
 * const [value, setValue] = useLocalStorage('key', 'initialValue');
 * 
 * 評価基準:
 * - コードの品質と可読性
 * - エラーハンドリング
 * - パフォーマンスの考慮
 * - TypeScriptの型定義
 */

// ここにコードを書いてください
`;

const MOCK_USER = {
    name: "山田 太郎",
    email: "yamada.taro@example.com"
};

export default function ChallengeTestPage() {
    const router = useRouter();
    const [name, setName] = useState(MOCK_USER.name);
    const [email, setEmail] = useState(MOCK_USER.email);
    const [question, setQuestion] = useState(MOCK_QUESTION);
    const [testId, setTestId] = useState("challenge-1");
    const [timeLeft, setTimeLeft] = useState(MOCK_TEST_INFO.time_limit * 60);
    const [isStarted, setIsStarted] = useState(false);
    const [isEditorDisabled, setIsEditorDisabled] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testInfo, setTestInfo] = useState(MOCK_TEST_INFO);

    // テスト開始ハンドラー
    const handleStart = () => {
        if (window.confirm('チャレンジテストを開始しますか？開始後は制限時間内に終了する必要があります。')) {
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

    // タイマー機能
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isStarted && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
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

    // モックの送信処理
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

            // モックの送信遅延
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 送信完了後、ダッシュボードに遷移
            router.push('/page/dashboard/applicant');

        } catch (error) {
            console.error("Error in handleSubmit:", error);
            alert("エラーが発生しました。");
        } finally {
            setIsSubmitting(false);
        }
    }, [name, email, question, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex flex-col">
            {/* ヘッダーセクション */}
            <header className="bg-white/90 backdrop-blur-lg shadow-lg p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600">
                                    {testInfo.title}
                                </h1>
                            </div>
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
                            {/* タイマー表示 */}
                            {isStarted && (
                                <div className={`px-4 py-2 rounded-lg bg-white border-2 ${timeLeft < 300 ? 'border-red-500 text-red-600' : 'border-purple-500 text-purple-600'} font-bold text-xl`}>
                                    残り時間: {formatTime(timeLeft)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* テスト情報の表示 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs text-gray-500">使用言語</span>
                            <p className="font-medium text-gray-800">{testInfo.programming_language}</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs text-gray-500">難易度</span>
                            <p className="font-medium text-gray-800">{testInfo.difficulty}</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs text-gray-500">制限時間</span>
                            <p className="font-medium text-gray-800">{testInfo.time_limit}分</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-xs text-gray-500">開催期間</span>
                            <p className="font-medium text-gray-800">
                                {new Date(testInfo.start_date).toLocaleDateString('ja-JP')} 〜
                                {new Date(testInfo.end_date).toLocaleDateString('ja-JP')}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 p-4 my-4 rounded-r-lg">
                        <h2 className="text-lg font-semibold text-purple-800 mb-2">チャレンジテストの注意事項</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-purple-700">
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                                開始ボタンを押すとタイマーが作動します
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                                制限時間は{testInfo.time_limit}分です（残り5分で赤く表示されます）
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                                提出後の修正はできません
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                                インターネットの検索は禁止です
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                                時間切れの場合は自動で提出されます
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                                結果は他の受験者と比較されます
                            </li>
                        </ul>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="flex-1 max-w-7xl mx-auto p-6 w-full">
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
                        // テスト未開始時の表示
                        <div className="text-center py-12">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">チャレンジテストの準備ができました</h3>
                                <p className="text-gray-600">開始ボタンをクリックしてテストを開始してください</p>
                            </div>
                            <button
                                onClick={handleStart}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02]"
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
                                    className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative"
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
        </div>
    );
}
