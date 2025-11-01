import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'elclasico.json');

// Создаем директорию data если её нет
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

interface DbData {
  users: any[];
  matches: any[];
  nextUserId: number;
  nextMatchId: number;
  settings?: {
    siteName: string;
    database: string;
    theme: string;
    colors: {
      realMadrid: {
        primary: string;
        secondary: string;
      };
      barcelona: {
        primary: string;
        secondary: string;
      };
    };
  };
}

function getDb(): DbData {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }
  
  // Default database structure
  return {
    users: [],
    matches: [],
    nextUserId: 1,
    nextMatchId: 1
  };
}

function saveDb(data: DbData) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export const query = async (sql: string, params: any[] = []) => {
  try {
    const db = getDb();
    const sqlUpper = sql.trim().toUpperCase();
    
    // SELECT users
    if (sqlUpper.includes('SELECT') && sqlUpper.includes('FROM USERS')) {
      if (sqlUpper.includes('WHERE USERNAME')) {
        const username = params[0];
        const user = db.users.find(u => u.username === username);
        return { rows: user ? [user] : [] };
      }
      if (sqlUpper.includes('WHERE EMAIL')) {
        const email = params[0];
        const user = db.users.find(u => u.email === email);
        return { rows: user ? [user] : [] };
      }
      if (sqlUpper.includes('WHERE ID')) {
        const id = parseInt(params[0], 10);
        const user = db.users.find(u => u.id === id);
        return { rows: user ? [user] : [] };
      }
      return { rows: db.users };
    }
    
    // SELECT matches
    if (sqlUpper.includes('SELECT') && sqlUpper.includes('FROM MATCHES')) {
      if (sqlUpper.includes('WHERE ID')) {
        const id = parseInt(params[0], 10);
        const match = db.matches.find(m => m.id === id);
        return { rows: match ? [match] : [] };
      }
      return { rows: db.matches };
    }
    
    // INSERT user
    if (sqlUpper.includes('INSERT INTO USERS')) {
      const [username, email, password_hash, plain_password, role] = params;
      const newUser = {
        id: db.nextUserId++,
        username,
        email: email || '',
        password_hash,
        plain_password: plain_password || '',
        role: role || 'PLAYER',
        created_at: new Date().toISOString()
      };
      db.users.push(newUser);
      saveDb(db);
      return { rows: [newUser] };
    }
    
    // INSERT match
    if (sqlUpper.includes('INSERT INTO MATCHES')) {
      // Извлекаем названия полей из SQL запроса
      const fieldsMatch = sql.match(/INSERT INTO MATCHES\s*\(([^)]+)\)/i);
      if (!fieldsMatch) {
        throw new Error('Invalid INSERT query format');
      }
      
      const fieldNames = fieldsMatch[1].split(',').map(f => f.trim());
      const newMatch: any = {
        id: db.nextMatchId++,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Динамически заполняем поля из params
      fieldNames.forEach((fieldName, index) => {
        newMatch[fieldName] = params[index];
      });
      
      db.matches.push(newMatch);
      saveDb(db);
      return { rows: [newMatch] };
    }
    
    // UPDATE match
    if (sqlUpper.includes('UPDATE MATCHES')) {
      const matchId = parseInt(params[params.length - 1], 10);
      const matchIndex = db.matches.findIndex(m => m.id === matchId);
      
      if (matchIndex !== -1) {
        // Парсим SET часть запроса для обновления полей
        const setPart = sql.match(/SET\s+(.+?)\s+WHERE/i)?.[1] || '';
        const setFields = setPart.split(',').map(f => f.trim());
        
        let paramIndex = 0;
        setFields.forEach(field => {
          const fieldName = field.split('=')[0].trim().toLowerCase();
          const value = params[paramIndex++];
          
          if (fieldName.includes('match_datetime')) {
            db.matches[matchIndex].match_datetime = value;
          } else if (fieldName.includes('location')) {
            db.matches[matchIndex].location = value;
          } else if (fieldName.includes('status')) {
            db.matches[matchIndex].status = value;
          } else if (fieldName.includes('score_real')) {
            db.matches[matchIndex].score_real = value;
          } else if (fieldName.includes('score_barca')) {
            db.matches[matchIndex].score_barca = value;
          } else if (fieldName.includes('lineup_real')) {
            db.matches[matchIndex].lineup_real = value;
          } else if (fieldName.includes('lineup_barca')) {
            db.matches[matchIndex].lineup_barca = value;
          } else if (fieldName.includes('coach_real')) {
            db.matches[matchIndex].coach_real = value;
          } else if (fieldName.includes('coach_barca')) {
            db.matches[matchIndex].coach_barca = value;
          } else if (fieldName.includes('goals_real')) {
            db.matches[matchIndex].goals_real = value;
          } else if (fieldName.includes('goals_barca')) {
            db.matches[matchIndex].goals_barca = value;
          } else if (fieldName.includes('conceded_real')) {
            db.matches[matchIndex].conceded_real = value;
          } else if (fieldName.includes('conceded_barca')) {
            db.matches[matchIndex].conceded_barca = value;
          } else if (fieldName.includes('points_real')) {
            db.matches[matchIndex].points_real = value;
          } else if (fieldName.includes('points_barca')) {
            db.matches[matchIndex].points_barca = value;
          }
        });
        
        db.matches[matchIndex].updated_at = new Date().toISOString();
        saveDb(db);
        return { rows: [db.matches[matchIndex]] };
      }
      return { rows: [] };
    }
    
    // UPDATE users
    if (sqlUpper.includes('UPDATE USERS')) {
      const userId = parseInt(params[params.length - 1], 10);
      const userIndex = db.users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        // Обновляем пользователя (роль, имя, пароль, plain_password)
        // params = [role, username, password_hash, plain_password, userId]
        const [role, username, password_hash, plain_password] = params;
        db.users[userIndex].role = role;
        db.users[userIndex].username = username;
        db.users[userIndex].password_hash = password_hash;
        db.users[userIndex].plain_password = plain_password;
        saveDb(db);
        return { rows: [db.users[userIndex]] };
      }
      return { rows: [] };
    }
    
    // DELETE match
    if (sqlUpper.includes('DELETE FROM MATCHES')) {
      const matchId = parseInt(params[0], 10);
      const matchIndex = db.matches.findIndex(m => m.id === matchId);
      if (matchIndex !== -1) {
        const deletedMatch = db.matches[matchIndex];
        db.matches.splice(matchIndex, 1);
        saveDb(db);
        return { rows: [{ id: deletedMatch.id }] };
      }
      return { rows: [] };
    }
    
    // DELETE users
    if (sqlUpper.includes('DELETE FROM USERS')) {
      const userId = parseInt(params[0], 10);
      const userIndex = db.users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        const deletedUser = db.users[userIndex];
        db.users.splice(userIndex, 1);
        saveDb(db);
        return { rows: [deletedUser] };
      }
      return { rows: [] };
    }
    
    return { rows: [] };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export default { query, getDb, saveDb };
