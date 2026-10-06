import { NextRequest, NextResponse } from 'next/server';
import { getGeminiVisionModel } from '@/lib/gemini/client';
import { OCR_SYSTEM_PROMPT } from '@/lib/gemini/prompts';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File gambar struk tidak ditemukan' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback simulation for local testing
      return NextResponse.json({
        merchant: 'Indomaret Point Stasiun',
        date: new Date().toISOString().split('T')[0],
        total: 78500,
        subtotal: 71363,
        tax: 7137,
        service_charge: null,
        items: [
          { name: 'Kopi Susu Gula Aren', quantity: 1, price: 18000, total: 18000 },
          { name: 'Roti Panggang Keju', quantity: 1, price: 22000, total: 22000 },
          { name: 'Air Mineral 1500ml', quantity: 2, price: 6000, total: 12000 },
          { name: 'Camilan Keripik Singkong', quantity: 1, price: 19363, total: 19363 },
        ],
        payment_method: 'ewallet',
        suggested_category: 'Makan & Minum',
        confidence: 'high',
        uncertain_fields: [],
        note: 'Struk berhasil diekstrak melalui simulasi lokal.',
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    const model = getGeminiVisionModel();

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type || 'image/jpeg',
          data: base64Data,
        },
      },
      {
        text: OCR_SYSTEM_PROMPT,
      },
    ]);

    const response = await result.response;
    const rawText = response.text().trim();

    // Parse JSON safely from markdown codeblock if returned
    const jsonMatch = rawText.match(/```(?:json)?([\s\S]*?)```/) || [null, rawText];
    const cleanedJson = (jsonMatch[1] || rawText).trim();
    const parsedData = JSON.parse(cleanedJson);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      {
        error: 'Gagal membaca struk. Pastikan foto cukup jelas dan coba lagi.',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
