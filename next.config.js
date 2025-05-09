/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['kvegcqlzwxcbeelkbyhm.supabase.co'],
    },
    typescript: {
        // ⚠️ 危険: 型チェックを無効にします
        ignoreBuildErrors: true,
    },
    eslint: {
        // ⚠️ 危険: ESLintのチェックも無効にします
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig 