"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; // シンタックスハイライトのスタイル
import 'prismjs/components/prism-markdown';

export default function SkillTestCreation() {
    const [prompt, setPrompt] = useState("");
    const [category, setCategory] = useState("general");
    const [generatedQuestions, setGeneratedQuestions] = useState<string>("");
    const [title, setTitle] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [timeLimit, setTimeLimit] = useState(0);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreateTest = async () => {
        if (prompt.trim() === "") {
            alert("プロンプトを入力してください。");
            return;
        }

        setLoading(true);
        try {
            // GeminiAPIを呼び出し
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `あなたはとても優秀なプログラミングのスキルテストの作成者です。
                    以下の条件でプログラミングのスキルテスト問題を5問作成してください：
                    - カテゴリ: ${category}
                    - 内容: ${prompt}
                    - 形式: 各問題には問題文、選択肢、正解を含めてくだ  さい。
                    - 出力形式: 問題ごとに番号をつけて、markdown形式で出力してください。返答は不要です。`
                }),
            });

            if (!response.ok) {
                throw new Error('問題の生成に失敗しました');
            }

            const data = await response.json();
            if (data.success) {
                setGeneratedQuestions(data.data);
            } else {
                throw new Error(data.error || '問題の生成に失敗しました');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen">
            {/* プレビュー画面 */}
            <div className="w-1/2 bg-gray-100 p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">プレビュー</h2>
                <Editor
                    value={generatedQuestions}
                    onValueChange={(code) => setGeneratedQuestions(code)}
                    highlight={code => highlight(code, languages.markdown, 'markdown')}
                    padding={10}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                        backgroundColor: '#e0f7fa',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        minHeight: '600px',
                        maxHeight: '600px',
                        overflow: 'auto',
                    }}
                />
            </div>

            {/* カテゴリ選択とプロンプト入力 */}
            <div className="w-1/2 bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">スキルテスト作成</h1>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">タイトルを入力</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mb-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="block text-gray-700 font-semibold mb-2">受験者を選択</label>
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="user1">ユーザー1</option>
                        <option value="user2">ユーザー2</option>
                        <option value="user3">ユーザー3</option>
                    </select>
                    <label className="block text-gray-700 font-semibold mb-2">制限時間を入力</label>
                    <input
                        type="number"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                        className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="block text-gray-700 font-semibold mb-2">プロンプトを入力</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="ここにプロンプトを入力してください..."
                    />
                </div>
                <button
                    onClick={handleCreateTest}
                    disabled={loading || !title || !selectedUser || !category || !prompt}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${loading || !title || !selectedUser || !category || !prompt
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                >
                    {loading ? "生成中..." : "テストを作成"}
                </button>
            </div>
        </div>
    );
}