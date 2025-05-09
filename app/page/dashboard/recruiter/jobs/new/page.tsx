'use client';
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';

import {
    AlertCircle,
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    ListChecks,
    Heart,
    Building2,
    FileText,
    UserPlus,
    Eye,
    Copy,
    Plus,
    Globe,
    RotateCcw,
    Upload,
    Users,
    Calendar
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { createClient } from '@supabase/supabase-js';


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 画像URLを取得する関数
const getImageUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/jobs/${path}`;
};

// テンプレートの型定義
type JobTemplate = {
    id: string;
    title: string;
    description: string;
    requirements: string;
    benefits: string;
    salary_min: number | null;
    salary_max: number | null;
    location: string;
    employment_type: string;
    selectedLocations: string[];
    selectedRequirements: string[];
    selectedBenefits: string[];
    work_style: string;
    company_culture: string;
    team_description: string;
    logo_url: string;
    office_photo_url: string;
    team_photo_url: string;
    event_photo_url: string;
    status: string;
    salary_range?: string;
    selected_employment_type?: string;
};

// テンプレートデータ
const jobTemplates: JobTemplate[] = [
    {
        id: 'frontend',
        title: 'フロントエンドエンジニア募集',
        description: '当社のWebアプリケーション開発チームで、最新のフロントエンド技術を活用してユーザー体験を向上させるエンジニアを募集しています。\n\n主な業務内容：\n- 新規機能の開発\n- 既存機能の改善\n- パフォーマンス最適化\n- コードレビュー',
        requirements: '必須スキル：\n- React/Next.jsの実務経験\n- TypeScriptの使用経験\n- Gitによるバージョン管理\n\n歓迎スキル：\n- テスト駆動開発の経験\n- CI/CDの知識\n- アクセシビリティ対応の経験',
        benefits: '福利厚生：\n- フレックスタイム制\n- リモートワーク可能\n- 各種社会保険完備\n- 書籍購入補助\n- 技術カンファレンス参加支援',
        salary_min: 4000000,
        salary_max: 8000000,
        location: '東京都渋谷区',
        employment_type: 'full_time',
        selectedLocations: ['kanto', 'remote'],
        selectedRequirements: ['react', 'typescript', 'git'],
        selectedBenefits: ['remote', 'flex', 'insurance', 'book', 'conference'],
        work_style: 'フレックス制で、コアタイムは10:00-16:00。リモートワークも可能で、週2-3日はオフィス出社をお願いしています。',
        company_culture: '「技術で社会を変える」をミッションに、エンジニアの裁量権を最大限尊重する文化があります。週1回の技術共有会や、月1回のハッカソンなど、技術力を高める機会が豊富です。',
        team_description: 'フロントエンドチームは現在5名で、全員がフルスタックエンジニアとして活躍しています。新規メンバーには、既存のプロダクト改善と新規機能開発の両方を担当していただきます。',
        logo_url: '',
        office_photo_url: '',
        team_photo_url: '',
        event_photo_url: '',
        status: 'draft'
    },
    {
        id: 'backend',
        title: 'バックエンドエンジニア募集',
        description: '当社のバックエンド開発チームで、スケーラブルなシステム構築を担うエンジニアを募集しています。\n\n主な業務内容：\n- API設計・開発\n- データベース設計\n- パフォーマンスチューニング\n- セキュリティ対策',
        requirements: '必須スキル：\n- Node.js/Pythonの実務経験\n- RESTful APIの設計・開発経験\n- データベース設計の経験\n\n歓迎スキル：\n- マイクロサービスアーキテクチャの知識\n- クラウドサービスの利用経験\n- コンテナ技術の知識',
        benefits: '福利厚生：\n- フレックスタイム制\n- リモートワーク可能\n- 各種社会保険完備\n- 技術書籍購入補助\n- 資格取得支援',
        salary_min: 4500000,
        salary_max: 8500000,
        location: '東京都渋谷区',
        employment_type: 'full_time',
        selectedLocations: ['kanto', 'remote'],
        selectedRequirements: ['nodejs', 'python', 'sql', 'nosql'],
        selectedBenefits: ['remote', 'flex', 'insurance', 'book', 'certification'],
        work_style: 'フレックス制で、コアタイムは10:00-16:00。リモートワークも可能で、週2-3日はオフィス出社をお願いしています。',
        company_culture: '「技術で社会を変える」をミッションに、エンジニアの裁量権を最大限尊重する文化があります。週1回の技術共有会や、月1回のハッカソンなど、技術力を高める機会が豊富です。',
        team_description: 'バックエンドチームは現在6名で、マイクロサービスアーキテクチャを採用しています。新規メンバーには、既存サービスの改善と新規サービスの開発の両方を担当していただきます。',
        logo_url: '',
        office_photo_url: '',
        team_photo_url: '',
        event_photo_url: '',
        status: 'draft'
    }
];

// 雇用形態のオプション
const employmentTypes = [
    { value: 'full_time', label: '正社員' },
    { value: 'contract', label: '契約社員' },
    { value: 'part_time', label: 'パートタイム' },
    { value: 'intern', label: 'インターン' }
];

// 勤務地のオプション（全国対応）
const locations = [
    { value: 'remote', label: 'リモートワーク可' },
    { value: 'hokkaido', label: '北海道' },
    { value: 'tohoku', label: '東北地方' },
    { value: 'kanto', label: '関東地方' },
    { value: 'chubu', label: '中部地方' },
    { value: 'kansai', label: '関西地方' },
    { value: 'chugoku', label: '中国地方' },
    { value: 'shikoku', label: '四国地方' },
    { value: 'kyushu', label: '九州地方' },
    { value: 'okinawa', label: '沖縄県' }
];

// 給与範囲のオプション
const salaryRanges = [
    { min: 3000000, max: 4000000, label: '年収300万円〜400万円' },
    { min: 4000000, max: 5000000, label: '年収400万円〜500万円' },
    { min: 5000000, max: 6000000, label: '年収500万円〜600万円' },
    { min: 6000000, max: 7000000, label: '年収600万円〜700万円' },
    { min: 7000000, max: 8000000, label: '年収700万円〜800万円' },
    { min: 8000000, max: 9000000, label: '年収800万円〜900万円' },
    { min: 9000000, max: 10000000, label: '年収900万円〜1000万円' },
    { min: 10000000, max: null, label: '年収1000万円〜' }
];

// 必須要件のカテゴリとオプション
const requirementCategories = [
    {
        id: 'frontend',
        label: 'フロントエンド',
        options: [
            { value: 'react', label: 'React/Next.js' },
            { value: 'vue', label: 'Vue.js' },
            { value: 'angular', label: 'Angular' },
            { value: 'typescript', label: 'TypeScript' },
            { value: 'javascript', label: 'JavaScript' },
            { value: 'html', label: 'HTML/CSS' },
            { value: 'sass', label: 'SASS/SCSS' },
            { value: 'jest', label: 'Jest' },
            { value: 'storybook', label: 'Storybook' }
        ]
    },
    {
        id: 'backend',
        label: 'バックエンド',
        options: [
            { value: 'nodejs', label: 'Node.js' },
            { value: 'python', label: 'Python' },
            { value: 'java', label: 'Java' },
            { value: 'php', label: 'PHP' },
            { value: 'ruby', label: 'Ruby' },
            { value: 'go', label: 'Go' },
            { value: 'rust', label: 'Rust' }
        ]
    },
    {
        id: 'infrastructure',
        label: 'インフラ',
        options: [
            { value: 'aws', label: 'AWS' },
            { value: 'gcp', label: 'GCP' },
            { value: 'azure', label: 'Azure' },
            { value: 'docker', label: 'Docker' },
            { value: 'kubernetes', label: 'Kubernetes' },
            { value: 'terraform', label: 'Terraform' },
            { value: 'ansible', label: 'Ansible' }
        ]
    },
    {
        id: 'database',
        label: 'データベース',
        options: [
            { value: 'mysql', label: 'MySQL' },
            { value: 'postgresql', label: 'PostgreSQL' },
            { value: 'mongodb', label: 'MongoDB' },
            { value: 'redis', label: 'Redis' },
            { value: 'elasticsearch', label: 'Elasticsearch' }
        ]
    },
    {
        id: 'devops',
        label: 'DevOps',
        options: [
            { value: 'git', label: 'Git' },
            { value: 'github', label: 'GitHub' },
            { value: 'gitlab', label: 'GitLab' },
            { value: 'jenkins', label: 'Jenkins' },
            { value: 'circleci', label: 'CircleCI' },
            { value: 'github_actions', label: 'GitHub Actions' }
        ]
    }
];

// 福利厚生のカテゴリとオプション
const benefitCategories = [
    {
        id: 'work_style',
        label: '働き方',
        options: [
            { value: 'remote', label: 'リモートワーク' },
            { value: 'flex', label: 'フレックスタイム' },
            { value: 'core_time', label: 'コアタイムなし' },
            { value: 'side_job', label: '副業可' }
        ]
    },
    {
        id: 'compensation',
        label: '報酬・待遇',
        options: [
            { value: 'insurance', label: '各種社会保険完備' },
            { value: 'bonus', label: '賞与あり' },
            { value: 'raise', label: '昇給あり' },
            { value: 'stock', label: 'ストックオプション' }
        ]
    },
    {
        id: 'development',
        label: '成長支援',
        options: [
            { value: 'training', label: '研修制度' },
            { value: 'conference', label: 'カンファレンス参加支援' },
            { value: 'book', label: '書籍購入補助' },
            { value: 'certification', label: '資格取得支援' }
        ]
    },
    {
        id: 'welfare',
        label: '福利厚生',
        options: [
            { value: 'gym', label: 'ジム利用補助' },
            { value: 'meal', label: '食事補助' },
            { value: 'transportation', label: '交通費全額支給' },
            { value: 'childcare', label: '育児支援' },
            { value: 'counseling', label: 'カウンセリング制度' },
            { value: 'holiday', label: '有給休暇消化促進' }
        ]
    }
];

// Imageコンポーネントの型定義
interface ImageProps {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    priority?: boolean;
}

const ImageComponent = ({ src, alt, fill = false, className, priority = false }: ImageProps) => {
    return (
        <Image
            src={src}
            alt={alt}
            fill={fill}
            className={className}
            priority={priority}
            style={fill ? { objectFit: 'cover' } : undefined}
        />
    );
};

// プレビュー部分の画像表示コンポーネント
const PreviewImage = ({ src, alt, className }: { src: string | null, alt: string, className?: string }) => {
    const imageUrl = getImageUrl(src);
    if (!imageUrl) return null;

    return (
        <Image
            src={imageUrl}
            alt={alt}
            width={1200}
            height={800}
            className={className}
            unoptimized
        />
    );
};

export default function NewJobPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const initialFormData: JobTemplate = {
        id: '',
        title: '',
        description: '',
        requirements: '',
        benefits: '',
        salary_min: null,
        salary_max: null,
        location: '',
        employment_type: '',
        selectedLocations: [],
        selectedRequirements: [],
        selectedBenefits: [],
        work_style: '',
        company_culture: '',
        team_description: '',
        logo_url: '',
        office_photo_url: '',
        team_photo_url: '',
        event_photo_url: '',
        status: 'draft'
    };
    const [formData, setFormData] = useState<JobTemplate>(initialFormData);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('セッション取得エラー:', sessionError);
                    throw new Error('認証セッションの取得に失敗しました');
                }

                if (!session) {
                    throw new Error('ログインが必要です。ログインしてから再度お試しください。');
                }

                setIsLoading(false);
            } catch (error) {
                console.error('認証エラー:', error);
                router.push('/auth/login');
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const handleReset = () => {
        setFormData(initialFormData);
        setError(null);
    };

    // 画像アップロードの処理
    const handleImageUpload = async (type: 'logo' | 'office' | 'team' | 'event', file: File) => {
        try {
            // ファイル名の生成（一意性を確保）
            const fileName = `${type}_${Date.now()}_${file.name}`;
            const filePath = fileName;

            // Storageへのアップロード
            const { data, error } = await supabase.storage
                .from('jobs')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // 相対パスを返す
            return `/${filePath}`;
        } catch (error) {
            console.error('画像アップロードエラー:', error);
            throw new Error('画像のアップロードに失敗しました');
        }
    };

    // 画像削除の処理
    const handleImageRemove = async (type: 'logo' | 'office' | 'team' | 'event', path: string) => {
        try {
            if (path) {
                // Storageから画像を削除
                const { error } = await supabase.storage
                    .from('jobs')
                    .remove([path.replace('/', '')]);

                if (error) throw error;
            }
        } catch (error) {
            console.error('画像削除エラー:', error);
            throw new Error('画像の削除に失敗しました');
        }
    };

    // フォーム送信時の処理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            if (!session) throw new Error('ログインが必要です');

            const { data: recruiterProfile, error: profileError } = await supabase
                .from('recruiter_profiles')
                .select('company_id')
                .eq('id', session.user.id)
                .single();

            if (profileError) throw profileError;
            if (!recruiterProfile) throw new Error('採用担当者プロフィールが見つかりません');

            // データベースに送信するデータを整形
            const jobData = {
                id: uuidv4(),
                title: formData.title,
                description: formData.description,
                requirements: formData.requirements,
                benefits: formData.benefits,
                salary_min: formData.salary_min,
                salary_max: formData.salary_max,
                location: formData.location,
                employment_type: formData.employment_type,
                status: 'published',
                work_style: formData.work_style,
                company_culture: formData.company_culture,
                team_description: formData.team_description,
                logo_url: formData.logo_url,
                office_photo_url: formData.office_photo_url,
                team_photo_url: formData.team_photo_url,
                event_photo_url: formData.event_photo_url,
                selected_benefits: formData.selectedBenefits,
                selected_locations: formData.selectedLocations,
                selected_requirements: formData.selectedRequirements,
                salary_range: formData.salary_min && formData.salary_max
                    ? `${formData.salary_min}〜${formData.salary_max}`
                    : null,
                selected_employment_type: formData.employment_type,
                company_id: recruiterProfile.company_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { error: insertError } = await supabase
                .from('jobs')
                .insert([jobData]);

            if (insertError) {
                console.error('求人作成エラー:', insertError);
                throw new Error(`求人の作成に失敗しました: ${insertError.message}`);
            }

            router.push('/page/dashboard/recruiter/jobs');
        } catch (error) {
            console.error('求人作成エラー:', error);
            setError('求人の作成に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTemplateSelect = (templateId: string) => {
        const template = jobTemplates.find(t => t.id === templateId);
        if (template) {
            setFormData(template);
        }
    };

    const handleCheckboxChange = (type: 'location' | 'requirement' | 'benefit', value: string) => {
        const field = `selected${type.charAt(0).toUpperCase() + type.slice(1)}s`;
        setFormData(prev => {
            const currentValues = prev[field as keyof typeof prev] as string[];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];

            // テキストフィールドの更新
            let textField = '';
            if (type === 'location') {
                textField = newValues.map(v => locations.find(l => l.value === v)?.label).join('、');
            } else if (type === 'requirement') {
                textField = newValues.map(v => {
                    for (const category of requirementCategories) {
                        const option = category.options.find(o => o.value === v);
                        if (option) return option.label;
                    }
                    return '';
                }).filter(Boolean).join('、');
            } else if (type === 'benefit') {
                textField = newValues.map(v => {
                    for (const category of benefitCategories) {
                        const option = category.options.find(o => o.value === v);
                        if (option) return option.label;
                    }
                    return '';
                }).filter(Boolean).join('、');
            }

            return {
                ...prev,
                [field]: newValues,
                [type]: textField
            };
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            新規求人作成
                        </h1>
                        <p className="text-gray-600 mt-1">求人情報を入力してください</p>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="border-gray-300 hover:bg-gray-100 flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            リセット
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/page/dashboard/recruiter/jobs')}
                            className="border-gray-300 hover:bg-gray-100"
                        >
                            一覧に戻る
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 入力フォーム */}
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">テンプレートから選択</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {jobTemplates.map(template => (
                                    <Button
                                        key={template.id}
                                        variant="outline"
                                        onClick={() => handleTemplateSelect(template.id)}
                                        className="flex items-center justify-center gap-2 h-auto py-3"
                                    >
                                        <Copy className="w-4 h-4" />
                                        {template.title}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Tabs defaultValue="basic" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
                                <TabsTrigger value="basic" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    基本情報
                                </TabsTrigger>
                                <TabsTrigger value="requirements" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
                                    <ListChecks className="w-4 h-4 mr-2" />
                                    必須要件
                                </TabsTrigger>
                                <TabsTrigger value="culture" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
                                    <Heart className="w-4 h-4 mr-2" />
                                    企業文化
                                </TabsTrigger>
                            </TabsList>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <TabsContent value="basic" className="space-y-6">
                                    <Card className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl">
                                        <CardHeader className="border-b border-gray-200">
                                            <CardTitle className="text-lg font-semibold text-gray-900">基本情報</CardTitle>
                                            <CardDescription className="text-gray-600">求人の基本情報を入力してください</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6 pt-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Building2 className="w-5 h-5 text-indigo-600" />
                                                    <Label htmlFor="title" className="text-gray-700">求人タイトル *</Label>
                                                </div>
                                                <Input
                                                    id="title"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="例: フロントエンドエンジニア募集"
                                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="w-5 h-5 text-indigo-600" />
                                                    <Label htmlFor="description" className="text-gray-700">求人内容 *</Label>
                                                </div>
                                                <Textarea
                                                    id="description"
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    placeholder="求人の詳細な内容を記述してください"
                                                    className="min-h-[200px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <UserPlus className="w-5 h-5 text-indigo-600" />
                                                        <Label htmlFor="employment_type" className="text-gray-700">雇用形態 *</Label>
                                                    </div>
                                                    <Select
                                                        value={formData.employment_type}
                                                        onValueChange={(value) => setFormData(prev => ({ ...prev, employment_type: value }))}
                                                    >
                                                        <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                                                            <SelectValue placeholder="選択してください" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {employmentTypes.map(type => (
                                                                <SelectItem key={type.value} value={type.value}>
                                                                    {type.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <DollarSign className="w-5 h-5 text-indigo-600" />
                                                        <Label htmlFor="salary_range" className="text-gray-700">給与範囲</Label>
                                                    </div>
                                                    <Select
                                                        value={formData.salary_min && formData.salary_max ? `${formData.salary_min}〜${formData.salary_max}` : ''}
                                                        onValueChange={(value) => {
                                                            const [min, max] = value.split('〜').map(Number);
                                                            setFormData(prev => ({ ...prev, salary_min: min, salary_max: max }));
                                                        }}
                                                    >
                                                        <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                                                            <SelectValue placeholder="選択してください" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {salaryRanges.map(range => (
                                                                <SelectItem key={range.label} value={`${range.min}〜${range.max || ''}`}>
                                                                    {range.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Globe className="w-5 h-5 text-indigo-600" />
                                                    <Label className="text-gray-700">勤務地</Label>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {locations.map(location => (
                                                        <div key={location.value} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`location-${location.value}`}
                                                                checked={formData.selectedLocations.includes(location.value)}
                                                                onCheckedChange={() => handleCheckboxChange('location', location.value)}
                                                            />
                                                            <Label htmlFor={`location-${location.value}`} className="text-sm">
                                                                {location.label}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-5 h-5 text-indigo-600" />
                                                    <Label className="font-medium text-gray-900">企業ロゴ</Label>
                                                </div>
                                                <ImageUpload
                                                    value={formData.logo_url}
                                                    onChange={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                                                    onRemove={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                                                    type="logo"
                                                    aspectRatio="square"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-5 h-5 text-indigo-600" />
                                                    <Label className="font-medium text-gray-900">オフィス写真</Label>
                                                </div>
                                                <ImageUpload
                                                    value={formData.office_photo_url}
                                                    onChange={(url) => setFormData(prev => ({ ...prev, office_photo_url: url }))}
                                                    onRemove={() => setFormData(prev => ({ ...prev, office_photo_url: '' }))}
                                                    type="office"
                                                    aspectRatio="video"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-5 h-5 text-indigo-600" />
                                                    <Label className="font-medium text-gray-900">チーム写真</Label>
                                                </div>
                                                <ImageUpload
                                                    value={formData.team_photo_url}
                                                    onChange={(url) => setFormData(prev => ({ ...prev, team_photo_url: url }))}
                                                    onRemove={() => setFormData(prev => ({ ...prev, team_photo_url: '' }))}
                                                    type="team"
                                                    aspectRatio="video"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-5 h-5 text-indigo-600" />
                                                    <Label className="font-medium text-gray-900">イベント写真</Label>
                                                </div>
                                                <ImageUpload
                                                    value={formData.event_photo_url}
                                                    onChange={(url) => setFormData(prev => ({ ...prev, event_photo_url: url }))}
                                                    onRemove={() => setFormData(prev => ({ ...prev, event_photo_url: '' }))}
                                                    type="event"
                                                    aspectRatio="video"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="requirements" className="space-y-6">
                                    <Card className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl">
                                        <CardHeader className="border-b border-gray-200">
                                            <CardTitle className="text-lg font-semibold text-gray-900">必須要件</CardTitle>
                                            <CardDescription className="text-gray-600">必要なスキルや経験を選択してください</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6 pt-6">
                                            {requirementCategories.map(category => (
                                                <div key={category.id} className="space-y-4">
                                                    <h3 className="text-md font-semibold text-gray-900">{category.label}</h3>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {category.options.map(option => (
                                                            <div key={option.value} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`requirement-${option.value}`}
                                                                    checked={formData.selectedRequirements.includes(option.value)}
                                                                    onCheckedChange={() => handleCheckboxChange('requirement', option.value)}
                                                                />
                                                                <Label htmlFor={`requirement-${option.value}`} className="text-sm">
                                                                    {option.label}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="culture" className="space-y-6">
                                    <Card className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl">
                                        <CardHeader className="border-b border-gray-200">
                                            <CardTitle className="text-lg font-semibold text-gray-900">企業文化</CardTitle>
                                            <CardDescription className="text-gray-600">企業文化や働き方について記述してください</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6 pt-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="w-5 h-5 text-indigo-600" />
                                                    <Label htmlFor="work_style" className="text-gray-700">働き方</Label>
                                                </div>
                                                <Textarea
                                                    id="work_style"
                                                    name="work_style"
                                                    value={formData.work_style}
                                                    onChange={handleChange}
                                                    placeholder="勤務時間や働き方について記述してください"
                                                    className="min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Heart className="w-5 h-5 text-indigo-600" />
                                                    <Label htmlFor="company_culture" className="text-gray-700">企業文化</Label>
                                                </div>
                                                <Textarea
                                                    id="company_culture"
                                                    name="company_culture"
                                                    value={formData.company_culture}
                                                    onChange={handleChange}
                                                    placeholder="企業文化や価値観について記述してください"
                                                    className="min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <UserPlus className="w-5 h-5 text-indigo-600" />
                                                    <Label htmlFor="team_description" className="text-gray-700">チーム紹介</Label>
                                                </div>
                                                <Textarea
                                                    id="team_description"
                                                    name="team_description"
                                                    value={formData.team_description}
                                                    onChange={handleChange}
                                                    placeholder="チームの構成や雰囲気について記述してください"
                                                    className="min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Heart className="w-5 h-5 text-indigo-600" />
                                                    <Label className="text-gray-700">福利厚生</Label>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {benefitCategories.map(category => (
                                                        <div key={category.id} className="space-y-2">
                                                            <h3 className="text-sm font-semibold text-gray-900">{category.label}</h3>
                                                            <div className="space-y-1">
                                                                {category.options.map(option => (
                                                                    <div key={option.value} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`benefit-${option.value}`}
                                                                            checked={formData.selectedBenefits.includes(option.value)}
                                                                            onCheckedChange={() => handleCheckboxChange('benefit', option.value)}
                                                                        />
                                                                        <Label htmlFor={`benefit-${option.value}`} className="text-sm">
                                                                            {option.label}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {error && (
                                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex justify-end gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        className="border-gray-300 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        リセット
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push('/page/dashboard/recruiter/jobs')}
                                        className="border-gray-300 hover:bg-gray-100"
                                    >
                                        キャンセル
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {isSubmitting ? '作成中...' : '作成'}
                                    </Button>
                                </div>
                            </form>
                        </Tabs>
                    </div>

                    {/* プレビュー */}
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <Eye className="w-5 h-5 text-indigo-600 mr-2" />
                                プレビュー
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-start gap-6 mb-6">
                                    {formData.logo_url && (
                                        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                            <PreviewImage
                                                src={formData.logo_url}
                                                alt="会社ロゴ"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate">{formData.title || '求人タイトル'}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.employment_type && (
                                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                                    {formData.employment_type === 'full_time' ? '正社員' :
                                                        formData.employment_type === 'contract' ? '契約社員' :
                                                            formData.employment_type === 'part_time' ? 'パートタイム' :
                                                                formData.employment_type === 'intern' ? 'インターン' : ''}
                                                </span>
                                            )}
                                            {formData.selectedLocations.length > 0 && (
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                    <MapPin className="w-4 h-4 inline-block mr-1" />
                                                    {formData.selectedLocations.map(v => locations.find(l => l.value === v)?.label).join('、')}
                                                </span>
                                            )}
                                            {formData.salary_min !== null && formData.salary_max !== null && (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                                    <DollarSign className="w-4 h-4 inline-block mr-1" />
                                                    {formData.salary_min}〜{formData.salary_max}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="prose max-w-none">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">求人内容</h4>
                                    <p className="text-gray-700 whitespace-pre-wrap">{formData.description || '求人内容がここに表示されます'}</p>

                                    {formData.selectedRequirements.length > 0 && (
                                        <>
                                            <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">必須要件</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {requirementCategories.map(category => {
                                                    const categoryRequirements = formData.selectedRequirements
                                                        .filter(v => category.options.some(o => o.value === v))
                                                        .map(v => category.options.find(o => o.value === v)?.label)
                                                        .filter(Boolean);

                                                    if (categoryRequirements.length === 0) return null;

                                                    return (
                                                        <div key={category.id} className="space-y-2">
                                                            <h5 className="text-sm font-semibold text-gray-900">{category.label}</h5>
                                                            <ul className="list-disc list-inside text-gray-700 text-sm">
                                                                {categoryRequirements.map((req, index) => (
                                                                    <li key={index}>{req}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}

                                    {formData.work_style && (
                                        <>
                                            <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">働き方</h4>
                                            <p className="text-gray-700 whitespace-pre-wrap">{formData.work_style}</p>
                                        </>
                                    )}

                                    {formData.company_culture && (
                                        <>
                                            <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">企業文化</h4>
                                            <p className="text-gray-700 whitespace-pre-wrap">{formData.company_culture}</p>
                                        </>
                                    )}

                                    {formData.team_description && (
                                        <>
                                            <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">チーム紹介</h4>
                                            <p className="text-gray-700 whitespace-pre-wrap">{formData.team_description}</p>
                                        </>
                                    )}

                                    {formData.selectedBenefits.length > 0 && (
                                        <>
                                            <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">福利厚生</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {benefitCategories.map(category => {
                                                    const categoryBenefits = formData.selectedBenefits
                                                        .filter(v => category.options.some(o => o.value === v))
                                                        .map(v => category.options.find(o => o.value === v)?.label)
                                                        .filter(Boolean);

                                                    if (categoryBenefits.length === 0) return null;

                                                    return (
                                                        <div key={category.id} className="space-y-2">
                                                            <h5 className="text-sm font-semibold text-gray-900">{category.label}</h5>
                                                            <ul className="list-disc list-inside text-gray-700 text-sm">
                                                                {categoryBenefits.map((benefit, index) => (
                                                                    <li key={index}>{benefit}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}

                                    {/* 会社情報 */}
                                    <div className="mt-8">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">会社情報</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { url: formData.office_photo_url, alt: 'オフィス写真' },
                                                { url: formData.team_photo_url, alt: 'チーム写真' },
                                                { url: formData.event_photo_url, alt: 'イベント写真' }
                                            ].filter(photo => photo.url).map((photo, index) => (
                                                <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                                                    <PreviewImage
                                                        src={photo.url}
                                                        alt={photo.alt}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 