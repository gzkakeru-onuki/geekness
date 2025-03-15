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
    const router = useRouter();

    const handleLogin = async (e: FormEvent) =>{
        e.preventDefault();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error(error);
        }else {
            console.log("login success");
            console.log(data.user?.id, data.user?.email);
            router.push("/page/dashboard?type=applicant");
        }
    }
    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">ログイン画面</h1>            
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
                    <form onSubmit={handleLogin}>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">メールアドレス</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">パスワード</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <Link href="/page/dashboard?type=applicant" type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 justify-center mx-auto">
                            <LoginIcon className="mr-2" />ログイン
                        </Link>
                        <Link href="/auth/signup">
                            <p className="text-center text-gray-700 font-semibold mt-2 hover:text-blue-600">新規登録はこちら</p>
                        </Link>
                    </form>
                )}

                {activeTab === "company" && (
                    <form>                        
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">メールアドレス</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">パスワード</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <Link href="/page/dashboard?type=recruiter" type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300">
                            ログイン
                        </Link>

                        <Link href="/auth/signup">
                            <p className="text-center text-gray-700 font-semibold mt-2 hover:text-blue-600">新規登録はこちら</p>
                        </Link>
                    </form>
                )}
            </div>
        </div>
    );
}
