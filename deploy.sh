#!/bin/bash

# Скрипт для развертывания сайта на VPS Reg.ru
# Запускать на сервере от root

echo "🚀 Начинаем развертывание футбольного сайта..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для вывода успешных сообщений
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Функция для вывода предупреждений
warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Функция для вывода ошибок
error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. Обновление системы
echo "📦 Обновление системы..."
apt update && apt upgrade -y
success "Система обновлена"

# 2. Установка Node.js 20.x
echo "📥 Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
success "Node.js $(node -v) установлен"
success "npm $(npm -v) установлен"

# 3. Установка PM2
echo "📥 Установка PM2..."
npm install -g pm2
success "PM2 установлен"

# 4. Установка Nginx
echo "📥 Установка Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx
success "Nginx установлен и запущен"

# 5. Установка Git (если нужен)
echo "📥 Установка Git..."
apt install -y git
success "Git установлен"

# 6. Создание директории для проекта
echo "📁 Создание директории..."
mkdir -p /var/www/footbol-site
cd /var/www/footbol-site
success "Директория создана: /var/www/footbol-site"

# 7. Информация о следующих шагах
echo ""
warning "📋 СЛЕДУЮЩИЕ ШАГИ:"
echo "1. Загрузите файлы проекта в /var/www/footbol-site через FTP/SFTP"
echo "   Или склонируйте репозиторий: git clone <ваш-репо> ."
echo ""
echo "2. Перейдите в папку проекта:"
echo "   cd /var/www/footbol-site"
echo ""
echo "3. Установите зависимости:"
echo "   npm install"
echo ""
echo "4. Соберите проект:"
echo "   npm run build"
echo ""
echo "5. Скопируйте Nginx конфиг:"
echo "   cp nginx.conf /etc/nginx/sites-available/footbol-site"
echo "   ln -s /etc/nginx/sites-available/footbol-site /etc/nginx/sites-enabled/"
echo "   Замените 'ваш-домен.ru' на ваш реальный домен"
echo "   nginx -t && systemctl reload nginx"
echo ""
echo "6. Запустите приложение через PM2:"
echo "   pm2 start ecosystem.config.json"
echo "   pm2 startup"
echo "   pm2 save"
echo ""
echo "7. Установите SSL сертификат:"
echo "   apt install -y certbot python3-certbot-nginx"
echo "   certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru"
echo ""
success "🎉 Базовая настройка сервера завершена!"
