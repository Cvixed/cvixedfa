import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini/client';
import { buildAdvisorPromptWithContext } from '@/lib/gemini/prompts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Pesan tidak valid' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback for local development before user adds key
      return NextResponse.json({
        reply:
          `[Mode Simulasi Dev] Terima kasih atas pertanyaan Anda: "${message}".\n\nUntuk mengaktifkan rekomendasi berbasis AI langsung dengan Gemini 2.0 Flash, mohon tambahkan GEMINI_API_KEY di file .env.local Anda.\n\n⚠️ *CvixedFA memberikan edukasi keuangan, bukan nasihat keuangan berlisensi.*`,
      });
    }

    const model = getGeminiModel();
    const prompt = buildAdvisorPromptWithContext(message, context || {});

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error('Advisor Chat Error:', error);
    return NextResponse.json(
      {
        error: 'Gagal memproses konsultasi keuangan',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
