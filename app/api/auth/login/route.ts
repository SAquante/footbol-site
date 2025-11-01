import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Требуется имя пользователя и пароль' },
        { status: 400 }
      );
    }

    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
