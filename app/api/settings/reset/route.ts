import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// POST /api/settings/reset - сбросить настройки к дефолтным
export async function POST(request: NextRequest) {
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

    const db = await import('@/lib/db').then(m => m.default);
    const data = db.getDb();
    
    // Дефолтные настройки
    data.settings = {
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
    
    db.saveDb(data);

    return NextResponse.json(data.settings);
  } catch (error) {
    console.error('Reset settings error:', error);
    return NextResponse.json({ error: 'Ошибка при сбросе настроек' }, { status: 500 });
  }
}
