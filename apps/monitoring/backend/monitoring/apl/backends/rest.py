import json
from base64 import urlsafe_b64encode
from contextlib import asynccontextmanager
from urllib.parse import urlparse

import httpx
from pydantic import BaseModel

from ..common import AplEntity, AplError, AplKeyError
from .base import AplBackend


class AplPage(BaseModel):
    count: int
    next: str | None
    previous: str | None
    results: list[AplEntity]


class RestAplBackend(AplBackend):
    def __init__(self, apl_url: str, token: str):
        self.apl_url = apl_url
        self.token = token

    @property
    def headers(self):
        return {"Authorization": f"Bearer {self.token}"}

    @staticmethod
    def map_apl_entity(value: AplEntity):
        return {
            "saleor_app_id": value.app_id,
            "saleor_api_url": value.saleor_api_url,
            "jwks": json.dumps(value.jwks),
            "domain": urlparse(value.saleor_api_url).netloc,
            "token": value.app_token,
        }

    @staticmethod
    def b64_encode(key: str):
        return urlsafe_b64encode(key.encode()).decode()

    @asynccontextmanager
    async def _client(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        async with httpx.AsyncClient(base_url=self.apl_url, headers=headers) as client:
            try:
                yield client
            except httpx.HTTPError as exc:
                raise AplError("RestApl error") from exc

    async def set(self, key: str, value: AplEntity):
        async with self._client() as client:
            resp = await client.post("/api/v1/apl", json=self.map_apl_entity(value))
            resp.raise_for_status()

    async def get(self, key: str):
        async with self._client() as client:
            resp = await client.get(f"/api/v1/apl/{self.b64_encode(key)}")
            if resp.status_code == 404:
                raise AplKeyError(f"Key: {key} not found in RestApl")
            resp.raise_for_status()
            return AplEntity.parse_raw(resp.content)

    async def delete(self, key: str):
        async with self._client() as client:
            resp = await client.delete(f"/api/v1/apl/{self.b64_encode(key)}")
            if resp.status_code == 404:
                raise AplKeyError(f"Key: {key} not found in RestApl")
            resp.raise_for_status()

    async def get_all(self, page_size: int):
        async with self._client() as client:
            offset, count = 0, 1
            while offset < count:
                params = {"limit": page_size, "offset": offset}
                resp = await client.get("/api/v1/apl", params=params)
                resp.raise_for_status()
                page = AplPage.parse_raw(resp.content)
                count = page.count
                offset += page_size
                for elem in page.results:
                    yield elem.saleor_api_url, elem
