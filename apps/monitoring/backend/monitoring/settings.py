from pathlib import Path

from pydantic import BaseSettings

from . import __version__ as app_version
from .saleor.common import LazyAbsoluteUrl, Manifest, SaleorPermissions

base_dir = Path(__file__).resolve().parent


class AppSettings(BaseSettings):
    debug: bool = True
    apl_url: str = f"file://{base_dir/'.fileApl.json'}"
    mock_datadog_client = False
    allowed_domains: set[str] = {"*"}
    forbidden_domains: set[str] = set()

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = AppSettings()


manifest = Manifest(
    id="saleor-app-monitoring",
    name="Monitoring",
    version=app_version,
    about="Saleor Monitoring app",
    data_privacy="",
    app_url=LazyAbsoluteUrl("/"),
    configuration_url=LazyAbsoluteUrl("/configuration"),
    data_privacy_url="https://saleor.io/legal/privacy",  # noqa
    homepage_url="https://saleor.io/",  # noqa
    support_url="https://github.com/saleor",  # noqa
    token_target_url=LazyAbsoluteUrl("install"),
    permissions=[SaleorPermissions.MANAGE_OBSERVABILITY],
    extensions=[],
    webhooks=[],
    author="Saleor Commerce"
)
