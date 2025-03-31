"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

interface Education {
    id: string;
    school: string;
    degree: string;
    major: string;
    start_date: string;
    end_date: string;
    description: string;
}

interface WorkExperience {
    id: string;
    company: string;
    position: string;
    start_date: string;
    end_date: string;
    description: string;
}

interface Skill {
    id: string;
    name: string;
    level: number;
}

interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
}

interface ApplicantFormData {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    current_position: string;
    desired_position: string;
    desired_salary: string;
    education: Education[];
    work_experience: WorkExperience[];
    skills: Skill[];
    certifications: Certification[];
}

export default function ApplicantProfile() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("basic");
    const [formData, setFormData] = useState<ApplicantFormData>({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        current_position: "",
        desired_position: "",
        desired_salary: "",
        education: [],
        work_experience: [],
        skills: [],
        certifications: []
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('applicant_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setFormData({
                        firstname: data.firstname || "",
                        lastname: data.lastname || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        current_position: data.current_position || "",
                        desired_position: data.desired_position || "",
                        desired_salary: data.desired_salary || "",
                        education: data.education || [],
                        work_experience: data.work_experience || [],
                        skills: data.skills || [],
                        certifications: data.certifications || []
                    });
                }
            } catch (error) {
                console.error('Error fetching applicant profile:', error);
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
                .from('applicant_profiles')
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

    const addEducation = () => {
        setFormData({
            ...formData,
            education: [
                ...formData.education,
                {
                    id: Date.now().toString(),
                    school: "",
                    degree: "",
                    major: "",
                    start_date: "",
                    end_date: "",
                    description: ""
                }
            ]
        });
    };

    const removeEducation = (id: string) => {
        setFormData({
            ...formData,
            education: formData.education.filter(edu => edu.id !== id)
        });
    };

    const addWorkExperience = () => {
        setFormData({
            ...formData,
            work_experience: [
                ...formData.work_experience,
                {
                    id: Date.now().toString(),
                    company: "",
                    position: "",
                    start_date: "",
                    end_date: "",
                    description: ""
                }
            ]
        });
    };

    const removeWorkExperience = (id: string) => {
        setFormData({
            ...formData,
            work_experience: formData.work_experience.filter(exp => exp.id !== id)
        });
    };

    const addSkill = () => {
        setFormData({
            ...formData,
            skills: [
                ...formData.skills,
                {
                    id: Date.now().toString(),
                    name: "",
                    level: 1
                }
            ]
        });
    };

    const removeSkill = (id: string) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(skill => skill.id !== id)
        });
    };

    const addCertification = () => {
        setFormData({
            ...formData,
            certifications: [
                ...formData.certifications,
                {
                    id: Date.now().toString(),
                    name: "",
                    issuer: "",
                    date: ""
                }
            ]
        });
    };

    const removeCertification = (id: string) => {
        setFormData({
            ...formData,
            certifications: formData.certifications.filter(cert => cert.id !== id)
        });
    };

    if (!user) {
        return <ErrorMessage message="ログインが必要です" />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <PageHeader
                title="プロフィール設定"
                subtitle="あなたの情報を管理できます"
                showBackButton
                backUrl="/page/dashboard/applicant"
            />

            <main className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* タブ切り替え */}
                        <div className="flex space-x-4 border-b mb-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab("basic")}
                                className={`flex items-center px-6 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                                    activeTab === "basic"
                                        ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <PersonIcon className="w-5 h-5 mr-2" />
                                基本情報
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("education")}
                                className={`flex items-center px-6 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                                    activeTab === "education"
                                        ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <SchoolIcon className="w-5 h-5 mr-2" />
                                学歴
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("experience")}
                                className={`flex items-center px-6 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                                    activeTab === "experience"
                                        ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <WorkIcon className="w-5 h-5 mr-2" />
                                職歴
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
                                            value={formData.lastname}
                                            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="山田"
                                        />
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">名</label>
                                        <input
                                            type="text"
                                            value={formData.firstname}
                                            onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
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
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="example@email.com"
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <PhoneIcon className="w-4 h-4 inline-block mr-1" />
                                        電話番号
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="03-1234-5678"
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <WorkIcon className="w-4 h-4 inline-block mr-1" />
                                        現在の職種
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.current_position}
                                        onChange={(e) => setFormData({ ...formData, current_position: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="エンジニア"
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <WorkIcon className="w-4 h-4 inline-block mr-1" />
                                        希望職種
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.desired_position}
                                        onChange={(e) => setFormData({ ...formData, desired_position: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="シニアエンジニア"
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <WorkIcon className="w-4 h-4 inline-block mr-1" />
                                        希望年収
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.desired_salary}
                                        onChange={(e) => setFormData({ ...formData, desired_salary: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="500万円"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 学歴 */}
                        {activeTab === "education" && (
                            <div className="space-y-6">
                                {formData.education.map((edu, index) => (
                                    <div key={edu.id} className="bg-gray-50 p-4 rounded-lg relative">
                                        <button
                                            type="button"
                                            onClick={() => removeEducation(edu.id)}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">学歴 {index + 1}</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <SchoolIcon className="w-4 h-4 inline-block mr-1" />
                                                    学校名
                                                </label>
                                                <input
                                                    type="text"
                                                    value={edu.school}
                                                    onChange={(e) => {
                                                        const newEducation = [...formData.education];
                                                        newEducation[index].school = e.target.value;
                                                        setFormData({ ...formData, education: newEducation });
                                                    }}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    placeholder="〇〇大学"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <SchoolIcon className="w-4 h-4 inline-block mr-1" />
                                                    学位
                                                </label>
                                                <input
                                                    type="text"
                                                    value={edu.degree}
                                                    onChange={(e) => {
                                                        const newEducation = [...formData.education];
                                                        newEducation[index].degree = e.target.value;
                                                        setFormData({ ...formData, education: newEducation });
                                                    }}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    placeholder="学士"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <SchoolIcon className="w-4 h-4 inline-block mr-1" />
                                                    専攻
                                                </label>
                                                <input
                                                    type="text"
                                                    value={edu.major}
                                                    onChange={(e) => {
                                                        const newEducation = [...formData.education];
                                                        newEducation[index].major = e.target.value;
                                                        setFormData({ ...formData, education: newEducation });
                                                    }}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    placeholder="情報工学"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        入学年月
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={edu.start_date}
                                                        onChange={(e) => {
                                                            const newEducation = [...formData.education];
                                                            newEducation[index].start_date = e.target.value;
                                                            setFormData({ ...formData, education: newEducation });
                                                        }}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        卒業年月
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={edu.end_date}
                                                        onChange={(e) => {
                                                            const newEducation = [...formData.education];
                                                            newEducation[index].end_date = e.target.value;
                                                            setFormData({ ...formData, education: newEducation });
                                                        }}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    詳細
                                                </label>
                                                <textarea
                                                    value={edu.description}
                                                    onChange={(e) => {
                                                        const newEducation = [...formData.education];
                                                        newEducation[index].description = e.target.value;
                                                        setFormData({ ...formData, education: newEducation });
                                                    }}
                                                    rows={3}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    placeholder="研究内容や取得した資格など"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addEducation}
                                    className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    + 学歴を追加
                                </button>
                            </div>
                        )}

                        {/* 職歴 */}
                        {activeTab === "experience" && (
                            <div className="space-y-6">
                                {formData.work_experience.map((exp, index) => (
                                    <div key={exp.id} className="bg-gray-50 p-4 rounded-lg relative">
                                        <button
                                            type="button"
                                            onClick={() => removeWorkExperience(exp.id)}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">職歴 {index + 1}</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <WorkIcon className="w-4 h-4 inline-block mr-1" />
                                                    会社名
                                                </label>
                                                <input
                                                    type="text"
                                                    value={exp.company}
                                                    onChange={(e) => {
                                                        const newExperience = [...formData.work_experience];
                                                        newExperience[index].company = e.target.value;
                                                        setFormData({ ...formData, work_experience: newExperience });
                                                    }}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    placeholder="株式会社〇〇"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <WorkIcon className="w-4 h-4 inline-block mr-1" />
                                                    職種
                                                </label>
                                                <input
                                                    type="text"
                                                    value={exp.position}
                                                    onChange={(e) => {
                                                        const newExperience = [...formData.work_experience];
                                                        newExperience[index].position = e.target.value;
                                                        setFormData({ ...formData, work_experience: newExperience });
                                                    }}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    placeholder="エンジニア"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        入社年月
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={exp.start_date}
                                                        onChange={(e) => {
                                                            const newExperience = [...formData.work_experience];
                                                            newExperience[index].start_date = e.target.value;
                                                            setFormData({ ...formData, work_experience: newExperience });
                                                        }}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        退職年月
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={exp.end_date}
                                                        onChange={(e) => {
                                                            const newExperience = [...formData.work_experience];
                                                            newExperience[index].end_date = e.target.value;
                                                            setFormData({ ...formData, work_experience: newExperience });
                                                        }}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    業務内容
                                                </label>
                                                <textarea
                                                    value={exp.description}
                                                    onChange={(e) => {
                                                        const newExperience = [...formData.work_experience];
                                                        newExperience[index].description = e.target.value;
                                                        setFormData({ ...formData, work_experience: newExperience });
                                                    }}
                                                    rows={3}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    placeholder="担当した業務や成果など"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addWorkExperience}
                                    className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    + 職歴を追加
                                </button>
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