'use client';

import { useEffect } from 'react';

interface PlanPopupProps {
    isOpen: boolean;
    onClose: () => void;
    plan: {
        title: string;
        price: string;
        description: string;
        features: string[];
    };
}

export default function PlanPopup({ isOpen, onClose, plan }: PlanPopupProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 背景オーバーレイ */}
            <div
                className="fixed inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* ポップアップコンテンツ */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all">
                {/* 閉じるボタン */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* プラン詳細 */}
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{plan.title}</h2>
                    <p className="text-4xl font-bold text-indigo-600 mb-6">{plan.price}</p>
                    <p className="text-gray-600 mb-8">{plan.description}</p>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">含まれる機能</h3>
                        <ul className="space-y-3">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center text-gray-700">
                                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
} 