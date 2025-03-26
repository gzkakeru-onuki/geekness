"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InfoIcon from '@mui/icons-material/Info';

interface Education {
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    isAttending: boolean;
}

interface WorkExperience {
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate: string;
    isCurrently: boolean;
}

interface Skill {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    years: number;
}

interface Certification {
    name: string;
    issuer: string;
    acquiredDate: string;
    expiryDate?: string;
}

// Recruiter用のインターフェース追加
interface RecruiterFormData {
    company_name: string;
    company_address: string;
    company_website: string;
    department: string;
    position: string;
    recruiter_firstname: string;
    recruiter_lastname: string;
    recruiter_email: string;
    recruiter_phone: string;
    company_description: string;
    hiring_process: string;
    company_benefits: string;
}

export default function Profile() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("basic");
    const [isRecruiter, setIsRecruiter] = useState<boolean | null>(null);
    const [educations, setEducations] = useState<Education[]>([]);
    const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [formData, setFormData] = useState({
        applicant_firstname: "",
        applicant_lastname: "",
        applicant_email: "",
        applicant_phone: "",
        applicant_address: "",
        applicant_birthday: "",
        applicant_gender: "",
        applicant_languages: "",
        applicant_hobbies: "",
        applicant_self_introduction: ""
    });

    // Recruiter用のstate
    const [recruiterFormData, setRecruiterFormData] = useState<RecruiterFormData>({
        company_name: "",
        company_address: "",
        company_website: "",
        department: "",
        position: "",
        recruiter_firstname: "",
        recruiter_lastname: "",
        recruiter_email: "",
        recruiter_phone: "",
        company_description: "",
        hiring_process: "",
        company_benefits: ""
    });

    // ユーザータイプの判定を追加
    useEffect(() => {
        const checkUserType = async () => {
            if (!user) return;

            try {
                // まずrecruiter_profilesをチェック
                const { data: recruiterData, error: recruiterError } = await supabase
                    .from('recruiter_profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (recruiterData) {
                    setIsRecruiter(true);
                    return;
                }

                // recruiter_profilesになければapplicant_profilesをチェック
                const { data: applicantData, error: applicantError } = await supabase
                    .from('applicant_profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (applicantData) {
                    setIsRecruiter(false);
                    return;
                }

                // どちらにも登録がない場合はデフォルトでapplicantとして扱う
                setIsRecruiter(false);

            } catch (error) {
                console.error('Error checking user type:', error);
                setIsRecruiter(false); // エラー時はデフォルトでapplicantとして扱う
            }
        };

        checkUserType();
    }, [user]);

    // プロフィールデータの取得を修正
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user || isRecruiter === null) return;

            if (isRecruiter) {
                // Recruiter用のデータ取得
                try {
                    const { data, error } = await supabase
                        .from('recruiter_profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (error) throw error;

                    if (data) {
                        setRecruiterFormData({
                            company_name: data.company_name || "",
                            company_address: data.company_address || "",
                            company_website: data.company_website || "",
                            department: data.department || "",
                            position: data.position || "",
                            recruiter_firstname: data.recruiter_firstname || "",
                            recruiter_lastname: data.recruiter_lastname || "",
                            recruiter_email: data.recruiter_email || "",
                            recruiter_phone: data.recruiter_phone || "",
                            company_description: data.company_description || "",
                            hiring_process: data.hiring_process || "",
                            company_benefits: data.company_benefits || ""
                        });
                    }
                } catch (error) {
                    console.error('Error fetching recruiter profile:', error);
                }
            } else {
                // Applicant用のデータ取得（既存のfetchProfile関数の中身）
                try {
                    const { data, error } = await supabase
                        .from('applicant_profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (error) throw error;

                    if (data) {
                        setFormData({
                            applicant_firstname: data.applicant_firstname || "",
                            applicant_lastname: data.applicant_lastname || "",
                            applicant_email: data.applicant_email || "",
                            applicant_phone: data.applicant_phone || "",
                            applicant_address: data.applicant_address || "",
                            applicant_birthday: data.applicant_birthday || "",
                            applicant_gender: data.applicant_gender || "",
                            applicant_languages: data.applicant_languages || "",
                            applicant_hobbies: data.applicant_hobbies || "",
                            applicant_self_introduction: data.applicant_self_introduction || ""
                        });

                        // JSONデータのパース
                        try {
                            if (data.applicant_education) {
                                setEducations(JSON.parse(data.applicant_education));
                            }
                            if (data.applicant_experience) {
                                setWorkExperiences(JSON.parse(data.applicant_experience));
                            }
                            if (data.applicant_skills) {
                                setSkills(JSON.parse(data.applicant_skills));
                            }
                            if (data.applicant_certifications) {
                                setCertifications(JSON.parse(data.applicant_certifications));
                            }
                        } catch (parseError) {
                            console.error('Error parsing JSON data:', parseError);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching applicant profile:', error);
                }
            }
        };

        fetchProfile();
    }, [user, isRecruiter]);

    const addEducation = () => {
        setEducations([...educations, {
            school: "",
            degree: "",
            field: "",
            startDate: "",
            endDate: "",
            isAttending: false
        }]);
    };

    const addWorkExperience = () => {
        setWorkExperiences([...workExperiences, {
            company: "",
            position: "",
            description: "",
            startDate: "",
            endDate: "",
            isCurrently: false
        }]);
    };

    const addSkill = () => {
        setSkills([...skills, {
            name: "",
            level: "beginner",
            years: 0
        }]);
    };

    const addCertification = () => {
        setCertifications([...certifications, {
            name: "",
            issuer: "",
            acquiredDate: "",
            expiryDate: ""
        }]);
    };

    const handleEducationChange = (index: number, field: keyof Education, value: any) => {
        const newEducations = [...educations];
        newEducations[index] = { ...newEducations[index], [field]: value };
        setEducations(newEducations);
    };

    const handleWorkExperienceChange = (index: number, field: keyof WorkExperience, value: any) => {
        const newWorkExperiences = [...workExperiences];
        newWorkExperiences[index] = { ...newWorkExperiences[index], [field]: value };
        setWorkExperiences(newWorkExperiences);
    };

    const handleSkillChange = (index: number, field: keyof Skill, value: any) => {
        const newSkills = [...skills];
        newSkills[index] = { ...newSkills[index], [field]: value };
        setSkills(newSkills);
    };

    const handleCertificationChange = (index: number, field: keyof Certification, value: any) => {
        const newCertifications = [...certifications];
        newCertifications[index] = { ...newCertifications[index], [field]: value };
        setCertifications(newCertifications);
    };

    const removeEducation = (index: number) => {
        setEducations(educations.filter((_, i) => i !== index));
    };

    const removeWorkExperience = (index: number) => {
        setWorkExperiences(workExperiences.filter((_, i) => i !== index));
    };

    const removeSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const removeCertification = (index: number) => {
        setCertifications(certifications.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            // プロフィールデータの更新
            const { error } = await supabase
                .from('applicant_profiles')
                .upsert({
                    id: user?.id,
                    // 基本情報
                    applicant_firstname: formData.applicant_firstname,
                    applicant_lastname: formData.applicant_lastname,
                    applicant_email: formData.applicant_email,
                    applicant_phone: formData.applicant_phone,
                    applicant_address: formData.applicant_address,
                    applicant_birthday: formData.applicant_birthday,
                    applicant_gender: formData.applicant_gender,

                    // その他の情報
                    applicant_languages: formData.applicant_languages,
                    applicant_hobbies: formData.applicant_hobbies,
                    applicant_self_introduction: formData.applicant_self_introduction,

                    // 配列データをJSON文字列として保存
                    applicant_education: JSON.stringify(educations),
                    applicant_experience: JSON.stringify(workExperiences),
                    applicant_skills: JSON.stringify(skills),
                    applicant_certifications: JSON.stringify(certifications),

                    // 更新日時
                    updated_at: new Date().toISOString()
                }, {
                    // 既存のレコードがない場合は挿入、ある場合は更新
                    onConflict: 'id'
                });

            if (error) throw error;

            setMessage("プロフィールが更新されました");
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage("エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    // Recruiter用の送信処理
    const handleRecruiterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const { error } = await supabase
                .from('recruiter_profiles')
                .upsert({
                    id: user?.id,
                    ...recruiterFormData,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                });

            if (error) throw error;

            setMessage("プロフィールが更新されました");
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage("エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    // Recruiter用のタブ定義
    const recruiterTabs = [
        { id: "basic", label: "基本情報", icon: <PersonIcon /> },
        { id: "company", label: "会社情報", icon: <WorkIcon /> },
        { id: "other", label: "その他情報", icon: <InfoIcon /> }
    ];

    // Applicant用のタブ定義を追加
    const tabs = [
        { id: "basic", label: "基本情報", icon: <PersonIcon /> },
        { id: "education", label: "学歴・職歴", icon: <SchoolIcon /> },
        { id: "skills", label: "スキル・資格", icon: <EmojiEventsIcon /> },
        { id: "other", label: "その他情報", icon: <InfoIcon /> }
    ];

    // レンダリング部分を修正
    if (isRecruiter === null) {
        return <div>Loading...</div>; // ユーザータイプ判定中のローディング表示
    }

    if (isRecruiter) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6">
                        <div className="flex items-center mb-6">
                            <Link
                                href="/page/dashboard"
                                className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                            >
                                <ArrowBackIcon className="mr-2" />
                                ダッシュボードに戻る
                            </Link>
                        </div>

                        <div className="mb-6">
                            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
                                企業プロフィール設定
                            </h1>
                            <p className="text-gray-600">
                                企業情報と採用担当者情報を更新してください
                            </p>
                        </div>

                        <form onSubmit={handleRecruiterSubmit}>
                            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                                {recruiterTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-6">
                                {activeTab === "basic" && (
                                    <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-lg border border-indigo-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">姓</label>
                                                <input
                                                    type="text"
                                                    value={recruiterFormData.recruiter_lastname}
                                                    onChange={(e) => setRecruiterFormData({
                                                        ...recruiterFormData,
                                                        recruiter_lastname: e.target.value
                                                    })}
                                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">名</label>
                                                <input
                                                    type="text"
                                                    value={recruiterFormData.recruiter_firstname}
                                                    onChange={(e) => setRecruiterFormData({
                                                        ...recruiterFormData,
                                                        recruiter_firstname: e.target.value
                                                    })}
                                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">部署</label>
                                                <input
                                                    type="text"
                                                    value={recruiterFormData.department}
                                                    onChange={(e) => setRecruiterFormData({
                                                        ...recruiterFormData,
                                                        department: e.target.value
                                                    })}
                                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">役職</label>
                                                <input
                                                    type="text"
                                                    value={recruiterFormData.position}
                                                    onChange={(e) => setRecruiterFormData({
                                                        ...recruiterFormData,
                                                        position: e.target.value
                                                    })}
                                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">メールアドレス</label>
                                                <input
                                                    type="email"
                                                    value={recruiterFormData.recruiter_email}
                                                    onChange={(e) => setRecruiterFormData({
                                                        ...recruiterFormData,
                                                        recruiter_email: e.target.value
                                                    })}
                                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">電話番号</label>
                                                <input
                                                    type="tel"
                                                    value={recruiterFormData.recruiter_phone}
                                                    onChange={(e) => setRecruiterFormData({
                                                        ...recruiterFormData,
                                                        recruiter_phone: e.target.value
                                                    })}
                                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "company" && (
                                    <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-lg border border-indigo-100">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">会社名</label>
                                                <input
                                                    type="text"
                                                    value={recruiterFormData.company_name}
                                                    onChange={(e) => setRecruiterFormData({
                                                        ...recruiterFormData,
                                                        company_name: e.target.value
                                                    })}
                                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">会社所在地</label>
                                                <input
                                                    type="text"
                                                    value={recruiterFormData.company_address}
                                                    onChange={(e) => setRecruiterFormData({
                                                        ...recruiterFormData,
                                                        company_address: e.target.value
                                                    })}
                                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">企業Webサイト</label>
                                                <input
                                                    type="url"
                                                    value={recruiterFormData.company_website}
                                                    onChange={(e) => setRecruiterFormData({
                                                        ...recruiterFormData,
                                                        company_website: e.target.value
                                                    })}
                                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">会社概要</label>
                                                <textarea
                                                    value={recruiterFormData.company_description}
                                                    onChange={(e) => setRecruiterFormData({
                                                        ...recruiterFormData,
                                                        company_description: e.target.value
                                                    })}
                                                    rows={4}
                                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="会社の事業内容や特徴について記入してください"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "other" && (
                                    <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-lg border border-indigo-100">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">採用プロセス</label>
                                                <textarea
                                                    value={recruiterFormData.hiring_process}
                                                    onChange={(e) => setRecruiterFormData({
                                                        ...recruiterFormData,
                                                        hiring_process: e.target.value
                                                    })}
                                                    rows={4}
                                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="一般的な採用の流れについて記入してください"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">福利厚生</label>
                                                <textarea
                                                    value={recruiterFormData.company_benefits}
                                                    onChange={(e) => setRecruiterFormData({
                                                        ...recruiterFormData,
                                                        company_benefits: e.target.value
                                                    })}
                                                    rows={4}
                                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="福利厚生や社内制度について記入してください"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {message && (
                                <div className="mt-6 p-4 rounded-lg bg-green-50 text-green-700">
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full mt-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white"
                                    }`}
                            >
                                <SaveIcon className="mr-2" />
                                {loading ? "保存中..." : "プロフィールを保存"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6">
                    <div className="flex items-center mb-6">
                        <Link
                            href="/page/dashboard"
                            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                        >
                            <ArrowBackIcon className="mr-2" />
                            ダッシュボードに戻る
                        </Link>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
                            プロフィール設定
                        </h1>
                        <p className="text-gray-600">
                            あなたの情報を更新してください
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            {activeTab === "basic" && (
                                <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-lg border border-indigo-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">姓</label>
                                            <input
                                                type="text"
                                                value={formData.applicant_lastname}
                                                onChange={(e) => setFormData({ ...formData, applicant_lastname: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">名</label>
                                            <input
                                                type="text"
                                                value={formData.applicant_firstname}
                                                onChange={(e) => setFormData({ ...formData, applicant_firstname: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">メールアドレス</label>
                                            <input
                                                type="email"
                                                value={formData.applicant_email}
                                                onChange={(e) => setFormData({ ...formData, applicant_email: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">電話番号</label>
                                            <input
                                                type="tel"
                                                value={formData.applicant_phone}
                                                onChange={(e) => setFormData({ ...formData, applicant_phone: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-700 font-semibold mb-2">住所</label>
                                            <input
                                                type="text"
                                                value={formData.applicant_address}
                                                onChange={(e) => setFormData({ ...formData, applicant_address: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">生年月日</label>
                                            <input
                                                type="date"
                                                value={formData.applicant_birthday}
                                                onChange={(e) => setFormData({ ...formData, applicant_birthday: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">性別</label>
                                            <select
                                                value={formData.applicant_gender}
                                                onChange={(e) => setFormData({ ...formData, applicant_gender: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                                            >
                                                <option value="">選択してください</option>
                                                <option value="male">男性</option>
                                                <option value="female">女性</option>
                                                <option value="other">その他</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "education" && (
                                <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-lg border border-indigo-100">
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-semibold text-gray-800">学歴</h3>
                                                <button
                                                    type="button"
                                                    onClick={addEducation}
                                                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-300"
                                                >
                                                    ＋ 学歴を追加
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {educations.map((edu, index) => (
                                                    <div key={index} className="bg-white p-4 rounded-lg border border-indigo-100">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h4 className="text-lg font-medium text-gray-700">学歴 {index + 1}</h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeEducation(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">学校名</label>
                                                                <input
                                                                    type="text"
                                                                    value={edu.school}
                                                                    onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    placeholder="例：○○大学"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">学位</label>
                                                                <select
                                                                    value={edu.degree}
                                                                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                >
                                                                    <option value="">選択してください</option>
                                                                    <option value="high_school">高校卒業</option>
                                                                    <option value="associate">短期大学卒業</option>
                                                                    <option value="bachelor">学士</option>
                                                                    <option value="master">修士</option>
                                                                    <option value="doctor">博士</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">専攻分野</label>
                                                                <input
                                                                    type="text"
                                                                    value={edu.field}
                                                                    onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    placeholder="例：情報工学"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">期間</label>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="month"
                                                                        value={edu.startDate}
                                                                        onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    />
                                                                    <span>～</span>
                                                                    <input
                                                                        type="month"
                                                                        value={edu.endDate}
                                                                        onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                                                                        disabled={edu.isAttending}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4">
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={edu.isAttending}
                                                                    onChange={(e) => handleEducationChange(index, 'isAttending', e.target.checked)}
                                                                    className="mr-2"
                                                                />
                                                                <span className="text-sm text-gray-600">在学中</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-semibold text-gray-800">職歴</h3>
                                                <button
                                                    type="button"
                                                    onClick={addWorkExperience}
                                                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-300"
                                                >
                                                    ＋ 職歴を追加
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {workExperiences.map((work, index) => (
                                                    <div key={index} className="bg-white p-4 rounded-lg border border-indigo-100">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h4 className="text-lg font-medium text-gray-700">職歴 {index + 1}</h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeWorkExperience(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">会社名</label>
                                                                <input
                                                                    type="text"
                                                                    value={work.company}
                                                                    onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    placeholder="例：○○株式会社"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">役職</label>
                                                                <input
                                                                    type="text"
                                                                    value={work.position}
                                                                    onChange={(e) => handleWorkExperienceChange(index, 'position', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    placeholder="例：エンジニア"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">業務内容</label>
                                                                <textarea
                                                                    value={work.description}
                                                                    onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                                                                    rows={3}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    placeholder="担当した業務内容を具体的に記入してください"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">期間</label>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="month"
                                                                        value={work.startDate}
                                                                        onChange={(e) => handleWorkExperienceChange(index, 'startDate', e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    />
                                                                    <span>～</span>
                                                                    <input
                                                                        type="month"
                                                                        value={work.endDate}
                                                                        onChange={(e) => handleWorkExperienceChange(index, 'endDate', e.target.value)}
                                                                        disabled={work.isCurrently}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4">
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={work.isCurrently}
                                                                    onChange={(e) => handleWorkExperienceChange(index, 'isCurrently', e.target.checked)}
                                                                    className="mr-2"
                                                                />
                                                                <span className="text-sm text-gray-600">現職</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "skills" && (
                                <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-lg border border-indigo-100">
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-semibold text-gray-800">スキル</h3>
                                                <button
                                                    type="button"
                                                    onClick={addSkill}
                                                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-300"
                                                >
                                                    ＋ スキルを追加
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {skills.map((skill, index) => (
                                                    <div key={index} className="bg-white p-4 rounded-lg border border-indigo-100">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h4 className="text-lg font-medium text-gray-700">スキル {index + 1}</h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSkill(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">スキル名</label>
                                                                <input
                                                                    type="text"
                                                                    value={skill.name}
                                                                    onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    placeholder="例：JavaScript"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">レベル</label>
                                                                <select
                                                                    value={skill.level}
                                                                    onChange={(e) => handleSkillChange(index, 'level', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                >
                                                                    <option value="beginner">初級（基本的な利用が可能）</option>
                                                                    <option value="intermediate">中級（実務で活用可能）</option>
                                                                    <option value="advanced">上級（他者に指導可能）</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">経験年数</label>
                                                                <input
                                                                    type="number"
                                                                    value={skill.years}
                                                                    onChange={(e) => handleSkillChange(index, 'years', parseFloat(e.target.value))}
                                                                    min="0"
                                                                    step="0.5"
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    placeholder="例：3.5"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-semibold text-gray-800">資格</h3>
                                                <button
                                                    type="button"
                                                    onClick={addCertification}
                                                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-300"
                                                >
                                                    ＋ 資格を追加
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {certifications.map((cert, index) => (
                                                    <div key={index} className="bg-white p-4 rounded-lg border border-indigo-100">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h4 className="text-lg font-medium text-gray-700">資格 {index + 1}</h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeCertification(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">資格名</label>
                                                                <input
                                                                    type="text"
                                                                    value={cert.name}
                                                                    onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    placeholder="例：基本情報技術者"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">発行機関</label>
                                                                <input
                                                                    type="text"
                                                                    value={cert.issuer}
                                                                    onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                    placeholder="例：IPA"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">取得日</label>
                                                                <input
                                                                    type="date"
                                                                    value={cert.acquiredDate}
                                                                    onChange={(e) => handleCertificationChange(index, 'acquiredDate', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">有効期限</label>
                                                                <input
                                                                    type="date"
                                                                    value={cert.expiryDate}
                                                                    onChange={(e) => handleCertificationChange(index, 'expiryDate', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "other" && (
                                <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-lg border border-indigo-100">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-4">語学力</h3>
                                            <div className="bg-white p-4 rounded-lg border border-indigo-100">
                                                <textarea
                                                    value={formData.applicant_languages}
                                                    onChange={(e) => setFormData({ ...formData, applicant_languages: e.target.value })}
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="例：
英語：TOEIC 800点（2020年取得）
中国語：HSK 4級（2019年取得）"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-4">趣味・特技</h3>
                                            <div className="bg-white p-4 rounded-lg border border-indigo-100">
                                                <textarea
                                                    value={formData.applicant_hobbies}
                                                    onChange={(e) => setFormData({ ...formData, applicant_hobbies: e.target.value })}
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="例：
・プログラミング（個人プロジェクト開発）
・読書（技術書、ビジネス書）
・スポーツ（サッカー、週1回）"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-4">自己紹介</h3>
                                            <div className="bg-white p-4 rounded-lg border border-indigo-100">
                                                <textarea
                                                    value={formData.applicant_self_introduction}
                                                    onChange={(e) => setFormData({ ...formData, applicant_self_introduction: e.target.value })}
                                                    rows={6}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="例：
私は3年間のWeb開発経験を持つエンジニアです。主にフロントエンド開発を担当し、ReactやTypeScriptを使用した大規模なWebアプリケーションの開発に携わってきました。

チーム開発を重視し、コードレビューや技術共有会を積極的に行っています。また、新技術の学習にも熱心で、週末は新しいフレームワークやツールの学習に時間を費やしています。

将来は、より複雑なシステム設計やチームリーダーとしての役割を担いたいと考えています。"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {message && (
                            <div className="mt-6 p-4 rounded-lg bg-green-50 text-green-700">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full mt-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white"
                                }`}
                        >
                            <SaveIcon className="mr-2" />
                            {loading ? "保存中..." : "プロフィールを保存"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
