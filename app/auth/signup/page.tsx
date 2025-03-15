"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { supabase } from "@/app/utils/supabase";
import { useRouter } from "next/navigation";

export default function Signup() {
    const [activeTab, setActiveTab] = useState("user");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // サインアップ
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            console.error(error);
        } else {
            console.log("Signup successful");
        }
        // ユーザープロファイルを更新
        const { data: userData, error: userError } = await supabase.from('profiles').insert({
            id: data.user?.id,
            username: name,
            email: email,
            password: password,
        });

        if (userError) {
            console.error("Error inserting profile:", userError);
            console.log("Error details:", JSON.stringify(userError, null, 2));
        } else {
            console.log("Profile inserted successfully");
            console.log("Inserted data:", userData);
            router.push("/page/dashboard?type=applicant");
        }
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">情報登録画面</h1>
            <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">登録種別</h3>
            <div className="flex justify-center mb-8">
                <button
                    className={`px-6 py-3 mx-2 rounded-full transition-colors duration-300 ${activeTab === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                        }`}
                    onClick={() => setActiveTab("user")}
                >
                    <PersonIcon className="mr-2" />採用希望者
                </button>
                <button
                    className={`px-6 py-3 mx-2 rounded-full transition-colors duration-300 ${activeTab === "company" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
                        }`}
                    onClick={() => setActiveTab("company")}
                >
                    <BusinessIcon className="mr-2" />企業担当者
                </button>
            </div>

            <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
                {activeTab === "user" && (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">ユーザー名</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">メールアドレス</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">パスワード</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300">
                            サインアップ
                        </button>

                        <Link href="/auth/login">
                            <p className="text-center text-gray-700 font-semibold mt-2 hover:text-blue-600">すでにアカウントをお持ちの方はこちら</p>
                        </Link>
                    </form>
                )}

                {activeTab === "company" && (
                    <form>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">企業名</label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">担当者名</label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">メールアドレス</label>
                            <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">パスワード</label>
                            <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300">
                            サインアップ
                        </button>

                        <Link href="/auth/login">
                            <p className="text-center text-gray-700 font-semibold mt-2 hover:text-blue-600">すでにアカウントをお持ちの方はこちら</p>
                        </Link>
                    </form>
                )}
            </div>
        </div>
    );
}
