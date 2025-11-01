'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при восстановлении пароля');
      }

      setMessage('Ваш пароль отправлен на указанный email адрес');
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <h1 className="text-center mb-8">
            <span className="text-white">ВОССТАНОВЛЕНИЕ ПАРОЛЯ</span>
          </h1>

          <div className="card">
            <p className="text-gray-400 mb-6 text-sm">
              Введите email, который вы указали при регистрации. Мы отправим на него ваш пароль.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm">
                  ✓ {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-real"
              >
                {loading ? 'Отправка...' : 'Восстановить пароль'}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-400">
                <Link href="/login" className="text-barca-blue hover:text-white transition-colors">
                  Вернуться ко входу
                </Link>
              </p>
              <p className="text-gray-400">
                <Link href="/register" className="text-real-gold hover:text-white transition-colors">
                  Создать новый аккаунт
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
