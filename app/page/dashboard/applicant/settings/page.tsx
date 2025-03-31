"use client";
import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Cog6ToothIcon, BellIcon, LockClosedIcon, GlobeAltIcon, TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/app/utils/supabase";

export default function ApplicantSettings() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSignOut = async () => {
        try {
            const confirmed = confirm("ログアウトしますか？");
            if (confirmed) {
                await signOut();
                router.push("/");
            }
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            // 設定の保存処理を実装
            setMessage("設定を保存しました");
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage("設定の保存に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const handleAccountDelete = async () => {
        if (confirm("本当にアカウントを削除しますか？この操作は取り消せません。")) {
            try {
                setLoading(true);
                setMessage("");

                // applicant_profilesテーブルから削除
                const { error: applicantError } = await supabase
                    .from('applicant_profiles')
                    .delete()
                    .eq('id', user?.id);

                if (applicantError) {
                    console.error("プロファイル削除エラー:", applicantError);
                    setMessage("アカウントの削除に失敗しました");
                    return;
                }

                // APIルートを呼び出してユーザーを削除
                const response = await fetch('/api/deleteUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: user?.id }),
                });

                if (!response.ok) {
                    console.error("ユーザー削除エラー:", await response.json());
                    setMessage("アカウントの削除に失敗しました");
                } else {
                    setMessage("アカウントが削除されました");
                    setTimeout(() => {
                        router.push("/");
                    }, 2000);
                }
            } catch (error) {
                console.error("アカウント削除エラー:", error);
                setMessage("アカウントの削除に失敗しました");
            } finally {
                setLoading(false);
            }
        }
    };

    if (!user) {
        return <ErrorMessage message="ログインが必要です" />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <PageHeader
                title="設定"
                subtitle="アカウントと通知の設定を管理できます"
                showBackButton
                backUrl="/page/dashboard/applicant"
            />

            <main className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        {/* 通知設定 */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <BellIcon className="w-5 h-5 mr-2 text-gray-400" />
                                通知設定
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">メール通知</label>
                                        <p className="text-sm text-gray-500">面接スケジュールや応募状況の更新をメールで通知</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <span className="sr-only">メール通知を有効にする</span>
                                        <span className="translate-x-5 pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out">
                                            <span className="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in-out">
                                                <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 12 12">
                                                    <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" fill="currentColor" />
                                                </svg>
                                            </span>
                                        </span>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">ブラウザ通知</label>
                                        <p className="text-sm text-gray-500">ブラウザで通知を表示</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <span className="sr-only">ブラウザ通知を有効にする</span>
                                        <span className="translate-x-0 pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out">
                                            <span className="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in-out">
                                                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                                                    <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" fill="currentColor" />
                                                </svg>
                                            </span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* プライバシー設定 */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <LockClosedIcon className="w-5 h-5 mr-2 text-gray-400" />
                                プライバシー設定
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">プロフィールの公開設定</label>
                                        <p className="text-sm text-gray-500">企業にプロフィールを公開する</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <span className="sr-only">プロフィールを公開する</span>
                                        <span className="translate-x-5 pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out">
                                            <span className="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in-out">
                                                <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 12 12">
                                                    <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" fill="currentColor" />
                                                </svg>
                                            </span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 言語設定 */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <GlobeAltIcon className="w-5 h-5 mr-2 text-gray-400" />
                                言語設定
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">表示言語</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="ja">日本語</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* アカウント削除 */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <TrashIcon className="w-5 h-5 mr-2 text-gray-400" />
                                アカウント削除
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">アカウントを削除</h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <p>アカウントを削除すると、すべてのデータが完全に削除され、復元できなくなります。</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <div className="-mx-2 -my-1.5 flex">
                                            <button
                                                type="button"
                                                onClick={handleAccountDelete}
                                                disabled={loading}
                                                className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50 disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <>
                                                        <LoadingSpinner className="w-4 h-4 mr-2" />
                                                        削除中...
                                                    </>
                                                ) : (
                                                    "アカウントを削除"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 保存ボタン */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner className="w-4 h-4 mr-2" />
                                        保存中...
                                    </>
                                ) : (
                                    "設定を保存"
                                )}
                            </button>
                        </div>

                        {/* メッセージ */}
                        {message && (
                            <div className="mt-4 p-4 rounded-md bg-green-50 text-green-700 border border-green-200">
                                {message}
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
} 