"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/app/utils/supabase";
import {
    BriefcaseIcon,
    DocumentTextIcon,
    CalendarIcon,
    ChartBarIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    ClockIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from "@/app/contexts/AuthContext";

interface Application {
    id: string;
    applicant_id: string;
    company_id: string;
    status: 'invited' | 'reviewing' | 'interviewing' | 'accepted' | 'rejected';
    next_step: string;
    next_date: string;
    score: number;
    feedback?: string;
    created_at: string;
    updated_at: string;
    recruiter_profiles: {
        company_name: string;
        department: string;
        position: string;
    };
}

interface Stats {
    totalInvitations: number;
    activeProcesses: number;
    upcomingInterviews: number;
    averageScore: number;
}

export default function ApplicantDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalInvitations: 0,
        activeProcesses: 0,
        upcomingInterviews: 0,
        averageScore: 0
    });

    const [applications, setApplications] = useState<Application[]>([]);

    const fetchApplications = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    recruiter_profiles:company_id (
                        company_name,
                        department,
                        position
                    )
                `)
                .eq('applicant_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApplications(data || []);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    }, [user]);

    const fetchStats = useCallback(async () => {
        if (!user) return;

        try {
            const { data: applications, error } = await supabase
                .from('applications')
                .select('*')
                .eq('applicant_id', user.id);

            if (error) throw error;

            const stats = {
                totalInvitations: applications?.length || 0,
                activeProcesses: applications?.filter(app =>
                    ['invited', 'reviewing', 'interviewing'].includes(app.status)
                ).length || 0,
                upcomingInterviews: applications?.filter(app => app.status === 'interviewing').length || 0,
                averageScore: applications?.reduce((acc, curr) => acc + (curr.score || 0), 0) / (applications?.length || 1) || 0
            };

            setStats(stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchApplications();
        fetchStats();
    }, [fetchApplications, fetchStats]);

    const getStatusColor = (status: Application['status']) => {
        const colors = {
            invited: 'bg-blue-100 text-blue-800',
            reviewing: 'bg-yellow-100 text-yellow-800',
            interviewing: 'bg-purple-100 text-purple-800',
            accepted: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status: Application['status']) => {
        const texts = {
            invited: '選考招待',
            reviewing: '書類選考中',
            interviewing: '面接選考中',
            accepted: '採用',
            rejected: '不採用'
        };
        return texts[status] || status;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
            <main className="max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="選考招待数"
                        value={stats.totalInvitations}
                        icon={<BriefcaseIcon className="w-6 h-6" />}
                    />
                    <StatCard
                        title="選考進行中"
                        value={stats.activeProcesses}
                        icon={<DocumentTextIcon className="w-6 h-6" />}
                    />
                    <StatCard
                        title="面接予定"
                        value={stats.upcomingInterviews}
                        icon={<CalendarIcon className="w-6 h-6" />}
                    />
                    <StatCard
                        title="平均スコア"
                        value={stats.averageScore.toFixed(1)}
                        icon={<ChartBarIcon className="w-6 h-6" />}
                    />
                </div>

                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">選考状況</h2>
                    </div>
                    <div className="space-y-4">
                        {applications.map((application) => (
                            <div
                                key={application.id}
                                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white p-2 rounded-lg">
                                            <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                {application.recruiter_profiles.company_name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {application.recruiter_profiles.department} - {application.recruiter_profiles.position}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">次のステップ</p>
                                            <p className="font-medium text-gray-800">{application.next_step}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                            {getStatusText(application.status)}
                                        </div>
                                    </div>
                                </div>
                                {application.feedback && (
                                    <div className="mt-4 p-3 bg-white rounded-lg">
                                        <p className="text-sm text-gray-600">フィードバック</p>
                                        <p className="text-gray-800">{application.feedback}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
    return (
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
                <div className="bg-indigo-50 p-3 rounded-xl">
                    {icon}
                </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mt-4">{value}</h3>
            <p className="text-gray-600 mt-1">{title}</p>
        </div>
    );
} 