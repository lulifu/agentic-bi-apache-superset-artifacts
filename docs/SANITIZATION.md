# Sanitization Notes

Before publication, this artifact package was curated with the following rules.

## Removed

- Internal Superset hostnames and URLs.
- Token, cookie, JWT, session, and authorization values.
- Production screenshots and raw production logs.
- MacOS `.DS_Store` files, Python caches, LaTeX build outputs, smoke-test outputs, and early pilot artifacts.
- Paper-planning documents and internal writing notes that are not needed to inspect the benchmark or results.

## Retained

- Public benchmark task text, schemas, SQL, and scoring rubrics.
- Development Superset artifact IDs where they appear in raw JSON result evidence.
- Placeholder environment variable names such as `SUPERSET_TOKEN`; these document how to run scripts locally and are not secret values.
- Public URLs for upstream benchmark datasets, official documentation, and bibliographic references.

## Final Checks

The curated tree is scanned for real internal endpoints and common credential patterns before upload. Screenshot PNGs are excluded; manifests and hashes may remain where they support grading evidence.
