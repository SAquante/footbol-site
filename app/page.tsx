'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Navigation from '@/components/Navigation';
import CountdownTimer from '@/components/CountdownTimer';
import { Match } from '@/types';

export default function HomePage() {
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      const matches: Match[] = await response.json();

      const now = new Date();
      const upcoming = matches
        .filter((m) => new Date(m.match_datetime) > now && m.status === 'scheduled')
        .sort((a, b) => new Date(a.match_datetime).getTime() - new Date(b.match_datetime).getTime());

      const recent = matches
        .filter((m) => m.status === 'completed')
        .sort((a, b) => new Date(b.match_datetime).getTime() - new Date(a.match_datetime).getTime())
        .slice(0, 3);

      setNextMatch(upcoming[0] || null);
      setRecentMatches(recent);
      setAllMatches(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Подсчёт статистики
  const completedMatches = allMatches.filter(m => m.status === 'completed');
  const realWins = completedMatches.filter(m => (m.score_real || 0) > (m.score_barca || 0)).length;
  const barcaWins = completedMatches.filter(m => (m.score_barca || 0) > (m.score_real || 0)).length;
  const draws = completedMatches.filter(m => m.score_real === m.score_barca).length;
  const totalRealGoals = completedMatches.reduce((sum, m) => sum + (m.score_real || 0), 0);
  const totalBarcaGoals = completedMatches.reduce((sum, m) => sum + (m.score_barca || 0), 0);

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

      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Hero секция с большим заголовком */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-16"
        >
          <motion.h1
            data-testid="hero-title"
            className="text-7xl md:text-9xl font-black mb-6"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-gradient-real">AMATEUR</span>
            <br />
            <span className="text-gradient-barca">EL CLÁSICO</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-400 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Легендарное противостояние сильнейших команд
          </motion.p>
          
          {/* Декоративные элементы */}
          <div className="flex justify-center gap-12 mb-12">
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-real-gold to-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-barca-blue to-barca-red"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </div>
        </motion.div>

        {/* Следующий матч */}
        {nextMatch ? (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-20"
          >
            <div className="text-center mb-8">
              <motion.div
                className="inline-block"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <span className="text-5xl">🔥</span>
              </motion.div>
              <h2 className="inline-block ml-4">
                <span className="text-gradient-real">СЛЕДУЮЩИЙ</span>{' '}
                <span className="text-gradient-barca">МАТЧ</span>
              </h2>
              <motion.div
                className="inline-block ml-4"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <span className="text-5xl">🔥</span>
              </motion.div>
            </div>

            <div className="card max-w-5xl mx-auto relative overflow-hidden">
              {/* Анимированный фон */}
              <div className="absolute inset-0 opacity-10">
                <motion.div
                  className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-real-gold via-white to-barca-blue"
                  animate={{ 
                    x: ['-100%', '100%'],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-block bg-gradient-to-r from-real-gold/20 to-barca-blue/20 border border-white/20 rounded-full px-8 py-3 mb-4">
                    <div className="text-lg font-bold text-white">
                      📅 {format(new Date(nextMatch.match_datetime), 'EEEE, d MMMM yyyy', {
                        locale: ru,
                      }).toUpperCase()}
                    </div>
                  </div>
                  <div className="text-6xl font-black text-white mb-2 tracking-wider">
                    {format(new Date(nextMatch.match_datetime), 'HH:mm')}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xl text-gray-400">
                    <span>📍</span>
                    <a 
                      href={`https://yandex.ru/maps/?text=${encodeURIComponent(nextMatch.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:text-real-gold transition-colors cursor-pointer underline"
                    >
                      {nextMatch.location}
                    </a>
                  </div>
                </div>

                <CountdownTimer targetDate={new Date(nextMatch.match_datetime)} />

                {/* Декоративный разделитель VS */}
                <div className="my-12 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-dashed border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <motion.div
                      className="bg-dark-primary px-8 py-4"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="text-6xl font-black bg-gradient-to-r from-real-gold via-white to-barca-blue bg-clip-text text-transparent">
                        VS
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Составы */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Реал Мадрид */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-real-gold/10 to-transparent border-2 border-real-gold/30 rounded-2xl p-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 text-9xl opacity-5">⚪</div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-4xl">👑</div>
                        <h3 className="text-2xl font-black text-gradient-real">
                          РЕАЛ МАДРИД
                        </h3>
                      </div>
                      {nextMatch.lineup_real ? (
                        <div className="bg-dark-accent/50 rounded-lg p-4 border border-real-gold/20">
                          <p className="whitespace-pre-line text-gray-300 leading-relaxed">
                            {nextMatch.lineup_real}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-dark-accent/30 rounded-lg p-6 border border-dashed border-white/10 text-center">
                          <div className="text-5xl mb-3">⏳</div>
                          <p className="text-gray-500 italic">Состав формируется...</p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Барселона */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-barca-blue/10 to-transparent border-2 border-barca-blue/30 rounded-2xl p-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 text-9xl opacity-5">🔵</div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-4xl">🏆</div>
                        <h3 className="text-2xl font-black text-gradient-barca">
                          БАРСЕЛОНА
                        </h3>
                      </div>
                      {nextMatch.lineup_barca ? (
                        <div className="bg-dark-accent/50 rounded-lg p-4 border border-barca-blue/20">
                          <p className="whitespace-pre-line text-gray-300 leading-relaxed">
                            {nextMatch.lineup_barca}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-dark-accent/30 rounded-lg p-6 border border-dashed border-white/10 text-center">
                          <div className="text-5xl mb-3">⏳</div>
                          <p className="text-gray-500 italic">Состав формируется...</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Призыв к действию */}
                <motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <div className="inline-block bg-gradient-to-r from-real-gold/10 via-white/5 to-barca-blue/10 border border-white/20 rounded-full px-6 py-3">
                    <p className="text-sm text-gray-300">
                      💡 <span className="font-bold">Не пропустите!</span> Будет жарко!
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 mb-20"
          >
            <div className="card max-w-2xl mx-auto">
              <div className="text-7xl mb-6">😴</div>
              <h2 className="mb-4">Нет запланированных матчей</h2>
              <p className="text-gray-400 text-lg">
                Следите за обновлениями расписания.<br/>
                Скоро будут новые жаркие противостояния!
              </p>
            </div>
          </motion.section>
        )}

        {/* Последние матчи */}
        {recentMatches.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="mb-4">
                <span className="text-white">⚡ ПОСЛЕДНИЕ МАТЧИ</span>
              </h2>
              <p className="text-gray-400">Результаты прошедших противостояний</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {recentMatches.map((match, index) => {
                const realWon = (match.score_real || 0) > (match.score_barca || 0);
                const barcaWon = (match.score_barca || 0) > (match.score_real || 0);
                const isDraw = match.score_real === match.score_barca;

                return (
                  <motion.div
                    key={match.id}
                    className={`card-hover relative overflow-hidden ${
                      realWon ? 'border-real-gold/40' : 
                      barcaWon ? 'border-barca-blue/40' : 
                      'border-white/20'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    {/* Победный фон */}
                    {realWon && (
                      <div className="absolute inset-0 bg-gradient-to-br from-real-gold/5 to-transparent" />
                    )}
                    {barcaWon && (
                      <div className="absolute inset-0 bg-gradient-to-br from-barca-blue/5 to-transparent" />
                    )}

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-gray-400 font-mono">
                          {format(new Date(match.match_datetime), 'd MMM yyyy', { locale: ru })}
                        </div>
                        {!isDraw && (
                          <div className="text-xl">
                            {realWon ? '👑' : '🏆'}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-6 mb-3">
                        <div className="text-center">
                          <div className={`text-5xl font-black ${
                            realWon ? 'text-gradient-real animate-pulse' : 'text-gradient-real opacity-50'
                          }`}>
                            {match.score_real}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">РЕАЛ</div>
                        </div>

                        <div className="text-3xl text-gray-600 font-bold">:</div>

                        <div className="text-center">
                          <div className={`text-5xl font-black ${
                            barcaWon ? 'text-gradient-barca animate-pulse' : 'text-gradient-barca opacity-50'
                          }`}>
                            {match.score_barca}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">БАРСА</div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="inline-block bg-dark-accent px-3 py-1 rounded-full">
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <span>📍</span>
                            <a 
                              href={`https://yandex.ru/maps/?text=${encodeURIComponent(match.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-real-gold transition-colors cursor-pointer underline"
                            >
                              {match.location}
                            </a>
                          </div>
                        </div>
                      </div>

                      {isDraw && (
                        <div className="mt-3 text-center">
                          <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-gray-400">
                            🤝 НИЧЬЯ
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* История противостояния */}
        {completedMatches.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-20"
          >
            <div className="card max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-center mb-8 text-white">
                📜 ИСТОРИЯ ПРОТИВОСТОЯНИЯ
              </h3>
              
              <div className="grid grid-cols-3 gap-6 mb-8">
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="text-6xl font-black text-gradient-real mb-2">
                    {((realWins / completedMatches.length) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-400">Процент побед Реала</div>
                </motion.div>

                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="text-6xl font-black text-white mb-2">
                    {completedMatches.length}
                  </div>
                  <div className="text-sm text-gray-400">Всего матчей</div>
                </motion.div>

                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="text-6xl font-black text-gradient-barca mb-2">
                    {((barcaWins / completedMatches.length) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-400">Процент побед Барсы</div>
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-real-gold/10 to-transparent border border-real-gold/30 rounded-xl p-6">
                  <div className="text-sm text-gray-400 mb-2">Средний счёт Реала</div>
                  <div className="text-4xl font-black text-gradient-real">
                    {(totalRealGoals / completedMatches.length).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">голов за матч</div>
                </div>

                <div className="bg-gradient-to-br from-barca-blue/10 to-transparent border border-barca-blue/30 rounded-xl p-6">
                  <div className="text-sm text-gray-400 mb-2">Средний счёт Барсы</div>
                  <div className="text-4xl font-black text-gradient-barca">
                    {(totalBarcaGoals / completedMatches.length).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">голов за матч</div>
                </div>
              </div>

              {/* Серии */}
              {(realWins > barcaWins || barcaWins > realWins) && (
                <motion.div
                  className="mt-6 text-center p-4 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="text-sm text-gray-400 mb-2">🔥 Лидер противостояния</div>
                  <div className={`text-2xl font-bold ${
                    realWins > barcaWins ? 'text-gradient-real' : 'text-gradient-barca'
                  }`}>
                    {realWins > barcaWins ? '👑 РЕАЛ МАДРИД' : '🏆 БАРСЕЛОНА'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    с преимуществом в {Math.abs(realWins - barcaWins)} {Math.abs(realWins - barcaWins) === 1 ? 'победу' : 'победы'}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        {/* Призыв к действию внизу */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <div className="card max-w-3xl mx-auto bg-gradient-to-r from-real-gold/5 via-transparent to-barca-blue/5 border-2 border-white/20">
            <div className="text-5xl mb-4">⚽</div>
            <h3 className="text-3xl font-bold mb-4 text-white">
              Стань частью легенды!
            </h3>
            <p className="text-gray-400 text-lg mb-6">
              Следи за всеми матчами, поддерживай свою команду<br/>
              и будь в курсе самых жарких моментов El Clásico
            </p>
            <div className="flex gap-4 justify-center">
              <motion.a
                href="/schedule"
                className="btn-real"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📅 Расписание
              </motion.a>
              <motion.a
                href="/login"
                className="btn-barca"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔐 Админка
              </motion.a>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
