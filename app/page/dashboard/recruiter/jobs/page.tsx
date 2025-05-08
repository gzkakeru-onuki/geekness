'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '@/app/utils/supabase';
import { Plus, ArrowLeft, Search, Filter, Eye, Calendar, Clock } from 'lucide-react';

type Job = {
    id: string;
    title: string;
    status: string;
    created_at: string;
    updated_at: string;
    company_id: string;
};

export default function JobsPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data: recruiterProfile } = await supabase
                .from('recruiter_profiles')
                .select('company_id')
                .eq('id', user.id)
                .single();

            if (!recruiterProfile) {
                console.error('採用担当者プロフィールが見つかりません');
                return;
            }

            const { data: jobsData, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('company_id', recruiterProfile.company_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setJobs(jobsData || []);
        } catch (error) {
            console.error('求人情報の取得に失敗しました:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">下書き</Badge>;
            case 'published':
                return <Badge variant="default" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">公開中</Badge>;
            case 'closed':
                return <Badge variant="destructive" className="bg-rose-100 text-rose-700 hover:bg-rose-200">終了</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">読み込み中...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/page/dashboard/recruiter')}
                            className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                求人一覧
                            </h1>
                            <p className="text-slate-600 mt-1">登録済みの求人一覧</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.push('/page/dashboard/recruiter/jobs/new')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        新規求人を作成
                    </Button>
                </div>

                <Card className="mb-6 bg-white shadow-sm border-slate-200">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="求人を検索..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="pl-9 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-colors">
                                        <SelectValue placeholder="ステータスでフィルタ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="focus:bg-indigo-50">すべて</SelectItem>
                                        <SelectItem value="draft" className="focus:bg-indigo-50">下書き</SelectItem>
                                        <SelectItem value="published" className="focus:bg-indigo-50">公開中</SelectItem>
                                        <SelectItem value="closed" className="focus:bg-indigo-50">終了</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader className="border-b border-slate-200">
                        <CardTitle className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            求人リスト
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableHead className="text-slate-600 font-medium py-3">タイトル</TableHead>
                                    <TableHead className="text-slate-600 font-medium py-3">ステータス</TableHead>
                                    <TableHead className="text-slate-600 font-medium py-3">作成日</TableHead>
                                    <TableHead className="text-slate-600 font-medium py-3">更新日</TableHead>
                                    <TableHead className="text-slate-600 font-medium py-3">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredJobs.map((job) => (
                                    <TableRow key={job.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                                        <TableCell className="font-medium text-slate-900 py-3">{job.title}</TableCell>
                                        <TableCell className="py-3">{getStatusBadge(job.status)}</TableCell>
                                        <TableCell className="text-slate-600 py-3">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                {format(new Date(job.created_at), 'yyyy年MM月dd日', { locale: ja })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600 py-3">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-slate-400" />
                                                {format(new Date(job.updated_at), 'yyyy年MM月dd日', { locale: ja })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Button
                                                variant="ghost"
                                                onClick={() => router.push(`/page/dashboard/recruiter/jobs/${job.id}`)}
                                                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 transition-colors"
                                            >
                                                <Eye className="h-4 w-4" />
                                                詳細
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 