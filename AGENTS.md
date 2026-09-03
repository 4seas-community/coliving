# Coliving Agent Instructions

GitHub `4seas-community/coliving` is the only development source of truth.
Gitea `4Seas/coliving` is a downstream operational copy. Use GitHub branches,
issues, pull requests, reviews, and CI. Never develop on, merge into, or
force-push Gitea.

Use `scripts/sync-gitea.sh` after a GitHub PR is merged. Local `main`, GitHub
`main`, and Gitea `main` must be the same commit before production work.

A GitHub push, merge, or Gitea synchronization is not production approval.
Read `deploy/DEPLOY.md`, inspect live 244 state, build an immutable release,
record the active release as the rollback point, present an execution card,
and obtain explicit human confirmation immediately before the first production
mutation. Never edit the active release in place or include uploads in a
release.

The application needs PostgreSQL for build and full preview. Use the isolated
local database documented in `README.md`; never build ordinary changes against
the production database. Never commit `.env.local`, credentials, connection
strings, applicant/resident data, uploaded images, database exports, or
backups.
