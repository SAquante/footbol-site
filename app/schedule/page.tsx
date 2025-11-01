'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import MatchCard from '@/components/MatchCard';
import { Match } from '@/types';

export default function SchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      const data: Match[] = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingMatches = matches
    .filter((m) => new Date(m.match_datetime) > now || m.status === 'scheduled')
    .sort((a, b) => new Date(a.match_datetime).getTime() - new Date(b.match_datetime).getTime());

  const pastMatches = matches
    .filter((m) => m.status === 'completed')
    .sort((a, b) => new Date(b.match_datetime).getTime() - new Date(a.match_datetime).getTime());

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

      <main className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Заголовок */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="mb-4">
                <span data-testid="schedule-title" className="text-gradient-real">📅 РАСПИСАНИЕ</span>{' '}
                <span className="text-gradient-barca">МАТЧЕЙ</span>
              </h1>
              <p className="text-xl text-gray-400">
                Все матчи легендарного противостояния
              </p>
            </motion.div>
            
            {/* Декоративная линия */}
            <motion.div 
              className="decorative-line max-w-md mx-auto mt-8"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          </div>

          {/* Статистика в шапке */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto"
          >
            <div className="card text-center bg-gradient-to-br from-real-gold/10 to-transparent border-real-gold/30">
              <div className="text-4xl font-black text-gradient-real mb-2">
                {upcomingMatches.length}
              </div>
              <div className="text-sm text-gray-400">Запланировано</div>
            </div>
            
            <div className="card text-center bg-gradient-to-br from-white/5 to-transparent border-white/20">
              <div className="text-4xl font-black text-white mb-2">
                {matches.length}
              </div>
              <div className="text-sm text-gray-400">Всего матчей</div>
            </div>
            
            <div className="card text-center bg-gradient-to-br from-barca-blue/10 to-transparent border-barca-blue/30">
              <div className="text-4xl font-black text-gradient-barca mb-2">
                {pastMatches.length}
              </div>
              <div className="text-sm text-gray-400">Сыграно</div>
            </div>
          </motion.div>

          {/* Предстоящие матчи */}
          <section className="mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="text-4xl">🔜</div>
              <h2 className="text-3xl font-bold text-white">Предстоящие матчи</h2>
              {upcomingMatches.length > 0 && (
                <div className="ml-auto">
                  <span className="px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-full text-green-400 text-sm font-bold">
                    {upcomingMatches.length} матчей
                  </span>
                </div>
              )}
            </motion.div>
            
            {upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.map((match, index) => (
                  <MatchCard key={match.id} match={match} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card text-center bg-gradient-to-br from-gray-500/10 to-transparent border-dashed"
              >
                <div className="text-6xl mb-4">📭</div>
                <div className="text-xl text-gray-400 mb-2">Нет запланированных матчей</div>
                <div className="text-sm text-gray-500">Ожидайте объявления новых дат</div>
              </motion.div>
            )}
          </section>

          {/* Прошедшие матчи */}
          <section>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="text-4xl">🏁</div>
              <h2 className="text-3xl font-bold text-white">Сыгранные матчи</h2>
              {pastMatches.length > 0 && (
                <div className="ml-auto">
                  <span className="px-4 py-2 bg-gray-500/20 border border-gray-500/40 rounded-full text-gray-400 text-sm font-bold">
                    {pastMatches.length} завершено
                  </span>
                </div>
              )}
            </motion.div>
            
            {pastMatches.length > 0 ? (
              <div className="space-y-4">
                {pastMatches.map((match, index) => (
                  <MatchCard key={match.id} match={match} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card text-center bg-gradient-to-br from-gray-500/10 to-transparent border-dashed"
              >
                <div className="text-6xl mb-4">🕰️</div>
                <div className="text-xl text-gray-400 mb-2">История матчей пуста</div>
                <div className="text-sm text-gray-500">Первый матч еще впереди</div>
              </motion.div>
            )}
          </section>
        </motion.div>
      </main>
    </div>
  );
}
