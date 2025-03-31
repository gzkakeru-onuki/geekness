"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

interface RecruiterFormData {
    company_name: string;
    company_address: string;
    company_website: string;
    company_description: string;
    department: string;
    position: string;
    recruiter_firstname: string;
    recruiter_lastname: string;
    recruiter_email: string;
    recruiter_phone: string;
}

export default function RecruiterProfile() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("basic");
    const [formData, setFormData] = useState<RecruiterFormData>({
        company_name: "",
        company_address: "",
        company_website: "",
        company_description: "",
        department: "",
        position: "",
        recruiter_firstname: "",
        recruiter_lastname: "",
        recruiter_email: "",
        recruiter_phone: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('recruiter_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setFormData({
                        company_name: data.company_name || "",
                        company_address: data.company_address || "",
                        company_website: data.company_website || "",
                        company_description: data.company_description || "",
                        department: data.department || "",
                        position: data.position || "",
                        recruiter_firstname: data.recruiter_firstname || "",
                        recruiter_lastname: data.recruiter_lastname || "",
                        recruiter_email: data.recruiter_email || "",
                        recruiter_phone: data.recruiter_phone || ""
                    });
                }
            } catch (error) {
                console.error('Error fetching recruiter profile:', error);
            }
        };

        fetchProfile();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage("");

        try {
            const { error } = await supabase
                .from('recruiter_profiles')
                .upsert({
                    id: user.id,
                    ...formData
                });

            if (error) throw error;

            setMessage("プロフィールを更新しました");
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage("プロフィールの更新に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <ErrorMessage message="ログインが必要です" />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <PageHeader
                title="プロフィール設定"
                subtitle="企業情報を管理できます"
                showBackButton
                backUrl="/page/dashboard/recruiter"
            />

            <main className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* タブ切り替え */}
                        <div className="flex space-x-4 border-b mb-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab("basic")}
                                className={`flex items-center px-6 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${activeTab === "basic"
                                        ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <PersonIcon className="w-5 h-5 mr-2" />
                                基本情報
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("company")}
                                className={`flex items-center px-6 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${activeTab === "company"
                                        ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <BusinessIcon className="w-5 h-5 mr-2" />
                                企業情報
                            </button>
                        </div>

                        {/* 基本情報 */}
                        {activeTab === "basic" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">姓</label>
                                        <input
                                            type="text"
                                            value={formData.recruiter_lastname}
                                            onChange={(e) => setFormData({ ...formData, recruiter_lastname: e.target.value })}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="山田"
                                        />
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">名</label>
                                        <input
                                            type="text"
                                            value={formData.recruiter_firstname}
                                            onChange={(e) => setFormData({ ...formData, recruiter_firstname: e.target.value })}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="太郎"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <EmailIcon className="w-4 h-4 inline-block mr-1" />
                                        メールアドレス
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.recruiter_email}
                                        onChange={(e) => setFormData({ ...formData, recruiter_email: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="example@company.com"
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <PhoneIcon className="w-4 h-4 inline-block mr-1" />
                                        電話番号
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.recruiter_phone}
                                        onChange={(e) => setFormData({ ...formData, recruiter_phone: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="03-1234-5678"
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <WorkIcon className="w-4 h-4 inline-block mr-1" />
                                        部署
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="採用部"
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <AccountCircleIcon className="w-4 h-4 inline-block mr-1" />
                                        役職
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="採用マネージャー"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 企業情報 */}
                        {activeTab === "company" && (
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <BusinessIcon className="w-4 h-4 inline-block mr-1" />
                                        企業名 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="株式会社〇〇"
                                        required
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <LocationOnIcon className="w-4 h-4 inline-block mr-1" />
                                        企業住所 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company_address}
                                        onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="東京都渋谷区..."
                                        required
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <BusinessIcon className="w-4 h-4 inline-block mr-1" />
                                        企業ウェブサイト
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.company_website}
                                        onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <BusinessIcon className="w-4 h-4 inline-block mr-1" />
                                        企業概要 <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.company_description}
                                        onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                                        rows={4}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="企業の概要を入力してください"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* 保存ボタン */}
                        <div className="flex justify-end mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner className="w-5 h-5 mr-2" />
                                        保存中...
                                    </>
                                ) : (
                                    <>
                                        <SaveIcon className="w-5 h-5 mr-2" />
                                        保存
                                    </>
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