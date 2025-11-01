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

// Создаем базовую структуру данных
const hashedPassword = bcrypt.hashSync('admin123', 10);

const initialData = {
  users: [
    {
      id: 1,
      username: 'admin',
      password_hash: hashedPassword,
      role: 'admin',
      created_at: new Date().toISOString()
    }
  ],
  matches: [],
  nextUserId: 2,
  nextMatchId: 1
};

fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
console.log('✓ Database initialized successfully');
console.log('✓ Admin user created (username: admin, password: admin123)');
console.log(`✓ Database file: ${dbPath}`);
