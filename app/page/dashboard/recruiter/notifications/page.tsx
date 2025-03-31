"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { BellIcon, UserGroupIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface Notification {
    id: string;
    title: string;
    message: string;
    date: string;
    type: 'application' | 'interview' | 'test' | 'system';
    read: boolean;
    applicantName?: string;
}

export default function RecruiterNotificationsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'application' | 'interview' | 'test' | 'system'>('all');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // TODO: APIから通知データを取得
                // 仮のデータ
                const mockNotifications: Notification[] = [
                    {
                        id: "1",
                        title: "新規応募がありました",
                        message: "シニアフロントエンドエンジニア職に新規応募がありました。",
                        date: "2024-03-15",
                        type: "application",
                        read: false,
                        applicantName: "山田 太郎"
                    },
                    {
                        id: "2",
                        title: "面接スケジュールの更新",
                        message: "鈴木 花子さんの面接スケジュールが更新されました。",
                        date: "2024-03-14",
                        type: "interview",
                        read: true,
                        applicantName: "鈴木 花子"
                    },
                    {
                        id: "3",
                        title: "テスト結果が公開されました",
                        message: "佐藤 一郎さんのスキルテスト結果が公開されました。",
                        date: "2024-03-13",
                        type: "test",
                        read: true,
                        applicantName: "佐藤 一郎"
                    },
                    {
                        id: "4",
                        title: "システムメンテナンスのお知らせ",
                        message: "3月20日の深夜にシステムメンテナンスを実施します。",
                        date: "2024-03-12",
                        type: "system",
                        read: true
                    }
                ];

                setNotifications(mockNotifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setError("通知の取得中にエラーが発生しました。");
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'application':
                return <DocumentTextIcon className="w-5 h-5 text-green-500" />;
            case 'interview':
                return <UserGroupIcon className="w-5 h-5 text-blue-500" />;
            case 'test':
                return <ChartBarIcon className="w-5 h-5 text-purple-500" />;
            case 'system':
                return <BellIcon className="w-5 h-5 text-gray-500" />;
            default:
                return <BellIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getNotificationTypeText = (type: Notification['type']) => {
        switch (type) {
            case 'application':
                return '応募関連';
            case 'interview':
                return '面接関連';
            case 'test':
                return 'テスト関連';
            case 'system':
                return 'システム通知';
            default:
                return 'その他';
        }
    };

    const filteredNotifications = notifications.filter(notification =>
        filter === 'all' || notification.type === filter
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
                title="通知一覧"
                subtitle="すべての通知を確認できます"
                showBackButton
                backUrl="/page/dashboard/recruiter"
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
                        onClick={() => setFilter('application')}
                        className={`px-4 py-2 rounded-lg ${filter === 'application'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        応募関連
                    </button>
                    <button
                        onClick={() => setFilter('interview')}
                        className={`px-4 py-2 rounded-lg ${filter === 'interview'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        面接関連
                    </button>
                    <button
                        onClick={() => setFilter('test')}
                        className={`px-4 py-2 rounded-lg ${filter === 'test'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        テスト関連
                    </button>
                    <button
                        onClick={() => setFilter('system')}
                        className={`px-4 py-2 rounded-lg ${filter === 'system'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        システム通知
                    </button>
                </div>

                {/* 通知一覧 */}
                <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            通知はありません
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-xl shadow-sm p-6 ${!notification.read ? 'border-l-4 border-indigo-500' : ''
                                    }`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {notification.title}
                                            </h3>
                                            <span className="text-sm text-gray-500">
                                                {new Date(notification.date).toLocaleDateString('ja-JP')}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-gray-600">
                                            {notification.message}
                                        </p>
                                        {notification.applicantName && (
                                            <div className="mt-2 text-sm text-gray-500">
                                                対象者: {notification.applicantName}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
} 