from typing import AsyncGenerator

from ..common import AplEntity


class AplBackend:
    async def get(self, key: str) -> AplEntity:
        raise NotImplementedError(
            "subclasses of BaseAPLClient must provide a get() method"
        )

    async def set(self, key: str, value: AplEntity):
        raise NotImplementedError(
            "subclasses of BaseAPLClient must provide a add() method"
        )

    async def delete(self, key: str):
        raise NotImplementedError(
            "subclasses of BaseAPLClient must provide a delete() method"
        )

    def get_all(self, page_size: int) -> AsyncGenerator[tuple[str, AplEntity], None]:
        raise NotImplementedError(
            "subclasses of BaseAPLClient must provide a delete() method"
        )
