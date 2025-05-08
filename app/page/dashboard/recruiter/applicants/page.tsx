"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { DocumentTextIcon, BuildingOfficeIcon, ChartBarIcon, TagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from "next/link";
import { TrophyIcon, CodeBracketIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface Applicant {
    id: string;
    name: string;
    position: string;
    appliedDate: string;
    status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
    nextStep?: string;
    nextDate?: string;
    score?: number;
    tags: string[];
    experience: string;
    skills: string[];
    challengeResults?: {
        id: string;
        title: string;
        score: number;
        completed_at: string;
        rank: string;
    }[];
    githubInfo?: {
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
    };
}

export default function RecruiterApplicantsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted'>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTabs, setActiveTabs] = useState<Record<string, 'info' | 'challenge' | 'github'>>({});

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // TODO: APIから応募者データを取得
                // 仮のデータ
                const mockApplicants: Applicant[] = [
                    {
                        id: "1",
                        name: "山田 太郎",
                        position: "シニアフロントエンドエンジニア",
                        appliedDate: "2024-03-15",
                        status: "interview",
                        nextStep: "技術面接",
                        nextDate: "2024-03-25",
                        score: 85,
                        tags: ["React", "TypeScript", "AWS"],
                        experience: "5年",
                        skills: ["フロントエンド開発", "UI/UXデザイン", "チームリーダーシップ"],
                        challengeResults: [
                            {
                                id: "1",
                                title: "データベース設計チャレンジ",
                                score: 85,
                                completed_at: "2024-03-15T10:30:00Z",
                                rank: "ゴールド"
                            },
                            {
                                id: "2",
                                title: "React実装チャレンジ",
                                score: 75,
                                completed_at: "2024-03-10T14:20:00Z",
                                rank: "シルバー"
                            }
                        ],
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
                    },
                    {
                        id: "2",
                        name: "佐藤 一郎",
                        position: "バックエンドエンジニア",
                        appliedDate: "2024-03-14",
                        status: "reviewing",
                        nextStep: "書類選考結果",
                        nextDate: "2024-03-20",
                        score: 92,
                        tags: ["Node.js", "TypeScript", "GCP"],
                        experience: "3年",
                        skills: ["バックエンド開発", "データベース設計", "マイクロサービス"],
                        challengeResults: [
                            {
                                id: "3",
                                title: "マイクロサービス設計チャレンジ",
                                score: 92,
                                completed_at: "2024-03-05T09:15:00Z",
                                rank: "プラチナ"
                            },
                            {
                                id: "1",
                                title: "データベース最適化チャレンジ",
                                score: 88,
                                completed_at: "2024-03-01T11:30:00Z",
                                rank: "ゴールド"
                            }
                        ],
                        githubInfo: {
                            username: "sato-ichiro",
                            repositories: [
                                {
                                    name: "microservices-demo",
                                    description: "マイクロサービスアーキテクチャのデモプロジェクト",
                                    stars: 89,
                                    forks: 24,
                                    language: "Go",
                                    lastUpdated: "2024-03-05"
                                },
                                {
                                    name: "node-api-boilerplate",
                                    description: "Node.js APIのボイラープレート",
                                    stars: 156,
                                    forks: 43,
                                    language: "TypeScript",
                                    lastUpdated: "2024-02-20"
                                },
                                {
                                    name: "database-optimization",
                                    description: "データベース最適化テクニックの実装例",
                                    stars: 72,
                                    forks: 19,
                                    language: "SQL",
                                    lastUpdated: "2024-01-10"
                                }
                            ],
                            contributions: 876,
                            followers: 64,
                            following: 38
                        }
                    }
                ];

                setApplicants(mockApplicants);

                // 各応募者の初期タブ状態を設定
                const initialTabs: Record<string, 'info' | 'challenge' | 'github'> = {};
                mockApplicants.forEach(applicant => {
                    initialTabs[applicant.id] = 'info';
                });
                setActiveTabs(initialTabs);
            } catch (error) {
                console.error('Error fetching applicants:', error);
                setError("応募者情報の取得中にエラーが発生しました。");
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplicants();
    }, []);

    const getStatusColor = (status: Applicant['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'reviewing':
                return 'bg-blue-100 text-blue-800';
            case 'interview':
                return 'bg-purple-100 text-purple-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: Applicant['status']) => {
        switch (status) {
            case 'pending':
                return '応募済み';
            case 'reviewing':
                return '審査中';
            case 'interview':
                return '面接中';
            case 'rejected':
                return '不採用';
            case 'accepted':
                return '採用';
            default:
                return '不明';
        }
    };

    const filteredApplicants = applicants.filter(applicant => {
        const matchesFilter = filter === 'all' || applicant.status === filter;
        const matchesSearch = applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            applicant.position.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // タブ切り替えハンドラー
    const handleTabChange = (applicantId: string, tab: 'info' | 'challenge' | 'github') => {
        setActiveTabs(prev => ({
            ...prev,
            [applicantId]: tab
        }));
    };

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <PageHeader
                title="応募者一覧"
                subtitle="すべての応募者を確認できます"
                showBackButton
                backUrl="/page/dashboard/recruiter"
            />

            <main className="max-w-4xl mx-auto p-6">
                {/* 検索とフィルター */}
                <div className="mb-6 space-y-4">
                    {/* 検索バー */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="応募者名または職種で検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* フィルター */}
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg ${filter === 'all'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            すべて
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-lg ${filter === 'pending'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            応募済み
                        </button>
                        <button
                            onClick={() => setFilter('reviewing')}
                            className={`px-4 py-2 rounded-lg ${filter === 'reviewing'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            審査中
                        </button>
                        <button
                            onClick={() => setFilter('interview')}
                            className={`px-4 py-2 rounded-lg ${filter === 'interview'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            面接中
                        </button>
                        <button
                            onClick={() => setFilter('accepted')}
                            className={`px-4 py-2 rounded-lg ${filter === 'accepted'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            採用
                        </button>
                        <button
                            onClick={() => setFilter('rejected')}
                            className={`px-4 py-2 rounded-lg ${filter === 'rejected'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            不採用
                        </button>
                    </div>
                </div>

                {/* 応募者一覧 */}
                <div className="space-y-4">
                    {filteredApplicants.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            応募者は見つかりません
                        </div>
                    ) : (
                        filteredApplicants.map((applicant) => (
                            <Link
                                key={applicant.id}
                                href={`/page/dashboard/recruiter/applicants/${applicant.id}`}
                                className="block"
                            >
                                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {applicant.name}
                                            </h3>
                                            <p className="mt-1 text-gray-600">
                                                {applicant.position}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicant.status)}`}>
                                            {getStatusText(applicant.status)}
                                        </span>
                                    </div>

                                    {/* タブ切り替え */}
                                    <div className="mt-4 border-b border-gray-200">
                                        <nav className="flex space-x-8">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleTabChange(applicant.id, 'info');
                                                }}
                                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTabs[applicant.id] === 'info'
                                                    ? 'border-indigo-500 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                <UserCircleIcon className="w-4 h-4 mr-1" />
                                                基本情報
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleTabChange(applicant.id, 'challenge');
                                                }}
                                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTabs[applicant.id] === 'challenge'
                                                    ? 'border-indigo-500 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                <TrophyIcon className="w-4 h-4 mr-1" />
                                                スキルチャレンジ
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleTabChange(applicant.id, 'github');
                                                }}
                                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTabs[applicant.id] === 'github'
                                                    ? 'border-indigo-500 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                <CodeBracketIcon className="w-4 h-4 mr-1" />
                                                GitHub
                                            </button>
                                        </nav>
                                    </div>

                                    {/* タブコンテンツ */}
                                    <div className="mt-4">
                                        {/* 基本情報タブ */}
                                        {activeTabs[applicant.id] === 'info' && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center space-x-2">
                                                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            応募日: {new Date(applicant.appliedDate).toLocaleDateString('ja-JP')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            経験年数: {applicant.experience}
                                                        </span>
                                                    </div>
                                                    {applicant.score && (
                                                        <div className="flex items-center space-x-2">
                                                            <ChartBarIcon className="w-5 h-5 text-gray-400" />
                                                            <span className="text-gray-600">
                                                                スコア: {applicant.score}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {applicant.nextStep && (
                                                    <div className="text-sm text-gray-600">
                                                        次のステップ: {applicant.nextStep}
                                                        {applicant.nextDate && ` (${new Date(applicant.nextDate).toLocaleDateString('ja-JP')})`}
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-2">
                                                    {applicant.tags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                                        >
                                                            <TagIcon className="w-3 h-3 mr-1" />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="text-sm text-gray-600">
                                                    スキル: {applicant.skills.join(", ")}
                                                </div>
                                            </div>
                                        )}

                                        {/* スキルチャレンジタブ */}
                                        {activeTabs[applicant.id] === 'challenge' && (
                                            <div>
                                                {applicant.challengeResults && applicant.challengeResults.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {applicant.challengeResults.map((result) => {
                                                            // ランクに応じた色を設定
                                                            let rankColor = "";
                                                            let rankBgColor = "";
                                                            if (result.rank === "プラチナ") {
                                                                rankColor = "text-blue-800";
                                                                rankBgColor = "bg-gradient-to-r from-blue-100 to-blue-200";
                                                            } else if (result.rank === "ゴールド") {
                                                                rankColor = "text-yellow-800";
                                                                rankBgColor = "bg-gradient-to-r from-yellow-100 to-yellow-200";
                                                            } else if (result.rank === "シルバー") {
                                                                rankColor = "text-gray-800";
                                                                rankBgColor = "bg-gradient-to-r from-gray-100 to-gray-200";
                                                            } else if (result.rank === "ブロンズ") {
                                                                rankColor = "text-orange-800";
                                                                rankBgColor = "bg-gradient-to-r from-orange-100 to-orange-200";
                                                            } else {
                                                                rankColor = "text-red-800";
                                                                rankBgColor = "bg-gradient-to-r from-red-100 to-red-200";
                                                            }

                                                            return (
                                                                <div key={result.id} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <h5 className="font-medium text-gray-900">{result.title}</h5>
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${rankBgColor} ${rankColor}`}>
                                                                            {result.rank}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <div className="flex items-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                            </svg>
                                                                            <span className="text-gray-600">スコア: {result.score}点</span>
                                                                        </div>
                                                                        <div className="text-gray-500 text-xs">
                                                                            受験日: {new Date(result.completed_at).toLocaleDateString('ja-JP')}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-gray-500">
                                                        スキルチャレンジの結果はありません
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* GitHubタブ */}
                                        {activeTabs[applicant.id] === 'github' && (
                                            <div>
                                                {applicant.githubInfo ? (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                                                </svg>
                                                                <span className="font-medium text-gray-900">@{applicant.githubInfo.username}</span>
                                                            </div>
                                                            <a
                                                                href={`https://github.com/${applicant.githubInfo.username}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                            >
                                                                GitHubプロフィールを見る
                                                            </a>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                                <div className="text-2xl font-bold text-gray-900">{applicant.githubInfo.contributions}</div>
                                                                <div className="text-xs text-gray-500">コントリビューション</div>
                                                            </div>
                                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                                <div className="text-2xl font-bold text-gray-900">{applicant.githubInfo.followers}</div>
                                                                <div className="text-xs text-gray-500">フォロワー</div>
                                                            </div>
                                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                                <div className="text-2xl font-bold text-gray-900">{applicant.githubInfo.following}</div>
                                                                <div className="text-xs text-gray-500">フォロー中</div>
                                                            </div>
                                                        </div>

                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">リポジトリ</h4>
                                                        <div className="space-y-3">
                                                            {applicant.githubInfo.repositories.map((repo, index) => (
                                                                <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                                    <div className="flex justify-between items-start">
                                                                        <h5 className="font-medium text-gray-900">{repo.name}</h5>
                                                                        <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-700">
                                                                            {repo.language}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                                                                    <div className="flex items-center mt-2 text-xs text-gray-500">
                                                                        <div className="flex items-center mr-4">
                                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                            </svg>
                                                                            {repo.stars}
                                                                        </div>
                                                                        <div className="flex items-center mr-4">
                                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                            {repo.forks}
                                                                        </div>
                                                                        <div>
                                                                            最終更新: {new Date(repo.lastUpdated).toLocaleDateString('ja-JP')}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-gray-500">
                                                        GitHub情報はありません
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
} 