# Django Auth — учебное веб-приложение

Проект объединяет учебный профиль и справочники, управление заявками (`tickets`) и сдачу лабораторных работ (`labs`). Документация составлена по фактическим файлам проекта без изменения программной логики.

## Возможности
- Профиль пользователя, факультеты, группы и курсы; изменение учебных справочников доступно группе «Методист».
- Заявки: просмотр категорий, создание и изменение собственных заявок; статусы `new → progress → done`.
- Лабораторные работы: просмотр лабораторных, сдача работы, запись на защиту, принятие преподавателем и история действий.
- Django Admin и JSON REST API. Для API используется аутентификация через сессию; изменяющие запросы требуют CSRF.

## Технологии
Python, Django 6.1.2, Django REST Framework 3.18.3, SQLite локально / PostgreSQL при заданном `DATABASE_URL`, Gunicorn, WhiteNoise; HTML/CSS/JS и статические ресурсы из проекта. Точные версии пакетов: `requirements.txt`.

## Требования
Python версии, совместимой с Django 6.1.2 (проверьте требования установленного Django); pip, доступ к терминалу. Для облака — PostgreSQL и Web Service. Команды ниже приведены для macOS/Linux; Windows: `.venv\Scripts\activate`.

## Быстрый старт (macOS/Linux)
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
export DJANGO_SECRET_KEY='replace-with-a-long-random-local-secret'
export DJANGO_DEBUG=True
export DJANGO_ALLOWED_HOSTS='127.0.0.1,localhost'
export DJANGO_CSRF_TRUSTED_ORIGINS='http://127.0.0.1:8000,http://localhost:8000'
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
Откройте `http://127.0.0.1:8000/`, `/profile/`, `/labs/`, `/admin/` или `/healthz/`. Для заполнения справочников используйте Django Admin; существующие данные в новом SQLite отсутствуют. **Важно:** текущий `settings.py` читает переменные через `os.environ`, но **не загружает `.env` автоматически**. Для локального запуска установите переменные через `export` (либо настройте переменные окружения в PyCharm).

## Проверка
`GET /healthz/` должен вернуть `{"status":"ok"}`. Войдите через `/admin/login/`, проверьте страницы и авторизованный `GET /api/categories/`. Для POST/PATCH нужен CSRF-токен; пример операций и ограничений — в [docs/api.md](docs/api.md). Проверяйте создание и повторное чтение записей только в своей тестовой базе.

## Документация
- [Архитектура и структура](docs/architecture.md)
- [Модели БД](docs/database.md)
- [REST API](docs/api.md)
- [Локальный запуск и Render](docs/deployment.md)
- [Ошибки и диагностика](docs/troubleshooting.md)
- [Проверка воспроизводимости](docs/reproducibility.md)

## Ограничения
Файл `build.sh` в исходном архиве пустой, как и `.env.example`; это исходное состояние сохранено. На Render необходимо явно указать build/start команды из `docs/deployment.md`. SQLite и облачная PostgreSQL не синхронизируются автоматически. Не публикуйте реальные секреты и URL подключения к базе.
