import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';

// PUT /api/users/[id] - обновить пользователя (роль, логин, пароль)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = parseInt(params.id);
    const body = await request.json();
    const { role, username, password } = body;

    // Проверяем, что пользователь не пытается изменить свою роль
    if (role && decoded.id === userId) {
      return NextResponse.json(
        { error: 'Нельзя изменить свою роль' },
        { status: 400 }
      );
    }

    // Проверяем допустимые роли (если роль указана)
    if (role && !['admin', 'PLAYER'].includes(role)) {
      return NextResponse.json(
        { error: 'Роль должна быть admin или PLAYER' },
        { status: 400 }
      );
    }

    // Получаем текущего пользователя
    const currentUser = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (currentUser.rows.length === 0) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const user = currentUser.rows[0];
    
    // Обновляем только те поля, которые переданы
    const updatedRole = role || user.role;
    const updatedUsername = username || user.username;
    let updatedPasswordHash = user.password_hash;
    let updatedPlainPassword = user.plain_password || '';

    // Если передан новый пароль - хешируем его и сохраняем plaintext
    if (password) {
      updatedPasswordHash = await hashPassword(password);
      updatedPlainPassword = password;
    }

    // Обновляем пользователя в базе через кастомный UPDATE
    const result = await query(
      'UPDATE users SET role = $1, username = $2, password_hash = $3, plain_password = $4 WHERE id = $5 RETURNING *',
      [updatedRole, updatedUsername, updatedPasswordHash, updatedPlainPassword, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
    }

    const updatedUser = result.rows[0];
    return NextResponse.json({
      id: updatedUser.id,
      username: updatedUser.username,
      password_hash: updatedUser.password_hash,
      plain_password: updatedUser.plain_password,
      role: updatedUser.role,
      created_at: updatedUser.created_at,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении пользователя' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - удалить пользователя
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = parseInt(params.id);

    // Проверяем, что пользователь не пытается удалить себя
    if (decoded.id === userId) {
      return NextResponse.json(
        { error: 'Нельзя удалить свой аккаунт' },
        { status: 400 }
      );
    }

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Пользователь удален' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Ошибка при удалении пользователя' }, { status: 500 });
  }
}
