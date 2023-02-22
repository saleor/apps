FROM python:3.10 as build

RUN pip install poetry'>=1.3.2,<1.4.0'

WORKDIR /app
COPY pyproject.toml poetry.lock /app/

RUN POETRY_VIRTUALENVS_CREATE=false poetry install --no-cache --only main

FROM python:3.10-slim as prod

ENV PYTHONUNBUFFERED 1

COPY --from=build /usr/local/bin/ /usr/local/bin/
COPY --from=build /usr/local/lib/python3.10/site-packages/ /usr/local/lib/python3.10/site-packages/

WORKDIR /app

COPY monitoring/ /app/monitoring/

EXPOSE 80

CMD ["uvicorn", "monitoring.app:app", "--host", "0.0.0.0", "--port", "80", "--no-access-log", "--forwarded-allow-ips", "*"]

FROM prod as dev

COPY pyproject.toml poetry.lock /app/
RUN POETRY_VIRTUALENVS_CREATE=false poetry install --no-cache --only dev
