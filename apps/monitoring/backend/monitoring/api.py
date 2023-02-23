from pathlib import Path

from ariadne import (
    MutationType,
    ObjectType,
    QueryType,
    convert_kwargs_to_snake_case,
    load_schema_from_path,
    make_executable_schema,
    snake_case_fallback_resolvers,
)
from ariadne.asgi import GraphQL
from graphql import GraphQLResolveInfo

from .deps import ApiDependencies
from .schema import DatadogConfig, DatadogCredentials
from .settings import settings

base_dir = Path(__file__).resolve().parent
type_defs = load_schema_from_path(str(base_dir / "schema.graphql"))
query = QueryType()
datadog_config = ObjectType("DatadogConfig")
mutation = MutationType()


def get_api_context(info: GraphQLResolveInfo) -> ApiDependencies:
    return info.context["request"].state.api_context


@datadog_config.field("credentials")
def resolve_datadog_credentials(datadog: DatadogConfig, *_):
    return {
        "site": datadog.credentials.site,
        "api_key_last_4": datadog.credentials.api_key[-4:],
    }


@query.field("integrations")
async def resolve_integrations(_, info):
    context = get_api_context(info)
    metadata = await context.manager.get_metadata()
    return metadata


@mutation.field("updateDatadogConfig")
@convert_kwargs_to_snake_case
async def resolve_update_datadog(_, info, input):
    context = get_api_context(info)
    metadata = await context.manager.get_metadata()

    if creds := input.get("credentials", None):
        creds = DatadogCredentials(site=creds["site"], api_key=creds["api_key"])
        if not await context.datadog_client.validate_credentials(creds):
            return {
                "errors": [
                    {
                        "field": "credentials",
                        "message": f"Invalid datadog apiKey for site {creds.site}",
                    }
                ]
            }

    # Create new configuration
    if metadata.datadog is None:
        if creds is None:
            return {"errors": [{"message": "No DataDog config to update"}]}
        metadata.datadog = DatadogConfig(credentials=creds)

    if "active" in input:
        metadata.datadog.active = input["active"]
    if creds:
        metadata.datadog.credentials = creds
    metadata.datadog.error = None

    await context.manager.save_private_metadata(metadata)
    return {"datadog": metadata.datadog, "errors": []}


@mutation.field("deleteDatadogConfig")
async def resolve_delete_datadog(_, info):
    context = get_api_context(info)
    metadata = await context.manager.get_metadata()
    if metadata.datadog is None:
        return {"errors": [{"message": "No DataDog config to delete"}]}
    await context.manager.delete_private_metadata("datadog")
    return {"datadog": metadata.datadog, "errors": []}


schema = make_executable_schema(
    type_defs, query, datadog_config, mutation, snake_case_fallback_resolvers
)
graphQL = GraphQL(schema, debug=settings.debug)
graphql_app = graphQL.http_handler
