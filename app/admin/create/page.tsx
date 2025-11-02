'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import LocationPicker from '@/components/LocationPicker';
import { useAuthStore } from '@/store/authStore';

export default function CreateMatchPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: 'ул. Константина Заслонова, 23 корпус 4, Санкт-Петербург, Россия, 191119',
    status: 'scheduled' as 'scheduled' | 'completed',
    score_real: '',
    score_barca: '',
    lineup_real: '',
    lineup_barca: '',
    coach_real: '',
    coach_barca: '',
    announcement: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Вычисляем, прошла ли дата матча
  const isPastMatch = useMemo(() => {
    if (!formData.date || !formData.time) return false;
    const matchDateTime = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();
    return matchDateTime < now;
  }, [formData.date, formData.time]);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const matchDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      
      // Автоматически определяем статус: если дата прошла → "completed", иначе → "scheduled"
      const autoStatus = matchDateTime < now ? 'completed' : 'scheduled';

      const requestData: any = {
        match_datetime: matchDateTime.toISOString(),
        location: formData.location,
        status: autoStatus,
        lineup_real: formData.lineup_real || null,
        lineup_barca: formData.lineup_barca || null,
        coach_real: formData.coach_real || null,
        coach_barca: formData.coach_barca || null,
        announcement: formData.announcement || null,
      };

      // Если матч завершен, добавляем статистику
      if (autoStatus === 'completed') {
        const scoreReal = parseInt(formData.score_real) || 0;
        const scoreBarca = parseInt(formData.score_barca) || 0;
        
        // Автоматический расчет очков
        let pointsReal = 0;
        let pointsBarca = 0;
        if (scoreReal > scoreBarca) {
          pointsReal = 3; // Real выиграл
        } else if (scoreReal < scoreBarca) {
          pointsBarca = 3; // Barca выиграла
        } else {
          pointsReal = 1; // Ничья
          pointsBarca = 1;
        }
        
        requestData.score_real = scoreReal;
        requestData.score_barca = scoreBarca;
        // goals_* = score_* (забитые голы = итоговый счет)
        requestData.goals_real = scoreReal;
        requestData.goals_barca = scoreBarca;
        // conceded_* = противоположный score (пропущенные = забитые соперником)
        requestData.conceded_real = scoreBarca;
        requestData.conceded_barca = scoreReal;
        // Автоматически рассчитанные очки
        requestData.points_real = pointsReal;
        requestData.points_barca = pointsBarca;
      }

      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании матча');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-center mb-12">
            <span className="text-gradient-real">СОЗДАТЬ</span>{' '}
            <span className="text-gradient-barca">МАТЧ</span>
          </h1>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Основная информация */}
              <section>
                <h3 className="text-xl font-bold mb-4 text-white">
                  Основная информация
                </h3>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Дата</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Время</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      📍 Место проведения
                    </label>
                    <LocationPicker
                      value={formData.location}
                      onChange={(location, address) => 
                        setFormData({ ...formData, location: address })
                      }
                    />
                  </div>

                  {isPastMatch && (
                    <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 text-yellow-400 text-sm">
                      ℹ️ Дата матча в прошлом. Матч будет создан как завершенный. Заполните статистику ниже.
                    </div>
                  )}
                </div>
              </section>

              {/* Статистика матча - показываем только если дата в прошлом */}
              {isPastMatch && (
                <>
                  {/* Итоговый счет */}
                  <section>
                      <h3 className="text-xl font-bold mb-4 text-white">Итоговый счет</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gradient-real">
                            Реал Мадрид
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.score_real}
                            onChange={(e) =>
                              setFormData({ ...formData, score_real: e.target.value })
                            }
                            className="input-field"
                            placeholder="Голы забитые"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gradient-barca">
                            Барселона
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.score_barca}
                            onChange={(e) =>
                              setFormData({ ...formData, score_barca: e.target.value })
                            }
                            className="input-field"
                            placeholder="Голы забитые"
                          />
                        </div>
                      </div>
                    </section>
                  </>
                )}

              {/* Составы команд */}
              <section>
                <h3 className="text-xl font-bold mb-4 text-white">👥 Составы команд</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gradient-real">
                      👔 Тренер Реал Мадрид
                    </label>
                    <input
                      type="text"
                      value={formData.coach_real}
                      onChange={(e) =>
                        setFormData({ ...formData, coach_real: e.target.value })
                      }
                      className="input-field mb-4"
                      placeholder="Имя тренера"
                    />
                    <label className="block text-sm font-semibold mb-2 text-gradient-real">
                      Состав Реал Мадрид
                    </label>
                    <textarea
                      value={formData.lineup_real}
                      onChange={(e) =>
                        setFormData({ ...formData, lineup_real: e.target.value })
                      }
                      className="input-field min-h-[150px] resize-y"
                      placeholder="Например:&#10;Вася&#10;Петя&#10;Коля&#10;..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gradient-barca">
                      👔 Тренер Барселона
                    </label>
                    <input
                      type="text"
                      value={formData.coach_barca}
                      onChange={(e) =>
                        setFormData({ ...formData, coach_barca: e.target.value })
                      }
                      className="input-field mb-4"
                      placeholder="Имя тренера"
                    />
                    <label className="block text-sm font-semibold mb-2 text-gradient-barca">
                      Состав Барселона
                    </label>
                    <textarea
                      value={formData.lineup_barca}
                      onChange={(e) =>
                        setFormData({ ...formData, lineup_barca: e.target.value })
                      }
                      className="input-field min-h-[150px] resize-y"
                      placeholder="Например:&#10;Саша&#10;Миша&#10;Дима&#10;..."
                    />
                  </div>
                </div>
              </section>

              {/* Анонс матча */}
              <section>
                <h3 className="text-xl font-bold mb-4 text-white">📢 Анонс матча</h3>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Анонс (будет отображаться на главной странице)
                  </label>
                  <textarea
                    value={formData.announcement}
                    onChange={(e) =>
                      setFormData({ ...formData, announcement: e.target.value })
                    }
                    className="input-field min-h-[120px] resize-y"
                    placeholder="Например:&#10;Грандиозное противостояние! Не пропустите самый захватывающий матч сезона! Битва за лидерство продолжается..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Напишите интересный текст, который будет мотивировать болельщиков прийти на матч
                  </p>
                </div>
              </section>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-real"
                >
                  {loading ? 'Создание...' : 'Создать матч'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
