from ..common import AplEntity, AplKeyError
from .base import AplBackend


class MemAplBackend(AplBackend):
    def __init__(self):
        self._apl: dict[str, AplEntity] = {}

    async def get(self, key: str):
        try:
            return self._apl[key]
        except KeyError as err:
            raise AplKeyError(f"Key: {key} not found in MemApl") from err

    async def set(self, key: str, value: AplEntity):
        self._apl[key] = value

    async def delete(self, key: str):
        try:
            del self._apl[key]
        except KeyError as err:
            raise AplKeyError(f"Key: {key} not found in MemApl") from err

    async def get_all(self, page_size: int):
        for key, val in self._apl.items():
            yield key, val
