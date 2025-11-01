import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET /api/users - получить всех пользователей (только для superadmin)
export async function GET(request: NextRequest) {
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

    const result = await query('SELECT * FROM users ORDER BY created_at DESC', []);
    
    // Для superadmin показываем все данные включая plain_password
    const users = result.rows.map(user => ({
      id: user.id,
      username: user.username,
      password_hash: user.password_hash,
      plain_password: user.plain_password || '(не установлен)', // Показываем реальный пароль
      role: user.role,
      created_at: user.created_at,
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// POST /api/users - создать нового пользователя (только для superadmin)
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

    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Необходимо указать username, password и role' },
        { status: 400 }
      );
    }

    // Проверяем допустимые роли
    if (!['admin', 'PLAYER'].includes(role)) {
      return NextResponse.json(
        { error: 'Роль должна быть admin или PLAYER' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь
    const existingUser = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Пользователь с таким именем уже существует' },
        { status: 400 }
      );
    }

    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (username, password_hash, role, plain_password) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, password_hash, role, password]
    );

    const newUser = result.rows[0];
    
    return NextResponse.json({
      id: newUser.id,
      username: newUser.username,
      plain_password: newUser.plain_password,
      role: newUser.role,
      created_at: newUser.created_at,
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Ошибка при создании пользователя' }, { status: 500 });
  }
}
