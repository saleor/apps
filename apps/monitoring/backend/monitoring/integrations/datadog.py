import logging
from typing import Any, Awaitable, cast

from datadog_api_client.exceptions import ApiException, ForbiddenException
from datadog_api_client.v1.api.authentication_api import AuthenticationApi
from datadog_api_client.v2 import AsyncApiClient, Configuration
from datadog_api_client.v2.api.logs_api import LogsApi
from datadog_api_client.v2.model.content_encoding import ContentEncoding
from datadog_api_client.v2.model.http_log import HTTPLog
from pydantic import BaseModel

from ..payload import OBSERVABILITY_EVENTS
from .logs import generate_logs

LOGS_ENCODING = ContentEncoding("gzip")

logger = logging.getLogger(__name__)

LOGS_ERRORS = {
    400: "Bad request (likely an issue in the payload formatting)",
    401: "Unauthorized (likely a missing API Key)",
    403: "Permission issue (likely using an invalid API Key)",
    408: "Request Timeout, request should be retried after some time",
    413: "Payload too large (batch is above 5MB uncompressed)",
    429: "Too Many Requests, request should be retried after some time",
    500: "Internal Server Error, the server encountered an unexpected condition that "
    "prevented it from fulfilling the request, request should be retried after some time",
    503: "Service Unavailable, the server is not ready to handle the request "
    "probably because it is overloaded, request should be retried after some time",
}


class DataDogClientError(Exception):
    pass


class DataDogCredsRejectedError(DataDogClientError):
    """DataDog credentials were rejected"""


class DatadogCredentials(BaseModel):
    site: str
    api_key: str


class DataDogClient:
    async def validate_credentials(self, credentials: DatadogCredentials) -> bool:
        raise NotImplementedError()

    async def send_logs(
        self,
        saleor_api_url: str,
        credentials: DatadogCredentials,
        logs: list[OBSERVABILITY_EVENTS],
    ):
        raise NotImplementedError()


class TestDataDogClient(DataDogClient):
    _good_creds = DatadogCredentials(
        site="US1", api_key="156e22d50c4e8b6816e1fd4794d3fd8c"
    )
    _failing_creds = DatadogCredentials(
        site="EU1", api_key="156e22d50c4e8b6816e1fd4794d3fd8c"
    )

    async def validate_credentials(self, credentials: DatadogCredentials) -> bool:
        return credentials == self._good_creds or credentials == self._failing_creds

    async def send_logs(
        self,
        saleor_api_url: str,
        credentials: DatadogCredentials,
        logs: list[OBSERVABILITY_EVENTS],
    ):
        if credentials == self._good_creds:
            return
        raise DataDogCredsRejectedError()


class DataDogApiClient(DataDogClient):
    _site_map = {
        "US1": "datadoghq.com",
        "US3": "us3.datadoghq.com",
        "US5": "us5.datadoghq.com",
        "EU1": "datadoghq.eu",
        "US1_FED": "ddog-gov.com",
    }

    @classmethod
    def _get_config(cls, credentials: DatadogCredentials) -> Configuration:
        configuration = Configuration()
        configuration.api_key["apiKeyAuth"] = credentials.api_key
        configuration.server_variables["site"] = cls._site_map[credentials.site]
        return configuration

    async def validate_credentials(self, credentials: DatadogCredentials) -> bool:
        config = self._get_config(credentials)
        async with AsyncApiClient(config) as api_client:
            api_instance = AuthenticationApi(api_client)
            try:
                response = await cast(Awaitable[Any], api_instance.validate())
                return response.valid
            except ForbiddenException:
                pass
            except ApiException as exp:
                logger.error(
                    "DataDog validate_credentials ApiException[%s]",
                    exp.status,
                    extra={
                        "status_code": exp.status,
                        "response_headers": dict(exp.headers) if exp.headers else None,
                    },
                )
            return False

    async def send_logs(
        self,
        saleor_api_url: str,
        credentials: DatadogCredentials,
        logs: list[OBSERVABILITY_EVENTS],
    ):
        config = self._get_config(credentials)
        logs = generate_logs(logs, saleor_api_url)
        async with AsyncApiClient(config) as api_client:
            api_instance = LogsApi(api_client)
            try:
                await cast(
                    Awaitable[Any],
                    api_instance.submit_log(
                        body=HTTPLog(logs), content_encoding=LOGS_ENCODING
                    ),
                )
            except ApiException as exp:
                error_msg = LOGS_ERRORS.get(exp.status)
                logger.error(
                    "DataDog send_logs ApiException[%s]",
                    error_msg,
                    extra={
                        "status_code": exp.status,
                        "response_headers": dict(exp.headers) if exp.headers else None,
                    },
                )
            except Exception:
                logger.error("DataDog send_logs Unknown error")
