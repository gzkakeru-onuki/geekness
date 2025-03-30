"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import {
    CalendarIcon,
    ClockIcon,
    UserGroupIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

interface Interview {
    id: string;
    applicantName: string;
    date: string;
    time: string;
    type: string;
    status: "scheduled" | "completed" | "cancelled";
}

export default function InterviewDetailPage() {
    const { user } = useAuth();
    const params = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [interview, setInterview] = useState<Interview | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchInterview = async () => {
            if (!user) return;

            try {
                // デモ用のデータ
                const demoInterview: Interview = {
                    id: params.id as string,
                    applicantName: "山田 太郎",
                    date: "2024-03-20",
                    time: "14:00",
                    type: "一次面接",
                    status: "scheduled"
                };
                setInterview(demoInterview);
            } catch (error) {
                console.error('Error fetching interview:', error);
                setError("面接スケジュールの取得中にエラーが発生しました。");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterview();
    }, [user, params.id]);

    const handleStatusUpdate = async (newStatus: Interview["status"]) => {
        if (!user || !interview) return;

        // 完了・キャンセルの場合は確認アラートを表示
        if (newStatus === "completed" || newStatus === "cancelled") {
            const message = newStatus === "completed"
                ? "面接スケジュールを完了としてマークします。よろしいですか？"
                : "面接スケジュールをキャンセルとしてマークします。よろしいですか？";

            if (!window.confirm(message)) {
                return;
            }
        }

        setIsUpdating(true);
        setError(null);

        try {
            // デモ用の処理
            console.log("面接ステータス更新:", { id: interview.id, status: newStatus });
            // 実際の実装ではここでSupabaseにデータを保存
            setInterview(prev => prev ? { ...prev, status: newStatus } : null);

            // 完了・キャンセルの場合は前の画面に戻る
            if (newStatus === "completed" || newStatus === "cancelled") {
                window.location.href = "/page/dashboard/recruiter/interviews";
            }
        } catch (error) {
            console.error('Error updating interview status:', error);
            setError("面接ステータスの更新中にエラーが発生しました。");
        } finally {
            setIsUpdating(false);
        }
    };

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (isLoading || !interview) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const statusColors = {
        scheduled: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800"
    };

    const statusLabels = {
        scheduled: "予定",
        completed: "完了",
        cancelled: "キャンセル"
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <PageHeader
                title="面接スケジュール詳細"
                subtitle={`${interview.applicantName}さんの${interview.type}`}
                showBackButton
                backUrl="/page/dashboard/recruiter/interviews"
                className="bg-white/80 backdrop-blur-lg border-b border-gray-200"
            />

            <main className="max-w-2xl mx-auto p-6">
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 space-y-8">
                    {/* 面接情報 */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <UserGroupIcon className="h-6 w-6 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-500">応募者名</div>
                                <div className="text-lg font-medium">{interview.applicantName}</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <CalendarIcon className="h-6 w-6 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-500">面接日</div>
                                <div className="text-lg font-medium">{interview.date}</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <ClockIcon className="h-6 w-6 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-500">面接時間</div>
                                <div className="text-lg font-medium">{interview.time}</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="h-6 w-6 flex items-center justify-center text-gray-400">
                                {interview.status === "completed" ? (
                                    <CheckCircleIcon className="h-6 w-6" />
                                ) : interview.status === "cancelled" ? (
                                    <XCircleIcon className="h-6 w-6" />
                                ) : (
                                    <div className="h-3 w-3 rounded-full bg-blue-400" />
                                )}
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">ステータス</div>
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${statusColors[interview.status]}`}>
                                    {statusLabels[interview.status]}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ステータス更新ボタン */}
                    <div className="border-t pt-6">
                        <div className="text-sm font-medium text-gray-700 mb-4">ステータスを更新</div>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => handleStatusUpdate("scheduled")}
                                disabled={isUpdating || interview.status === "scheduled"}
                                className="flex-1 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                予定
                            </button>
                            <button
                                onClick={() => handleStatusUpdate("completed")}
                                disabled={isUpdating || interview.status === "completed"}
                                className="flex-1 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                完了
                            </button>
                            <button
                                onClick={() => handleStatusUpdate("cancelled")}
                                disabled={isUpdating || interview.status === "cancelled"}
                                className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>

                    {/* 確定ボタン */}
                    {interview.status === "scheduled" && (
                        <div className="border-t pt-6">
                            <div className="text-sm font-medium text-gray-700 mb-4">面接スケジュールの確定</div>
                            <button
                                onClick={() => handleStatusUpdate("completed")}
                                disabled={isUpdating}
                                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {isUpdating ? (
                                    <>
                                        <LoadingSpinner />
                                        <span>確定中...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="w-5 h-5" />
                                        <span>面接スケジュールを確定する</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
} 