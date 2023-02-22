from pathlib import Path
from urllib.parse import urlparse

from .backends import AplBackend, FileAplBackend, MemAplBackend, RestAplBackend
from .common import AplEntity, NotConfiguredError


class AplClient:
    def __init__(self):
        self._backend: AplBackend | None = None

    @staticmethod
    def parse_settings_url(url: str) -> AplBackend:
        parts = urlparse(url)
        if parts.scheme == "file":
            path = Path(url.removeprefix("file://"))
            return FileAplBackend(path)
        elif parts.scheme == "mem":
            return MemAplBackend()
        elif parts.scheme in ["http", "https"]:
            token = parts.username or ""
            port = "" if parts.port is None else f":{parts.port}"
            apl_url = f"{parts.scheme}://{parts.hostname}{port}{parts.path}"
            return RestAplBackend(apl_url=apl_url, token=token)
        raise NotImplementedError()

    def setup(self, url: str):
        self._backend = self.parse_settings_url(url)

    @property
    def backend(self) -> AplBackend:
        if self._backend is None:
            raise NotConfiguredError(
                "Run `apl_client.setup(...)` before using apl_client"
            )
        return self._backend

    async def get(self, key: str) -> AplEntity:
        return await self.backend.get(key)

    async def set(self, key: str, value: AplEntity):
        return await self.backend.set(key, value)

    async def delete(self, key: str):
        return await self.backend.delete(key)

    async def get_all(self, page_size=100):
        async for item in self.backend.get_all(page_size=page_size):
            yield item
