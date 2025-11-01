'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Navigation from '@/components/Navigation';
import CountdownTimer from '@/components/CountdownTimer';
import { Match } from '@/types';

export default function MatchDetailPage() {
  const params = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatch();
  }, [params.id]);

  const fetchMatch = async () => {
    try {
      const response = await fetch(`/api/matches/${params.id}`);
      const data = await response.json();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Матч не найден</div>
      </div>
    );
  }

  const isCompleted = match.status === 'completed';
  const matchDate = new Date(match.match_datetime);
  const isValidDate = !isNaN(matchDate.getTime());
  const isFuture = isValidDate && matchDate > new Date();

  if (!isValidDate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">❌ Ошибка в дате матча</div>
          <div className="text-gray-400">Некорректная дата: {String(match.match_datetime)}</div>
        </div>
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
        </motion.div>
      </main>
    </div>
  );
}
