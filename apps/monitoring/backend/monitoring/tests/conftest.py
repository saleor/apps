import pytest
from httpx import AsyncClient

from ..app import app


@pytest.fixture
def anyio_backend():
    return "asyncio", {"use_uvloop": True}


@pytest.fixture
def observability_app():
    return app


@pytest.fixture
async def client(observability_app):
    async with AsyncClient(app=observability_app, base_url="http://test") as client:
        yield client
