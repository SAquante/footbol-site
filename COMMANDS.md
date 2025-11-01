# 📝 Шпаргалка команд для сервера

## После первой установки на сервер:

```bash
# 1. Переход в папку проекта
cd /var/www/footbol-site

# 2. Установка зависимостей
npm install

# 3. Сборка проекта
npm run build

# 4. Настройка Nginx
cp nginx.conf /etc/nginx/sites-available/footbol-site
nano /etc/nginx/sites-available/footbol-site  # Замените домен
ln -s /etc/nginx/sites-available/footbol-site /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 5. Запуск приложения
pm2 start ecosystem.config.json
pm2 startup
pm2 save

# 6. SSL сертификат
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

---

## Обновление сайта:

```bash
cd /var/www/footbol-site
git pull                    # Если используете Git
npm install                 # Обновить зависимости
npm run build              # Пересобрать
pm2 restart footbol-site   # Перезапустить
```

Или используйте:
```bash
cd /var/www/footbol-site
./update.sh
```

---

## Управление приложением (PM2):

```bash
pm2 status                 # Статус всех приложений
pm2 logs footbol-site      # Логи в реальном времени
pm2 logs --lines 100       # Последние 100 строк
pm2 restart footbol-site   # Перезапуск
pm2 stop footbol-site      # Остановка
pm2 start footbol-site     # Запуск
pm2 delete footbol-site    # Удаление
pm2 save                   # Сохранить список приложений
```

---

## Управление Nginx:

```bash
systemctl status nginx     # Статус
systemctl start nginx      # Запуск
systemctl stop nginx       # Остановка
systemctl restart nginx    # Перезапуск
systemctl reload nginx     # Перезагрузка конфигурации
nginx -t                   # Проверка конфигурации
```

---

## Просмотр логов:

```bash
# Логи приложения
pm2 logs footbol-site

# Логи Nginx
tail -f /var/log/nginx/footbol-site_access.log
tail -f /var/log/nginx/footbol-site_error.log

# Последние 50 строк
tail -50 /var/log/nginx/footbol-site_error.log
```

---

## Мониторинг сервера:

```bash
htop                       # Мониторинг процессов (Ctrl+C для выхода)
df -h                      # Свободное место на диске
free -h                    # Использование памяти
netstat -tulpn | grep :3000  # Проверка порта приложения
netstat -tulpn | grep :80    # Проверка порта Nginx
```

---

## Обновление SSL сертификата:

```bash
certbot renew              # Обновить все сертификаты
certbot renew --dry-run    # Тестовое обновление
certbot certificates       # Список сертификатов
```

---

## Firewall (UFW):

```bash
ufw status                 # Статус
ufw enable                 # Включить
ufw disable                # Выключить
ufw allow 22               # Разрешить SSH
ufw allow 80               # Разрешить HTTP
ufw allow 443              # Разрешить HTTPS
```

---

## Работа с файлами:

```bash
nano файл.txt              # Редактировать (Ctrl+X для выхода)
cat файл.txt               # Показать содержимое
ls -la                     # Список файлов
cd /путь/к/папке           # Перейти в папку
pwd                        # Текущая папка
mkdir папка                # Создать папку
rm файл.txt                # Удалить файл
rm -rf папка               # Удалить папку
cp файл1 файл2             # Копировать
mv файл1 файл2             # Переместить/переименовать
```

---

## Поиск проблем:

```bash
# Приложение не запускается
pm2 logs footbol-site --err

# 502 Bad Gateway
pm2 status
pm2 restart footbol-site

# Проверить, слушает ли приложение порт 3000
netstat -tulpn | grep :3000

# Проверить процессы Node.js
ps aux | grep node

# Убить процесс (если завис)
kill -9 <PID>
```

---

## Резервное копирование:

```bash
# Создать бэкап базы данных
cd /var/www/footbol-site
cp data/elclasico.json data/elclasico.backup.json

# Создать архив всего проекта
cd /var/www
tar -czf footbol-site-backup-$(date +%Y%m%d).tar.gz footbol-site

# Скачать бэкап через SFTP или:
scp root@ваш_IP:/var/www/footbol-site-backup-*.tar.gz ./
```

---

## Обновление Node.js:

```bash
# Установить nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Установить последнюю LTS версию
nvm install --lts
nvm use --lts

# Проверить версию
node -v
```

---

## Очистка дискового пространства:

```bash
# Очистка старых логов
pm2 flush

# Очистка кэша npm
npm cache clean --force

# Удаление старых логов Nginx
rm /var/log/nginx/*.log.*.gz

# Очистка системного кэша
apt clean
apt autoremove
```

---

## Безопасность:

```bash
# Изменить пароль root
passwd

# Создать нового пользователя
adduser username
usermod -aG sudo username

# Отключить вход root по SSH (после создания другого пользователя)
nano /etc/ssh/sshd_config
# Найдите: PermitRootLogin yes
# Замените на: PermitRootLogin no
systemctl restart ssh
```

---

## Автоматические обновления безопасности:

```bash
apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

---

## Перезагрузка сервера:

```bash
reboot                     # Немедленная перезагрузка
shutdown -r +5             # Перезагрузка через 5 минут
shutdown -r now            # Перезагрузка сейчас
```

После перезагрузки PM2 автоматически запустит приложение (если настроен `pm2 startup`)
