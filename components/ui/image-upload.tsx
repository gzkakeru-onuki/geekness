'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Upload, X } from 'lucide-react';
import { Button } from './button';
import Image from 'next/image';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    onRemove: () => void;
    type: 'logo' | 'office' | 'team' | 'event';
    aspectRatio?: 'square' | 'video';
    className?: string;
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    type,
    aspectRatio = 'square',
    className = ''
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setProgress(0);

            // ファイルサイズチェック（5MB以下）
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('ファイルサイズが大きすぎます（5MB以下にしてください）');
            }

            // ファイルタイプチェック
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('対応していないファイル形式です（JPEG、PNG、GIFのみ対応）');
            }

            // ファイル名の検証
            const fileName = file.name.toLowerCase();
            if (!/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(fileName)) {
                throw new Error('ファイル名が無効です。英数字、ハイフン、アンダースコアのみ使用可能です');
            }

            // ファイル名の生成（一意性を確保）
            const uniqueFileName = `${type}_${Date.now()}_${fileName}`;
            const filePath = uniqueFileName;

            // Storageへのアップロード
            const { data, error } = await supabase.storage
                .from('jobs')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                if (error.message.includes('duplicate')) {
                    throw new Error('同じ名前のファイルが既に存在します。ファイル名を変更してください');
                }
                throw error;
            }

            // 相対パスを保存
            const imageUrl = `/${filePath}`;
            onChange(imageUrl);

        } catch (error) {
            console.error('画像アップロードエラー:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : '画像のアップロードに失敗しました。以下の点を確認してください：\n' +
                '1. ファイルサイズが5MB以下であること\n' +
                '2. ファイル形式がJPEG、PNG、GIFであること\n' +
                '3. ファイル名が英数字、ハイフン、アンダースコアのみで構成されていること\n' +
                '4. 同じ名前のファイルが存在しないこと';

            alert(errorMessage);
        } finally {
            setIsUploading(false);
            setProgress(0);
            // input要素の値をリセット
            e.target.value = '';
        }
    };

    const handleRemove = async () => {
        try {
            if (value) {
                // Storageから画像を削除
                const { error } = await supabase.storage
                    .from('jobs')
                    .remove([value.replace('/', '')]);

                if (error) {
                    if (error.message.includes('not found')) {
                        throw new Error('削除するファイルが見つかりません');
                    }
                    throw error;
                }
            }
            onRemove();
        } catch (error) {
            console.error('画像削除エラー:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : '画像の削除に失敗しました。以下の点を確認してください：\n' +
                '1. ファイルが存在すること\n' +
                '2. インターネット接続が安定していること';

            alert(errorMessage);
        }
    };

    const getFullImageUrl = (relativePath: string) => {
        if (!relativePath) return '';
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/jobs${relativePath}`;
    };

    return (
        <div className={`relative ${className}`}>
            {value ? (
                <div className="relative group">
                    <div className={`relative ${aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'} overflow-hidden rounded-lg`}>
                        <Image
                            src={getFullImageUrl(value)}
                            alt={`${type} image`}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className={`border-2 border-dashed rounded-lg p-4 ${aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'} flex items-center justify-center`}>
                    <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4 flex text-sm text-gray-600">
                            <label
                                htmlFor={`file-upload-${type}`}
                                className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                            >
                                <span>画像をアップロード</span>
                                <input
                                    id={`file-upload-${type}`}
                                    name={`file-upload-${type}`}
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>
                        {isUploading && (
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-indigo-600 h-2.5 rounded-full"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {Math.round(progress)}% アップロード中...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 