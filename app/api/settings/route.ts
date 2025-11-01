import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET /api/settings - получить настройки
export async function GET(request: NextRequest) {
  try {
    const db = await import('@/lib/db').then(m => m.default);
    const data = db.getDb();
    
    const settings = data.settings || {
      siteName: "Amateur El Clásico",
      database: "JSON (data/elclasico.json)",
      theme: "Тёмная",
      colors: {
        realMadrid: {
          primary: "#FFD700",
          secondary: "#FFAA00"
        },
        barcelona: {
          primary: "#0052A5",
          secondary: "#DC0028"
        }
      }
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// PUT /api/settings - обновить настройки (только для superadmin)
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'superadmin') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const body = await request.json();
    const db = await import('@/lib/db').then(m => m.default);
    const data = db.getDb();
    
    data.settings = {
      ...data.settings,
      ...body
    };
    
    db.saveDb(data);

    return NextResponse.json(data.settings);
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении настроек' }, { status: 500 });
  }
}
