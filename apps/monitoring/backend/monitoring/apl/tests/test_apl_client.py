from pathlib import Path

import pytest

from ..backends import FileAplBackend, MemAplBackend, RestAplBackend
from ..common import AplKeyError, NotConfiguredError
from ..wrapper import AplClient

pytestmark = pytest.mark.anyio


@pytest.fixture
def mem_apl_client():
    client = AplClient()
    client.setup("mem://")
    return client


@pytest.fixture
def file_apl_client():
    path_string = ".test_fileApl.json"
    apl_file = Path(path_string)
    client = AplClient()
    client.setup(f"file://{path_string}")
    yield client
    if apl_file.exists():
        apl_file.unlink()


@pytest.fixture
def rest_apl_client():
    client = AplClient()
    client.setup("https://access.token@apl.example.com")
    return client


apl_clients = ["mem_apl_client", "file_apl_client", "rest_apl_client"]


def test_parse_settings_url_mem_backend():
    backend = AplClient.parse_settings_url("mem://")
    assert isinstance(backend, MemAplBackend)


@pytest.mark.parametrize(
    "url,path",
    [
        ("file://.fileApl.json", ".fileApl.json"),
        ("file://path/to/fileApl.json", "path/to/fileApl.json"),
    ],
)
def test_parse_settings_url_file_backend(url, path):
    backend = AplClient.parse_settings_url(url)
    assert isinstance(backend, FileAplBackend)
    assert backend.path == Path(path)


@pytest.mark.parametrize(
    "url,apl_url,token",
    [
        (
            "https://86b0bb44ee7e488d9cc3949b78b0a3ac.6dnRhRlMhhtjHXwBh3f3lJkmz4opGX7EInHKvxlMyPq6T5Y7@apl.example.com",
            "https://apl.example.com",
            "86b0bb44ee7e488d9cc3949b78b0a3ac.6dnRhRlMhhtjHXwBh3f3lJkmz4opGX7EInHKvxlMyPq6T5Y7",
        ),
        (
            "http://access.token@localhost:8000",
            "http://localhost:8000",
            "access.token",
        ),
    ],
)
def test_parse_settings_url_rest_backend(url, apl_url, token):
    backend = AplClient.parse_settings_url(url)
    assert isinstance(backend, RestAplBackend)
    assert backend.apl_url == apl_url
    assert backend.token == token


def test_parse_settings_url_not_supported_backend():
    with pytest.raises(NotImplementedError):
        AplClient.parse_settings_url("new-schema://path")


async def test_apl_client_no_setup():
    client = AplClient()
    with pytest.raises(NotConfiguredError):
        await client.get("shop.saleor.cloud")


@pytest.mark.vcr
@pytest.mark.parametrize("client_fixture", apl_clients)
async def test_apl_get(client_fixture, entity, request):
    apl_client: AplClient = request.getfixturevalue(client_fixture)
    await apl_client.set(entity.saleor_api_url, entity)
    entity_from_client = await apl_client.get(entity.saleor_api_url)
    assert entity_from_client == entity.copy()


@pytest.mark.vcr
@pytest.mark.parametrize("client_fixture", apl_clients)
async def test_apl_key_error(client_fixture, request):
    apl_client: AplClient = request.getfixturevalue(client_fixture)
    with pytest.raises(AplKeyError):
        await apl_client.get("https://non.existing.domain")


@pytest.mark.vcr
@pytest.mark.parametrize("client_fixture", apl_clients)
async def test_apl_delete(client_fixture, entity, request):
    apl_client: AplClient = request.getfixturevalue(client_fixture)
    await apl_client.set(entity.saleor_api_url, entity)
    await apl_client.delete(entity.saleor_api_url)
    with pytest.raises(AplKeyError):
        await apl_client.get(entity.saleor_api_url)


@pytest.mark.vcr
@pytest.mark.parametrize("client_fixture", apl_clients)
async def test_apl_delete_non_existing(client_fixture, request):
    apl_client: AplClient = request.getfixturevalue(client_fixture)
    with pytest.raises(AplKeyError):
        await apl_client.delete("https://non.existing.domain")


@pytest.mark.vcr
@pytest.mark.parametrize("client_fixture", apl_clients)
async def test_apl_get_all(client_fixture, entities_factory, request):
    apl_client: AplClient = request.getfixturevalue(client_fixture)
    entities = entities_factory()
    for entity in entities:
        await apl_client.set(entity.saleor_api_url, entity)
    apl_entities = [entity async for entity in apl_client.get_all(page_size=2)]
    assert apl_entities == [(entity.saleor_api_url, entity) for entity in entities]
