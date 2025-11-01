'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/schedule', label: 'Расписание' },
    { href: '/stats', label: 'Статистика' },
  ];

  const isActive = (path: string) => pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-primary/90 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Лого */}
          <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-xl md:text-2xl font-black"
            >
              <span className="text-gradient-real">EL</span>
              {' '}
              <span className="text-gradient-barca">CLÁSICO</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
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

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-white"
            />
            <motion.span
              animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-0.5 bg-white"
            />
            <motion.span
              animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-white"
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-dark-primary border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`block py-3 px-4 rounded-lg text-base font-semibold transition-colors ${
                    isActive(link.href)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  {(user.role === 'admin' || user.role === 'superadmin') && (
                    <Link
                      href="/admin"
                      onClick={closeMobileMenu}
                      className="block py-3 px-4 rounded-lg text-base font-semibold text-real-gold hover:bg-white/5 transition-colors"
                    >
                      Админ-панель
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="w-full text-left py-3 px-4 rounded-lg text-base font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Выход ({user.username})
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="block py-3 px-4 rounded-lg text-base font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Вход
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="block py-3 px-4 rounded-lg text-base font-semibold text-center bg-gradient-to-r from-real-gold to-yellow-400 text-dark-primary hover:opacity-90 transition-opacity"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
