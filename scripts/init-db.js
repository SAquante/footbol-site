const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '../data');
const dbPath = path.join(dbDir, 'elclasico.db');
const schemaPath = path.join(__dirname, '../database/schema.sql');

async function initDatabase() {
  try {
    console.log('🔄 Начинаем инициализацию базы данных SQLite...');
    
    // Создаем директорию data если её нет
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('📁 Создана директория data/');
    }

    // Удаляем старую БД если есть
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('🗑️  Удалена старая база данных');
    }

    // Инициализируем SQL.js
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    console.log('📦 Создана новая база данных в памяти');

    // Читаем SQL схему
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
    
    // Выполняем SQL команды
    db.run(schemaSQL);
    
    // Сохраняем БД в файл
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
    
    console.log('✅ База данных успешно инициализирована!');
    console.log('👤 Создан администратор: username = "admin", password = "admin123"');
    console.log('📍 Путь к БД:', dbPath);
    
    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    process.exit(1);
  }
}

initDatabase();
