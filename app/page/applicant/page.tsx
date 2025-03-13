"use client";
import { useState } from "react";

interface Applicant {
    id: number;
    name: string;
    contact: string;
    experience: string;
    status: string;
    language: string;
    position: string;
}

export default function ApplicantListPage() {
    const [applicants] = useState<Applicant[]>([
        {
            id: 1,
            name: "田中 太郎",
            contact: "tanaka@example.com",
            experience: "5年のソフトウェア開発経験。JavaとReactに精通。",
            status: "面接予定",
            language: "プログラミング",
            position: "フロントエンドエンジニア",
        },
        {
            id: 2,
            name: "山田 花子",
            contact: "yamada@example.com",
            experience: "3年のデータサイエンス経験。PythonとRに精通。",
            status: "応募中",
            language: "プログラミング",
            position: "バックエンドエンジニア",
        },
        // 他の応募者データをここに追加
    ]);

    return (
        <div className="flex h-screen">
            <div className="w-full bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">応募者一覧</h1>
                <div className="w-full bg-white p-8 rounded-lg shadow-lg overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr className="bg-blue-200">
                                <th className="py-2 px-4 text-center border-b border-gray-300">名前</th>
                                <th className="py-2 px-4 text-center border-b border-gray-300">連絡先</th>
                                <th className="py-2 px-4 text-center border-b border-gray-300">経歴</th>
                                <th className="py-2 px-4 text-center border-b border-gray-300">ステータス</th>
                                <th className="py-2 px-4 text-center border-b border-gray-300">応募言語</th>
                                <th className="py-2 px-4 text-center border-b border-gray-300">応募職種</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.map(applicant => (
                                <tr key={applicant.id} className="border-t border-gray-300 hover:bg-gray-50">
                                    <td className="py-2 px-4 text-center border-b border-gray-300">{applicant.name}</td>
                                    <td className="py-2 px-4 text-center border-b border-gray-300">{applicant.contact}</td>
                                    <td className="py-2 px-4 text-center border-b border-gray-300">{applicant.experience}</td>
                                    <td className="py-2 px-4 text-center border-b border-gray-300">{applicant.status}</td>
                                    <td className="py-2 px-4 text-center border-b border-gray-300">{applicant.language}</td>
                                    <td className="py-2 px-4 text-center border-b border-gray-300">{applicant.position}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}