from .integrations.datadog import DatadogCredentials
from .saleor.metadata import BaseMetadata, FlatMetadata


class DatadogConfig(FlatMetadata):
    active: bool = False
    error: str | None = None
    credentials: DatadogCredentials


class Metadata(BaseMetadata):
    datadog: DatadogConfig | None = None
