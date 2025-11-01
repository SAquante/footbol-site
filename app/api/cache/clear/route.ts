import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// POST /api/cache/clear - очистить кеш Next.js
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || (decoded.role !== 'superadmin' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // Путь к папке .next
    const nextDir = path.join(process.cwd(), '.next');

    // Удаляем кеш (только безопасные файлы)
    const cacheDir = path.join(nextDir, 'cache');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Кеш успешно очищен. Перезапустите сервер для применения изменений.' 
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    return NextResponse.json({ error: 'Ошибка при очистке кеша' }, { status: 500 });
  }
}
