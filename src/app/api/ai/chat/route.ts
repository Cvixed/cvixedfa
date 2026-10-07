import { NextRequest, NextResponse } from 'next/server';
import { generateJsonWithFallback } from '@/lib/gemini/client';
import { buildAdvisorPromptWithContext } from '@/lib/gemini/prompts';
import { executeAiActions } from '@/lib/ai/action-executor';
import { createAdminClient, OWNER_USER_ID } from '@/lib/supabase/admin';

export const maxDuration = 30; // Max execution duration for Vercel

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context: customContext } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Pesan tidak valid' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fetch existing live context from Supabase to provide AI with grounded state
    const supabase = createAdminClient();
    const [walletsRes, vehiclesRes, goalsRes] = await Promise.all([
      supabase.from('wallets').select('name, type').eq('user_id', OWNER_USER_ID),
      supabase.from('vehicles').select('name, plate_number').eq('user_id', OWNER_USER_ID),
      supabase.from('goals').select('name, target_amount, current_amount, target_date').eq('user_id', OWNER_USER_ID),
    ]);

    const activeContext = {
      ...(customContext || {}),
      wallets: walletsRes.data || [],
      vehicles: vehiclesRes.data || [],
      goals: (goalsRes.data || []).map((g: any) => ({
        name: g.name,
        target: Number(g.target_amount),
        current: Number(g.current_amount),
        target_date: g.target_date,
      })),
    };

    if (!apiKey) {
      // Graceful fallback for local development before user adds key
      return NextResponse.json({
        reply:
          `[Mode Simulasi Dev] Terima kasih atas pesan Anda: "${message}".\n\nUntuk mengaktifkan rekomendasi berbasis AI langsung dengan Gemini, mohon tambahkan GEMINI_API_KEY di file .env.local Anda.\n\n⚠️ *CvixedFA memberikan edukasi keuangan, bukan nasihat keuangan berlisensi.*`,
        executed_actions: [],
      });
    }

    const prompt = buildAdvisorPromptWithContext(message, activeContext);

    // Call Gemini with robust multi-model fallback and timeout
    const { text, modelUsed } = await generateJsonWithFallback(prompt);

    const rawText = text.trim();
    let parsedData: { actions?: any[]; reply?: string } = {};

    try {
      const jsonMatch = rawText.match(/```(?:json)?([\s\S]*?)```/) || [null, rawText];
      const cleanedJson = (jsonMatch[1] || rawText).trim();
      parsedData = JSON.parse(cleanedJson);
    } catch {
      console.warn('Failed to parse Gemini output as JSON, using raw text response');
      parsedData = {
        reply: rawText,
        actions: [],
      };
    }

    const actions = Array.isArray(parsedData.actions) ? parsedData.actions : [];

    // Execute extracted financial actions against Supabase
    let executedResults: any[] = [];
    if (actions.length > 0) {
      executedResults = await executeAiActions(actions);
    }

    return NextResponse.json({
      reply: parsedData.reply || 'Data berhasil diproses oleh asisten CvixedFA.',
      actions,
      executed_actions: executedResults,
      _model: modelUsed,
    });
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
