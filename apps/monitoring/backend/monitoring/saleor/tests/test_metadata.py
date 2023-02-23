import pytest
from pydantic import BaseModel

from ..metadata import BaseMetadata, FlatMetadata


class Foo(BaseModel):
    a: str
    b: float | None = None


class Bar(BaseModel):
    a: int
    b: Foo | None = None
    c: list[Foo] = []


class ExampleConfig(FlatMetadata):
    login: str
    password: str
    more: Bar | None = None


class Metadata(BaseMetadata):
    a: str | None = None
    b: int | None = None
    c: list[str] | None = None
    d: str | None = None
    e: Bar | None = None
    f: ExampleConfig | None = None
    g: list[Bar] = []


@pytest.fixture
def metadata():
    return Metadata(
        a="a",
        b=3,
        c=["a", "b", "c"],
        e=Bar(a=0, b=Foo(a="a"), c=[Foo(a="a"), Foo(a="b")]),
        f=ExampleConfig(
            login="admin",
            password="admin",
            more=Bar(
                a=1,
                b=Foo(
                    a="a",
                ),
            ),
        ),
        g=[Bar(a=0), Bar(a=1, b=Foo(a="a"))],
    )


def test_to_metadata(metadata):
    assert metadata.export() == {
        "a": '"a"',
        "b": "3",
        "c": '["a", "b", "c"]',
        "d": "null",
        "e": '{"a": 0, "b": {"a": "a", "b": null}, "c": [{"a": "a", "b": null}, {"a": "b", "b": null}]}',
        "f_login": '"admin"',
        "f_password": '"admin"',
        "f_more": '{"a": 1, "b": {"a": "a", "b": null}, "c": []}',
        "g": '[{"a": 0, "b": null, "c": []}, {"a": 1, "b": {"a": "a", "b": null}, "c": []}]',
    }


def test_metadata_export_reversible(metadata):
    exported = metadata.export()
    assert Metadata.parse_obj(exported) == metadata


def test_metadata_flatten_field(metadata):
    assert metadata.field_flatten("a") == {"a"}
    assert metadata.field_flatten("f") == {"f_login", "f_password", "f_more"}
    assert metadata.field_flatten(metadata.__fields__["f"]) == {
        "f_login",
        "f_password",
        "f_more",
    }
