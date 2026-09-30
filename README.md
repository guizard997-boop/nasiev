# nasieeeev — Social Links + Admin Panel

Современный сайт-переходник (link-in-bio) в чёрно-белом стиле с админ-панелью.

## Возможности

- Публичная страница со всеми ссылками
- Админ-панель (`/admin`) — добавление, редактирование и удаление ссылок
- Иконки: Instagram, TikTok, YouTube, X, Telegram, VK, GitHub, Discord
- Пароль защищает админку

## Локальный запуск

```bash
npm install
ADMIN_PASSWORD=твой_пароль npm start
```

Открой:
- Сайт: http://localhost:3000
- Админка: http://localhost:3000/admin

По умолчанию пароль: `admin123`

## Деплой на Railway

1. Создай репозиторий на GitHub и залей все файлы
2. Зайди на [railway.com/new](https://railway.com/new) → **Deploy from GitHub repo**
3. После деплоя зайди в сервис → **Variables** и добавь:
   ```
   ADMIN_PASSWORD=твой_секретный_пароль
   ```
4. Нажми **Generate Domain**

Админка будет по адресу: `https://твой-домен.up.railway.app/admin`

### Важно про сохранение данных

Файловая система Railway по умолчанию временная (данные могут сброситься при редеплое).

Чтобы ссылки сохранялись навсегда:
1. В Railway → твой сервис → **Settings** → **Volumes**
2. Добавь Volume с путём монтирования: `/app/data`
3. Перезапусти сервис

## Структура

```
├── server.js          # Express сервер + API
├── package.json
├── data/
│   └── links.json     # База ссылок
└── public/
    ├── index.html     # Публичная страница
    └── admin.html     # Админ-панель
```
