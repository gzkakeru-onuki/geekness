"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

function SkillTestResultContent() {
    const searchParams = useSearchParams();
    const [userType, setUserType] = useState<"applicant" | "recruiter">("applicant");
    const [userCode, setUserCode] = useState("// あなたのコードがここに表示されます");
    const [sampleCode, setSampleCode] = useState("// 見本のコードがここに表示されます");
    const [company, setCompany] = useState("Tech Innovators Inc.");
    const [score, setScore] = useState(85);
    const [status, setStatus] = useState("採用");
    const [review, setReview] = useState("コードの効率性が高く、最適化されています。");

    useEffect(() => {
        const type = searchParams.get("type");
        if (type === "recruiter") {
            setUserType("recruiter");
        } else {
            setUserType("applicant");
        }
    }, [searchParams]);

    return (
        <div className="flex h-screen">
            {/* コード表示エリア */}
            <div className="w-1/2 bg-gray-50 p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">{userType === "applicant" ? "見本のコード" : "候補者のコード"}</h2>
                <Editor
                    value={sampleCode}
                    onValueChange={setSampleCode}
                    highlight={code => highlight(code, languages.js, 'javascript')}
                    padding={10}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                        backgroundColor: '#f9f9f9',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        minHeight: '150px',
                        marginBottom: '20px',
                    }}
                />
                <h2 className="text-2xl font-bold mb-4 text-gray-900">{userType === "applicant" ? "あなたのコード" : "見本のコード"}</h2>
                <Editor
                    value={userCode}
                    onValueChange={setUserCode}
                    highlight={code => highlight(code, languages.js, 'javascript')}
                    padding={10}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                        backgroundColor: '#f9f9f9',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        minHeight: '150px',
                    }}
                />
            </div>

            {/* 結果表示エリア */}
            <div className="w-1/2 bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-900">テスト結果</h1>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800">企業名: {company}</h2>
                </div>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800">点数: {score}</h2>
                </div>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800">ステータス: {status}</h2>
                </div>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800">レビュー:</h2>
                    <p className="text-gray-700">{review}</p>
                </div>
            </div>
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
