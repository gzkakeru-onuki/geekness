"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase";

// プロフィールコンテンツコンポーネント
function ProfileContent() {
    const userType = useSearchParams()?.get("type");
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: user, error: userError } = await supabase.auth.getUser();
            if (userError) {
                console.error("Error fetching user:", userError);
                return;
            }

            if (user) {
                const { data: profileData, error } = await supabase
                    .from(userType === 'recruiter' ? 'recruiter_profiles' : 'applicant_profiles')
                    .select('*')
                    .eq('id', user.user?.id)
                    .single();

                if (error) {
                    console.error("プロフィール取得エラー:", error);
                    return;
                }

                if (profileData) {
                    setProfile(profileData);
                    console.log("プロフィール取得成功:", profileData);
                }
            } else {
                console.log("ユーザーがいないやんけ");
            }
        }
        fetchProfile();
    }, [userType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prevProfile: any) => ({
            ...prevProfile,
            [name]: value
        }));
    };

    const handleEditToggle = () => {
        setEditing(!editing);
    };

    const handleSaveProfile = async () => {
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError) {
            console.error("Error fetching user:", userError);
            return;
        }

        if (user) {
            // applicant_profilesテーブルを確認
            const { data: applicantData, error: applicantError } = await supabase
                .from('applicant_profiles')
                .select('*')
                .eq('id', user.user?.id)
                .single();

            if (applicantData) {
                // applicant_profilesに存在する場合、更新
                const { data, error } = await supabase
                    .from('applicant_profiles')
                    .update(profile)
                    .eq('id', user.user?.id);

                if (error) {
                    console.error("プロフィール保存エラー:", error);
                } else {
                    console.log("プロフィール保存成功:", data);
                    alert("プロフィールを保存しました");
                    setEditing(false);
                    router.push("/page/dashboard?type=applicant");
                }
            } else {
                // recruiter_profilesテーブルを確認
                const { data: recruiterData, error: recruiterError } = await supabase
                    .from('recruiter_profiles')
                    .select('*')
                    .eq('id', user.user?.id)
                    .single();

                if (recruiterData) {
                    // recruiter_profilesに存在する場合、更新
                    const { data, error } = await supabase
                        .from('recruiter_profiles')
                        .update(profile)
                        .eq('id', user.user?.id);

                    if (error) {
                        console.error("プロフィール保存エラー:", error);
                    } else {
                        console.log("プロフィール保存成功:", data);
                        alert("プロフィールを保存しました");
                        setEditing(false);
                        router.push("/page/dashboard?type=recruiter");
                    }
                } else {
                    console.log("ユーザーIDがどちらのテーブルにも存在しません");
                }
            }
        }
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">プロフィール</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">名前</label>
                    {editing ? (
                        <input
                            type="text"
                            name="applicant_firstname"
                            value={profile?.applicant_firstname || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="text-gray-700">{profile?.applicant_firstname || "N/A"}</p>
                    )}
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">メールアドレス</label>
                    {editing ? (
                        <input
                            type="email"
                            name="email"
                            value={profile?.email || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="text-gray-700">{profile?.email || "N/A"}</p>
                    )}
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">電話番号</label>
                    {editing ? (
                        <input
                            type="text"
                            name="phone_number"
                            value={profile?.phone_number || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="text-gray-700">{profile?.phone_number || "N/A"}</p>
                    )}
                </div>
                <button
                    onClick={editing ? handleSaveProfile : handleEditToggle}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                >
                    {editing ? "保存" : "編集"}
                </button>
            </div>
        </div>
    );
}

// メインのプロフィールコンポーネント
export default function Profile() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
                </div>
            }
        >
            <ProfileContent />
        </Suspense>
    );
}
