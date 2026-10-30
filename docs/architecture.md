# Архитектура и структура

```mermaid
flowchart LR
  B[Браузер: HTML / JS / CSS] -->|HTTP(S), cookies, CSRF| W[Gunicorn / Django WSGI]
  W --> D[Django: urls, views, templates]
  D --> R[Django REST Framework: /api/]
  D --> O[Django ORM]
  R --> O
  O --> DB[(SQLite локально / PostgreSQL Render)]
  W --> S[WhiteNoise: /static/]
  S --> B
  D --> B
```

Граница клиента — браузер, выполняющий запросы к серверу; сессии и проверка CSRF обрабатываются Django. `config/urls.py` объединяет приложения. ORM обращается к базе, выбранной через `DATABASE_URL` (без неё SQLite). Статические файлы обслуживаются WhiteNoise при соответствующей сборке.

| Путь | Назначение |
|---|---|
| `manage.py` | Управление Django, миграции и локальный сервер |
| `config/settings.py` | Настройки, переменные окружения, БД, статика, DRF |
| `config/urls.py` | Корневые маршруты |
| `config/wsgi.py`, `config/asgi.py` | Точки входа серверов |
| `accounts/` | Профиль, факультеты, группы, курсы, формы |
| `tickets/` | Заявки и категории, API |
| `labs/` | Лабораторные, сдачи, история и API |
| `dashboard/` | Представления статистических страниц |
| `templates/` | HTML-шаблоны |
| `static/` | Исходные CSS/JS и другие ресурсы |
| `staticfiles/` | Результат `collectstatic` (генерируемая папка) |
| `requirements.txt` | Зафиксированные зависимости |
| `build.sh` | Присутствует, но пуст в исходном архиве |
| `.env.example` | Присутствует, но пуст в исходном архиве; перечень переменных см. deployment.md |

Не изменяйте конфигурацию для выполнения только документационной работы.
