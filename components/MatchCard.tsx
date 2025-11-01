'use client';

import { Match } from '@/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface MatchCardProps {
  match: Match;
  index: number;
}

export default function MatchCard({ match, index }: MatchCardProps) {
  const isCompleted = match.status === 'completed';
  const matchDate = new Date(match.match_datetime);
  const realWon = isCompleted && (match.score_real || 0) > (match.score_barca || 0);
  const barcaWon = isCompleted && (match.score_barca || 0) > (match.score_real || 0);
  const isDraw = isCompleted && match.score_real === match.score_barca;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <Link href={`/match/${match.id}`}>
        <div className={`card group relative overflow-hidden transition-all duration-300 ${
          realWon ? 'border-real-gold/50 hover:border-real-gold' : 
          barcaWon ? 'border-barca-blue/50 hover:border-barca-blue' : 
          'hover:border-white/40'
        }`}>
          {/* Победный фон */}
          {realWon && (
            <div className="absolute inset-0 bg-gradient-to-r from-real-gold/5 via-transparent to-transparent" />
          )}
          {barcaWon && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-barca-blue/5" />
          )}

          {/* Анимированная полоса сверху */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-real-gold via-white to-barca-blue"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-6">
            {/* Дата и время */}
            <motion.div 
              className="flex-shrink-0 text-center md:text-left"
              whileHover={{ scale: 1.05 }}
            >
              <div className="inline-block bg-dark-accent px-4 py-2 rounded-lg border border-white/10 mb-2">
                <div className="text-xs text-gray-400 uppercase tracking-wider font-mono">
                  {format(matchDate, 'EEEEEE', { locale: ru })}
                </div>
                <div className="text-lg font-bold text-white">
                  {format(matchDate, 'd MMM', { locale: ru })}
                </div>
              </div>
              <div className="text-3xl font-black text-white flex items-center gap-2 justify-center md:justify-start">
                <span>🕐</span>
                <span>{format(matchDate, 'HH:mm')}</span>
              </div>
            </motion.div>

            {/* Команды и счет */}
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center justify-center gap-4 md:gap-8">
                {/* Реал Мадрид */}
                <motion.div 
                  className="flex-1 text-right"
                  whileHover={{ x: -5 }}
                >
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <span className="text-2xl">👑</span>
                    <span className="text-lg font-bold text-gradient-real">РЕАЛ</span>
                  </div>
                  {isCompleted && (
                    <div className={`text-5xl md:text-6xl font-black ${
                      realWon ? 'text-gradient-real animate-pulse' : 'text-gradient-real opacity-40'
                    }`}>
                      {match.score_real}
                    </div>
                  )}
                </motion.div>

                {/* VS или счет */}
                <div className="flex flex-col items-center justify-center px-4">
                  {isCompleted ? (
                    <>
                      <div className="text-4xl font-black text-gray-600 mb-2">:</div>
                      {isDraw && (
                        <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-400">
                          НИЧЬЯ
                        </span>
                      )}
                      {realWon && (
                        <motion.span 
                          className="text-2xl"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          👑
                        </motion.span>
                      )}
                      {barcaWon && (
                        <motion.span 
                          className="text-2xl"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          🏆
                        </motion.span>
                      )}
                    </>
                  ) : (
                    <motion.div
                      className="text-3xl font-black bg-gradient-to-r from-real-gold via-white to-barca-blue bg-clip-text text-transparent"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      VS
                    </motion.div>
                  )}
                </div>

                {/* Барселона */}
                <motion.div 
                  className="flex-1 text-left"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-gradient-barca">БАРСА</span>
                    <span className="text-2xl">🏆</span>
                  </div>
                  {isCompleted && (
                    <div className={`text-5xl md:text-6xl font-black ${
                      barcaWon ? 'text-gradient-barca animate-pulse' : 'text-gradient-barca opacity-40'
                    }`}>
                      {match.score_barca}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Место и статус */}
            <motion.div 
              className="flex-shrink-0 text-center md:text-right"
              whileHover={{ scale: 1.05 }}
            >
              <div className="inline-block bg-dark-accent px-4 py-3 rounded-lg border border-white/10 mb-3">
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1 justify-center md:justify-end">
                  <span>📍</span>
                  <span>МЕСТО ПРОВЕДЕНИЯ</span>
                </div>
                <div className="text-sm font-semibold text-white">
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
              
              <div className="flex justify-center md:justify-end">
                {isCompleted ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/40">
                    <span>✅</span>
                    <span>Завершён</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/40 animate-pulse">
                    <span>📅</span>
                    <span>Скоро</span>
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Индикатор для наведения */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-real-gold via-white to-barca-blue opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </Link>
    </motion.div>
  );
}
