from typing import Any, Dict, Optional, Sequence
from urllib.parse import urlparse, urlunparse

import httpx

from .graphql import (
    CREATE_WEBHOOK,
    DELETE_PRIVATE_METADATA,
    GET_APP_INFO,
    UPDATE_PRIVATE_METADATA,
)
from .utils import JsonBaseModel


class WebhookInfo(JsonBaseModel):
    id: str
    target_url: str
    is_active: bool


class AppInfo(JsonBaseModel):
    id: str
    webhooks: list[WebhookInfo]
    private_metafields: dict[str, str]


class GraphQLError(Exception):
    """
    Raised on Saleor GraphQL errors
    """

    def __init__(
        self,
        errors: Sequence[Dict[str, Any]],
        response_data: Optional[Dict[str, Any]] = None,
    ):
        self.errors = errors
        self.response_data = response_data

    def __str__(self):
        return (
            f"GraphQLError: {', '.join([error['message'] for error in self.errors])}."
        )


class SaleorClient:
    def __init__(self, saleor_api_url: str, user_agent, auth_token=None):
        self.saleor_api_url = saleor_api_url
        self.headers = {"User-Agent": user_agent}
        if auth_token:
            self.headers["Authorization"] = f"Bearer {auth_token}"

    async def get_jwks(self) -> dict[str, Any]:
        parts = urlparse(self.saleor_api_url)
        jwks_url = urlunparse(parts._replace(path="/.well-known/jwks.json"))
        async with httpx.AsyncClient() as client:
            res = await client.get(jwks_url)
            return res.json()

    async def execute(self, query, variables=None):
        async with httpx.AsyncClient() as client:
            data = {"query": query, "variables": variables}
            res = await client.post(
                self.saleor_api_url,
                json=data,
                headers=self.headers,
            )
            res_data = res.json()
            if errors := res_data.get("errors"):
                raise GraphQLError(errors=errors, response_data=res_data.get("data"))
            return res_data["data"]

    async def app_info(self) -> AppInfo:
        result = await self.execute(GET_APP_INFO)
        return AppInfo.parse_obj(result["app"])

    async def update_private_metadata(self, app_id: str, metadata: dict[str, str]):
        metadata_input = [{"key": key, "value": val} for key, val in metadata.items()]
        await self.execute(
            UPDATE_PRIVATE_METADATA,
            variables={"appId": app_id, "metadata": metadata_input},
        )

    async def delete_private_metadata(self, app_id: str, keys: set[str]):
        await self.execute(
            DELETE_PRIVATE_METADATA, variables={"appId": app_id, "keys": list(keys)}
        )

    async def create_webhook(
        self,
        target_url: str,
        events: list[str],
        name: str,
    ):
        webhook_input = {
            "targetUrl": target_url,
            "events": events,
            "name": name,
        }
        await self.execute(
            CREATE_WEBHOOK,
            variables={"input": webhook_input},
        )
