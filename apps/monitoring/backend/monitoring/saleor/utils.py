from pydantic import BaseModel


def to_camel(snake_str: str) -> str:
    components = snake_str.split("_")
    return components[0] + "".join(x.capitalize() if x else "_" for x in components[1:])


class JsonBaseModel(BaseModel):
    class Config:
        alias_generator = to_camel
        allow_population_by_field_name = True
