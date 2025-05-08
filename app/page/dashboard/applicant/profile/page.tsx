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
import { TrophyIcon } from '@heroicons/react/24/outline';

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

interface ChallengeTestResult {
    id: string;
    title: string;
    score: number;
    completed_at: string;
    code_quality_score: number;
    maintainability_score: number;
    algorithm_score: number;
    readability_score: number;
    performance_score: number;
    review_comments: string;
}

interface GithubInfo {
    username: string;
    repositories: {
        name: string;
        description: string;
        stars: number;
        forks: number;
        language: string;
        lastUpdated: string;
    }[];
    contributions: number;
    followers: number;
    following: number;
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
    githubInfo?: GithubInfo;
}

export default function ApplicantProfile() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState<"basic" | "education" | "experience" | "challenge" | "github">("basic");
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
        certifications: [],
        githubInfo: {
            username: "yamada-taro",
            repositories: [
                {
                    name: "react-component-library",
                    description: "再利用可能なReactコンポーネントライブラリ",
                    stars: 128,
                    forks: 32,
                    language: "TypeScript",
                    lastUpdated: "2024-03-10"
                },
                {
                    name: "nextjs-portfolio",
                    description: "Next.jsで構築したポートフォリオサイト",
                    stars: 45,
                    forks: 12,
                    language: "JavaScript",
                    lastUpdated: "2024-02-28"
                },
                {
                    name: "aws-lambda-functions",
                    description: "AWS Lambda関数のコレクション",
                    stars: 67,
                    forks: 18,
                    language: "Python",
                    lastUpdated: "2024-01-15"
                }
            ],
            contributions: 1245,
            followers: 87,
            following: 42
        }
    });
    const [challengeResults, setChallengeResults] = useState<ChallengeTestResult[]>([
        {
            id: "1",
            title: "データベースチャレンジ",
            score: 85,
            completed_at: "2024-03-15T10:30:00Z",
            code_quality_score: 90,
            maintainability_score: 85,
            algorithm_score: 80,
            readability_score: 90,
            performance_score: 85,
            review_comments: "データベース設計の基本を理解しており、効率的なクエリを作成できています。インデックスの活用やクエリの最適化についても適切に対応できています。\n\n改善点：\n- より複雑なJOINクエリの最適化\n- パーティショニングの活用\n- バックアップ戦略の考慮"
        },
        {
            id: "2",
            title: "フロントエンドチャレンジ",
            score: 75,
            completed_at: "2024-03-10T14:20:00Z",
            code_quality_score: 80,
            maintainability_score: 70,
            algorithm_score: 75,
            readability_score: 85,
            performance_score: 70,
            review_comments: "Reactの基本的な機能を理解し、コンポーネントの作成ができています。状態管理も適切に行えています。\n\n改善点：\n- パフォーマンス最適化（メモ化の活用）\n- エラーハンドリングの強化\n- アクセシビリティの向上"
        },
        {
            id: "3",
            title: "バックエンドチャレンジ",
            score: 92,
            completed_at: "2024-03-05T09:15:00Z",
            code_quality_score: 95,
            maintainability_score: 90,
            algorithm_score: 90,
            readability_score: 95,
            performance_score: 90,
            review_comments: "RESTful APIの設計と実装が非常に優れています。セキュリティ対策も適切に行われています。\n\n特に評価できる点：\n- クリーンアーキテクチャの適用\n- 適切なエラーハンドリング\n- 効率的なデータベースアクセス\n- テストカバレッジの高さ"
        }
    ]);

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
                        certifications: data.certifications || [],
                        githubInfo: data.githubInfo || {
                            username: "yamada-taro",
                            repositories: [
                                {
                                    name: "react-component-library",
                                    description: "再利用可能なReactコンポーネントライブラリ",
                                    stars: 128,
                                    forks: 32,
                                    language: "TypeScript",
                                    lastUpdated: "2024-03-10"
                                },
                                {
                                    name: "nextjs-portfolio",
                                    description: "Next.jsで構築したポートフォリオサイト",
                                    stars: 45,
                                    forks: 12,
                                    language: "JavaScript",
                                    lastUpdated: "2024-02-28"
                                },
                                {
                                    name: "aws-lambda-functions",
                                    description: "AWS Lambda関数のコレクション",
                                    stars: 67,
                                    forks: 18,
                                    language: "Python",
                                    lastUpdated: "2024-01-15"
                                }
                            ],
                            contributions: 1245,
                            followers: 87,
                            following: 42
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching applicant profile:', error);
            }
        };

        fetchProfile();
        fetchChallengeResults();
    }, []);

    const fetchChallengeResults = async () => {
        try {
            // モックデータを直接使用
            const mockResults: ChallengeTestResult[] = [
                {
                    id: "1",
                    title: "データベースチャレンジ",
                    score: 85,
                    completed_at: "2024-03-15T10:30:00Z",
                    code_quality_score: 90,
                    maintainability_score: 85,
                    algorithm_score: 80,
                    readability_score: 90,
                    performance_score: 85,
                    review_comments: "データベース設計の基本を理解しており、効率的なクエリを作成できています。インデックスの活用やクエリの最適化についても適切に対応できています。\n\n改善点：\n- より複雑なJOINクエリの最適化\n- パーティショニングの活用\n- バックアップ戦略の考慮"
                },
                {
                    id: "2",
                    title: "フロントエンドチャレンジ",
                    score: 75,
                    completed_at: "2024-03-10T14:20:00Z",
                    code_quality_score: 80,
                    maintainability_score: 70,
                    algorithm_score: 75,
                    readability_score: 85,
                    performance_score: 70,
                    review_comments: "Reactの基本的な機能を理解し、コンポーネントの作成ができています。状態管理も適切に行えています。\n\n改善点：\n- パフォーマンス最適化（メモ化の活用）\n- エラーハンドリングの強化\n- アクセシビリティの向上"
                },
                {
                    id: "3",
                    title: "バックエンドチャレンジ",
                    score: 92,
                    completed_at: "2024-03-05T09:15:00Z",
                    code_quality_score: 95,
                    maintainability_score: 90,
                    algorithm_score: 90,
                    readability_score: 95,
                    performance_score: 90,
                    review_comments: "RESTful APIの設計と実装が非常に優れています。セキュリティ対策も適切に行われています。\n\n特に評価できる点：\n- クリーンアーキテクチャの適用\n- 適切なエラーハンドリング\n- 効率的なデータベースアクセス\n- テストカバレッジの高さ"
                }
            ];
            setChallengeResults(mockResults);
        } catch (error) {
            console.error('Error fetching challenge results:', error);
        }
    };

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
                                onClick={() => setActiveTab("education")}
                                className={`flex items-center px-6 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${activeTab === "education"
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
                                className={`flex items-center px-6 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${activeTab === "experience"
                                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <WorkIcon className="w-5 h-5 mr-2" />
                                職歴
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("challenge")}
                                className={`flex items-center px-6 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${activeTab === "challenge"
                                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <TrophyIcon className="w-5 h-5 mr-2" />
                                スキルチャレンジ
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("github")}
                                className={`flex items-center px-6 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${activeTab === "github"
                                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                GitHub
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

                        {/* スキルチャレンジ */}
                        {activeTab === "challenge" && (
                            <div className="space-y-6">
                                {challengeResults.length > 0 ? (
                                    challengeResults.map((result) => {
                                        // ランクの判定
                                        let rank = "";
                                        let rankColor = "";
                                        if (result.score >= 90) {
                                            rank = "プラチナ";
                                            rankColor = "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800";
                                        } else if (result.score >= 80) {
                                            rank = "ゴールド";
                                            rankColor = "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800";
                                        } else if (result.score >= 70) {
                                            rank = "シルバー";
                                            rankColor = "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800";
                                        } else if (result.score >= 60) {
                                            rank = "ブロンズ";
                                            rankColor = "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800";
                                        } else {
                                            rank = "銅";
                                            rankColor = "bg-gradient-to-r from-red-100 to-red-200 text-red-800";
                                        }

                                        return (
                                            <div key={result.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900">{result.title}</h3>
                                                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${rankColor}`}>
                                                        {rank}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                                    <div className="bg-white/50 rounded-lg p-3">
                                                        <span className="text-xs text-gray-500">コード品質</span>
                                                        <p className="font-medium text-gray-800">{result.code_quality_score}点</p>
                                                    </div>
                                                    <div className="bg-white/50 rounded-lg p-3">
                                                        <span className="text-xs text-gray-500">保守性</span>
                                                        <p className="font-medium text-gray-800">{result.maintainability_score}点</p>
                                                    </div>
                                                    <div className="bg-white/50 rounded-lg p-3">
                                                        <span className="text-xs text-gray-500">アルゴリズム</span>
                                                        <p className="font-medium text-gray-800">{result.algorithm_score}点</p>
                                                    </div>
                                                    <div className="bg-white/50 rounded-lg p-3">
                                                        <span className="text-xs text-gray-500">可読性</span>
                                                        <p className="font-medium text-gray-800">{result.readability_score}点</p>
                                                    </div>
                                                    <div className="bg-white/50 rounded-lg p-3">
                                                        <span className="text-xs text-gray-500">パフォーマンス</span>
                                                        <p className="font-medium text-gray-800">{result.performance_score}点</p>
                                                    </div>
                                                </div>
                                                <div className="bg-white/50 rounded-lg p-4">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">レビューコメント</h4>
                                                    <p className="text-gray-600 whitespace-pre-wrap">{result.review_comments}</p>
                                                </div>
                                                <div className="mt-4 text-sm text-gray-500">
                                                    受験日: {new Date(result.completed_at).toLocaleDateString('ja-JP')}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8">
                                        <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">まだスキルチャレンジの結果はありません</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* GitHub連携情報 */}
                        {activeTab === "github" && (
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">GitHub連携情報</h3>

                                    <div className="space-y-4">
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">GitHubアカウント情報</h4>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        GitHubユーザー名
                                                    </label>
                                                    <div className="flex items-center">
                                                        <span className="text-gray-500 mr-2">@</span>
                                                        <input
                                                            type="text"
                                                            value={formData.githubInfo?.username || ""}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                githubInfo: {
                                                                    ...formData.githubInfo,
                                                                    username: e.target.value
                                                                } as GithubInfo
                                                            })}
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                            placeholder="ユーザー名を入力"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <a
                                                        href={`https://github.com/${formData.githubInfo?.username || ""}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                    >
                                                        GitHubプロフィールを確認
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">リポジトリ情報</h4>

                                            <div className="space-y-4">
                                                {formData.githubInfo?.repositories && formData.githubInfo.repositories.length > 0 ? (
                                                    formData.githubInfo.repositories.map((repo, index) => (
                                                        <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <input
                                                                        type="text"
                                                                        value={repo.name}
                                                                        onChange={(e) => {
                                                                            const updatedRepos = [...(formData.githubInfo?.repositories || [])];
                                                                            updatedRepos[index].name = e.target.value;
                                                                            setFormData({
                                                                                ...formData,
                                                                                githubInfo: {
                                                                                    ...formData.githubInfo,
                                                                                    repositories: updatedRepos
                                                                                } as GithubInfo
                                                                            });
                                                                        }}
                                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-medium text-gray-900"
                                                                        placeholder="リポジトリ名"
                                                                    />
                                                                </div>
                                                                <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-700 ml-2">
                                                                    {repo.language}
                                                                </span>
                                                            </div>
                                                            <textarea
                                                                value={repo.description}
                                                                onChange={(e) => {
                                                                    const updatedRepos = [...(formData.githubInfo?.repositories || [])];
                                                                    updatedRepos[index].description = e.target.value;
                                                                    setFormData({
                                                                        ...formData,
                                                                        githubInfo: {
                                                                            ...formData.githubInfo,
                                                                            repositories: updatedRepos
                                                                        } as GithubInfo
                                                                    });
                                                                }}
                                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-600 mt-1"
                                                                placeholder="リポジトリの説明"
                                                                rows={2}
                                                            />
                                                            <div className="flex items-center mt-2 text-xs text-gray-500">
                                                                <div className="flex items-center mr-4">
                                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                    <input
                                                                        type="number"
                                                                        value={repo.stars}
                                                                        onChange={(e) => {
                                                                            const updatedRepos = [...(formData.githubInfo?.repositories || [])];
                                                                            updatedRepos[index].stars = parseInt(e.target.value) || 0;
                                                                            setFormData({
                                                                                ...formData,
                                                                                githubInfo: {
                                                                                    ...formData.githubInfo,
                                                                                    repositories: updatedRepos
                                                                                } as GithubInfo
                                                                            });
                                                                        }}
                                                                        className="block w-16 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center mr-4">
                                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <input
                                                                        type="number"
                                                                        value={repo.forks}
                                                                        onChange={(e) => {
                                                                            const updatedRepos = [...(formData.githubInfo?.repositories || [])];
                                                                            updatedRepos[index].forks = parseInt(e.target.value) || 0;
                                                                            setFormData({
                                                                                ...formData,
                                                                                githubInfo: {
                                                                                    ...formData.githubInfo,
                                                                                    repositories: updatedRepos
                                                                                } as GithubInfo
                                                                            });
                                                                        }}
                                                                        className="block w-16 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <span className="mr-1">最終更新:</span>
                                                                    <input
                                                                        type="date"
                                                                        value={repo.lastUpdated.split('T')[0]}
                                                                        onChange={(e) => {
                                                                            const updatedRepos = [...(formData.githubInfo?.repositories || [])];
                                                                            updatedRepos[index].lastUpdated = e.target.value;
                                                                            setFormData({
                                                                                ...formData,
                                                                                githubInfo: {
                                                                                    ...formData.githubInfo,
                                                                                    repositories: updatedRepos
                                                                                } as GithubInfo
                                                                            });
                                                                        }}
                                                                        className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4 text-gray-500">
                                                        リポジトリ情報はありません
                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newRepo = {
                                                            name: "",
                                                            description: "",
                                                            stars: 0,
                                                            forks: 0,
                                                            language: "TypeScript",
                                                            lastUpdated: new Date().toISOString().split('T')[0]
                                                        };

                                                        setFormData({
                                                            ...formData,
                                                            githubInfo: {
                                                                ...formData.githubInfo,
                                                                repositories: [
                                                                    ...(formData.githubInfo?.repositories || []),
                                                                    newRepo
                                                                ]
                                                            } as GithubInfo
                                                        });
                                                    }}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    + リポジトリを追加
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">GitHub統計情報</h4>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        コントリビューション
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.githubInfo?.contributions || 0}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            githubInfo: {
                                                                ...formData.githubInfo,
                                                                contributions: parseInt(e.target.value) || 0
                                                            } as GithubInfo
                                                        })}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        フォロワー
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.githubInfo?.followers || 0}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            githubInfo: {
                                                                ...formData.githubInfo,
                                                                followers: parseInt(e.target.value) || 0
                                                            } as GithubInfo
                                                        })}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        フォロー中
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.githubInfo?.following || 0}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            githubInfo: {
                                                                ...formData.githubInfo,
                                                                following: parseInt(e.target.value) || 0
                                                            } as GithubInfo
                                                        })}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 保存ボタン */}
                        {activeTab !== "challenge" && activeTab !== "github" && (
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
                        )}

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