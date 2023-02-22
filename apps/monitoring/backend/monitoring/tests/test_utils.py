import pytest

from ..utils import domain_validation


@pytest.mark.parametrize(
    "domain,allowed,forbidden,is_allowed",
    [
        ("localhost:8000", {"*"}, None, True),
        ("wrong.com", {"example.com"}, None, False),
        ("sub.example.com", {"example.com"}, None, False),
        ("sub.example.com", {"*.example.com"}, None, True),
        ("sub.sub.example.com", {"*.example.com"}, None, True),
        ("example.com", {"*.example.com"}, None, False),
        ("sub.example.com", {"*.sub.example.com"}, None, False),
        ("sub.sub.example.com", {"*.sub.example.com"}, None, True),
        ("example.com", {"python.org", "example.com"}, None, True),
        ("any.com", {"python.org", "example.com", "*"}, None, True),
        ("example.com", {"*.example.com"}, None, False),
        ("sub.example.com", {"*"}, {"*.example.com"}, False),
        ("sub.example.com", {"*.example.com"}, {"*.banned.com"}, True),
        ("sub.example.com", {"*.example.com"}, {"x.example.com"}, True),
        ("non-eu-sub.saleor.cloud", {"*.saleor.cloud"}, {"*.eu.saleor.cloud"}, True),
        ("sub.eu.saleor.cloud", {"*.saleor.cloud"}, {"*.eu.saleor.cloud"}, False),
    ],
)
def test_domain_validation(domain, allowed, forbidden, is_allowed):
    assert domain_validation(domain, allowed, forbidden) is is_allowed
