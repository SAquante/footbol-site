import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Требуется имя пользователя, email и пароль' },
        { status: 400 }
      );
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Некорректный email адрес' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Пользователь с таким именем уже существует' },
        { status: 409 }
      );
    }

    // Проверяем, существует ли email
    const existingEmail = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Хэшируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаем пользователя с email и plain_password
    const result = await query(
      'INSERT INTO users (username, email, password_hash, plain_password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role',
      [username, email, passwordHash, password, 'PLAYER']
    );

    const user = result.rows[0];
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
        email: user.email,
        role: user.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
