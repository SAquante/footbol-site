'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Navigation from '@/components/Navigation';
import CountdownTimer from '@/components/CountdownTimer';
import MatchInteractions from '@/components/MatchInteractions';
import MatchPredictions from '@/components/MatchPredictions';
import ConfettiEffect from '@/components/ConfettiEffect';
import { Match } from '@/types';
import { useParams, useRouter } from 'next/navigation';

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchMatch(params.id as string);
    }
  }, [params.id]);

  const fetchMatch = async (id: string) => {
    try {
      const response = await fetch(`/api/matches/${id}`);
      if (!response.ok) throw new Error('Match not found');
      const data: Match = await response.json();
      setMatch(data);
    } catch (error) {
      console.error('Error fetching match:', error);
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

  if (!match) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 pt-20 pb-12">
          <div className="card max-w-2xl mx-auto text-center py-12">
            <div className="text-7xl mb-4">❌</div>
            <h2 className="text-2xl mb-3">Матч не найден</h2>
            <button
              onClick={() => router.back()}
              className="btn-primary mt-4"
            >
              ← Назад
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isCompleted = match.status === 'completed';
  const matchDate = new Date(match.match_datetime);
  const isValidDate = !isNaN(matchDate.getTime());
  const isFuture = isValidDate && matchDate > new Date();
  
  // Для завершённых матчей
  const realWon = isCompleted && (match.score_real || 0) > (match.score_barca || 0);
  const barcaWon = isCompleted && (match.score_barca || 0) > (match.score_real || 0);
  const isDraw = isCompleted && match.score_real === match.score_barca;

  if (!isValidDate) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 pt-20 pb-12">
          <div className="card max-w-2xl mx-auto text-center py-12">
            <div className="text-7xl mb-4">❌</div>
            <h2 className="text-2xl mb-4">Ошибка в дате матча</h2>
            <p className="text-gray-400">Некорректная дата: {String(match.match_datetime)}</p>
            <button onClick={() => router.back()} className="btn-primary mt-4">
              ← Назад
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Если матч завершён, показываем детальную карточку
  if (isCompleted) {
    return (
      <div className="min-h-screen">
        <Navigation />

        <main className="container mx-auto px-4 pt-20 pb-12 md:pt-32 md:pb-20">
          {/* Кнопка назад */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 md:mb-8"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-xl">←</span>
              <span className="text-sm md:text-base">Назад к матчам</span>
            </button>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {/* Основная карточка матча */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card mb-6 md:mb-8 relative overflow-hidden ${
                realWon ? 'border-real-gold/40' : 
                barcaWon ? 'border-barca-blue/40' : 
                'border-white/20'
              }`}
            >
              {/* Победный фон */}
              {realWon && (
                <div className="absolute inset-0 bg-gradient-to-br from-real-gold/10 to-transparent" />
              )}
              {barcaWon && (
                <div className="absolute inset-0 bg-gradient-to-br from-barca-blue/10 to-transparent" />
              )}

              <div className="relative z-10">
                {/* Заголовок */}
                <div className="text-center mb-6 md:mb-8 pb-6 border-b border-white/10">
                  <div className="text-xs md:text-sm text-gray-400 mb-2 font-mono">
                    {format(matchDate, 'EEEE', { locale: ru }).toUpperCase()}
                  </div>
                  <div className="text-lg md:text-2xl text-white mb-2">
                    {format(matchDate, 'd MMMM yyyy', { locale: ru })}
                  </div>
                  <div className="text-base md:text-xl text-gray-300 font-mono">
                    🕐 {format(matchDate, 'HH:mm')}
                  </div>
                </div>

                {/* Счёт */}
                <div className="flex items-center justify-center gap-6 md:gap-12 mb-6 md:mb-8">
                  {/* Реал Мадрид */}
                  <div className="flex flex-col items-center flex-1 max-w-xs">
                    <div className="text-xs md:text-sm text-gray-400 mb-2">РЕАЛ МАДРИД</div>
                    <div className="flex items-center gap-3">
                      {realWon && <span className="text-2xl md:text-4xl">👑</span>}
                      <span className={`text-5xl md:text-7xl font-black ${
                        realWon ? 'text-gradient-real' : 'text-gray-500'
                      }`}>
                        {match.score_real}
                      </span>
                    </div>
                  </div>

                  {/* Разделитель */}
                  <div className="text-3xl md:text-5xl text-gray-600 font-bold">:</div>

                  {/* Барселона */}
                  <div className="flex flex-col items-center flex-1 max-w-xs">
                    <div className="text-xs md:text-sm text-gray-400 mb-2">БАРСЕЛОНА</div>
                    <div className="flex items-center gap-3">
                      <span className={`text-5xl md:text-7xl font-black ${
                        barcaWon ? 'text-gradient-barca' : 'text-gray-500'
                      }`}>
                        {match.score_barca}
                      </span>
                      {barcaWon && <span className="text-2xl md:text-4xl">🏆</span>}
                    </div>
                  </div>
                </div>

                {/* Результат */}
                <div className="text-center mb-6">
                  {realWon && (
                    <div className="text-xl md:text-3xl font-black text-gradient-real">
                      🎉 ПОБЕДА РЕАЛ МАДРИД
                    </div>
                  )}
                  {barcaWon && (
                    <div className="text-xl md:text-3xl font-black text-gradient-barca">
                      🎉 ПОБЕДА БАРСЕЛОНА
                    </div>
                  )}
                  {isDraw && (
                    <div className="text-xl md:text-3xl font-black text-white">
                      🤝 НИЧЬЯ
                    </div>
                  )}
                </div>

                {/* Место */}
                <div className="text-center">
                  <a 
                    href={`https://yandex.ru/maps/?text=${encodeURIComponent(match.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-dark-accent px-6 py-3 rounded-lg hover:bg-dark-accent/80 transition-colors"
                  >
                    <span className="text-base md:text-lg">📍</span>
                    <span className="text-sm md:text-base text-gray-300 hover:text-white">
                      {match.location}
                    </span>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Составы */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Состав Реал Мадрид */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card border-real-gold/30"
              >
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                  <div className="text-2xl">⚪</div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gradient-real">РЕАЛ МАДРИД</h3>
                    <p className="text-xs text-gray-400">Состав команды</p>
                  </div>
                </div>
                {match.lineup_real ? (
                  <p className="text-sm md:text-base text-gray-300 whitespace-pre-line leading-relaxed">
                    {match.lineup_real}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">Состав не указан</p>
                )}
                {match.coach_real && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Тренер</div>
                    <div className="text-sm md:text-base text-white font-medium">
                      👔 {match.coach_real}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Состав Барселона */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card border-barca-blue/30"
              >
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                  <div className="text-2xl">🔵</div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gradient-barca">БАРСЕЛОНА</h3>
                    <p className="text-xs text-gray-400">Состав команды</p>
                  </div>
                </div>
                {match.lineup_barca ? (
                  <p className="text-sm md:text-base text-gray-300 whitespace-pre-line leading-relaxed">
                    {match.lineup_barca}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">Состав не указан</p>
                )}
                {match.coach_barca && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Тренер</div>
                    <div className="text-sm md:text-base text-white font-medium">
                      👔 {match.coach_barca}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Анонс (если есть) */}
            {match.announcement && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card mb-6 md:mb-8 bg-gradient-to-br from-real-gold/5 via-transparent to-barca-blue/5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📢</span>
                  <h3 className="text-lg md:text-xl font-bold text-white">АНОНС МАТЧА</h3>
                </div>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed whitespace-pre-line">
                  {match.announcement}
                </p>
              </motion.div>
            )}

            {/* Статистика матча */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card"
            >
              <h3 className="text-lg md:text-xl font-bold text-white mb-6 text-center">
                📊 СТАТИСТИКА МАТЧА
              </h3>
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div className="text-center">
                  <div className="text-xs md:text-sm text-gray-400 mb-2">Голы Реала</div>
                  <div className="text-3xl md:text-5xl font-black text-gradient-real">
                    {match.score_real}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs md:text-sm text-gray-400 mb-2">Всего голов</div>
                  <div className="text-3xl md:text-5xl font-black text-white">
                    {(match.score_real || 0) + (match.score_barca || 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs md:text-sm text-gray-400 mb-2">Голы Барсы</div>
                  <div className="text-3xl md:text-5xl font-black text-gradient-barca">
                    {match.score_barca}
                  </div>
                </div>
              </div>

              {/* Разница голов */}
              {!isDraw && (
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <div className="text-xs md:text-sm text-gray-400 mb-2">Разница голов</div>
                  <div className="text-2xl md:text-4xl font-black text-white">
                    {Math.abs((match.score_real || 0) - (match.score_barca || 0))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Комментарии и реакции */}
            <MatchInteractions matchId={match.id} />
          </div>

          {/* Конфетти при победе */}
          <ConfettiEffect winner={realWon ? 'real' : barcaWon ? 'barca' : null} />
        </main>
      </div>
    );
  }

  // Для предстоящих матчей - старый вид

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Заголовок */}
          <div className="text-center mb-12">
            <h1 className="mb-4">
              {isCompleted ? (
                <>
                  <span className="text-gradient-real">РЕЗУЛЬТАТ</span>{' '}
                  <span className="text-gradient-barca">МАТЧА</span>
                </>
              ) : (
                <>
                  <span className="text-gradient-real">ПРЕДСТОЯЩИЙ</span>{' '}
                  <span className="text-gradient-barca">МАТЧ</span>
                </>
              )}
            </h1>
            <div className="text-xl text-gray-400">
              {format(matchDate, 'EEEE, d MMMM yyyy', { locale: ru })} в{' '}
              {format(matchDate, 'HH:mm')}
            </div>
            <div className="text-lg text-gray-500 mt-2">
              <a 
                href={`https://yandex.ru/maps/?text=${encodeURIComponent(match.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-real-gold transition-colors cursor-pointer underline"
              >
                📍 {match.location}
              </a>
            </div>
          </div>

          {/* Счет или таймер */}
          <div className="card mb-12">
            {isCompleted ? (
              <div className="flex items-center justify-center gap-12 py-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-400 mb-4">
                    Реал Мадрид
                  </h3>
                  <div className="text-8xl font-black text-gradient-real">
                    {match.score_real}
                  </div>
                </div>
                <div className="text-6xl font-black text-gray-600">:</div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-400 mb-4">
                    Барселона
                  </h3>
                  <div className="text-8xl font-black text-gradient-barca">
                    {match.score_barca}
                  </div>
                </div>
              </div>
            ) : isFuture ? (
              <div className="py-8">
                <h3 className="text-2xl font-bold text-center mb-8 text-gray-400">
                  До начала матча
                </h3>
                <CountdownTimer targetDate={matchDate} />
              </div>
            ) : null}
          </div>

          {/* VS Divider */}
          <div className="vs-divider mb-12">
            <div className="vs-text">VS</div>
          </div>

          {/* Составы */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Реал */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-gradient-real mb-6">
                Реал Мадрид
              </h2>
              {match.lineup_real ? (
                <div className="card border-real-gold/20">
                  <h4 className="text-lg font-semibold mb-4 text-real-gold">
                    Состав на матч
                  </h4>
                  <p className="whitespace-pre-line text-gray-300 leading-relaxed">
                    {match.lineup_real}
                  </p>
                </div>
              ) : (
                <div className="card">
                  <p className="text-gray-500 italic">Состав еще не объявлен</p>
                </div>
              )}
            </motion.div>

            {/* Барселона */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-gradient-barca mb-6 md:text-right">
                Барселона
              </h2>
              {match.lineup_barca ? (
                <div className="card border-barca-blue/20">
                  <h4 className="text-lg font-semibold mb-4 text-barca-blue">
                    Состав на матч
                  </h4>
                  <p className="whitespace-pre-line text-gray-300 leading-relaxed">
                    {match.lineup_barca}
                  </p>
                </div>
              ) : (
                <div className="card">
                  <p className="text-gray-500 italic">Состав еще не объявлен</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Прогнозы для предстоящих матчей */}
          <MatchPredictions matchId={match.id} matchStatus={match.status} />
        </motion.div>
      </main>
    </div>
  );
}
