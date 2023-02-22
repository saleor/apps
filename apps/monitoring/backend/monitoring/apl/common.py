import json
from typing import Any

from pydantic import AnyHttpUrl, BaseModel, Field, validator


class AplEntity(BaseModel):
    saleor_api_url: AnyHttpUrl
    app_id: str = Field(..., alias="saleor_app_id")
    app_token: str = Field(..., alias="token")
    jwks: dict[str, Any]

    class Config:
        allow_population_by_field_name = True

    @validator("jwks", pre=True)
    def parse_json(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v


class AplError(Exception):
    pass


class AplKeyError(AplError):
    pass


class NotConfiguredError(AplError):
    """If apl client was not configured"""
