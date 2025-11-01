'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Navigation from '@/components/Navigation';
import { useAuthStore } from '@/store/authStore';
import { Match } from '@/types';

type AdminTab = 'matches' | 'users' | 'settings';

interface Settings {
  siteName: string;
  database: string;
  theme: string;
  colors: {
    realMadrid: {
      primary: string;
      secondary: string;
    };
    barcelona: {
      primary: string;
      secondary: string;
    };
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('matches');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [editingColors, setEditingColors] = useState(false);

  useEffect(() => {
    // Даем время Zustand persist загрузить данные из localStorage
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isCheckingAuth) return;
    
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      router.push('/login');
      return;
    }
    fetchMatches();
    fetchSettings();
  }, [user, router, isCheckingAuth]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMatch = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот матч?')) return;

    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMatches(matches.filter((m) => m.id !== id));
        alert('✅ Матч удалён успешно');
      } else {
        alert('❌ Ошибка при удалении матча');
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('❌ Ошибка при удалении матча');
    }
  };

  const quickUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchMatches();
        alert(`✅ Статус изменён на "${newStatus}"`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const clearCache = async () => {
    if (!confirm('⚠️ Очистить кеш Next.js? После этого потребуется перезапуск сервера.')) return;
    
    try {
      const response = await fetch('/api/cache/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        alert('✅ Кеш успешно очищен! Перезапустите сервер командой: npm run dev');
      } else {
        alert('❌ Ошибка при очистке кеша');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('❌ Ошибка при очистке кеша');
    }
  };

  const resetDatabase = async () => {
    if (!confirm('⚠️ ВНИМАНИЕ! Это удалит все данные и загрузит демо-данные. Продолжить?')) return;
    if (!confirm('⚠️ ВЫ УВЕРЕНЫ? Это действие нельзя отменить!')) return;
    
    alert('💡 Функция в разработке. Выполните вручную: node scripts/init-demo-db.js');
  };

  const updateColors = async (colors: Settings['colors']) => {
    if (!settings) return;
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ colors }),
      });
      
      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        alert('✅ Цвета обновлены!');
        setEditingColors(false);
      } else {
        alert('❌ Ошибка при обновлении цветов');
      }
    } catch (error) {
      console.error('Error updating colors:', error);
      alert('❌ Ошибка при обновлении цветов');
    }
  };

  const resetToDefaultColors = async () => {
    if (!confirm('Сбросить цветовую схему к дефолтной?')) return;
    
    try {
      const response = await fetch('/api/settings/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const resetSettings = await response.json();
        setSettings(resetSettings);
        alert('✅ Настройки сброшены к дефолтным!');
        setEditingColors(false);
      } else {
        alert('❌ Ошибка при сбросе настроек');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      alert('❌ Ошибка при сбросе настроек');
    }
  };

  const filteredMatches = matches.filter(match => 
    match.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    format(new Date(match.match_datetime), 'd MMMM yyyy', { locale: ru }).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingMatches = filteredMatches.filter(m => m.status === 'scheduled');
  const completedMatches = filteredMatches.filter(m => m.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold animate-pulse">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-overlay">
      <Navigation />

      <main className="container mx-auto px-4 pt-20 pb-12 md:pt-32 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Шапка админки */}
          <div className="card mb-6 md:mb-8 bg-gradient-to-r from-real-gold/10 via-transparent to-barca-blue/10 border-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="mb-2 text-3xl md:text-4xl lg:text-5xl">
                  <span className="text-gradient-real">⚙️ АДМИН</span>{' '}
                  <span className="text-gradient-barca">ПАНЕЛЬ</span>
                </h1>
                <p className="text-gray-400 text-sm md:text-base">
                  👋 Добро пожаловать, <span className="text-white font-bold">{user?.username}</span>
                </p>
              </div>
              <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                <Link href="/" className="flex-1 md:flex-none px-3 py-2 md:px-4 md:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-semibold text-center text-sm md:text-base">
                  🏠 На сайт
                </Link>
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="flex-1 md:flex-none px-3 py-2 md:px-4 md:py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-red-400 font-semibold text-sm md:text-base"
                >
                  🚪 Выйти
                </button>
              </div>
            </div>
          </div>

          {/* Вкладки */}
          <div className="flex gap-2 mb-6 md:mb-8 overflow-x-auto pb-2 hide-scrollbar">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold transition-all whitespace-nowrap text-sm md:text-base ${
                activeTab === 'matches'
                  ? 'bg-gradient-to-r from-real-gold to-yellow-400 text-black'
                  : 'bg-dark-accent text-gray-400 hover:text-white'
              }`}
            >
              ⚽ Матчи ({matches.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold transition-all whitespace-nowrap text-sm md:text-base ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-barca-blue to-barca-red text-white'
                  : 'bg-dark-accent text-gray-400 hover:text-white'
              }`}
            >
              👥 Пользователи
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-dark-accent text-gray-400 hover:text-white'
              }`}
            >
              ⚙️ Настройки
            </button>
          </div>

          {/* Контент вкладок */}
          {activeTab === 'matches' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Статистика и действия */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="card bg-gradient-to-br from-green-500/20 to-transparent border-green-500/40">
                  <div className="text-sm text-gray-400 mb-1">📅 Запланировано</div>
                  <div className="text-4xl font-black text-green-400">{upcomingMatches.length}</div>
                </div>
                <div className="card bg-gradient-to-br from-blue-500/20 to-transparent border-blue-500/40">
                  <div className="text-sm text-gray-400 mb-1">✅ Завершено</div>
                  <div className="text-4xl font-black text-blue-400">{completedMatches.length}</div>
                </div>
                <div className="card bg-gradient-to-br from-purple-500/20 to-transparent border-purple-500/40">
                  <div className="text-sm text-gray-400 mb-1">📊 Всего матчей</div>
                  <div className="text-4xl font-black text-purple-400">{matches.length}</div>
                </div>
                <Link href="/admin/create" className="card bg-gradient-to-r from-real-gold/20 to-barca-blue/20 hover:from-real-gold/30 hover:to-barca-blue/30 border-2 border-white/30 flex items-center justify-center cursor-pointer group">
                  <div className="text-center">
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">➕</div>
                    <div className="font-bold text-white">Создать матч</div>
                  </div>
                </Link>
              </div>

              {/* Поиск */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="🔍 Поиск по дате или месту..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Список матчей */}
              <div className="space-y-6">
                {/* Запланированные */}
                {upcomingMatches.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-green-400 flex items-center gap-2">
                      <span>📅</span> Запланированные ({upcomingMatches.length})
                    </h3>
                    <div className="space-y-3">
                      {upcomingMatches.map((match) => (
                        <MatchAdminCard
                          key={match.id}
                          match={match}
                          onDelete={deleteMatch}
                          onQuickStatus={quickUpdateStatus}
                          token={token || ''}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Завершённые */}
                {completedMatches.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                      <span>✅</span> Завершённые ({completedMatches.length})
                    </h3>
                    <div className="space-y-3">
                      {completedMatches.map((match) => (
                        <MatchAdminCard
                          key={match.id}
                          match={match}
                          onDelete={deleteMatch}
                          onQuickStatus={quickUpdateStatus}
                          token={token || ''}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredMatches.length === 0 && (
                  <div className="card text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <div className="text-xl text-gray-400 mb-2">
                      {searchTerm ? 'Ничего не найдено' : 'Нет матчей'}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      {searchTerm ? 'Попробуйте другой запрос' : 'Создайте первый матч!'}
                    </div>
                    {!searchTerm && (
                      <Link href="/admin/create" className="btn-real inline-block">
                        ➕ Создать матч
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card text-center"
            >
              <h2 className="text-2xl font-bold mb-6">👥 Управление пользователями</h2>
              {user?.role === 'superadmin' ? (
                <div className="space-y-6">
                  <div className="p-8 bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/40 rounded-lg">
                    <div className="text-6xl mb-4">👑</div>
                    <h3 className="text-2xl font-bold text-purple-400 mb-3">Супер-администратор</h3>
                    <p className="text-gray-400 mb-6">
                      У вас есть полный доступ к управлению пользователями системы
                    </p>
                    <Link
                      href="/admin/users"
                      className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                    >
                      🎛️ Открыть панель управления пользователями
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-3">Доступ ограничен</h3>
                  <p className="text-gray-400">
                    Управление пользователями доступно только супер-администраторам
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="grid gap-6">
                <div className="card">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span>⚙️</span> Общие настройки
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-dark-accent rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Название сайта</div>
                      <div className="font-bold text-white">{settings?.siteName || 'Amateur El Clásico'}</div>
                    </div>
                    <div className="p-4 bg-dark-accent rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">База данных</div>
                      <div className="font-bold text-white">{settings?.database || 'JSON (data/elclasico.json)'}</div>
                    </div>
                    <div className="p-4 bg-dark-accent rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Тема</div>
                      <div className="font-bold text-white">{settings?.theme || 'Тёмная'}</div>
                    </div>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <span>🎨</span> Цветовая схема
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={resetToDefaultColors}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-400 font-semibold transition-colors text-sm"
                      >
                        ↺ Сбросить к дефолтной
                      </button>
                      {!editingColors ? (
                        <button
                          onClick={() => setEditingColors(true)}
                          className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 rounded-lg text-purple-400 font-semibold transition-colors text-sm"
                        >
                          ✏️ Изменить цвета
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingColors(false)}
                          className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/40 rounded-lg text-gray-400 font-semibold transition-colors text-sm"
                        >
                          ✕ Отмена
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {!editingColors ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-dark-accent rounded-lg">
                        <div className="text-sm text-gray-400 mb-2">Реал Мадрид</div>
                        <div className="flex gap-2">
                          <div 
                            className="w-12 h-12 rounded" 
                            style={{ 
                              background: `linear-gradient(to right, ${settings?.colors.realMadrid.primary || '#FFD700'}, ${settings?.colors.realMadrid.secondary || '#FFAA00'})` 
                            }}
                          ></div>
                          <div className="flex flex-col justify-center text-xs text-gray-500">
                            <div>{settings?.colors.realMadrid.primary || '#FFD700'}</div>
                            <div>{settings?.colors.realMadrid.secondary || '#FFAA00'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-dark-accent rounded-lg">
                        <div className="text-sm text-gray-400 mb-2">Барселона</div>
                        <div className="flex gap-2">
                          <div 
                            className="w-12 h-12 rounded" 
                            style={{ 
                              background: `linear-gradient(to right, ${settings?.colors.barcelona.primary || '#0052A5'}, ${settings?.colors.barcelona.secondary || '#DC0028'})` 
                            }}
                          ></div>
                          <div className="flex flex-col justify-center text-xs text-gray-500">
                            <div>{settings?.colors.barcelona.primary || '#0052A5'}</div>
                            <div>{settings?.colors.barcelona.secondary || '#DC0028'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-dark-accent rounded-lg">
                        <div className="text-sm text-gray-400 mb-3 font-semibold">Реал Мадрид</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Основной цвет</label>
                            <input
                              type="color"
                              defaultValue={settings?.colors.realMadrid.primary || '#FFD700'}
                              id="realPrimary"
                              className="w-full h-10 rounded cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Вторичный цвет</label>
                            <input
                              type="color"
                              defaultValue={settings?.colors.realMadrid.secondary || '#FFAA00'}
                              id="realSecondary"
                              className="w-full h-10 rounded cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-dark-accent rounded-lg">
                        <div className="text-sm text-gray-400 mb-3 font-semibold">Барселона</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Основной цвет</label>
                            <input
                              type="color"
                              defaultValue={settings?.colors.barcelona.primary || '#0052A5'}
                              id="barcaPrimary"
                              className="w-full h-10 rounded cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Вторичный цвет</label>
                            <input
                              type="color"
                              defaultValue={settings?.colors.barcelona.secondary || '#DC0028'}
                              id="barcaSecondary"
                              className="w-full h-10 rounded cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const realPrimary = (document.getElementById('realPrimary') as HTMLInputElement).value;
                          const realSecondary = (document.getElementById('realSecondary') as HTMLInputElement).value;
                          const barcaPrimary = (document.getElementById('barcaPrimary') as HTMLInputElement).value;
                          const barcaSecondary = (document.getElementById('barcaSecondary') as HTMLInputElement).value;
                          
                          updateColors({
                            realMadrid: { primary: realPrimary, secondary: realSecondary },
                            barcelona: { primary: barcaPrimary, secondary: barcaSecondary }
                          });
                        }}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
                      >
                        ✓ Сохранить цвета
                      </button>
                    </div>
                  )}
                </div>

                <div className="card bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span>🔧</span> Быстрые действия
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={clearCache}
                      className="p-4 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 rounded-lg text-left transition-colors group"
                    >
                      <div className="font-bold text-yellow-400 mb-1 group-hover:scale-105 transition-transform">🗑️ Очистить кеш</div>
                      <div className="text-xs text-gray-400">Удалить .next папку</div>
                    </button>
                    <button
                      onClick={resetDatabase}
                      className="p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-left transition-colors group"
                    >
                      <div className="font-bold text-blue-400 mb-1 group-hover:scale-105 transition-transform">🔄 Сбросить БД</div>
                      <div className="text-xs text-gray-400">Загрузить демо-данные</div>
                    </button>
                    <a
                      href="/api/matches"
                      target="_blank"
                      className="p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 rounded-lg text-left transition-colors group"
                    >
                      <div className="font-bold text-purple-400 mb-1 group-hover:scale-105 transition-transform">📡 API Матчи</div>
                      <div className="text-xs text-gray-400">Посмотреть JSON</div>
                    </a>
                    <button
                      onClick={() => fetchMatches()}
                      className="p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-lg text-left transition-colors group"
                    >
                      <div className="font-bold text-green-400 mb-1 group-hover:scale-105 transition-transform">🔃 Обновить</div>
                      <div className="text-xs text-gray-400">Перезагрузить данные</div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

// Компонент карточки матча для админки
function MatchAdminCard({
  match,
  onDelete,
  onQuickStatus,
  token,
}: {
  match: Match;
  onDelete: (id: number) => void;
  onQuickStatus: (id: number, status: string) => void;
  token: string;
}) {
  const isCompleted = match.status === 'completed';
  
  return (
    <div className="card bg-dark-secondary hover:border-white/30 transition-all">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        {/* Дата и место */}
        <div className="flex-shrink-0 min-w-[200px]">
          <div className="text-lg font-bold text-white mb-1">
            📅 {format(new Date(match.match_datetime), 'd MMMM yyyy', { locale: ru })}
          </div>
          <div className="text-md text-gray-300 mb-1">
            🕐 {format(new Date(match.match_datetime), 'HH:mm')}
          </div>
          <div className="text-sm text-gray-400">
            📍 <a 
              href={`https://yandex.ru/maps/?text=${encodeURIComponent(match.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-real-gold transition-colors cursor-pointer underline"
              onClick={(e) => e.stopPropagation()}
            >
              {match.location}
            </a>
          </div>
        </div>

        {/* Счёт или статус */}
        <div className="flex-1 min-w-[150px]">
          {isCompleted ? (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">РЕАЛ</div>
                <div className="text-3xl font-black text-gradient-real">{match.score_real}</div>
              </div>
              <div className="text-2xl text-gray-600">:</div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">БАРСА</div>
                <div className="text-3xl font-black text-gradient-barca">{match.score_barca}</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="px-3 py-1 rounded-full text-sm font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 inline-block">
                📅 Запланирован
              </div>
            </div>
          )}
        </div>

        {/* Действия */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/edit/${match.id}`}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors font-semibold border border-blue-500/40 hover:border-blue-500/60"
          >
            ✏️ Редактировать
          </Link>
          
          {!isCompleted && (
            <button
              onClick={() => onQuickStatus(match.id, 'completed')}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors font-semibold border border-green-500/40 hover:border-green-500/60"
            >
              ✅ Завершить
            </button>
          )}
          
          <button
            onClick={() => onDelete(match.id)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-semibold border border-red-500/40 hover:border-red-500/60"
          >
            🗑️ Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
