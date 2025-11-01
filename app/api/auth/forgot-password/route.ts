import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Требуется email' },
        { status: 400 }
      );
    }

    // Ищем пользователя по email
    const result = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь с таким email не найден' },
        { status: 404 }
      );
    }

    // В продакшене здесь должна быть отправка email через SendGrid, Mailgun и т.д.
    // Для демонстрации просто возвращаем success
    // В реальном приложении:
    // 1. Генерировать временный токен
    // 2. Отправлять email с ссылкой для сброса
    // 3. Не показывать реальный пароль
    
    console.log(`Password recovery requested for email: ${email}`);
    
    return NextResponse.json({
      success: true,
      message: 'Пароль отправлен на ваш email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
