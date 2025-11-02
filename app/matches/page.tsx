'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Navigation from '@/components/Navigation';
import { Match } from '@/types';
import Link from 'next/link';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      const data: Match[] = await response.json();
      
      // Сортируем по дате, самые новые сверху
      const sortedMatches = data
        .filter(m => m.status === 'completed')
        .sort((a, b) => new Date(b.match_datetime).getTime() - new Date(a.match_datetime).getTime());
      
      setMatches(sortedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold animate-pulse">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="container mx-auto px-4 pt-20 pb-12 md:pt-32 md:pb-20">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="mb-4 text-4xl md:text-6xl">
            <span className="text-gradient-real">⚽ СЫГРАННЫЕ</span>{' '}
            <span className="text-gradient-barca">МАТЧИ</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            Все завершённые противостояния Реал Мадрид vs Барселона
          </p>
        </motion.div>

        {/* Список матчей */}
        {matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card max-w-2xl mx-auto text-center py-12"
          >
            <div className="text-5xl md:text-7xl mb-4">😴</div>
            <h2 className="text-xl md:text-2xl mb-3">Нет сыгранных матчей</h2>
            <p className="text-gray-400">История матчей появится здесь после первых игр</p>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:gap-6 max-w-6xl mx-auto">
            {matches.map((match, index) => {
              const realWon = (match.score_real || 0) > (match.score_barca || 0);
              const barcaWon = (match.score_barca || 0) > (match.score_real || 0);
              const isDraw = match.score_real === match.score_barca;
              const matchDate = new Date(match.match_datetime);

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/match/${match.id}`}>
                    <div className={`card-hover relative overflow-hidden cursor-pointer ${
                      realWon ? 'border-real-gold/40' : 
                      barcaWon ? 'border-barca-blue/40' : 
                      'border-white/20'
                    }`}>
                      {/* Победный фон */}
                      {realWon && (
                        <div className="absolute inset-0 bg-gradient-to-br from-real-gold/5 to-transparent" />
                      )}
                      {barcaWon && (
                        <div className="absolute inset-0 bg-gradient-to-br from-barca-blue/5 to-transparent" />
                      )}

                      <div className="relative z-10">
                        {/* Дата и время */}
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="bg-dark-accent px-3 py-1 rounded-lg">
                              <div className="text-xs text-gray-400 font-mono">
                                {format(matchDate, 'EEEE', { locale: ru }).toUpperCase()}
                              </div>
                            </div>
                            <div className="text-sm md:text-base text-gray-300">
                              📅 {format(matchDate, 'd MMMM yyyy', { locale: ru })}
                            </div>
                          </div>
                          <div className="text-sm md:text-base text-gray-400 font-mono">
                            🕐 {format(matchDate, 'HH:mm')}
                          </div>
                        </div>

                        {/* Счёт */}
                        <div className="flex items-center justify-center gap-4 md:gap-8 mb-4">
                          {/* Реал Мадрид */}
                          <div className="flex items-center gap-3 flex-1 justify-end">
                            <div className="text-right">
                              <div className="text-xs md:text-sm text-gray-400 mb-1">РЕАЛ МАДРИД</div>
                              <div className="flex items-center gap-2 justify-end">
                                {realWon && <span className="text-xl">👑</span>}
                                <span className={`text-2xl md:text-4xl font-black ${
                                  realWon ? 'text-gradient-real' : 'text-gray-500'
                                }`}>
                                  {match.score_real}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Разделитель */}
                          <div className="text-2xl md:text-3xl text-gray-600 font-bold">:</div>

                          {/* Барселона */}
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-left">
                              <div className="text-xs md:text-sm text-gray-400 mb-1">БАРСЕЛОНА</div>
                              <div className="flex items-center gap-2">
                                <span className={`text-2xl md:text-4xl font-black ${
                                  barcaWon ? 'text-gradient-barca' : 'text-gray-500'
                                }`}>
                                  {match.score_barca}
                                </span>
                                {barcaWon && <span className="text-xl">🏆</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Место */}
                        <div className="text-center">
                          <div className="inline-flex items-center gap-2 bg-dark-accent px-4 py-2 rounded-lg">
                            <span className="text-xs md:text-sm text-gray-400">📍</span>
                            <span className="text-xs md:text-sm text-gray-300">
                              {match.location.split(',')[0]}
                            </span>
                          </div>
                        </div>

                        {/* Статус */}
                        {isDraw && (
                          <div className="mt-4 text-center">
                            <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-gray-400">
                              🤝 НИЧЬЯ
                            </span>
                          </div>
                        )}

                        {/* Стрелка для перехода */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-gray-600 group-hover:text-white transition-colors">
                          →
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Статистика внизу */}
        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 md:mt-20"
          >
            <div className="card max-w-4xl mx-auto text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                📊 ОБЩАЯ СТАТИСТИКА
              </h3>
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div>
                  <div className="text-3xl md:text-5xl font-black text-gradient-real mb-2">
                    {matches.filter(m => (m.score_real || 0) > (m.score_barca || 0)).length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">Побед Реала</div>
                </div>
                <div>
                  <div className="text-3xl md:text-5xl font-black text-white mb-2">
                    {matches.filter(m => m.score_real === m.score_barca).length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">Ничьих</div>
                </div>
                <div>
                  <div className="text-3xl md:text-5xl font-black text-gradient-barca mb-2">
                    {matches.filter(m => (m.score_barca || 0) > (m.score_real || 0)).length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">Побед Барсы</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
