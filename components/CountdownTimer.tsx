'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="text-3xl sm:text-4xl md:text-7xl font-black text-white bg-dark-accent rounded-lg md:rounded-xl px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 border border-white/10">
          {String(value).padStart(2, '0')}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-real-gold/20 to-transparent rounded-lg md:rounded-xl pointer-events-none" />
      </div>
      <span className="text-xs sm:text-sm md:text-base text-gray-400 mt-1 md:mt-2 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-8">
      <TimeBlock value={timeLeft.days} label="Дней" />
      <TimeBlock value={timeLeft.hours} label="Часов" />
      <TimeBlock value={timeLeft.minutes} label="Минут" />
      <TimeBlock value={timeLeft.seconds} label="Секунд" />
    </div>
  );
}
