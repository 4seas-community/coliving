# Deploying 4Seas Coliving

Live at `https://4seas.xyz/coliving`, served by `4seas-app@coliving.service`
on `127.0.0.1:3006` behind nginx on the production box (ssh alias `4seas`,
149.28.158.244).

## Layout on the server

| Path | What |
| --- | --- |
| `/opt/4seas-coliving/releases/<ts>-<sha>` | one build each |
| `/opt/4seas-coliving/current` | symlink to the live release — flip to roll back |
| `/opt/4seas-coliving/env` | `root:root 0600`, holds the DB password |
| `/opt/4seas-coliving/uploads` | admin-uploaded photos, **outside** the release tree |
| `/etc/nginx/4seas-paths/coliving.conf` | the mount into the main vhost |
| `/etc/nginx/snippets/4seas-coliving-proxy.conf` | proxy settings, pinned to :3006 |

The unit is the shared template `4seas-app@.service`, which runs
`/opt/4seas-coliving/current/server.js` as the `coliving` user under
`ProtectSystem=strict` with `ReadWritePaths=/opt/4seas-coliving`. That is
why `UPLOAD_DIR` has to live under `/opt/4seas-coliving` — anywhere else
is read-only to the service.

## Cutting a release

Built on a Mac, shipped as a tarball. Two things bite if you improvise:

1. **`outputFileTracingRoot` must stay set** in `next.config.mjs`.
   Without it Next walks up past `4seas-dev` to `~/package.json` and
   buries `server.js` several directories deep in `.next/standalone`.
2. **Do not `tar -h`.** Dereferencing pnpm's symlinks flattens
   `node_modules/next` into a plain directory, and Node then fails to
   resolve `next`'s own transitive deps — the failure looks like
   `Cannot find module '@swc/helpers/_/_interop_require_default'`. The
   `.pnpm` tree inside `.next/standalone` is self-contained and all its
   links are relative, so plain `tar -cz` is correct.
3. **Copy both `.next/static` and `public` in yourself.** Next does not
   reliably place either inside `.next/standalone`; a missing `public`
   shows up as every photo 404ing while the pages themselves render.

```bash
# local
npm_config_package_manager_strict=false pnpm install
DATABASE_URL='<session pooler url>' pnpm exec next build   # build reads the DB
cp -R .next/static .next/standalone/.next/static
cp -R public .next/standalone/public
tar -czf /tmp/coliving-release.tgz -C .next/standalone .
scp /tmp/coliving-release.tgz 4seas:/tmp/

# server
REL=/opt/4seas-coliving/releases/$(date +%Y%m%d%H%M%S)-$(git rev-parse --short HEAD)
mkdir -p "$REL" && tar -xzf /tmp/coliving-release.tgz -C "$REL"
chown -R coliving:coliving "$REL"
ln -sfn "$REL" /opt/4seas-coliving/current.new
mv -T /opt/4seas-coliving/current.new /opt/4seas-coliving/current
systemctl restart 4seas-app@coliving
```

The build talks to the database because `/coliving/apply` and
`/coliving/rooms` are statically prerendered from `getEnabledRooms()`.
That also means **any admin action that edits a room has to call
`revalidatePath` for both of those routes**, or they keep serving the
build-time snapshot until the next deploy.

## Secrets

This repo is **public** (`tea.4seas.xyz/4Seas/coliving`), so `ADMIN_SECRET`
and `INTERNAL_PASSWORD` have no in-source defaults. `lib/secrets.ts` reads
them from the environment per request and throws if either is missing —
lazily, so `next build` does not need them, only the running service. Both
live in `/opt/4seas-coliving/env`.

Rotating `INTERNAL_PASSWORD` or `ADMIN_SECRET` invalidates the matching
cookies (both are hashes of the secret), so everyone signs in again.

`/coliving/checkin` has no gate at all — it is reachable by anyone with
the link, and kept out of search results with `robots: noindex` only.

## Images

`next/image` optimisation is on, so `/_next/image?url=…&w=…` resizes and
re-encodes to AVIF/WebP on first request and caches the result under
`.next/cache/images` in the live release. That needs **sharp with its
linux/x64 codecs**, and the build machine is a Mac — hence the
`pnpm.supportedArchitectures` block in `package.json`. Without it the
tarball carries only the darwin binary and every image 500s in
production. After a build, confirm the codecs shipped:

```bash
ls -d .next/standalone/node_modules/.pnpm/@img+sharp-linux-x64*
```

Admin uploads are normalised on the way in (`uploadSiteImage`): EXIF
rotation applied, capped at 2000px, re-encoded to WebP. Uploaded files
keep their own URL under `/coliving/uploads/` and are served straight off
disk by nginx rather than through the optimiser.

## Database

Supabase project `kjvghylfjuvczzhmooyd` (ZuzaluChiangMai org, Singapore,
Free plan). Connect over the **session pooler on 5432** — the direct host
`db.<ref>.supabase.co` publishes only an AAAA record and this server has
no IPv6. Not the 6543 transaction pooler either; drizzle's prepared
statements do not survive it.

`deploy/schema.sql` creates the 8 tables. Every one ends up **RLS enabled,
zero policies, not forced** — the app connects as `postgres` and bypasses
RLS entirely, but the project also exposes PostgREST, where the anon key
can read any table that has RLS switched off. `applications` holds
applicant names, emails and IM handles. Verify with:

```bash
curl -H "apikey: $ANON" "https://kjvghylfjuvczzhmooyd.supabase.co/rest/v1/rooms?select=*"
# must return [] even though the table has rows
```

`deploy/seed.sql` (regenerate with `node deploy/gen-seed.mjs`) is not
optional decoration. `updateRoom()` and `updateGuide()` in
`app/coliving/admin/actions.ts` are UPDATE-only — there is no INSERT path
anywhere in the app. Without a seeded row an admin can write the entire
Chiang Mai guide, hit save, get no error, and lose all of it. The 52
`room_units` rows come from `data/4SEAS-co-living-room-details-info-*.xlsx`.

## Serving it under a subpath

The app has **no `basePath`** — the `/coliving` prefix comes from the
`app/coliving/` route directory. So its build output and `public/` files
are addressed from the domain root, and nginx has to hand each of those
root paths to the app: `/_next/`, `/rooms/`, `/checkin/`,
`/images/guides/`, and a handful of root-level icons. Each was checked
against `/opt/4seas-home/current` for collisions first — `/images/` itself
belongs to the Webflow homepage, which is why only the `guides` subtree is
claimed. Adding a new top-level folder under `public/` means adding a
matching location.

Two nginx details that are easy to get wrong:

- Every prefix needs `^~`. `4seas-site` has a static-asset regex location
  that otherwise steals `*.css|js|png` and resolves them against the
  homepage root.
- Do **not** add `location = /coliving { return 301 /coliving/; }`. Next
  canonicalises the other way, so that redirect plus Next's 308 back is an
  infinite loop. The static-site template preplaced in 2026-08 had exactly
  that line; it is kept as `coliving.conf.static-template.bak`.
