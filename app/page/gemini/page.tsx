'use client';
import { useState } from 'react';

// コンポーネントの定義
const Gemini = () => {
    const [geminiResponse, setGeminiResponse] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState<string>('');
    const postData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setGeminiResponse(data.data);
        } catch (error) {
            console.error('Error:', error);
            setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Gemini API</h1>
            <input className="border-2 border-gray-300 rounded-md p-2" type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <button
                onClick={postData}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                {loading ? '送信中...' : '送信'}
            </button>

            {error && (
                <p className="text-red-500 mt-2">{error}</p>
            )}

            {geminiResponse && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <p>{geminiResponse}</p>
                </div>
            )}
        </div>
    );
};

export default Gemini;