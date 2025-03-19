import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/app/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { userId } = req.body;

        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ message: 'User deleted successfully' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}