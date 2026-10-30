# Локальный запуск и развёртывание на Render

## Локально с нуля
1. Распакуйте проект или клонируйте репозиторий; откройте каталог с `manage.py`.
2. Создайте виртуальное окружение: `python3 -m venv .venv`; активируйте: `source .venv/bin/activate`.
3. Установите зависимости: `python -m pip install -r requirements.txt`.
4. Настройте переменные окружения (см. таблицу ниже). В исходном проекте `.env.example` пустой, а `settings.py` не читает `.env` автоматически. Устанавливайте переменные командой `export` или в настройках PyCharm.
5. Выполните `python manage.py migrate`.
6. Создайте тестового администратора `python manage.py createsuperuser`. При необходимости через `/admin/` создайте Category, Lab и учебные справочники. Не создавайте тестовые записи в рабочей БД.
7. Запустите `python manage.py runserver` и откройте `/healthz/`, `/admin/`, `/`, `/labs/`.
8. Для повторной проверки остановите сервер, запустите снова и убедитесь, что созданные тестовые записи сохранились.

## Переменные окружения
| Переменная | Назначение | Пример (НЕ секрет) |
|---|---|---|
| `DJANGO_SECRET_KEY` | Обязательный секрет подписи Django | `replace-with-unique-secret-generated-locally` |
| `DJANGO_DEBUG` | Режим отладки | `True` локально, `False` в облаке |
| `DJANGO_ALLOWED_HOSTS` | Разрешённые имена хостов через запятую | `localhost,127.0.0.1` или `my-app.onrender.com` |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Доверенные источники для CSRF с протоколом | `http://localhost:8000` или `https://my-app.onrender.com` |
| `DATABASE_URL` | Подключение к БД | локально можно не задавать (SQLite); в облаке задаётся приватно |

Пример команды локально: `export DJANGO_SECRET_KEY='replace-with-your-own-random-secret' DJANGO_DEBUG=True DJANGO_ALLOWED_HOSTS='localhost,127.0.0.1' DJANGO_CSRF_TRUSTED_ORIGINS='http://localhost:8000,http://127.0.0.1:8000'`. Настоящие секреты нельзя коммитить.

## Render: отдельно сборка, миграции, запуск и проверка
1. Создайте PostgreSQL в Render (при наличии доступного бесплатного варианта в вашей учётной записи). Сохраните **Internal Database URL только в защищённой переменной `DATABASE_URL` Web Service**, если база и Web Service находятся внутри сети Render. Не помещайте URL в документацию, git или скриншоты. Для подключения с локального компьютера Internal URL обычно недоступен — нужен внешний адрес и отдельные правила доступа.
2. Создайте Web Service из GitHub-репозитория, выберите Python-окружение и ветку. Рабочая директория — папка с `manage.py`.
3. Задайте в Environment: `DJANGO_SECRET_KEY` (случайный секрет), `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS=my-app.onrender.com`, `DJANGO_CSRF_TRUSTED_ORIGINS=https://my-app.onrender.com`, `DATABASE_URL` (приватный URL базы).
4. **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`. В исходном архиве `build.sh` пуст, поэтому не указывайте `./build.sh` в качестве рабочей команды.
5. **Миграции:** `python manage.py migrate` должны выполняться отдельно до обслуживания запросов (например, через доступный механизм команд/развёртывания Render). При отсутствии отдельной команды запускайте `python manage.py migrate && gunicorn config.wsgi:application` как временную учебную конфигурацию Start Command, учитывая, что миграции будут повторяться при каждом старте.
6. **Start Command** при отдельно настроенных миграциях: `gunicorn config.wsgi:application`.
7. Проверьте публичный `/healthz/` (JSON `{"status":"ok"}`), `/admin/login/`, CSS, вход и запросы API. В Render Logs проверяйте ошибки и успешный запуск Gunicorn.

**Важно:** SQLite (`db.sqlite3`) и PostgreSQL на Render — две разные базы. Команда `migrate` создаёт структуру, но не переносит локальные записи. В новой базе справочники и пользователи могут отсутствовать. Не добавляйте реальные секреты в отчёт. Настройки Render должны соответствовать доступным возможностям тарифного плана.
