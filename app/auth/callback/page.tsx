"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/utils/supabase';

export default function ConfirmPage() {
    const router = useRouter();

    useEffect(() => {
        const handleEmailConfirm = async () => {
            try {
                const { error } = await supabase.auth.refreshSession();
                if (!error) {
                    router.push('/dashboard/profile');
                }
            } catch (error) {
                console.error('Error during confirmation:', error);
            }
        };

        handleEmailConfirm();
    }, []);

    return <div>メール確認中...</div>;
}
