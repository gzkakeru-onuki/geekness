"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { DocumentTextIcon, BuildingOfficeIcon, ChartBarIcon, TagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from "next/link";

interface Applicant {
    id: string;
    name: string;
    position: string;
    appliedDate: string;
    status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
    nextStep?: string;
    nextDate?: string;
    score?: number;
    tags: string[];
    experience: string;
    skills: string[];
}

export default function RecruiterApplicantsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted'>('all');
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // TODO: APIから応募者データを取得
                // 仮のデータ
                const mockApplicants: Applicant[] = [
                    {
                        id: "1",
                        name: "山田 太郎",
                        position: "シニアフロントエンドエンジニア",
                        appliedDate: "2024-03-15",
                        status: "interview",
                        nextStep: "技術面接",
                        nextDate: "2024-03-25",
                        score: 85,
                        tags: ["React", "TypeScript", "AWS"],
                        experience: "5年",
                        skills: ["フロントエンド開発", "UI/UXデザイン", "チームリーダーシップ"]
                    },
                    {
                        id: "2",
                        name: "佐藤 一郎",
                        position: "バックエンドエンジニア",
                        appliedDate: "2024-03-14",
                        status: "reviewing",
                        nextStep: "書類選考結果",
                        nextDate: "2024-03-20",
                        score: 92,
                        tags: ["Node.js", "TypeScript", "GCP"],
                        experience: "3年",
                        skills: ["バックエンド開発", "データベース設計", "マイクロサービス"]
                    }
                ];

                setApplicants(mockApplicants);
            } catch (error) {
                console.error('Error fetching applicants:', error);
                setError("応募者情報の取得中にエラーが発生しました。");
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplicants();
    }, []);

    const getStatusColor = (status: Applicant['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'reviewing':
                return 'bg-blue-100 text-blue-800';
            case 'interview':
                return 'bg-purple-100 text-purple-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: Applicant['status']) => {
        switch (status) {
            case 'pending':
                return '応募済み';
            case 'reviewing':
                return '審査中';
            case 'interview':
                return '面接中';
            case 'rejected':
                return '不採用';
            case 'accepted':
                return '採用';
            default:
                return '不明';
        }
    };

    const filteredApplicants = applicants.filter(applicant => {
        const matchesFilter = filter === 'all' || applicant.status === filter;
        const matchesSearch = applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            applicant.position.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <PageHeader
                title="応募者一覧"
                subtitle="すべての応募者を確認できます"
                showBackButton
                backUrl="/page/dashboard/recruiter"
            />

            <main className="max-w-4xl mx-auto p-6">
                {/* 検索とフィルター */}
                <div className="mb-6 space-y-4">
                    {/* 検索バー */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="応募者名または職種で検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* フィルター */}
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg ${filter === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            すべて
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-lg ${filter === 'pending'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            応募済み
                        </button>
                        <button
                            onClick={() => setFilter('reviewing')}
                            className={`px-4 py-2 rounded-lg ${filter === 'reviewing'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            審査中
                        </button>
                        <button
                            onClick={() => setFilter('interview')}
                            className={`px-4 py-2 rounded-lg ${filter === 'interview'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            面接中
                        </button>
                        <button
                            onClick={() => setFilter('accepted')}
                            className={`px-4 py-2 rounded-lg ${filter === 'accepted'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            採用
                        </button>
                        <button
                            onClick={() => setFilter('rejected')}
                            className={`px-4 py-2 rounded-lg ${filter === 'rejected'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            不採用
                        </button>
                    </div>
                </div>

                {/* 応募者一覧 */}
                <div className="space-y-4">
                    {filteredApplicants.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            応募者は見つかりません
                        </div>
                    ) : (
                        filteredApplicants.map((applicant) => (
                            <Link
                                key={applicant.id}
                                href={`/page/dashboard/recruiter/applicants/${applicant.id}`}
                                className="block"
                            >
                                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {applicant.name}
                                            </h3>
                                            <p className="mt-1 text-gray-600">
                                                {applicant.position}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicant.status)}`}>
                                            {getStatusText(applicant.status)}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-600">
                                                応募日: {new Date(applicant.appliedDate).toLocaleDateString('ja-JP')}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-600">
                                                経験年数: {applicant.experience}
                                            </span>
                                        </div>
                                        {applicant.score && (
                                            <div className="flex items-center space-x-2">
                                                <ChartBarIcon className="w-5 h-5 text-gray-400" />
                                                <span className="text-gray-600">
                                                    スコア: {applicant.score}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {applicant.nextStep && (
                                        <div className="mt-4 text-sm text-gray-600">
                                            次のステップ: {applicant.nextStep}
                                            {applicant.nextDate && ` (${new Date(applicant.nextDate).toLocaleDateString('ja-JP')})`}
                                        </div>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {applicant.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                            >
                                                <TagIcon className="w-3 h-3 mr-1" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-4 text-sm text-gray-600">
                                        スキル: {applicant.skills.join(", ")}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
} 