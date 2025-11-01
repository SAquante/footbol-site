'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { useAuthStore } from '@/store/authStore';

interface User {
  id: number;
  username: string;
  password_hash: string;
  plain_password?: string; // Для отображения реального пароля
  role: 'superadmin' | 'admin' | 'PLAYER';
  created_at: string;
}

export default function UsersManagementPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    password: '',
  });
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'PLAYER' as 'admin' | 'PLAYER',
  });

  useEffect(() => {
    if (!user || user.role !== 'superadmin') {
      router.push('/login');
      return;
    }
    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки пользователей');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания пользователя');
      }

      setNewUser({ username: '', password: '', role: 'PLAYER' });
      setShowCreateForm(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangeRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'PLAYER' : 'admin';
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка изменения роли');
      }

      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Удалить пользователя "${username}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка удаления пользователя');
      }

      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEditUser = (userId: number, username: string) => {
    setEditingUser(userId);
    setEditForm({
      username: username,
      password: '',
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({ username: '', password: '' });
  };

  const handleEditUser = async (userId: number) => {
    if (!editForm.username.trim()) {
      setError('Имя пользователя не может быть пустым');
      return;
    }

    try {
      const body: any = {
        username: editForm.username,
      };
      
      // Если пароль заполнен - отправляем его тоже
      if (editForm.password) {
        body.password = editForm.password;
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка обновления пользователя');
      }

      setEditingUser(null);
      setEditForm({ username: '', password: '' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 pt-32 pb-20">
          <p className="text-center">Загрузка...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gradient">
              👥 УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
            </h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all"
            >
              {showCreateForm ? '✕ Отмена' : '➕ Создать пользователя'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="card mb-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-white">Создать пользователя</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Имя пользователя</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="input-field"
                    required
                    data-testid="create-user-username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Пароль</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="input-field"
                    required
                    data-testid="create-user-password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Роль</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'PLAYER' })}
                    className="input-field"
                    data-testid="create-user-role"
                  >
                    <option value="PLAYER">Игрок</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                  data-testid="create-user-submit"
                >
                  Создать
                </button>
              </form>
            </motion.div>
          )}

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4">ID</th>
                    <th className="text-left py-4 px-4">Логин</th>
                    <th className="text-left py-4 px-4">Пароль</th>
                    <th className="text-left py-4 px-4">Роль</th>
                    <th className="text-left py-4 px-4">Дата создания</th>
                    <th className="text-right py-4 px-4">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">{u.id}</td>
                      <td className="py-4 px-4">
                        {editingUser === u.id ? (
                          <input
                            type="text"
                            value={editForm.username}
                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                            className="input-field py-1"
                            placeholder="Новый логин"
                          />
                        ) : (
                          <span className="font-semibold">{u.username}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingUser === u.id ? (
                          <input
                            type="text"
                            value={editForm.password}
                            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                            className="input-field py-1"
                            placeholder="Новый пароль"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-white">
                            {u.plain_password || '(не установлен)'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            u.role === 'superadmin'
                              ? 'bg-purple-500/20 text-purple-400'
                              : u.role === 'admin'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {u.role === 'superadmin'
                            ? '👑 Супер-админ'
                            : u.role === 'admin'
                            ? '⚙️ Администратор'
                            : '👤 Игрок'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {new Date(u.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        {u.role !== 'superadmin' && (
                          <>
                            {editingUser === u.id ? (
                              <>
                                <button
                                  onClick={() => handleEditUser(u.id)}
                                  className="px-4 py-2 rounded-lg font-semibold bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                                >
                                  ✓ Сохранить
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-4 py-2 rounded-lg font-semibold bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-all"
                                >
                                  ✕ Отмена
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditUser(u.id, u.username)}
                                  className="px-4 py-2 rounded-lg font-semibold bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
                                >
                                  ✏️ Изменить
                                </button>
                                <button
                                  onClick={() => handleChangeRole(u.id, u.role)}
                                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    u.role === 'admin'
                                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                      : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                  }`}
                                  data-testid={`change-role-${u.id}`}
                                >
                                  {u.role === 'admin' ? '↓ Игрок' : '↑ Админ'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all"
                                  data-testid={`delete-user-${u.id}`}
                                >
                                  🗑️ Удалить
                                </button>
                              </>
                            )}
                          </>
                        )}
                        {u.role === 'superadmin' && (
                          <span className="text-gray-500 italic">Нельзя изменить</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <p className="text-center py-8 text-gray-400">Пользователи не найдены</p>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
