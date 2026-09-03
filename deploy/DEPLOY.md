# Deploying 4Seas Coliving

GitHub [`4seas-community/coliving`](https://github.com/4seas-community/coliving)
is the only source of truth. Gitea `4Seas/coliving` is a downstream operational
copy synchronized from a local checkout with `scripts/sync-gitea.sh`. Never
develop on or force-push Gitea. Neither GitHub nor Gitea changes production
automatically.

Before preparing a release, require a clean GitHub `main` and synchronize the
same commit to Gitea:

```bash
git switch main
git pull --ff-only origin main
./scripts/sync-gitea.sh --check
./scripts/sync-gitea.sh --apply
```

Production is a separate locally controlled operation. Inspect the live state,
record the active release, build and checksum a new immutable release, show an
execution card, and obtain explicit human approval immediately before upload or
switching. If post-switch service, log, or public checks fail, atomically switch
back to the recorded release and restart the service. Never edit `current` or an
active release in place, and never include persistent `uploads/` in a release.

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

# Point both sharp entry points at the natively-installed copy (see Images).
V=/opt/4seas-coliving/vendor/node_modules/sharp
rm -rf "$REL/node_modules/sharp" && ln -s "$V" "$REL/node_modules/sharp"
for l in "$REL"/.next/node_modules/sharp-*; do
  case "$(basename "$l")" in ._*) continue;; esac
  rm -rf "$l" && ln -s "$V" "$l"
done

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

This repo is **public** (`github.com/4seas-community/coliving`), so `ADMIN_SECRET`
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
linux/x64 codecs**, and the build machine is a Mac.

Cross-installing them from macOS does not work. `pnpm.supportedArchitectures`
does pull the linux packages into the bundle, but the `@img/sharp-libvips-linux-x64`
copy pnpm fetches on a Mac arrives with an empty `lib/`, so the `.node`
binary loads and then dies on `libvips-cpp.so.8.18.3: cannot open shared
object file`. Symptom: every page that touches sharp 500s — including
`/coliving/admin`, which imports it for upload processing.

What works is a **native sharp vendored on the server**, installed once
outside the release tree:

```bash
mkdir -p /opt/4seas-coliving/vendor && cd /opt/4seas-coliving/vendor
npm init -y && npm install --include=optional sharp@0.35.3
chown -R coliving:coliving /opt/4seas-coliving/vendor
node -e 'console.log(require("/opt/4seas-coliving/vendor/node_modules/sharp").versions.vips)'
```

Then every release has to be pointed at it. Note it is **not** enough to
replace `node_modules/sharp`: Next externalises sharp under a hashed name
and loads it through `.next/node_modules/sharp-<hash>`, which symlinks
straight into the bundled pnpm tree. Both have to move (this is in the
release recipe above).

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
- Every one of those prefixes needs an exact-match twin, or the bare form
  redirects forever. `/checkin` matches no `^~` prefix (they all end in
  `/`), falls through to the static site's `try_files $uri $uri/`, and
  comes back 301 with the slash added — which the prefix then hands to
  Next, which 308s the slash back off. `/checkin` and `/rooms` are now
  `return 301` to their `/coliving/…` pages, so they double as short
  links; `/_next` is a plain 404. Add the same for any new prefix.
- Do **not** add `location = /coliving { return 301 /coliving/; }`. Next
  canonicalises the other way, so that redirect plus Next's 308 back is an
  infinite loop. The static-site template preplaced in 2026-08 had exactly
  that line; it is kept as `coliving.conf.static-template.bak`.
