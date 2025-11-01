'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/schedule', label: 'Расписание' },
    { href: '/stats', label: 'Статистика' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-primary/90 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Лого */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-black"
            >
              <span className="text-gradient-real">EL</span>
              {' '}
              <span className="text-gradient-barca">CLÁSICO</span>
            </motion.div>
          </Link>

          {/* Навигация */}
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="activeNav"
                    className="h-0.5 bg-gradient-to-r from-real-gold via-white to-barca-blue mt-1"
                  />
                )}
              </Link>
            ))}

            {user ? (
              <>
                {(user.role === 'admin' || user.role === 'superadmin') && (
                  <Link
                    href="/admin"
                    className="text-sm font-semibold text-real-gold hover:text-white transition-colors"
                  >
                    Админ-панель
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  Выход ({user.username})
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  Вход
                </Link>
                <Link
                  href="/register"
                  className="btn-real text-sm"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
