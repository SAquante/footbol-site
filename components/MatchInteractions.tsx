'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { MatchComment, MatchReaction } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Props {
  matchId: number;
}

const reactionTypes = ['🔥', '⚽', '👏', '😢', '😂', '❤️'] as const;

export default function MatchInteractions({ matchId }: Props) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<MatchComment[]>([]);
  const [reactions, setReactions] = useState<MatchReaction[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [matchId]);

  const fetchData = async () => {
    try {
      const [commentsRes, reactionsRes] = await Promise.all([
        fetch(`/api/matches/${matchId}/comments`),
        fetch(`/api/matches/${matchId}/reactions`)
      ]);
      
      const commentsData = await commentsRes.json();
      const reactionsData = await reactionsRes.json();
      
      setComments(commentsData);
      setReactions(reactionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const response = await fetch(`/api/matches/${matchId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: user.username,
          comment: newComment
        })
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([...comments, comment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReaction = async (type: typeof reactionTypes[number]) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/matches/${matchId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: user.username,
          type
        })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const getReactionCount = (type: string) => {
    return reactions.filter(r => r.type === type).length;
  };

  const hasUserReacted = (type: string) => {
    return user && reactions.some(r => r.user_id === user.id && r.type === type);
  };

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Реакции */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>💬</span> Реакции
        </h3>
        
        <div className="flex flex-wrap gap-2 md:gap-3">
          {reactionTypes.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              disabled={!user}
              className={`px-4 py-2 rounded-lg text-2xl md:text-3xl transition-all ${
                hasUserReacted(emoji)
                  ? 'bg-gradient-to-r from-real-gold to-yellow-400 scale-110'
                  : 'bg-dark-accent hover:bg-dark-accent/80'
              } ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
            >
              {emoji} <span className="text-sm text-gray-400">{getReactionCount(emoji)}</span>
            </button>
          ))}
        </div>
        
        {!user && (
          <p className="text-xs text-gray-500 mt-3">Войдите, чтобы оставить реакцию</p>
        )}
      </motion.div>

      {/* Комментарии */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>💭</span> Комментарии ({comments.length})
        </h3>

        {/* Форма добавления комментария */}
        {user ? (
          <form onSubmit={handleAddComment} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Напишите комментарий..."
                className="input-field flex-1"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="btn-primary px-4 py-2 text-sm md:text-base disabled:opacity-50"
              >
                Отправить
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-500 mb-6">Войдите, чтобы оставить комментарий</p>
        )}

        {/* Список комментариев */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Пока нет комментариев</p>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-dark-accent p-4 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-white">{comment.username}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(comment.created_at), 'd MMM, HH:mm', { locale: ru })}
                  </span>
                </div>
                <p className="text-sm md:text-base text-gray-300">{comment.comment}</p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
