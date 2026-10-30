# Типичные ошибки и диагностика

| Проблема | Признак и диагностика | Исправление |
|---|---|---|
| Не задан `DJANGO_SECRET_KEY` | `ImproperlyConfigured: Set DJANGO_SECRET_KEY` при запуске | Задайте переменную в терминале, PyCharm или Render Environment; не записывайте ключ в репозиторий. |
| Нет зависимостей | `ModuleNotFoundError: django` или `rest_framework` | Активируйте `.venv`; `python -m pip install -r requirements.txt`; проверьте `which python`. |
| База не готова | `no such table`, `relation does not exist` | Проверьте `DATABASE_URL`; выполните `python manage.py migrate` в нужной базе. |
| 400 DisallowedHost | `Invalid HTTP_HOST header` | Укажите домен без протокола в `DJANGO_ALLOWED_HOSTS`. |
| 403 CSRF Failed | POST/PATCH не проходит, в Network 403 | Проверьте сессию, `X-CSRFToken`, `DJANGO_CSRF_TRUSTED_ORIGINS` с `https://` для Render. |
| API 403 без входа | GET API возвращает Forbidden | Авторизуйтесь: DRF использует SessionAuthentication и IsAuthenticated. |
| Статика отсутствует | 404 на CSS/JS, неоформленные страницы | Проверьте `static/`, команду `python manage.py collectstatic --noinput`, логи WhiteNoise. |
| Нет свободных мест | POST `/api/submissions/ID/book/` возвращает 400 | Проверьте `free_slots` у Lab и статус сдачи `new`. |
| Неверный переход заявки | PATCH статуса возвращает 400 | Следуйте `new → progress → done`; обратный переход запрещён сериализатором. |
| Ошибка подключения к PostgreSQL | В логах `OperationalError` | Проверьте приватный `DATABASE_URL`, доступность БД и сетевое подключение Render. |
| Сборка Render не запускается | В build log видно ошибку выполнения `build.sh` | Файл `build.sh` в исходном архиве пуст; задайте явную Build Command из deployment.md. |

При диагностике сохраняйте только обезличенные сообщения ошибок и HTTP-коды; не копируйте пароли, токены, cookies и URL БД.
