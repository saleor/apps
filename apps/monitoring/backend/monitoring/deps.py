import logging

from fastapi import Depends, Header, HTTPException, Request
from jwt.api_jwk import PyJWKSet

from .apl import AplEntity, AplError, AplKeyError, apl_client
from .integrations.datadog import DataDogApiClient, DataDogClient, TestDataDogClient
from .saleor import (
    SALEOR_API_URL_HEADER,
    SALEOR_SIGNATURE_HEADER,
    SALEOR_TOKEN_HEADER,
    SaleorToken,
)
from .saleor.crypto import decode_webhook_payload
from .saleor.manager import SaleorManager
from .schema import Metadata
from .settings import settings

logger = logging.getLogger(__name__)


async def saleor_api_url_header(
    api_url: str | None = Header(None, alias=SALEOR_API_URL_HEADER)
) -> str:
    if not api_url:
        msg = f"Missing {SALEOR_API_URL_HEADER.upper()} header."
        logger.warning(msg)
        raise HTTPException(status_code=400, detail=msg)
    return api_url


async def verify_saleor_api_url(api_url: str = Depends(saleor_api_url_header)):
    # TODO implement
    if api_url:
        return True
    raise HTTPException(
        status_code=400,
        detail=f"Provided url is invalid or environment {api_url} not allowed.",
    )


async def saleor_token_header(
    token: str | None = Header(None, alias=SALEOR_TOKEN_HEADER)
) -> str:
    if not token:
        msg = f"Missing {SALEOR_TOKEN_HEADER.upper()} header."
        logger.warning(msg)
        raise HTTPException(status_code=400, detail=msg)
    return token


async def apl_entity(
    api_url: str = Depends(saleor_api_url_header),
    _verify=Depends(verify_saleor_api_url),
) -> AplEntity:
    try:
        return await apl_client.get(api_url)
    except AplKeyError:
        msg = f"App needs to be installed before use. First, install the app in Saleor at {api_url}."
        logger.warning(msg)
        raise HTTPException(status_code=400, detail=msg)  # noqa: 904
    except AplError as error:
        logging.error("APL error %r", error)
        raise HTTPException(  # noqa: 904
            status_code=500, detail="App error. Try again later."
        )


async def saleor_token(
    token_str: str = Depends(saleor_token_header),
    saleor_data: AplEntity = Depends(apl_entity),
) -> SaleorToken:
    token = SaleorToken(token_str, saleor_data.jwks)
    # TODO handle jwks reload
    return token


async def verify_is_stuff_user(token: SaleorToken = Depends(saleor_token)) -> bool:
    if not token.is_staff_user():
        HTTPException(
            status_code=400, detail="Only staff user can perform this operation."
        )
    return True


async def get_saleor_signature(
    saleor_signature: str | None = Header(None, alias=SALEOR_SIGNATURE_HEADER)
):
    return saleor_signature


async def verify_webhook_signature(
    request: Request,
    jws: str = Depends(get_saleor_signature),
    saleor_data: AplEntity = Depends(apl_entity),
):
    saleor_jwks = PyJWKSet.from_dict(saleor_data.jwks)
    return decode_webhook_payload(
        jws=jws, jwks=saleor_jwks, webhook_payload=await request.body()
    )


async def saleor_manager(saleor_data: AplEntity = Depends(apl_entity)):
    return SaleorManager[Metadata](
        saleor_data.saleor_api_url,
        saleor_data.app_id,
        saleor_data.app_token,
        Metadata,
    )


async def datadog_client() -> DataDogClient:
    if settings.mock_datadog_client:
        return TestDataDogClient()
    return DataDogApiClient()


class ApiDependencies:
    def __init__(
        self,
        token: SaleorToken = Depends(saleor_token),
        saleor_data: AplEntity = Depends(apl_entity),
        manager: SaleorManager[Metadata] = Depends(saleor_manager),
        datadog_client: DataDogClient = Depends(datadog_client),
        _verify_is_stuff_user=Depends(verify_is_stuff_user),
    ):
        self.saleor_data = saleor_data
        self.token = token
        self.manager = manager
        self.datadog_client = datadog_client


class WebhookDependencies:
    def __init__(
        self,
        saleor_data: AplEntity = Depends(apl_entity),
        manager: SaleorManager[Metadata] = Depends(saleor_manager),
        datadog_client: DataDogClient = Depends(datadog_client),
        _verify_webhook_signature=Depends(verify_webhook_signature),
    ):
        self.saleor_data = saleor_data
        self.manager = manager
        self.datadog_client = datadog_client
