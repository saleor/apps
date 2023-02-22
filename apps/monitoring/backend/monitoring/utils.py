import fnmatch
import urllib.parse

from fastapi import Request
from pydantic import BaseModel
from starlette.datastructures import URL

HttpHeaders = list[tuple[str, str]]


def domain_validation(
    domain_name: str, allowed: set[str], forbidden: set[str] | None = None
):
    forbidden = set() if forbidden is None else forbidden
    for origin in allowed:
        if fnmatch.fnmatchcase(domain_name, origin):
            for disallowed in forbidden:
                if fnmatch.fnmatchcase(domain_name, disallowed):
                    return False
            return True
    return False


def to_camel(snake_str: str) -> str:
    components = snake_str.split("_")
    return components[0] + "".join(x.capitalize() if x else "_" for x in components[1:])


class JsonBaseModel(BaseModel):
    class Config:
        alias_generator = to_camel
        allow_population_by_field_name = True


def parse_headers(headers_list: HttpHeaders) -> dict[str, str]:
    headers: dict[str, str] = {}
    for key, val in headers_list:
        headers[key] = val
    return headers


def get_base_url(request: Request) -> URL:
    base_url, headers = request.base_url, request.headers
    scheme = headers.get("x-forwarded-proto", base_url.scheme).split(",")[0].strip()
    if forwarded_host := headers.get("x-forwarded-host"):
        parts = urllib.parse.urlsplit(f"//{forwarded_host}")
        base_url = base_url.replace(hostname=parts.hostname, port=parts.port)
    return base_url.replace(scheme=scheme)
