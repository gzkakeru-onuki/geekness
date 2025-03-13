"use client";
import { useState } from "react";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

export default function ExamPage() {
    const [answer, setAnswer] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = () => {
        if (!name || !email || !answer) {
            alert("すべてのフィールドを入力してください。");
            return;
        }
        // 解答を送信する処理をここに追加
        console.log("解答を送信しました", { name, email, answer });
    };

    return (
        <div className="flex h-screen">
            {/* テスト回答画面 */}
            <div className="w-1/2 bg-gray-100 p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">テスト問題</h2>
                <p className="mb-4 text-gray-700">次の関数を完成させてください: <code>function add(a, b) { /* ここにコードを追加 */}</code></p>
                <Editor
                    value={answer}
                    onValueChange={(code) => setAnswer(code)}
                    highlight={code => highlight(code, languages.js, 'javascript')}
                    padding={10}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        minHeight: '200px',
                    }}
                    placeholder={
                        "function add(a, b) {return a + b;}"
                    }
                />
            </div>

            {/* 受験者情報入力 */}
            <div className="w-1/2 bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">受験者情報</h1>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">名前</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="名前を入力してください"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">メールアドレス</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="メールアドレスを入力してください"
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                >
                    解答を送信
                </button>
            </div>
        </div>
    );
}
