"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { CalendarIcon, VideoCameraIcon, BuildingOfficeIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Interview {
    id: string;
    company: string;
    position: string;
    date: string;
    time: string;
    type: 'online' | 'offline';
    location?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    interviewer?: string;
    notes?: string;
}

export default function ApplicantInterviewsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // TODO: APIから面接データを取得
                // 仮のデータ
                const mockInterviews: Interview[] = [
                    {
                        id: "1",
                        company: "株式会社テクノロジー",
                        position: "シニアフロントエンドエンジニア",
                        date: "2024-03-20",
                        time: "14:00",
                        type: "online",
                        status: "scheduled",
                        interviewer: "山田 太郎",
                        notes: "Zoomを使用したオンライン面接です。"
                    },
                    {
                        id: "2",
                        company: "株式会社イノベーション",
                        position: "バックエンドエンジニア",
                        date: "2024-03-15",
                        time: "15:30",
                        type: "offline",
                        location: "東京都渋谷区〇〇ビル 5F",
                        status: "completed",
                        interviewer: "鈴木 花子",
                        notes: "技術面接が行われます。"
                    }
                ];

                setInterviews(mockInterviews);
            } catch (error) {
                console.error('Error fetching interviews:', error);
                setError("面接情報の取得中にエラーが発生しました。");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterviews();
    }, []);

    const getStatusColor = (status: Interview['status']) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: Interview['status']) => {
        switch (status) {
            case 'scheduled':
                return '予定';
            case 'completed':
                return '完了';
            case 'cancelled':
                return 'キャンセル';
            default:
                return '不明';
        }
    };

    const filteredInterviews = interviews.filter(interview =>
        filter === 'all' || interview.status === filter
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
                title="面接スケジュール"
                subtitle="すべての面接スケジュールを確認できます"
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
                        onClick={() => setFilter('scheduled')}
                        className={`px-4 py-2 rounded-lg ${filter === 'scheduled'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        予定
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-lg ${filter === 'completed'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        完了
                    </button>
                    <button
                        onClick={() => setFilter('cancelled')}
                        className={`px-4 py-2 rounded-lg ${filter === 'cancelled'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        キャンセル
                    </button>
                </div>

                {/* 面接一覧 */}
                <div className="space-y-4">
                    {filteredInterviews.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            面接スケジュールはありません
                        </div>
                    ) : (
                        filteredInterviews.map((interview) => (
                            <div
                                key={interview.id}
                                className="bg-white rounded-xl shadow-sm p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {interview.company}
                                            </h3>
                                        </div>
                                        <p className="mt-1 text-gray-600">
                                            {interview.position}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
                                        {getStatusText(interview.status)}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-600">
                                            {new Date(interview.date).toLocaleDateString('ja-JP')}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <ClockIcon className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-600">
                                            {interview.time}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {interview.type === 'online' ? (
                                            <VideoCameraIcon className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                                        )}
                                        <span className="text-gray-600">
                                            {interview.type === 'online' ? 'オンライン面接' : '対面面接'}
                                        </span>
                                    </div>
                                    {interview.location && (
                                        <div className="flex items-center space-x-2">
                                            <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-600">
                                                {interview.location}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {interview.interviewer && (
                                    <div className="mt-4 text-sm text-gray-600">
                                        面接官: {interview.interviewer}
                                    </div>
                                )}

                                {interview.notes && (
                                    <div className="mt-4 text-sm text-gray-600">
                                        備考: {interview.notes}
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