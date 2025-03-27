"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function InviteApplicant() {
    const router = useRouter();
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setMessage("メールアドレスを入力してください");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            // 採用担当者の企業IDを取得
            const { data: recruiterData, error: recruiterError } = await supabase
                .from('recruiter_profiles')
                .select('company_id')
                .eq('id', user?.id)
                .maybeSingle();

            if (recruiterError || !recruiterData?.company_id) {
                throw new Error("企業情報の取得に失敗しました");
            }

            // 招待レコードを作成
            const { data: invitation, error: invitationError } = await supabase
                .from('invitations')
                .insert({
                    email: email,
                    company_id: recruiterData.company_id,
                    status: 'pending'
                })
                .select()
                .single();

            if (invitationError) throw invitationError;

            // 招待メールを送信
            const response = await fetch('/api/send-invitation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    invitationId: invitation.id,
                    companyId: recruiterData.company_id
                }),
            });

            if (!response.ok) {
                throw new Error('メール送信に失敗しました');
            }

            setMessage("招待メールを送信しました");
            setInvitedEmails(prev => [...prev, email]);
            setEmail("");

        } catch (error) {
            console.error('Error inviting user:', error);
            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("招待メールの送信に失敗しました");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">受験者を招待</h1>
                            <p className="text-gray-600 mt-1">新規受験者に招待メールを送信します</p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            戻る
                        </button>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${message.includes("失敗") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                            }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                メールアドレス
                            </label>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <EnvelopeIcon className="w-5 h-5 mr-2" />
                                    {loading ? "送信中..." : "招待メールを送信"}
                                </button>
                            </div>
                        </div>
                    </form>

                    {invitedEmails.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">招待済みメールアドレス</h2>
                            <div className="space-y-2">
                                {invitedEmails.map((email, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <span className="text-gray-700">{email}</span>
                                        <span className="text-sm text-green-600">招待済み</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 