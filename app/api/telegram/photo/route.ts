import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const targetChatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !targetChatId) {
      return NextResponse.json({ error: 'Telegram configuration missing' }, { status: 500 });
    }

    const tgFormData = new FormData();
    tgFormData.append('chat_id', targetChatId);
    tgFormData.append('photo', formData.get('photo') as Blob);
    tgFormData.append('caption', formData.get('caption') as string);
    tgFormData.append('parse_mode', 'Markdown');

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: tgFormData,
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
