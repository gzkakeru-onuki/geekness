"use client";
import { useState } from "react";

export default function Profile() {
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: "山田 太郎",
        email: "taro.yamada@example.com",
        phone: "090-1234-5678",
        bio: "ソフトウェアエンジニアとして10年以上の経験があります。"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value
        }));
    };

    const handleEditToggle = () => {
        setEditing(!editing);
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
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="text-gray-700">{profile.name}</p>
                    )}
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">メールアドレス</label>
                    {editing ? (
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="text-gray-700">{profile.email}</p>
                    )}
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">電話番号</label>
                    {editing ? (
                        <input
                            type="text"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="text-gray-700">{profile.phone}</p>
                    )}
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">自己紹介</label>
                    {editing ? (
                        <textarea
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="text-gray-700">{profile.bio}</p>
                    )}
                </div>
                <button
                    onClick={handleEditToggle}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                >
                    {editing ? "保存" : "編集"}
                </button>
            </div>
        </div>
    );
}
