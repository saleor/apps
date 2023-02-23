import random
import string

import pytest

from ..common import AplEntity

_SEED = 10


def _random_str(size: int, uppercase=False) -> str:
    letters = string.ascii_uppercase if uppercase else string.ascii_lowercase
    return "".join(random.choice(letters) for _ in range(size))


@pytest.fixture
def anyio_backend():
    return "asyncio", {"use_uvloop": True}


@pytest.fixture(scope="module")
def vcr_config():
    return {
        "match_on": [
            "method",
            "scheme",
            "host",
            "port",
            "path",
            "query",
            "headers",
            "body",
        ]
    }


jwks_template = """
{{
    "keys": [
        {{
            "kty": "RSA",
            "key_ops": ["verify"],
            "n": "{key_n}",
            "e": "AQAB",
            "use": "sig",
            "kid": "1"
        }}
    ]
}}
"""


@pytest.fixture(scope="session")
def entities_factory():
    def factory(size=10):
        random.seed(_SEED)
        return [
            AplEntity(
                saleor_api_url=f"https://{_random_str(10)}.saleor.cloud/graphql",
                app_id=_random_str(10),
                app_token=_random_str(30),
                jwks=jwks_template.format(key_n=_random_str(30)),
            )
            for _ in range(size)
        ]

    return factory


@pytest.fixture(scope="session")
def entity(entities_factory) -> AplEntity:
    return entities_factory()[0]
