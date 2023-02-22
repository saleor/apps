import logging

from fastapi import Depends, FastAPI, Request, status
from starlette.middleware.cors import CORSMiddleware

from .api import graphql_app
from .apl import AplEntity, apl_client
from .deps import (
    ApiDependencies,
    WebhookDependencies,
    saleor_api_url_header,
    verify_saleor_api_url,
)
from .integrations.datadog import DataDogClientError
from .logs import configure_logging
from .payload import OBSERVABILITY_EVENTS
from .saleor.client import GraphQLError, SaleorClient
from .saleor.common import InstallData, LazyUrl
from .settings import manifest, settings
from .utils import get_base_url

logger = logging.getLogger(__name__)

configure_logging(settings.debug)

apl_client.setup(settings.apl_url)


app = FastAPI(openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["OPTIONS", "GET", "POST", "DELETE"],
)


@app.get("/manifest", status_code=status.HTTP_200_OK, tags=["installation-handshake"])
async def show_manifest(request: Request):
    manifest_copy = manifest.copy()
    for name, field in manifest_copy:
        if isinstance(field, LazyUrl):
            setattr(manifest_copy, name, field(request))
    for extension in manifest_copy.extensions:
        if isinstance(extension.url, LazyUrl):
            extension.url = extension.url(request)
    for webhook in manifest_copy.webhooks:
        if isinstance(webhook.target_url, LazyUrl):
            webhook.target_url = webhook.target_url(request)
    return manifest_copy


@app.post(
    "/install",
    status_code=status.HTTP_200_OK,
    tags=["installation-handshake"],
    name="install",
)
async def install(
    data: InstallData,
    request: Request,
    api_url=Depends(saleor_api_url_header),
    _valid=Depends(verify_saleor_api_url),
):
    client = SaleorClient(api_url, "test", data.auth_token)
    try:
        app_info = await client.app_info()
        target_url = get_base_url(request).replace(path="webhooks")
        await client.create_webhook(
            target_url=str(target_url),
            events=["OBSERVABILITY"],
            name="OBSERVABILITY",
        )
        jwks = await client.get_jwks()
        entity = AplEntity(
            saleor_api_url=api_url,
            app_id=app_info.id,
            app_token=data.auth_token,
            jwks=jwks,
        )
        await apl_client.set(api_url, entity)
    except GraphQLError:
        return {"error": {"message": "Wrong app token"}}
    return {}


@app.post(
    "/webhooks",
    status_code=status.HTTP_200_OK,
    tags=["webhooks"],
    name="webhooks",
)
async def handle_observability_events(
    payloads: list[OBSERVABILITY_EVENTS],
    commons: WebhookDependencies = Depends(),
):
    metadata = await commons.manager.get_metadata()
    if not metadata.datadog or not metadata.datadog.active:
        logger.warning(
            "DataDog integration inactive or not configured. Dropping %s events",
            len(payloads),
        )
        return
    credentials = metadata.datadog.credentials
    try:
        logger.info("Sending %s events to DataDog", len(payloads))
        await commons.datadog_client.send_logs(
            commons.saleor_data.saleor_api_url, credentials, payloads
        )
    except DataDogClientError:
        logger.warning("Sending logs to DataDog failed. Deactivating integration")
        metadata.datadog.active = False
        metadata.datadog.error = "Wrong credentials. Integration deactivated"
        await commons.manager.save_private_metadata(metadata)


@app.get("/health", status_code=status.HTTP_200_OK, tags=["health"], name="health")
async def health():
    return {"status": "ok"}


@app.get("/graphql")
async def graphiql(request: Request):
    return await graphql_app.render_playground(request)


@app.post("/graphql")
async def graphql(request: Request, commons: ApiDependencies = Depends()):
    request.state.api_context = commons
    return await graphql_app.graphql_http_server(request)
