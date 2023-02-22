from datetime import datetime
from typing import Any, Literal

from .utils import HttpHeaders, JsonBaseModel


class App(JsonBaseModel):
    id: str
    name: str


class ApiCallRequest(JsonBaseModel):
    id: str
    method: str
    url: str
    time: datetime
    headers: HttpHeaders
    content_length: int


class ApiCallResponse(JsonBaseModel):
    headers: HttpHeaders
    status_code: int | None
    content_length: int


class JsonTruncText(JsonBaseModel):
    text: str
    truncated: bool


class GraphQLOperation(JsonBaseModel):
    name: JsonTruncText | None
    operation_type: str | None
    query: JsonTruncText | None
    result: JsonTruncText | None
    result_invalid: bool


class ApiCallPayload(JsonBaseModel):
    event_type: Literal["api_call"]
    request: ApiCallRequest
    response: ApiCallResponse
    gql_operations: list[GraphQLOperation]
    app: App | None


class EventDeliveryAttemptRequest(JsonBaseModel):
    headers: HttpHeaders


class EventDeliveryAttemptResponse(JsonBaseModel):
    headers: HttpHeaders
    status_code: int | None
    content_length: int
    body: JsonTruncText


class EventDeliveryPayload(JsonBaseModel):
    content_length: int
    body: JsonTruncText


class EventDelivery(JsonBaseModel):
    id: str
    status: str
    event_type: str
    event_sync: bool
    payload: EventDeliveryPayload


class Webhook(JsonBaseModel):
    id: str
    name: str
    target_url: str
    subscription_query: JsonTruncText | None


class EventDeliveryAttemptPayload(JsonBaseModel):
    event_type: Literal["event_delivery_attempt"]
    id: str
    time: datetime
    duration: float | None
    status: str
    next_retry: datetime | None
    request: EventDeliveryAttemptRequest
    response: EventDeliveryAttemptResponse
    event_delivery: EventDelivery
    webhook: Webhook
    app: App


OBSERVABILITY_EVENTS = ApiCallPayload | EventDeliveryAttemptPayload | dict[str, Any]
