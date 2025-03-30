"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { BellIcon, CalendarIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';

interface Notification {
    id: string;
    title: string;
    message: string;
    date: string;
    type: 'interview' | 'application' | 'profile';
    read: boolean;
}

export default function ApplicantNotificationsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'interview' | 'application' | 'profile'>('all');

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
                        title: "面接スケジュールが確定しました",
                        message: "株式会社〇〇との面接が3月20日14:00に確定しました。",
                        date: "2024-03-15",
                        type: "interview",
                        read: false
                    },
                    {
                        id: "2",
                        title: "応募書類が確認されました",
                        message: "株式会社△△があなたの応募書類を確認しました。",
                        date: "2024-03-14",
                        type: "application",
                        read: true
                    },
                    {
                        id: "3",
                        title: "プロフィールの更新を推奨",
                        message: "スキル情報を更新すると、より多くの企業からスカウトを受けられる可能性があります。",
                        date: "2024-03-13",
                        type: "profile",
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
            case 'interview':
                return <CalendarIcon className="w-5 h-5 text-blue-500" />;
            case 'application':
                return <DocumentTextIcon className="w-5 h-5 text-green-500" />;
            case 'profile':
                return <UserIcon className="w-5 h-5 text-purple-500" />;
            default:
                return <BellIcon className="w-5 h-5 text-gray-500" />;
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
                        onClick={() => setFilter('interview')}
                        className={`px-4 py-2 rounded-lg ${filter === 'interview'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        面接関連
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
                        onClick={() => setFilter('profile')}
                        className={`px-4 py-2 rounded-lg ${filter === 'profile'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        プロフィール関連
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
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {notification.title}
                                        </h3>
                                        <p className="mt-1 text-gray-600">
                                            {notification.message}
                                        </p>
                                        <div className="mt-2 text-sm text-gray-500">
                                            {new Date(notification.date).toLocaleDateString('ja-JP')}
                                        </div>
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