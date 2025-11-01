import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Amateur El Clásico',
  description: 'Официальный сайт любительских команд Реал Мадрид и Барселона',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
