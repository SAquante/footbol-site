# Примеры использования API

## Аутентификация

### Регистрация нового пользователя

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "password": "password123"
  }'
```

Ответ:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "player1",
    "role": "PLAYER"
  }
}
```

### Вход в систему

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

## Управление матчами

### Получить все матчи

```bash
curl http://localhost:3000/api/matches
```

### Создать новый матч (требуется ADMIN)

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "match_datetime": "2025-11-05T20:00:00.000Z",
    "location": "Стадион Луч"
  }'
```

### Обновить матч (добавить составы и счет)

```bash
curl -X PUT http://localhost:3000/api/matches/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "completed",
    "score_real": 3,
    "score_barca": 2,
    "lineup_real": "Вася\nПетя\nКоля\nСаша\nДима",
    "lineup_barca": "Миша\nАлекс\nВиктор\nСергей\nАндрей"
  }'
```

### Удалить матч

```bash
curl -X DELETE http://localhost:3000/api/matches/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## PowerShell примеры

### Создание матча (PowerShell)

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_TOKEN"
}

$body = @{
    match_datetime = "2025-11-05T20:00:00.000Z"
    location = "Стадион Луч"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/matches" -Method Post -Headers $headers -Body $body
```

## JavaScript/Fetch примеры

### Вход и получение токена

```javascript
async function login() {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.token;
}
```

### Создание матча

```javascript
async function createMatch(token) {
  const response = await fetch('/api/matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      match_datetime: new Date('2025-11-05T20:00:00').toISOString(),
      location: 'Стадион Луч'
    })
  });
  
  return await response.json();
}
```

### Обновление матча с составами

```javascript
async function updateMatch(matchId, token) {
  const response = await fetch(`/api/matches/${matchId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      lineup_real: 'Вася\nПетя\nКоля',
      lineup_barca: 'Миша\nАлекс\nВиктор'
    })
  });
  
  return await response.json();
}
```

### Завершение матча (добавление счета)

```javascript
async function completeMatch(matchId, token, scoreReal, scoreBarca) {
  const response = await fetch(`/api/matches/${matchId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: 'completed',
      score_real: scoreReal,
      score_barca: scoreBarca
    })
  });
  
  return await response.json();
}
```
