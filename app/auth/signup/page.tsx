"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { supabase } from "@/app/utils/supabase";
import { useRouter } from "next/navigation";
import { randomUUID } from "crypto";

export default function Signup() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("user");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastNameKana, setLastNameKana] = useState("");
    const [firstNameKana, setFirstNameKana] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // 企業担当者用の状態管理
    const [companyName, setCompanyName] = useState("");
    const [representativeLastName, setRepresentativeLastName] = useState("");
    const [representativeFirstName, setRepresentativeFirstName] = useState("");
    const [representativeLastNameKana, setRepresentativeLastNameKana] = useState("");
    const [representativeFirstNameKana, setRepresentativeFirstNameKana] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            // 既存ユーザーチェック
            const { data: existingUser } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (existingUser.user) {
                alert("このメールアドレスは既に登録されています");
                return;
            }

            // サインアップ
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            console.log("SignUp Response:", {
                data: data,
                error: error,
                user: data?.user,
                session: data?.session
            });

            if (error) {
                console.error("Signup error details:", {
                    message: error.message,
                    status: error.status,
                    name: error.name
                });
                alert(`サインアップに失敗しました: ${error.message}`);
                return;
            }

            if (!data.user) {
                alert("ユーザー情報の取得に失敗しました");
                return;
            }

            // identitiesの長さが0の場合は既存ユーザー
            if (data.user.identities?.length === 0) {
                alert("このメールアドレスは既に登録されています");
                return;
            }

            console.log("Signup successful");

            // プロフィール登録処理
            if (activeTab === "user") {
                const { data: applicantData, error: applicantError } = await supabase
                    .from('applicant_profiles')
                    .insert({
                        id: data.user?.id,
                        applicant_firstname: firstName,
                        applicant_lastname: lastName,
                        applicant_email: email,
                        applicant_phone: phoneNumber,
                        // 初期値として空または配列を設定
                        applicant_address: "",
                        applicant_birthday: null,
                        applicant_gender: null,
                        applicant_languages: "",
                        applicant_hobbies: "",
                        applicant_self_introduction: "",
                        applicant_education: [],
                        applicant_experience: [],
                        applicant_skills: [],
                        applicant_certifications: [],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                if (applicantError) {
                    console.error("Insert profile error:", applicantError);
                    // プロフィール登録に失敗した場合、作成したユーザーを削除
                    await supabase.auth.admin.deleteUser(data.user.id);
                    alert("プロフィールの登録に失敗しました");
                    return;
                }

                console.log("Profile inserted successfully");
                router.push("/page/dashboard?type=applicant");

            } else if (activeTab === "company") {
                // 1. まず会社情報を登録
                const { data: companyData, error: companyError } = await supabase
                    .from('companies')
                    .insert({
                        id: crypto.randomUUID(),
                        name: companyName,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (companyError) {
                    console.error("Company creation error:", companyError);
                    // 会社登録に失敗した場合、作成したユーザーを削除
                    await supabase.auth.admin.deleteUser(data.user.id);
                    alert("会社情報の登録に失敗しました");
                    return;
                }

                // 2. 採用担当者のプロフィールを作成（company_idを含める）
                const { data: recruiterData, error: recruiterError } = await supabase
                    .from('recruiter_profiles')
                    .insert({
                        id: data.user?.id,
                        company_id: companyData.id, // 作成した会社のIDを設定
                        company_name: companyName,
                        recruiter_firstname: representativeFirstName,
                        recruiter_lastname: representativeLastName,
                        recruiter_email: email,
                        recruiter_phone: phoneNumber,
                        // 初期値として空の文字列を設定
                        company_address: "",
                        company_website: "",
                        department: "",
                        position: "",
                        company_description: "",
                        hiring_process: "",
                        company_benefits: "",
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                if (recruiterError) {
                    console.error("Insert profile error:", recruiterError);
                    // プロフィール登録に失敗した場合、作成した会社とユーザーを削除
                    await supabase.from('companies').delete().eq('id', companyData.id);
                    await supabase.auth.admin.deleteUser(data.user.id);
                    alert("プロフィールの登録に失敗しました");
                    return;
                }

                console.log("Company and Profile inserted successfully");
                router.push("/page/dashboard?type=recruiter");
            }

        } catch (error) {
            console.error("Signup error:", error);
            alert(`サインアップに失敗しました: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                        Geekness
                    </h1>
                    <p className="text-gray-600">新規会員登録</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm bg-white/80">
                    <div className="flex justify-center mb-6 space-x-4">
                        <button
                            className={`px-5 py-2 rounded-full transition-all duration-300 flex items-center ${activeTab === "user"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            onClick={() => setActiveTab("user")}
                        >
                            <PersonIcon className="mr-1" />採用希望者
                        </button>
                        <button
                            className={`px-5 py-2 rounded-full transition-all duration-300 flex items-center ${activeTab === "company"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            onClick={() => setActiveTab("company")}
                        >
                            <BusinessIcon className="mr-1" />企業担当者
                        </button>
                    </div>

                    {activeTab === "user" && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">姓</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="ジーク"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">名</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="太郎"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">姓（フリガナ）</label>
                                    <input
                                        type="text"
                                        value={lastNameKana}
                                        onChange={(e) => setLastNameKana(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="ジーク"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">名（フリガナ）</label>
                                    <input
                                        type="text"
                                        value={firstNameKana}
                                        onChange={(e) => setFirstNameKana(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="タロウ"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="example@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                                    <input
                                        type="text"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="09012345678"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                    placeholder="********"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 text-sm"
                            >
                                サインアップ
                            </button>

                            <Link href="/auth/login" className="block text-center">
                                <p className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200 text-sm">
                                    すでにアカウントをお持ちの方はこちら
                                </p>
                            </Link>
                        </form>
                    )}

                    {activeTab === "company" && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">企業名</label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                    placeholder="株式会社Geekness"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">担当者姓</label>
                                    <input
                                        type="text"
                                        value={representativeLastName}
                                        onChange={(e) => setRepresentativeLastName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="義育"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">担当者名</label>
                                    <input
                                        type="text"
                                        value={representativeFirstName}
                                        onChange={(e) => setRepresentativeFirstName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="太郎"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">担当者姓（フリガナ）</label>
                                    <input
                                        type="text"
                                        value={representativeLastNameKana}
                                        onChange={(e) => setRepresentativeLastNameKana(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="ジーク"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">担当者名（フリガナ）</label>
                                    <input
                                        type="text"
                                        value={representativeFirstNameKana}
                                        onChange={(e) => setRepresentativeFirstNameKana(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="タロウ"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="example@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                                    <input
                                        type="text"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="09012345678"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                    placeholder="********"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 text-sm"
                            >
                                サインアップ
                            </button>

                            <Link href="/auth/login" className="block text-center">
                                <p className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200 text-sm">
                                    すでにアカウントをお持ちの方はこちら
                                </p>
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
