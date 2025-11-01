'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import MatchCard from '@/components/MatchCard';
import { Match } from '@/types';

export default function HistoryPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      const data: Match[] = await response.json();
      
      // Фильтруем только завершенные матчи
      const completedMatches = data
        .filter((m) => m.status === 'completed')
        .sort((a, b) => new Date(b.match_datetime).getTime() - new Date(a.match_datetime).getTime());
      
      setMatches(completedMatches);
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

      <main className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-center mb-12">
            <span data-testid="history-title" className="text-gradient-real">📜 ИСТОРИЯ</span>{' '}
            <span className="text-gradient-barca">МАТЧЕЙ</span>
          </h1>

          {matches.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {matches.map((match, index) => (
                <MatchCard key={match.id} match={match} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card max-w-2xl mx-auto text-center py-20"
            >
              <div className="text-7xl mb-6">📜</div>
              <h2 className="text-2xl font-bold mb-4">Нет завершенных матчей</h2>
              <p className="text-gray-400 text-lg">
                История пока пуста.<br/>
                Завершенные матчи появятся здесь.
              </p>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
