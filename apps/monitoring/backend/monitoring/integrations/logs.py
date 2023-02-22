from datetime import datetime
from enum import Enum

from datadog_api_client.v2.model.http_log_item import HTTPLogItem
from pydantic import BaseModel
from ua_parser import user_agent_parser  # type: ignore

from ..payload import (
    OBSERVABILITY_EVENTS,
    ApiCallPayload,
    EventDeliveryAttemptPayload,
    JsonTruncText,
)
from ..utils import parse_headers


class EventDeliveryStatus(str, Enum):
    pending = "pending"
    success = "success"
    failed = "failed"


class LogLevel(str, Enum):
    info = "INFO"
    warn = "WARN"
    error = "ERROR"


log_level_map = {
    EventDeliveryStatus.pending.value: LogLevel.warn,
    EventDeliveryStatus.success.value: LogLevel.info,
    EventDeliveryStatus.failed.value: LogLevel.error,
}


class DataDogLogUseragentDetails(BaseModel):
    os: dict[str, str | None]
    browser: dict[str, str | None]
    device: dict[str, str | None]


class DataDogLogNetwork(BaseModel):
    bytes_read: int | None
    bytes_written: int | None


class DataDogLogEvent(BaseModel):
    name: str
    outcome: str | None


class DataDogLogHttp(BaseModel):
    url: str
    request_id: str | None
    referer: str | None
    status_code: str | None
    method: str | None
    useragent: str | None
    useragent_details: DataDogLogUseragentDetails | None


class DataDogLog(BaseModel):
    ddsource: str = "saleor"
    service: str
    timestamp: float
    level: LogLevel = LogLevel.info
    ddtags: str | None
    http: DataDogLogHttp
    network: DataDogLogNetwork
    evt: DataDogLogEvent
    duration: int | None


class GraphQLOperation(BaseModel):
    name: str | None
    operation_type: str
    query: str | None
    result: str | None
    result_invalid: bool
    truncated: bool


class EventRequest(BaseModel):
    headers: dict[str, str] = {}


class EventResponse(BaseModel):
    headers: dict[str, str] = {}
    body: JsonTruncText | None


class App(BaseModel):
    id: str
    name: str


class ApiCall(BaseModel):
    request_headers: dict[str, str] = {}
    response_headers: dict[str, str] = {}
    gql_operations: list[GraphQLOperation]
    app: App | None


class ApiCallLog(DataDogLog):
    saleor: ApiCall


class Webhook(BaseModel):
    id: str
    name: str
    target_url: str
    subscription_query: JsonTruncText | None


class EventDeliveryPayload(BaseModel):
    content_length: int
    body: JsonTruncText


class EventDelivery(BaseModel):
    id: str
    status: str
    event_type: str
    event_sync: bool
    payload: EventDeliveryPayload


class EventDeliveryAttempt(BaseModel):
    id: str
    status: str
    next_retry: datetime | None
    request_headers: dict[str, str] = {}
    response_headers: dict[str, str] = {}
    response_body: JsonTruncText | None


class EventDeliveryAttemptData(BaseModel):
    event_delivery_attempt: EventDeliveryAttempt
    event_delivery: EventDelivery
    webhook: Webhook
    app: App


class EventDeliveryAttemptLog(DataDogLog):
    saleor: EventDeliveryAttemptData


def http_status_ok(status_code: int | None):
    if status_code is None or status_code >= 400:
        return False
    return True


def parse_useragent(useragent: str | None) -> DataDogLogUseragentDetails | None:
    if not useragent:
        return None
    parsed = user_agent_parser.Parse(useragent)
    return DataDogLogUseragentDetails(
        os=parsed["os"],
        browser=parsed["user_agent"],
        device=parsed["device"],
    )


def convert_duration(duration: float | None) -> float | None:
    return duration * 1_000_000_000 if duration else None


