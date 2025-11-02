'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  winner: 'real' | 'barca' | null;
}

export default function ConfettiEffect({ winner }: Props) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (!winner) return;

    const colors = winner === 'real' 
      ? ['#FFD700', '#FFA500', '#FFAA00', '#FFE55C']
      : ['#0052A5', '#DC0028', '#1E90FF', '#FF6B9D'];

    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5
    }));

    setConfetti(newConfetti);

    // Очищаем через 5 секунд
    const timeout = setTimeout(() => setConfetti([]), 5000);
    return () => clearTimeout(timeout);
  }, [winner]);

  if (confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ x: `${piece.x}vw`, y: `${piece.y}vh`, opacity: 1, rotate: 0 }}
          animate={{
            y: '110vh',
            rotate: 720,
            opacity: 0
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: piece.delay,
            ease: 'easeIn'
          }}
          style={{
            position: 'absolute',
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%'
          }}
        />
      ))}
    </div>
  );
}
