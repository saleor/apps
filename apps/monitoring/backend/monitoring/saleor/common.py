from enum import Enum
from typing import Any

from fastapi import Request
from jwt.api_jwk import PyJWKSet
from pydantic import AnyHttpUrl, BaseModel, Field
from starlette.routing import NoMatchFound

from ..utils import get_base_url
from .crypto import decode_jwt

SALEOR_API_URL_HEADER = "saleor-api-url"
SALEOR_TOKEN_HEADER = "authorization-bearer"
SALEOR_SIGNATURE_HEADER = "saleor-signature"


class SaleorAppError(Exception):
    """Generic Saleor App Error, all framework errros inherit from this"""


class InstallAppError(SaleorAppError):
    """Install App error"""


class ConfigurationError(SaleorAppError):
    """App is misconfigured"""


class InstallData(BaseModel):
    auth_token: str


class SaleorPermissions(str, Enum):
    MANAGE_OBSERVABILITY = "MANAGE_OBSERVABILITY"


class LazyUrl(str):
    """
    Used to declare a fully qualified url that is to be resolved when the
    request is available.
    """

    def __init__(self, name: str):
        self.name = name

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        return v

    def resolve(self):
        return self.request.url_for(self.name)

    def __call__(self, request: Request):
        self.request = request
        try:
            return self.resolve()
        except NoMatchFound:
            raise ConfigurationError(
                f"Failed to resolve a lazy url, check if an endpoint named '{self.name}' is defined."
            ) from None

    def __hash__(self):
        return hash(self.name)

    def __eq__(self, other):
        return self.name == other.name

    def __ne__(self, other):
        return not (self.name == other.name)

    def __str__(self):
        return f"LazyURL('{self.name}')"

    def __repr__(self):
        return str(self)


class LazyAbsoluteUrl(LazyUrl):
    def resolve(self):
        base_url = get_base_url(self.request)
        return str(base_url.replace(path=self.name))


class LazyPath(LazyUrl):
    """
    Much like LazyUrl but resolves only to the path part of an url.
    The lazy aspect of this class is very redundant but is built like so to
    maintain the same usage as the LazyUrl class.
    """

    def resolve(self):
        return self.request.app.url_path_for(self.name)

    def __str__(self):
        return f"LazyPath('{self.name}')"


class Webhook(BaseModel):
    name: str
    async_events: list[str] = Field(..., alias="asyncEvents")
    query: str
    target_url: AnyHttpUrl | LazyUrl = Field(..., alias="targetUrl")
    is_active: bool = Field(..., alias="isActive")

    class Config:
        allow_population_by_field_name = True


class Manifest(BaseModel):
    id: str
    permissions: list[str]
    name: str
    author: str
    version: str
    about: str
    extensions: list[Any] = []
    webhooks: list[Webhook] = []
    data_privacy: str = Field(..., alias="dataPrivacy")
    data_privacy_url: AnyHttpUrl | LazyUrl = Field(..., alias="dataPrivacyUrl")
    homepage_url: AnyHttpUrl | LazyUrl = Field(..., alias="homepageUrl")
    support_url: AnyHttpUrl | LazyUrl = Field(..., alias="supportUrl")
    configuration_url: AnyHttpUrl | LazyUrl | None = Field(
        None, alias="configurationUrl"
    )
    app_url: AnyHttpUrl | LazyUrl = Field(..., alias="appUrl")
    token_target_url: AnyHttpUrl | LazyUrl = Field(
        LazyUrl("install"), alias="tokenTargetUrl"
    )

    class Config:
        allow_population_by_field_name = True


class SaleorToken:
    def __init__(self, token_str: str, jwks: dict[str, Any]):
        self.token_str = token_str
        self.jwks = PyJWKSet.from_dict(jwks)
        self.jwt = decode_jwt(self.token_str, self.jwks)

    def is_staff_user(self) -> bool:
        return self.jwt["is_staff"]

    def validate_permission(self, permissions: str | list[str]) -> bool:
        return True

    def validate_user_permission(self, permissions: str | list[str]) -> bool:
        return True
