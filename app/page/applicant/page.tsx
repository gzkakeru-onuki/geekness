"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase";
import {
    BriefcaseIcon,
    DocumentTextIcon,
    CalendarIcon,
    ChartBarIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    ClockIcon,
    UserIcon,
    ArrowRightIcon,
    StarIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

interface WorkExperience {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    isCurrently: boolean;
}

interface Skill {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    years: number;
}

interface Certification {
    name: string;
    issuer: string;
    acquiredDate: string;
    expiryDate?: string;
}

interface FormattedSkill {
    name: string;
    levelText: string;
    years: number;
}

interface Profile {
    name: string;
    title: string;
    experience: string;
    skills: FormattedSkill[];
    rating: number;
    company: string;
    position: string;
}

const levelMap: Record<Skill['level'], string> = {
    'beginner': '初級',
    'intermediate': '中級',
    'advanced': '上級',
    'expert': 'エキスパート'
};

export default function ApplicantPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile>({
        name: "",
        title: "",
        experience: "",
        skills: [],
        rating: 0,
        company: "",
        position: ""
    });

    const [applications, setApplications] = useState([
        {
            id: 1,
            company: "株式会社テクノロジー",
            position: "シニアフロントエンドエンジニア",
            status: "選考中",
            appliedDate: "2024-03-15",
            nextStep: "技術面接",
            nextDate: "2024-03-25",
            score: 85,
            tags: ["React", "TypeScript", "AWS"]
        },
        {
            id: 2,
            company: "株式会社イノベーション",
            position: "バックエンドエンジニア",
            status: "書類選考",
            appliedDate: "2024-03-14",
            nextStep: "書類選考結果",
            nextDate: "2024-03-20",
            score: 92,
            tags: ["Node.js", "TypeScript", "GCP"]
        }
    ]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // ログインユーザーの取得
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setError("ユーザー情報が見つかりません");
                    return;
                }

                // applicant_profilesからユーザー情報を取得
                const { data: applicantProfile, error: profileError } = await supabase
                    .from('applicant_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    setError("プロフィールの取得に失敗しました");
                    return;
                }

                if (applicantProfile) {
                    // 各JSONデータをパース
                    const skillsData = JSON.parse(applicantProfile.applicant_skills || '[]') as Skill[];
                    const experienceData = JSON.parse(applicantProfile.applicant_experience || '[]') as WorkExperience[];
                    const certifications = JSON.parse(applicantProfile.applicant_certifications || '[]') as Certification[];

                    // 最新の職歴を取得（isCurrentlyがtrueまたは最後の要素）
                    const currentExperience = experienceData.find((exp: WorkExperience) => exp.isCurrently) || experienceData[experienceData.length - 1] || {};

                    // スキル情報を整形
                    const formattedSkills: FormattedSkill[] = skillsData.map((skill: Skill): FormattedSkill => ({
                        name: skill.name,
                        levelText: levelMap[skill.level] || '不明',
                        years: skill.years
                    }));

                    setProfile({
                        name: `${applicantProfile.applicant_lastname} ${applicantProfile.applicant_firstname}`,
                        title: certifications.length > 0 ? certifications.map((cert: Certification) => cert.name).join(', ') : '資格なし',
                        experience: "経験者",
                        skills: formattedSkills,
                        rating: 4.8,
                        company: currentExperience.company || '',
                        position: currentExperience.position || ''
                    });
                }
            } catch (err) {
                setError("予期せぬエラーが発生しました");
                console.error('エラー:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    const headerActions = (
        <Link href="/page/dashboard/profile" className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            <UserIcon className="w-5 h-5" />
            <span>プロフィール</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <PageHeader
                title="応募状況"
                subtitle="現在の応募状況を確認できます"
                actions={headerActions}
                showBackButton
                backUrl="/page/dashboard"
            />

            {/* メインコンテンツ */}
            <main className="max-w-7xl mx-auto p-6">
                {/* プロフィールサマリー */}
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="bg-indigo-100 p-4 rounded-full">
                                <UserIcon className="w-12 h-12 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
                                <div className="flex items-center space-x-4 mt-1">
                                    {profile.company && (
                                        <>
                                            <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full"><></>{profile.company}</span>
                                        </>
                                    )}
                                    {profile.position && (
                                        <>
                                            <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{profile.position}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-2"
                            >
                                <span>{skill.name}</span>
                                <span className="text-xs bg-indigo-200 px-2 py-0.5 rounded-full">
                                    {skill.levelText}
                                </span>
                                <span className="text-xs text-indigo-600">
                                    {skill.years}年
                                </span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* 応募状況一覧 */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">応募中の企業</h2>
                        <a
                            href="/applications"
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
                        >
                            すべて表示
                            <ArrowRightIcon className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {applications.map((application) => (
                            <div
                                key={application.id}
                                className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-200"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">{application.position}</h3>
                                        <p className="text-gray-600 mt-1">{application.company}</p>
                                    </div>
                                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${application.status === "選考中"
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        <CheckBadgeIcon className="w-4 h-4" />
                                        <span>{application.status}</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <CalendarIcon className="w-4 h-4 mr-1" />
                                        <span>応募日: {application.appliedDate}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <ClockIcon className="w-4 h-4 mr-1" />
                                        <span>次のステップ: {application.nextStep}</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <ChartBarIcon className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-medium text-indigo-600">スコア: {application.score}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {application.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}