def generate_api_call_log(payload: ApiCallPayload, saleor_domain: str) -> HTTPLogItem:
    request_headers = parse_headers(payload.request.headers)
    response_headers = parse_headers(payload.response.headers)
    gql_operations: list[GraphQLOperation] = []
    for op in payload.gql_operations:
        gql_operations.append(
            GraphQLOperation(
                name=op.name.text if op.name else None,
                operation_type=op.operation_type,
                query=op.query.text if op.query else None,
                result=op.result.text if op.result else None,
                result_invalid=op.result_invalid,
                truncated=any(
                    [
                        op.name.truncated if op.name else False,
                        op.query.truncated if op.query else False,
                        op.result.truncated if op.result else False,
                    ]
                ),
            )
        )
    level = (
        LogLevel.info
        if http_status_ok(payload.response.status_code)
        else LogLevel.error
    )
    message = ApiCallLog(
        service=saleor_domain,
        timestamp=payload.request.time.timestamp() * 1000,
        level=level,
        http=DataDogLogHttp(
            url=payload.request.url,
            request_id=payload.request.id,
            referer=request_headers.get("Referer"),
            status_code=str(payload.response.status_code),
            method=payload.request.method,
            useragent=request_headers.get("User-Agent"),
            useragent_details=parse_useragent(request_headers.get("User-Agent")),
        ),
        network=DataDogLogNetwork(
            bytes_read=payload.request.content_length,
            bytes_written=payload.response.content_length,
        ),
        evt=DataDogLogEvent(
            name=payload.event_type,
            outcome="success" if level == LogLevel.info else "failure",
        ),
        saleor=ApiCall(
            gql_operations=gql_operations,
            app=App(id=payload.app.id, name=payload.app.name) if payload.app else None,
            request_headers=dict(request_headers),
            response_headers=dict(response_headers),
        ),
    )
    return HTTPLogItem(message=message.json())


def generate_event_delivery_attempt_log(
    payload: EventDeliveryAttemptPayload, saleor_domain: str
) -> HTTPLogItem:
    request_headers = parse_headers(payload.request.headers)
    response_headers = parse_headers(payload.response.headers)
    message = EventDeliveryAttemptLog(
        service=saleor_domain,
        timestamp=payload.time.timestamp() * 1000,
        level=log_level_map.get(payload.event_delivery.status, LogLevel.error),
        duration=convert_duration(payload.duration),
        http=DataDogLogHttp(
            url=payload.webhook.target_url,
            request_id=payload.id,
            status_code=str(payload.response.status_code),
        ),
        network=DataDogLogNetwork(
            bytes_read=payload.response.content_length,
            bytes_written=payload.event_delivery.payload.content_length,
        ),
        evt=DataDogLogEvent(
            name=payload.event_type,
            outcome=payload.status,
        ),
        saleor=EventDeliveryAttemptData(
            event_delivery_attempt=EventDeliveryAttempt(
                id=payload.id,
                status=payload.status,
                next_retry=payload.next_retry,
                request_headers=dict(request_headers),
                response_headers=dict(response_headers),
                response_body=payload.response.body,
            ),
            app=App(id=payload.app.id, name=payload.app.name),
            event_delivery=EventDelivery(
                id=payload.event_delivery.id,
                status=payload.event_delivery.status,
                event_type=payload.event_delivery.event_type,
                event_sync=payload.event_delivery.event_sync,
                payload=EventDeliveryPayload(
                    body=payload.event_delivery.payload.body,
                    content_length=payload.event_delivery.payload.content_length,
                ),
            ),
            webhook=Webhook(
                id=payload.webhook.id,
                name=payload.webhook.name,
                target_url=payload.webhook.target_url,
                subscription_query=payload.webhook.subscription_query,
            ),
        ),
    )
    return HTTPLogItem(message=message.json())


def generate_logs(
    payloads: list[OBSERVABILITY_EVENTS], saleor_domain: str
) -> list[HTTPLogItem]:
    log_items: list[HTTPLogItem] = []
    for payload in payloads:
        if isinstance(payload, ApiCallPayload):
            log_items.append(generate_api_call_log(payload, saleor_domain))
        elif isinstance(payload, EventDeliveryAttemptPayload):
            log_items.append(
                generate_event_delivery_attempt_log(payload, saleor_domain)
            )
    return log_items
