# Yandex Music Service

Современный музыкальный сервис с интеграцией Yandex Music API, построенный на React.js и Node.js.

## Архитектура

### Фронтенд (React + Vite)
- **Технологии**: React 18, Vite, React Router, Tailwind CSS, React Icons
- **Компоненты**: 
  - Главная страница с поиском и рекомендациями
  - Музыкальный плеер (глобальный)
  - Поиск с автодополнением
  - Избранное
  - Плейлисты
  - Профиль пользователя

### Бэкенд (Node.js + Express)
- **Технологии**: Node.js, Express, yandex-music (Python subprocess)
- **Функции**:
  - Проксирование Yandex Music API
  - Аутентификация через Supabase
  - CRUD операции для избранного и плейлистов
  - Кэширование запросов

### База данных (Supabase)
- **Таблицы**:
  - `users` - профили пользователей
  - `favorites` - избранные треки
  - `playlists` - пользовательские плейлисты

## Установка и запуск

### Предварительные требования
- Node.js 18+
- Python 3.8+
- Supabase аккаунт

### 1. Клонирование и установка зависимостей

```bash
# Установка зависимостей фронтенда
cd frontend
npm install

# Установка зависимостей бэкенда
cd ../backend
npm install

# Установка Python зависимостей
pip install yandex-music
```

### 2. Настройка переменных окружения

Создайте файлы `.env` в папках `frontend` и `backend`:

**frontend/.env**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3001
```

**backend/.env**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
YANDEX_MUSIC_TOKEN=your_yandex_music_token
PORT=3001
```

### 3. Настройка Supabase

1. Создайте проект в Supabase
2. Создайте таблицы:

```sql
-- Таблица пользователей
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Таблица избранного
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица плейлистов
CREATE TABLE playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tracks JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Запуск приложения

```bash
# Запуск бэкенда
cd backend
npm run dev

# Запуск фронтенда (в новом терминале)
cd frontend
npm run dev
```

Приложение будет доступно по адресу http://localhost:5173

## Деплой

### Фронтенд (Vercel)
1. Подключите репозиторий к Vercel
2. Настройте переменные окружения в Vercel
3. Деплой автоматический при push в main

### Бэкенд (Render/Heroku)
1. Подключите репозиторий к Render/Heroku
2. Настройте переменные окружения
3. Установите Python buildpack для yandex-music

## API Endpoints

### Музыка
- `GET /api/search?q=query&type=track` - поиск треков
- `GET /api/track/:id` - информация о треке
- `GET /api/play/:id` - получение ссылки на воспроизведение

### Пользователь
- `GET /api/favorites` - избранные треки
- `POST /api/favorites` - добавить в избранное
- `DELETE /api/favorites/:id` - удалить из избранного
- `GET /api/playlists` - плейлисты пользователя
- `POST /api/playlists` - создать плейлист
- `PUT /api/playlists/:id` - обновить плейлист
- `DELETE /api/playlists/:id` - удалить плейлист

## Особенности

- **Безопасность**: API токены хранятся на сервере
- **Кэширование**: Redis для кэширования API запросов
- **Responsive**: Адаптивный дизайн для всех устройств
- **Тёмная тема**: Минималистичный дизайн
- **Оффлайн**: Fallback контент при недоступности API