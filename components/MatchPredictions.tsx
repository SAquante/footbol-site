'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Prediction } from '@/types';

interface Props {
  matchId: number;
  matchStatus: 'scheduled' | 'completed';
}

export default function MatchPredictions({ matchId, matchStatus }: Props) {
  const { user } = useAuthStore();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [predictedReal, setPredictedReal] = useState('');
  const [predictedBarca, setPredictedBarca] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPredictions();
  }, [matchId]);

  const fetchPredictions = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}/predictions`);
      const data = await response.json();
      setPredictions(data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    
    try {
      const response = await fetch(`/api/matches/${matchId}/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: user.username,
          predicted_score_real: parseInt(predictedReal),
          predicted_score_barca: parseInt(predictedBarca)
        })
      });

      if (response.ok) {
        const prediction = await response.json();
        setPredictions([...predictions, prediction]);
        setPredictedReal('');
        setPredictedBarca('');
      } else {
        const data = await response.json();
        setError(data.error || 'Не удалось создать прогноз');
      }
    } catch (error) {
      setError('Произошла ошибка');
    }
  };

  const userPrediction = user && predictions.find(p => p.user_id === user.id);
  const canPredict = matchStatus === 'scheduled' && !userPrediction;

  if (loading) {
    return <div className="text-center py-4">Загрузка прогнозов...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🎲</span> Прогнозы ({predictions.length})
      </h3>

      {/* Форма прогноза */}
      {user && canPredict && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gradient-to-r from-real-gold/10 to-barca-blue/10 rounded-lg border border-white/10">
          <p className="text-sm text-gray-300 mb-3">Предскажите счёт матча:</p>
          
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex-1 max-w-[120px]">
              <label className="block text-xs text-gray-400 mb-1 text-center">Реал Мадрид</label>
              <input
                type="number"
                min="0"
                max="50"
                value={predictedReal}
                onChange={(e) => setPredictedReal(e.target.value)}
                className="input-field text-center text-2xl font-bold w-full"
                placeholder="?"
                required
              />
            </div>
            
            <div className="text-3xl font-bold text-gray-600">:</div>
            
            <div className="flex-1 max-w-[120px]">
              <label className="block text-xs text-gray-400 mb-1 text-center">Барселона</label>
              <input
                type="number"
                min="0"
                max="50"
                value={predictedBarca}
                onChange={(e) => setPredictedBarca(e.target.value)}
                className="input-field text-center text-2xl font-bold w-full"
                placeholder="?"
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400 mb-2">{error}</p>}
          
          <button
            type="submit"
            className="btn-primary w-full text-sm"
          >
            Сделать прогноз
          </button>
        </form>
      )}

      {/* Ваш прогноз */}
      {userPrediction && (
        <div className="mb-4 p-4 bg-dark-accent rounded-lg border-2 border-real-gold/50">
          <p className="text-xs text-gray-400 mb-2">Ваш прогноз:</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-3xl font-black text-gradient-real">
              {userPrediction.predicted_score_real}
            </span>
            <span className="text-2xl text-gray-600">:</span>
            <span className="text-3xl font-black text-gradient-barca">
              {userPrediction.predicted_score_barca}
            </span>
          </div>
          {userPrediction.points_earned !== null && (
            <p className="text-center mt-2 text-sm">
              Заработано очков: <span className="text-real-gold font-bold">{userPrediction.points_earned}</span>
            </p>
          )}
        </div>
      )}

      {!user && (
        <p className="text-sm text-gray-500 mb-4">Войдите, чтобы сделать прогноз</p>
      )}

      {matchStatus === 'completed' && (
        <p className="text-xs text-gray-500 mb-4">Матч завершён. Новые прогнозы недоступны.</p>
      )}

      {/* Топ прогнозистов */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Прогнозы игроков:</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {predictions.length === 0 ? (
            <p className="text-center text-gray-500 py-4 text-sm">Пока нет прогнозов</p>
          ) : (
            predictions.map((pred) => (
              <div
                key={pred.id}
                className="flex items-center justify-between bg-dark-accent p-3 rounded-lg text-sm"
              >
                <span className="font-medium text-white">{pred.username}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-real-gold">{pred.predicted_score_real}</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-bold text-barca-blue">{pred.predicted_score_barca}</span>
                  {pred.points_earned !== null && (
                    <span className="ml-2 text-xs text-gray-400">
                      ({pred.points_earned} очков)
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
