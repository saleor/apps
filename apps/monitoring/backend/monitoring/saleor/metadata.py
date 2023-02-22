import json
from typing import Any

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, root_validator, validator
from pydantic.fields import ModelField


class JsonFieldsModel(BaseModel):
    @validator("*", pre=True)
    def parse_field(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                pass
        return v


class FlatMetadata(JsonFieldsModel):
    pass


class BaseMetadata(JsonFieldsModel):
    _flat_fields: dict[str, tuple[str, str]] = {}

    @classmethod
    def field_flatten(cls, field: str | ModelField) -> set[str]:
        flatten_set: set[str] = set()
        if isinstance(field, str):
            field = cls.__fields__[field]
        if issubclass(field.type_, FlatMetadata):
            for sub_field in field.type_.__fields__.values():
                flat_key = f"{field.name}_{sub_field.name}"
                flatten_set.add(flat_key)
        else:
            flatten_set.add(field.name)
        return flatten_set

    @classmethod
    def _get_flat_fields_map(cls) -> dict[str, tuple[str, str]]:
        flat_fields: dict[str, tuple[str, str]] = {}
        for field in cls.__fields__.values():
            if issubclass(field.type_, FlatMetadata):
                for sub_field in field.type_.__fields__.values():
                    flat_key = f"{field.name}_{sub_field.name}"
                    flat_fields[flat_key] = field.name, sub_field.name
        return flat_fields

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        cls._flat_fields = cls._get_flat_fields_map()
        for field_name in cls.__fields__.keys():
            if field_name in cls._flat_fields:
                parent, subfield = cls._flat_fields[field_name]
                raise ValueError(
                    f"{cls!r}: field {field_name} name conflict with flatten {parent}.{subfield}"
                )

    @staticmethod
    def _encode_field(field, value):
        if isinstance(value, FlatMetadata):
            result = {}
            for key, val in value.dict().items():
                result[f"{field.name}_{key}"] = jsonable_encoder(val)
            return result
        return {field.name: jsonable_encoder(value)}

    def export(self, include: set | None = None) -> dict[str, str]:
        metadata: dict[str, Any] = {}
        fields = set(self.__fields__.keys())
        if include is not None:
            fields = fields & include
        for field_name in fields:
            field, value = self.__fields__[field_name], getattr(self, field_name)
            metadata.update(self._encode_field(field, value))
        return {key: json.dumps(val) for key, val in metadata.items()}

    @root_validator(pre=True)
    def unflatten(cls, values):
        unflatten_values: dict[str, Any] = {}
        for key, val in values.items():
            try:
                parent_name, field_name = cls._flat_fields[key]
                unflatten_values.setdefault(parent_name, {})[field_name] = val
            except KeyError:
                unflatten_values[key] = val
        return unflatten_values
