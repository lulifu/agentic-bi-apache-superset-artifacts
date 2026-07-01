# Codex Superset Skill Adapter

This directory contains local adapter code for loading Superset skills into Codex
benchmark runs. External skill repositories remain read-only; the dev benchmark
copy lives in `skills/superset-dev-benchmark`.

## Token Interceptor Shim (token-bearer mode)

Use `superset_token_interceptor.mjs` when running Superset skill scripts locally from this paper repo and the chat runtime's `weasso-plugin` is not available.

Required environment:

- `SUPERSET_DEV_TOKEN` or `SUPERSET_TOKEN`: bearer token for the development benchmark environment. The shim fails at module load if neither is set.
- `SUPERSET_BASE_URL`: optional Superset base URL. Defaults to `https://superset.example.invalid`.

Invocation:

```bash
node --import ./scripts/skill-adapter-codex/superset_token_interceptor.mjs \
  skills/superset-dev-benchmark/scripts/create_chart.mjs \
  --search-dataset <dataset_name>
```

The shim patches Node `fetch`, `http.request`, `http.get`, `https.request`, and `https.get`. It injects `Authorization: Bearer <token>` only for requests whose hostname matches `SUPERSET_BASE_URL`; other hosts are untouched. It logs only the active hostname and redacted request paths, never the token value.

This is not a production auth mechanism. Runtime deployments use the governed SSO/session-cookie interceptor in the chat-bot environment. This bearer-token shim exists only to make Codex smoke tests and benchmark runs possible from the local research environment without modifying external skill repositories.

The shim refuses `superset.toolsfdg.net` unless `SUPERSET_ALLOW_PROD=1` is set explicitly.
