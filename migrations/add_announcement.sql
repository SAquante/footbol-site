-- Миграция: Добавление поля "Анонс" в таблицу matches
-- Дата: 2025-11-02
-- Описание: Добавляет колонку announcement для хранения анонсов матчей

-- Добавление колонки announcement в таблицу matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS announcement TEXT;

-- Добавление комментария к колонке
COMMENT ON COLUMN matches.announcement IS 'Анонс матча для отображения на главной странице';

-- Примечание: Колонка может быть NULL, так как не все матчи обязательно имеют анонс

-- Для применения миграции выполните:
-- psql -U postgres -d elclasico -f migrations/add_announcement.sql
