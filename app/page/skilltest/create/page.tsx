"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; // シンタックスハイライトのスタイル

export default function SkillTestCreation() {
    const [prompt, setPrompt] = useState("");
    const [category, setCategory] = useState("general");
    const [tests, setTests] = useState<string[]>([]);
    const router = useRouter();

    const handleCreateTest = () => {
        if (prompt.trim() === "") {
            alert("プロンプトを入力してください。");
            return;
        }
        // テストを作成し、リストに追加
        setTests([...tests, prompt]);
        setPrompt("");
    };

    return (
        <div className="flex h-screen">
            {/* プレビュー画面 */}
            <div className="w-1/2 bg-gray-100 p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">プレビュー</h2>
                <Editor
                    value={tests.join('\n')}
                    onValueChange={(code) => setTests(code.split('\n'))}
                    highlight={code => highlight(code, languages.js, 'javascript')}
                    padding={10}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                        backgroundColor: '#e0f7fa',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        minHeight: '200px',
                    }}
                />
            </div>

            {/* カテゴリ選択とプロンプト入力 */}
            <div className="w-1/2 bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">スキルテスト作成</h1>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">プロンプトを入力</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="ここにプロンプトを入力してください..."
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">カテゴリを選択</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="general">一般</option>
                        <option value="programming">プログラミング</option>
                        <option value="math">数学</option>
                        <option value="science">科学</option>
                    </select>
                </div>
                <button
                    onClick={handleCreateTest}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                >
                    テストを作成
                </button>
            </div>
        </div>
    );
}