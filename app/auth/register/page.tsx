"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase";

export default function Register() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: ""
    });
    const [companyId, setCompanyId] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. アカウントを作成
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        phone: formData.phoneNumber,
                        company_id: companyId
                    }
                }
            });

            if (authError) throw authError;

            // 2. プロフィールを作成
            const { error: profileError } = await supabase
                .from('applicant_profiles')
                .insert({
                    id: authData.user?.id,
                    applicant_email: formData.email,
                    applicant_firstname: formData.firstName,
                    applicant_lastname: formData.lastName,
                    applicant_phone: formData.phoneNumber,
                });

            if (profileError) throw profileError;

            // 3. applicationsテーブルに初期データを作成
            const { error: applicationError } = await supabase
                .from('applications')
                .insert({
                    id: authData.user?.id,
                    company_id: companyId,
                    applicant_id: authData.user?.id,
                    status: 'pending',
                    applied_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (applicationError) throw applicationError;

            // 成功メッセージを設定
            setMessage("アカウントの作成が完了しました。ログインページからログインしてください。");

            // 3秒後にLPにリダイレクト
            setTimeout(() => {
                router.push("/"); // または適切なLPのパスに変更
            }, 3000);

        } catch (error) {
            console.error("Error in signup:", error);
            setError("アカウントの作成に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getInviteData = async () => {
            try {
                const searchParams = new URLSearchParams(window.location.search);
                const invitationId = searchParams.get('invitation');
                const companyId = searchParams.get('company_id');

                if (invitationId && companyId) {
                    // 招待情報を取得
                    const { data: invitation, error } = await supabase
                        .from('invitations')
                        .select('*')
                        .eq('id', invitationId)
                        .single();

                    if (error) throw error;

                    if (invitation && invitation.status === 'pending') {
                        // URLから取得した企業IDを設定
                        setCompanyId(companyId);

                        // 招待情報を更新
                        await supabase
                            .from('invitations')
                            .update({ status: 'used' })
                            .eq('id', invitationId);
                    }
                }
            } catch (error) {
                console.error("招待データの取得エラー:", error);
            }
        };

        getInviteData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">アカウント登録</h1>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            パスワード
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            姓
                        </label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            名
                        </label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            電話番号
                        </label>
                        <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "登録中..." : "アカウントを作成"}
                    </button>
                </form>

                {message && (
                    <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400">
                        <p className="text-green-700">{message}</p>
                        <p className="text-sm text-green-600 mt-2">
                            まもなくトップページにリダイレクトします...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 