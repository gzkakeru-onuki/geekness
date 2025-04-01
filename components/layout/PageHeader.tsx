import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    backUrl?: string;
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    subtitle,
    showBackButton = false,
    backUrl = "/page/dashboard",
    actions,
    className = ''
}: PageHeaderProps) {
    return (
        <header className={`fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg shadow-sm z-50 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {showBackButton && (
                            <button
                                onClick={() => window.history.back()}
                                className="mr-4 text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                                <ArrowLeftIcon className="h-6 w-6" />
                            </button>
                        )}
                        <div>
                            <Link href="/">
                                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                    {title}
                                </h1>
                            </Link>
                            {subtitle && (
                                <p className="text-gray-600 mt-2">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    {actions && (
                        <div className="flex items-center">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
} 