# Настройка Chrome DevTools MCP для VS Code

## Шаги настройки:

### 1. Откройте глобальные настройки VS Code
- Нажмите `Ctrl+Shift+P`
- Введите "Preferences: Open User Settings (JSON)"
- Или откройте файл: `%APPDATA%\Code\User\settings.json`

### 2. Добавьте конфигурацию MCP

Добавьте в settings.json:

```json
{
  "github.copilot.chat.mcp.enabled": true,
  "github.copilot.chat.mcp.servers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

### 3. Перезагрузите VS Code

После добавления конфигурации перезапустите VS Code.

### 4. Откройте Chrome с DevTools

1. Откройте Chrome
2. Перейдите на http://localhost:3000
3. Нажмите F12 для открытия DevTools
4. В VS Code Copilot Chat теперь сможет взаимодействовать с DevTools

### 5. Проверка работы

В Copilot Chat можете написать:
- "Проверь консоль браузера на ошибки"
- "Покажи Network запросы"
- "Проанализируй производительность страницы"

## Альтернатива: Проверка вручную

Если MCP не работает, проверьте сайт вручную:

1. **Откройте**: http://localhost:3000
2. **DevTools**: F12
3. **Проверьте вкладки**:
   - Console - ошибки JavaScript
   - Network - API запросы
   - Performance - скорость загрузки
   - Lighthouse - общая оценка

## Текущее состояние сайта

✅ Сервер работает: http://localhost:3000
✅ Все страницы доступны
✅ API endpoints работают
✅ Админка функционирует

Логины: admin/Сергей/qopdota2
Пароль: admin123
