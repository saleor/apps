from json import dumps
from pathlib import Path

from fastapi.encoders import jsonable_encoder
from pydantic import parse_file_as

from ..common import AplEntity
from .mem import MemAplBackend


class FileAplBackend(MemAplBackend):
    def _load_file(self):
        self._apl = parse_file_as(dict[str, AplEntity], self.path)

    def _save_file(self):
        data = dumps(jsonable_encoder(self._apl), indent=2)
        self.path.write_text(data)

    def __init__(self, path: Path):
        super().__init__()
        self.path = path
        if self.path.exists():
            self._load_file()

    async def set(self, *args, **kwargs):
        await super().set(*args, **kwargs)
        self._save_file()

    async def delete(self, *args, **kwargs):
        await super().delete(*args, **kwargs)
        self._save_file()
