-- Инициализация базы данных SQLite для Amateur El Clásico

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'PLAYER' CHECK (role IN ('ADMIN', 'PLAYER')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы матчей
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_datetime DATETIME NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed')),
    score_real INTEGER,
    score_barca INTEGER,
    lineup_real TEXT,
    lineup_barca TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_matches_datetime ON matches(match_datetime);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER IF NOT EXISTS update_matches_timestamp 
AFTER UPDATE ON matches
BEGIN
    UPDATE matches SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Вставка первого администратора (пароль: admin123)
-- Хэш для пароля "admin123" сгенерирован с помощью bcrypt (rounds=10)
INSERT OR IGNORE INTO users (username, password_hash, role) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN');
