"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { DocumentTextIcon, BuildingOfficeIcon, ChartBarIcon, TagIcon } from '@heroicons/react/24/outline';

interface Application {
    id: string;
    company: string;
    position: string;
    appliedDate: string;
    status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
    nextStep?: string;
    nextDate?: string;
    score?: number;
    tags: string[];
}

export default function ApplicantApplicationsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted'>('all');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // TODO: APIから応募データを取得
                // 仮のデータ
                const mockApplications: Application[] = [
                    {
                        id: "1",
                        company: "株式会社テクノロジー",
                        position: "シニアフロントエンドエンジニア",
                        appliedDate: "2024-03-15",
                        status: "interview",
                        nextStep: "技術面接",
                        nextDate: "2024-03-25",
                        score: 85,
                        tags: ["React", "TypeScript", "AWS"]
                    },
                    {
                        id: "2",
                        company: "株式会社イノベーション",
                        position: "バックエンドエンジニア",
                        appliedDate: "2024-03-14",
                        status: "reviewing",
                        nextStep: "書類選考結果",
                        nextDate: "2024-03-20",
                        score: 92,
                        tags: ["Node.js", "TypeScript", "GCP"]
                    }
                ];

                setApplications(mockApplications);
            } catch (error) {
                console.error('Error fetching applications:', error);
                setError("応募情報の取得中にエラーが発生しました。");
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const getStatusColor = (status: Application['status']) => {
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

    const getStatusText = (status: Application['status']) => {
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

    const filteredApplications = applications.filter(application =>
        filter === 'all' || application.status === filter
    );

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
                title="応募状況"
                subtitle="すべての応募状況を確認できます"
                showBackButton
                backUrl="/page/dashboard/applicant"
            />

            <main className="max-w-4xl mx-auto p-6">
                {/* フィルター */}
                <div className="mb-6 flex space-x-4">
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

                {/* 応募一覧 */}
                <div className="space-y-4">
                    {filteredApplications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            応募情報はありません
                        </div>
                    ) : (
                        filteredApplications.map((application) => (
                            <div
                                key={application.id}
                                className="bg-white rounded-xl shadow-sm p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {application.company}
                                            </h3>
                                        </div>
                                        <p className="mt-1 text-gray-600">
                                            {application.position}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                        {getStatusText(application.status)}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-600">
                                            応募日: {new Date(application.appliedDate).toLocaleDateString('ja-JP')}
                                        </span>
                                    </div>
                                    {application.score && (
                                        <div className="flex items-center space-x-2">
                                            <ChartBarIcon className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-600">
                                                スコア: {application.score}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {application.nextStep && (
                                    <div className="mt-4 text-sm text-gray-600">
                                        次のステップ: {application.nextStep}
                                        {application.nextDate && ` (${new Date(application.nextDate).toLocaleDateString('ja-JP')})`}
                                    </div>
                                )}

                                {application.tags.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {application.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                            >
                                                <TagIcon className="w-3 h-3 mr-1" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
} 