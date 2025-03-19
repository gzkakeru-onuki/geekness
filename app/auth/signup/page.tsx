"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { supabase } from "@/app/utils/supabase";
import { useRouter } from "next/navigation";

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
        // サインアップ
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            alert("サインアップに失敗しました");
        } else {
            console.log("Signup successful");
        }


        if (activeTab === "user") {
            // ユーザープロファイルを更新
            const { data: applicantData, error: applicantError } = await supabase.from('applicant_profiles').insert({
                id: data.user?.id,
                email: email,
                password: password,
                applicant_lastname: lastName,
                applicant_firstname: firstName,
                applicant_lastname_kana: lastNameKana,
                applicant_firstname_kana: firstNameKana,
                phone_number: phoneNumber,
                role: activeTab === "user" ? "applicant" : "company", //登録種別
            });
            if (applicantError) {
                console.error("Insert profile error:", applicantError);
                console.log("Error details:", JSON.stringify(applicantError, null, 2));
            } else {
                console.log("Profile inserted successfully");
                console.log("Inserted data:", applicantData);
                router.push("/page/dashboard?type=applicant");
            }
        } else if (activeTab === "company") {
            const { data: companyData, error: companyError } = await supabase.from('recruiter_profiles').insert({
                id: data.user?.id,
                email: email,
                password: password,
                company_name: companyName, // 企業名
                recruiter_lastname: representativeLastName, // 担当者姓
                recruiter_firstname: representativeFirstName, // 担当者名
                recruiter_lastname_kana: representativeLastNameKana, // 担当者姓（フリガナ）
                recruiter_firstname_kana: representativeFirstNameKana, // 担当者名（フリガナ）
                phone_number: phoneNumber,
                role: activeTab === "company" ? "recruiter" : "applicant", //登録種別
            });
            if (companyError) {
                console.error("Insert profile error:", companyError);
                console.log("Error details:", JSON.stringify(companyError, null, 2));
            } else {
                console.log("Profile inserted successfully");
                console.log("Inserted data:", companyData);
                router.push("/page/dashboard?type=recruiter");
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-extrabold text-center mb-4 text-gray-800">まずは会員登録</h1>
            <h1 className="text-xl font-bold text-center mb-2 text-gray-800"><span className="text-blue-600">登録種別</span>を選択してください。</h1>
            <div className="flex justify-center mb-2">
                <button
                    className={`px-4 py-2 mx-1 rounded-full transition-colors duration-300 ${activeTab === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                        }`}
                    onClick={() => setActiveTab("user")}
                >
                    <PersonIcon className="mr-1" />採用希望者
                </button>
                <button
                    className={`px-4 py-2 mx-1 rounded-full transition-colors duration-300 ${activeTab === "company" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
                        }`}
                    onClick={() => setActiveTab("company")}
                >
                    <BusinessIcon className="mr-1" />企業担当者
                </button>
            </div>

            <div className="max-w-md mx-auto bg-white p-4 rounded-lg shadow-lg">
                {activeTab === "user" && (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">姓</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="ジーク"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">名</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="太郎"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">姓（フリガナ）</label>
                            <input
                                type="text"
                                value={lastNameKana}
                                onChange={(e) => setLastNameKana(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="ジーク"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">名（フリガナ）</label>
                            <input
                                type="text"
                                value={firstNameKana}
                                onChange={(e) => setFirstNameKana(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="タロウ"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">メールアドレス</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="example@example.com"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">電話番号</label>
                            <input
                                type="text"
                                value={phoneNumber}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="09012345678 ハイフンは不要"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">パスワード</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="********"
                            />
                        </div>

                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 text-sm">
                            サインアップ
                        </button>

                        <Link href="/auth/login">
                            <p className="text-center text-gray-700 font-semibold mt-2 hover:text-blue-600 text-sm">すでにアカウントをお持ちの方はこちら</p>
                        </Link>
                    </form>
                )}

                {activeTab === "company" && (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">企業名</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="株式会社Geekness"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">担当者姓</label>
                            <input
                                type="text"
                                value={representativeLastName}
                                onChange={(e) => setRepresentativeLastName(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="義育"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">担当者名</label>
                            <input
                                type="text"
                                value={representativeFirstName}
                                onChange={(e) => setRepresentativeFirstName(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="太郎"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">担当者姓（フリガナ）</label>
                            <input
                                type="text"
                                value={representativeLastNameKana}
                                onChange={(e) => setRepresentativeLastNameKana(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="ジーク"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">担当者名（フリガナ）</label>
                            <input
                                type="text"
                                value={representativeFirstNameKana}
                                onChange={(e) => setRepresentativeFirstNameKana(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="タロウ"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">メールアドレス</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="example@example.com"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">電話番号</label>
                            <input
                                type="text"
                                value={phoneNumber}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="09012345678 ハイフンは不要"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">パスワード</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="********"
                            />
                        </div>

                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 text-sm">
                            サインアップ
                        </button>

                        <Link href="/auth/login">
                            <p className="text-center text-gray-700 font-semibold mt-2 hover:text-blue-600 text-sm">すでにアカウントをお持ちの方はこちら</p>
                        </Link>
                    </form>
                )}
            </div>
        </div>
    );
}
