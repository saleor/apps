from typing import Generic, Type, TypeVar

from .client import AppInfo, SaleorClient
from .metadata import BaseMetadata

T = TypeVar("T", bound=BaseMetadata)


class SaleorManager(Generic[T]):
    def __init__(
        self,
        saleor_api_url: str,
        app_id: str,
        auth_token: str,
        metadata_cls: Type[T],
        user_agent="test",
    ):
        self.client = SaleorClient(saleor_api_url, user_agent, auth_token)
        self.app_id = app_id
        self.metadata_cls = metadata_cls

    async def get_app_info(self) -> AppInfo:
        return await self.client.app_info()

    async def get_metadata(self) -> T:
        app_info = await self.get_app_info()
        return self.metadata_cls.parse_obj(app_info.private_metafields)

    async def save_private_metadata(self, metadata: T, include: set[str] | None = None):
        exported = metadata.export(include)
        await self.client.update_private_metadata(self.app_id, exported)

    async def delete_private_metadata(self, keys: str | set[str]):
        await self.client.delete_private_metadata(self.app_id, {"datadog"})
        flatten_keys: set[str] = set()
        if isinstance(keys, str):
            keys = {keys}
        for key in keys:
            flatten_keys.update(self.metadata_cls.field_flatten(key))
        await self.client.delete_private_metadata(self.app_id, flatten_keys)
