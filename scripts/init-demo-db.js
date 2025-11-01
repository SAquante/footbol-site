const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'elclasico.json');

// Создаем директорию если её нет
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✓ Created data directory');
}

const hashedPassword = bcrypt.hashSync('admin123', 10);

// Создаём тестовые данные с матчами
const demoData = {
  users: [
    {
      id: 1,
      username: 'admin',
      password_hash: hashedPassword,
      role: 'admin',
      created_at: new Date().toISOString()
    }
  ],
  matches: [
    // Прошедшие матчи
    {
      id: 1,
      match_datetime: new Date(2025, 9, 15, 18, 0).toISOString(),
      location: 'Стадион "Центральный"',
      status: 'completed',
      score_real: 3,
      score_barca: 2,
      home_scores: '',
      away_scores: '',
      lineup_real: 'Вратарь: Иванов\nЗащита: Петров, Сидоров, Козлов\nПолузащита: Смирнов, Новиков, Морозов\nНападение: Соколов, Волков, Лебедев',
      lineup_barca: 'Вратарь: García\nЗащита: López, Martínez, Rodríguez\nПолузащита: Fernández, González, Sánchez\nНападение: Torres, Ramírez, Díaz',
      home_lineup: '',
      away_lineup: '',
      created_at: new Date(2025, 9, 10).toISOString(),
      updated_at: new Date(2025, 9, 15, 20, 0).toISOString()
    },
    {
      id: 2,
      match_datetime: new Date(2025, 8, 20, 16, 30).toISOString(),
      location: 'Арена "Спартак"',
      status: 'completed',
      score_real: 1,
      score_barca: 1,
      home_scores: '',
      away_scores: '',
      lineup_real: 'Вратарь: Иванов\nЗащита: Петров, Сидоров, Козлов, Егоров\nПолузащита: Смирнов, Новиков\nНападение: Соколов, Волков, Лебедев',
      lineup_barca: 'Вратарь: García\nЗащита: López, Martínez, Rodríguez, Hernández\nПолузащита: Fernández, González\nНападение: Torres, Ramírez, Díaz',
      home_lineup: '',
      away_lineup: '',
      created_at: new Date(2025, 8, 15).toISOString(),
      updated_at: new Date(2025, 8, 20, 18, 30).toISOString()
    },
    {
      id: 3,
      match_datetime: new Date(2025, 7, 10, 19, 0).toISOString(),
      location: 'Стадион "Олимпийский"',
      status: 'completed',
      score_real: 2,
      score_barca: 4,
      home_scores: '',
      away_scores: '',
      lineup_real: 'Вратарь: Иванов\nЗащита: Петров, Сидоров, Козлов\nПолузащита: Смирнов, Новиков, Морозов, Егоров\nНападение: Соколов, Волков, Лебедев',
      lineup_barca: 'Вратарь: García\nЗащита: López, Martínez, Rodríguez\nПолузащита: Fernández, González, Sánchez, Hernández\nНападение: Torres, Ramírez, Díaz',
      home_lineup: '',
      away_lineup: '',
      created_at: new Date(2025, 7, 5).toISOString(),
      updated_at: new Date(2025, 7, 10, 21, 0).toISOString()
    },
    // Будущий матч
    {
      id: 4,
      match_datetime: new Date(2025, 10, 15, 17, 0).toISOString(),
      location: 'Стадион "Центральный"',
      status: 'scheduled',
      score_real: null,
      score_barca: null,
      home_scores: '',
      away_scores: '',
      lineup_real: 'Вратарь: Иванов И.\n\nЗащита:\n• Петров П. (капитан)\n• Сидоров С.\n• Козлов К.\n• Егоров Е.\n\nПолузащита:\n• Смирнов С.\n• Новиков Н.\n• Морозов М.\n\nНападение:\n• Соколов С.\n• Волков В.\n• Лебедев Л.',
      lineup_barca: 'Вратарь: García J.\n\nЗащита:\n• López M. (капитан)\n• Martínez A.\n• Rodríguez C.\n• Hernández D.\n\nПолузащита:\n• Fernández L.\n• González R.\n• Sánchez P.\n\nНападение:\n• Torres F.\n• Ramírez E.\n• Díaz G.',
      home_lineup: '',
      away_lineup: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  nextUserId: 2,
  nextMatchId: 5
};

fs.writeFileSync(dbPath, JSON.stringify(demoData, null, 2), 'utf-8');
console.log('✓ Database initialized with demo data');
console.log('✓ Admin user: admin / admin123');
console.log('✓ 3 completed matches added');
console.log('✓ 1 upcoming match added');
console.log(`✓ Database file: ${dbPath}`);
