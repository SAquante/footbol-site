'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import LocationPicker from '@/components/LocationPicker';
import { useAuthStore } from '@/store/authStore';
import { Match } from '@/types';

export default function EditMatchPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuthStore();
  const [match, setMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    status: 'scheduled' as 'scheduled' | 'completed',
    score_real: '',
    score_barca: '',
    lineup_real: '',
    lineup_barca: '',
    coach_real: '',
    coach_barca: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      router.push('/login');
      return;
    }
    fetchMatch();
  }, [user, router, params.id]);

  const fetchMatch = async () => {
    try {
      const response = await fetch(`/api/matches/${params.id}`);
      const data: Match = await response.json();
      setMatch(data);

      const matchDate = new Date(data.match_datetime);
      const now = new Date();
      
      // Автоматически определяем статус: если матч уже начался, он должен быть "completed"
      const autoStatus = matchDate < now ? 'completed' : data.status;
      
      setFormData({
        date: format(matchDate, 'yyyy-MM-dd'),
        time: format(matchDate, 'HH:mm'),
        location: data.location,
        status: autoStatus,
        score_real: data.score_real?.toString() || '',
        score_barca: data.score_barca?.toString() || '',
        lineup_real: data.lineup_real || '',
        lineup_barca: data.lineup_barca || '',
        coach_real: data.coach_real || '',
        coach_barca: data.coach_barca || '',
      });
    } catch (error) {
      console.error('Error fetching match:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const matchDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      
      // Автоматически устанавливаем статус "completed" если матч уже начался
      let finalStatus = formData.status;
      if (matchDateTime < now && formData.status === 'scheduled') {
        finalStatus = 'completed';
      }

      const updateData: any = {
        match_datetime: matchDateTime.toISOString(),
        location: formData.location,
        status: finalStatus,
        lineup_real: formData.lineup_real || null,
        lineup_barca: formData.lineup_barca || null,
        coach_real: formData.coach_real || null,
        coach_barca: formData.coach_barca || null,
      };

      if (finalStatus === 'completed') {
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
        
        updateData.score_real = scoreReal;
        updateData.score_barca = scoreBarca;
        // goals_* = score_* (забитые голы = итоговый счет)
        updateData.goals_real = scoreReal;
        updateData.goals_barca = scoreBarca;
        // conceded_* = противоположный score (пропущенные = забитые соперником)
        updateData.conceded_real = scoreBarca;
        updateData.conceded_barca = scoreReal;
        // Автоматически рассчитанные очки
        updateData.points_real = pointsReal;
        updateData.points_barca = pointsBarca;
      }

      const response = await fetch(`/api/matches/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обновлении матча');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold animate-pulse">Загрузка...</div>
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
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-center mb-12">
            <span className="text-gradient-real">РЕДАКТИРОВАТЬ</span>{' '}
            <span className="text-gradient-barca">МАТЧ</span>
          </h1>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Основная информация */}
              <section>
                <h3 className="text-xl font-bold mb-4 text-white">
                  Основная информация
                </h3>
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

                <div className="mt-6">
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

                <div className="mt-6">
                  <label className="block text-sm font-semibold mb-2">Статус</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'scheduled' | 'completed',
                      })
                    }
                    className="input-field"
                  >
                    <option value="scheduled">Предстоящий</option>
                    <option value="completed">Завершён</option>
                  </select>
                  {(() => {
                    const matchDateTime = new Date(`${formData.date}T${formData.time}`);
                    const now = new Date();
                    if (matchDateTime < now && formData.status === 'scheduled') {
                      return (
                        <p className="mt-2 text-sm text-yellow-400">
                          ⚠️ Матч уже начался. При сохранении статус автоматически изменится на "Завершён"
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              </section>

              {/* Счет (если матч сыгран) */}
              {formData.status === 'completed' && (
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
                        required={formData.status === 'completed'}
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
                        required={formData.status === 'completed'}
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Составы */}
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
                      className="input-field min-h-[200px] resize-y"
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
                      className="input-field min-h-[200px] resize-y"
                      placeholder="Например:&#10;Саша&#10;Миша&#10;Дима&#10;..."
                    />
                  </div>
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
                <button type="submit" disabled={loading} className="flex-1 btn-barca">
                  {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
