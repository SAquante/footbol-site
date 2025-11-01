'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Match } from '@/types';

export default function StatsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

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

  const currentYear = new Date().getFullYear();
  const currentYearMatches = matches.filter(
    (match) =>
      match.status === 'completed' &&
      new Date(match.match_datetime).getFullYear() === currentYear
  );

  // Статистика Реала
  const realStats = {
    matches: currentYearMatches.length,
    wins: currentYearMatches.filter((m) => (m.score_real || 0) > (m.score_barca || 0)).length,
    draws: currentYearMatches.filter((m) => m.score_real === m.score_barca).length,
    losses: currentYearMatches.filter((m) => (m.score_real || 0) < (m.score_barca || 0)).length,
    goalsScored: currentYearMatches.reduce((sum, m) => sum + (m.goals_real || m.score_real || 0), 0),
    goalsConceded: currentYearMatches.reduce((sum, m) => sum + (m.conceded_real || m.score_barca || 0), 0),
    points: currentYearMatches.reduce((sum, m) => sum + (m.points_real || 0), 0),
  };

  // Статистика Барсы
  const barcaStats = {
    matches: currentYearMatches.length,
    wins: currentYearMatches.filter((m) => (m.score_barca || 0) > (m.score_real || 0)).length,
    draws: currentYearMatches.filter((m) => m.score_real === m.score_barca).length,
    losses: currentYearMatches.filter((m) => (m.score_barca || 0) < (m.score_real || 0)).length,
    goalsScored: currentYearMatches.reduce((sum, m) => sum + (m.goals_barca || m.score_barca || 0), 0),
    goalsConceded: currentYearMatches.reduce((sum, m) => sum + (m.conceded_barca || m.score_real || 0), 0),
    points: currentYearMatches.reduce((sum, m) => sum + (m.points_barca || 0), 0),
  };

  const completedMatches = matches
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
    <div className="min-h-screen">
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <h1 className="text-center" data-testid="stats-title">
            <span className="text-gradient-real">СТАТИСТИКА</span>{' '}
            <span className="text-gradient-barca">{currentYear}</span>
          </h1>

          {/* Общая статистика */}
          {completedMatches.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="card">
                <h3 className="text-3xl font-bold text-center mb-8 text-white">
                  📊 ОБЩАЯ СТАТИСТИКА
                </h3>
                
                <div className="grid md:grid-cols-5 gap-6">
                  {/* Реал победы */}
                  <motion.div
                    className="bg-gradient-to-br from-real-gold/20 to-transparent border border-real-gold/30 rounded-xl p-6 text-center"
                    whileHover={{ scale: 1.05, borderColor: 'rgba(255, 215, 0, 0.6)' }}
                  >
                    <div className="text-5xl font-black text-gradient-real mb-2">{realStats.wins}</div>
                    <div className="text-sm text-gray-400">Побед Реала</div>
                  </motion.div>

                  {/* Ничьи */}
                  <motion.div
                    className="bg-dark-accent border border-white/20 rounded-xl p-6 text-center"
                    whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.4)' }}
                  >
                    <div className="text-5xl font-black text-white mb-2">{realStats.draws}</div>
                    <div className="text-sm text-gray-400">Ничьих</div>
                  </motion.div>

                  {/* Барса победы */}
                  <motion.div
                    className="bg-gradient-to-br from-barca-blue/20 to-transparent border border-barca-blue/30 rounded-xl p-6 text-center"
                    whileHover={{ scale: 1.05, borderColor: 'rgba(0, 82, 165, 0.6)' }}
                  >
                    <div className="text-5xl font-black text-gradient-barca mb-2">{barcaStats.wins}</div>
                    <div className="text-sm text-gray-400">Побед Барсы</div>
                  </motion.div>

                  {/* Голы Реала */}
                  <motion.div
                    className="bg-gradient-to-br from-yellow-400/10 to-transparent border border-real-gold/20 rounded-xl p-6 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-4xl font-black text-gradient-real mb-2">{realStats.goalsScored}</div>
                    <div className="text-xs text-gray-400">⚽ Голов Реала</div>
                  </motion.div>

                  {/* Голы Барсы */}
                  <motion.div
                    className="bg-gradient-to-br from-barca-red/10 to-transparent border border-barca-red/20 rounded-xl p-6 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-4xl font-black text-gradient-barca mb-2">{barcaStats.goalsScored}</div>
                    <div className="text-xs text-gray-400">⚽ Голов Барсы</div>
                  </motion.div>
                </div>

                {/* Прогресс бар соотношения побед */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gradient-real font-bold">РЕАЛ</span>
                    <span className="text-sm text-gray-500">Соотношение побед</span>
                    <span className="text-sm text-gradient-barca font-bold">БАРСА</span>
                  </div>
                  <div className="h-6 bg-dark-accent rounded-full overflow-hidden flex">
                    <motion.div
                      className="bg-gradient-to-r from-real-gold to-yellow-400"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${completedMatches.length > 0 ? (realStats.wins / (realStats.wins + barcaStats.wins || 1)) * 100 : 50}%` 
                      }}
                      transition={{ delay: 0.8, duration: 1 }}
                    />
                    <motion.div
                      className="bg-gradient-to-r from-barca-red to-barca-blue"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${completedMatches.length > 0 ? (barcaStats.wins / (realStats.wins + barcaStats.wins || 1)) * 100 : 50}%` 
                      }}
                      transition={{ delay: 0.8, duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Таблица статистики */}
          <div className="card overflow-x-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              📊 Турнирная таблица {currentYear}
            </h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Команда</th>
                  <th className="text-center py-3 px-2">И</th>
                  <th className="text-center py-3 px-2">В</th>
                  <th className="text-center py-3 px-2">Н</th>
                  <th className="text-center py-3 px-2">П</th>
                  <th className="text-center py-3 px-2">ЗГ</th>
                  <th className="text-center py-3 px-2">ПГ</th>
                  <th className="text-center py-3 px-2">РГ</th>
                  <th className="text-center py-3 px-2 font-bold">О</th>
                </tr>
              </thead>
              <tbody>
                {/* Сортируем по очкам */}
                {[
                  { name: 'РЕАЛ МАДРИД', stats: realStats, gradient: 'text-gradient-real' },
                  { name: 'БАРСЕЛОНА', stats: barcaStats, gradient: 'text-gradient-barca' },
                ]
                  .sort((a, b) => b.stats.points - a.stats.points)
                  .map((team, idx) => (
                    <tr key={team.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <span className={`font-bold ${team.gradient}`}>
                          {idx + 1}. {team.name}
                        </span>
                      </td>
                      <td className="text-center py-4 px-2">{team.stats.matches}</td>
                      <td className="text-center py-4 px-2 text-green-400">{team.stats.wins}</td>
                      <td className="text-center py-4 px-2 text-yellow-400">{team.stats.draws}</td>
                      <td className="text-center py-4 px-2 text-red-400">{team.stats.losses}</td>
                      <td className="text-center py-4 px-2">{team.stats.goalsScored}</td>
                      <td className="text-center py-4 px-2">{team.stats.goalsConceded}</td>
                      <td className="text-center py-4 px-2">
                        {team.stats.goalsScored - team.stats.goalsConceded > 0 ? '+' : ''}
                        {team.stats.goalsScored - team.stats.goalsConceded}
                      </td>
                      <td className="text-center py-4 px-2 font-bold text-lg">{team.stats.points}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="mt-4 text-sm text-gray-400 space-y-1">
              <p>И - Игры, В - Победы, Н - Ничьи, П - Поражения</p>
              <p>ЗГ - Забитые голы, ПГ - Пропущенные голы, РГ - Разница голов, О - Очки</p>
            </div>
          </div>

          {/* Сыгранные матчи */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">
              🏁 <span className="text-gradient-real">СЫГРАННЫЕ</span>{' '}
              <span className="text-gradient-barca">МАТЧИ</span>
            </h2>

            {completedMatches.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">🕰️</div>
                <h3 className="text-xl font-bold mb-2">История матчей пуста</h3>
                <p className="text-gray-400">Первый матч еще впереди</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedMatches.map((match) => {
                  const matchDate = new Date(match.match_datetime);
                  const realWon = (match.score_real || 0) > (match.score_barca || 0);
                  const barcaWon = (match.score_barca || 0) > (match.score_real || 0);
                  const isDraw = match.score_real === match.score_barca;

                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card hover:shadow-xl transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="text-sm text-gray-400">
                          📅 {matchDate.toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                          <br />
                          🕐 {matchDate.toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>

                        <div className="flex-1 flex items-center justify-center gap-8">
                          <div className={`text-right ${realWon ? 'text-green-400' : ''}`}>
                            <div className="text-lg font-bold">👑 РЕАЛ</div>
                            {match.coach_real && (
                              <div className="text-xs text-gray-400">👔 {match.coach_real}</div>
                            )}
                          </div>

                          <div className="text-center">
                            <div className="text-4xl font-black">
                              <span className={realWon ? 'text-green-400' : ''}>{match.score_real || 0}</span>
                              <span className="text-gray-600 mx-2">:</span>
                              <span className={barcaWon ? 'text-green-400' : ''}>{match.score_barca || 0}</span>
                            </div>
                            {isDraw && <div className="text-sm text-yellow-400 mt-1">🤝 НИЧЬЯ</div>}
                          </div>

                          <div className={`text-left ${barcaWon ? 'text-green-400' : ''}`}>
                            <div className="text-lg font-bold">БАРСА 🏆</div>
                            {match.coach_barca && (
                              <div className="text-xs text-gray-400">👔 {match.coach_barca}</div>
                            )}
                          </div>
                        </div>

                        <div className="text-sm text-gray-400 text-right">
                          📍 <a 
                            href={`https://yandex.ru/maps/?text=${encodeURIComponent(match.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-real-gold transition-colors cursor-pointer underline"
                          >
                            {match.location}
                          </a>
                          {(match.points_real || match.points_barca) && (
                            <div className="mt-2 text-xs">
                              <div>Очки: {match.points_real || 0} - {match.points_barca || 0}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Составы */}
                      {(match.lineup_real || match.lineup_barca) && (
                        <div className="mt-4 pt-4 border-t border-white/10 grid md:grid-cols-2 gap-4 text-sm">
                          {match.lineup_real && (
                            <div>
                              <div className="font-semibold text-gradient-real mb-2">Состав Реала:</div>
                              <div className="text-gray-400 whitespace-pre-line">{match.lineup_real}</div>
                            </div>
                          )}
                          {match.lineup_barca && (
                            <div>
                              <div className="font-semibold text-gradient-barca mb-2">Состав Барсы:</div>
                              <div className="text-gray-400 whitespace-pre-line">{match.lineup_barca}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
