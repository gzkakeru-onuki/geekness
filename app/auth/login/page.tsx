"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { supabase } from "@/app/utils/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
    const [activeTab, setActiveTab] = useState("user");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: FormEvent, userType: string) => {
        e.preventDefault();
        setError(null);

        try {
            // まずAuthでログイン
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                console.error("Login error:", authError);
                setError("認証メールを確認していないか、メールアドレスまたはパスワードが正しくありません。");
                return;
            }

            if (!data?.user) {
                setError("ユーザー情報の取得に失敗しました。");
                return;
            }

            // applicant_profilesをチェック
            const { data: applicantProfile, error: applicantError } = await supabase
                .from('applicant_profiles')
                .select('id')
                .eq('id', data.user.id)
                .maybeSingle();

            if (applicantError) {
                console.error("Applicant profile error:", applicantError);
                setError("プロフィール情報の取得に失敗しました。");
                return;
            }

            // recruiter_profilesをチェック
            const { data: recruiterProfile, error: recruiterError } = await supabase
                .from('recruiter_profiles')
                .select('id')
                .eq('id', data.user.id)
                .maybeSingle();

            if (recruiterError) {
                console.error("Recruiter profile error:", recruiterError);
                setError("プロフィール情報の取得に失敗しました。");
                return;
            }

            // プロフィールの存在確認と適切な遷移
            if (applicantProfile) {
                if (userType === "applicant") {
                    router.push("/page/dashboard/applicant");
                } else {
                    setError("このアカウントは採用希望者として登録されています。採用希望者タブからログインしてください。");
                    await supabase.auth.signOut();
                }
            } else if (recruiterProfile) {
                if (userType === "recruiter") {
                    router.push("/page/dashboard/recruiter");
                } else {
                    setError("このアカウントは企業担当者として登録されています。企業担当者タブからログインしてください。");
                    await supabase.auth.signOut();
                }
            } else {
                setError("プロフィール情報が見つかりません。");
                await supabase.auth.signOut();
            }

        } catch (error) {
            console.error("Login process error:", error);
            setError("ログイン処理中にエラーが発生しました。");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
                        Geekness
                    </h1>
                    <p className="text-gray-600 text-lg">アカウントにログイン</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-white/80">
                    <div className="flex justify-center mb-8 space-x-4">
                        <button
                            className={`px-6 py-3 rounded-full transition-all duration-300 flex items-center ${activeTab === "user"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            onClick={() => setActiveTab("user")}
                        >
                            <PersonIcon className="mr-2" />採用希望者
                        </button>
                        <button
                            className={`px-6 py-3 rounded-full transition-all duration-300 flex items-center ${activeTab === "company"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            onClick={() => setActiveTab("company")}
                        >
                            <BusinessIcon className="mr-2" />企業担当者
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {activeTab === "user" && (
                        <form onSubmit={(e) => handleLogin(e, "applicant")} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    メールアドレス
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="example@email.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    パスワード
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center"
                            >
                                <LoginIcon className="mr-2" />ログイン
                            </button>
                            <Link href="/auth/signup" className="block text-center">
                                <p className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">
                                    新規登録はこちら
                                </p>
                            </Link>
                        </form>
                    )}

                    {activeTab === "company" && (
                        <form onSubmit={(e) => handleLogin(e, "recruiter")} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    メールアドレス
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="example@email.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    パスワード
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center"
                            >
                                <LoginIcon className="mr-2" />ログイン
                            </button>
                            <Link href="/auth/signup" className="block text-center">
                                <p className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">
                                    新規登録はこちら
                                </p>
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
