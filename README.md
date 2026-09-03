# 4Seas Coliving

Public Next.js application for [4seas.xyz/coliving](https://4seas.xyz/coliving/).

[GitHub `4seas-community/coliving`](https://github.com/4seas-community/coliving)
is the only source of truth for development, issues, and pull requests. Gitea
`4Seas/coliving` is a downstream operational copy; never develop on or
force-push it.

```text
branch / pull request
        ↓
GitHub main + CI
        ↓ local, manually approved sync
Gitea 4Seas/coliving
        ↓ local release plan + human approval
244 immutable release → validation → success or rollback
```

GitHub CI builds the application against an isolated disposable PostgreSQL
service. It has no production SSH credentials and cannot deploy to 244.

## Local development

Coliving needs PostgreSQL to build and preview. In the shared `4seas-244`
workspace, start the isolated local database:

```bash
docker compose -f ../../local/coliving/compose.yml up -d --wait
pnpm install --frozen-lockfile
pnpm build
pnpm dev --hostname 127.0.0.1 --port 3106
```

Open `http://127.0.0.1:3106/coliving`. Local `.env.local`, build output, and
dependencies are ignored and must never be committed.

## Synchronize Gitea

After a GitHub pull request is reviewed, CI passes, and it is merged:

```bash
git switch main
git pull --ff-only origin main
./scripts/sync-gitea.sh --check
./scripts/sync-gitea.sh --apply
```

The script requires a clean checkout at GitHub `main`, runs the repository
checks, permits only a fast-forward Gitea update, and verifies the resulting
commit. Synchronizing source does not publish production.

Read [deploy/DEPLOY.md](deploy/DEPLOY.md) before any production work. Production
requires a separate local release plan, an explicit human approval, an
immutable release, validation, and rollback to the recorded previous release
on failure.
