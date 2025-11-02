-- Создание суперадмина
-- Логин: Сергей
-- Пароль: qopdota2
-- Роль: superadmin

-- Примечание: Хеш пароля создан с использованием bcrypt (rounds=10)
-- Пароль: qopdota2
-- Хеш: $2a$10$YourHashWillBeHere (необходимо сгенерировать отдельно)

-- Для создания пользователя используйте API регистрации или выполните:
-- INSERT INTO users (username, password_hash, role) VALUES ('Сергей', 'HASH_HERE', 'superadmin');

-- ИЛИ используйте Node.js скрипт для генерации правильного хеша:

/*
const bcrypt = require('bcryptjs');
const password = 'qopdota2';
const hash = bcrypt.hashSync(password, 10);
console.log('Hash:', hash);

// Затем выполните SQL:
INSERT INTO users (username, password_hash, role, created_at) 
VALUES ('Сергей', 'сгенерированный_хеш', 'superadmin', NOW());
*/

-- Альтернативный способ через приложение:
-- 1. Зарегистрируйтесь через форму регистрации с логином "Сергей" и паролем "qopdota2"
-- 2. Затем обновите роль в базе данных:
UPDATE users SET role = 'superadmin' WHERE username = 'Сергей';
