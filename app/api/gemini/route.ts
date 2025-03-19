import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
    console.log('API route called'); // デバッグ用

    try {
        if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
            console.error('API key is missing');
            return NextResponse.json(
                { success: false, error: 'API key is not configured' },
                { status: 500 }
            );
        }

        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash"
        });

        console.log('Calling Gemini API with prompt:', prompt); // デバッグ用

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({
            success: true,
            data: text
        });

    } catch (error) {
        console.error('API route error:', error); // デバッグ用
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            },
            { status: 500 }
        );
    }
}