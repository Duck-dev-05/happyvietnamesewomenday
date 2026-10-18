# Thương — Vietnamese Women's Day

A Vietnamese 20/10 greeting page with personal wishes, short share links, shuffled music, and a SQLite database.

**Vercel:** persistent Supabase support is available through `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. Follow [VERCEL.md](VERCEL.md). Local SQLite remains the default for development, but it is never used as a fallback on Vercel. A hosted database and credentials must be configured before Vercel can save wishes.

## Requirements and setup

Use Node.js 24 or newer (the project uses the built-in `node:sqlite` driver).

```sh
npm install
npm run db:init
npm run dev
```

`db:init` creates `data/wishes.sqlite`, applies the schema, and inserts the six confirmed recipients without prewritten wishes. Migration 2 removes only exact matches of the earlier generated messages; user-authored messages are preserved. It is safe to run again. The server also initializes the database automatically on first use.

Checks:

```sh
npm run test:db
npm run lint
npm run build
```

## Database

- `recipients`: confirmed name, social handle, unique share slug, avatar metadata, and creation time.
- `wishes`: a recipient's individual wish and closing, linked by a foreign key.
- `schema_migrations`: applied database schema versions.

The database uses transactions, foreign keys, unique constraints, bound SQL parameters, and a five-second busy timeout. Database files and SQLite journals are ignored by Git.

Set the server environment variable `DATABASE_PATH` to use another persistent location; the default is `data/wishes.sqlite`, relative to the server working directory. For example, in PowerShell:

```powershell
$env:DATABASE_PATH = 'D:\Data\thuong\wishes.sqlite'
npm run db:init
npm run start
```

Back up the database with the server stopped so SQLite can checkpoint and close its journal. Keep the whole `data/` folder if making an offline file backup.

For an online, consistent snapshot including committed WAL data, run `npm run db:backup`. It writes a timestamped SQLite snapshot to `data/backups/` and checks integrity. Copy backups off the server separately. To restore to a **new** file, run `npm run db:restore -- data/backups/<backup>.sqlite data/restored.sqlite`. Existing destinations are refused. Stop the app, set `DATABASE_PATH` to the restored file, and restart after verifying it. No scheduled task is installed automatically.

## Docker hosting

Run `docker compose up -d --build` with Docker Compose installed. Node 24 runs as a non-root user; the named `wishes` volume persists SQLite across container rebuilds. Do not remove the volume when updating. This creates a fresh database on first start; it does not automatically migrate your local database. Run `docker compose exec web npm run db:backup` to create a snapshot inside the volume, then copy it off the server. Configure TLS and access controls at your hosting provider before exposing the app. No hosting account is provisioned by this configuration.

## PNG postcards

Open a saved wish and select **Tải thiệp PNG**. The browser exports a card containing the recipient name, wish, and closing. The canvas height grows to fit long text. No external image export service is used.

Deploy this version on a Node.js server with a writable persistent disk. Local SQLite files are not shared between multiple server instances and are not durable on ephemeral serverless filesystems. For those hosting environments, use a hosted database instead.

## Wishes and sharing

The six confirmed names and handles from the supplied screenshot are seed data in `app/data/sisters.ts`. Their wishes start empty. There are no generated greeting suggestions, stock portraits, or invented personality traits. Select a recipient's card to open the blank form with their name filled in, then write your own wish. Saving attaches it to the existing recipient without duplicating the profile or losing their handle. Copy/share controls appear only for saved wishes. Editing the seed file updates the recipient's name, handle, and display attributes while preserving any existing saved wishes.

The form saves new wishes to the server before clearing the fields or opening the sharing dialog. If saving fails, the draft remains available to retry. It shows a saving state and prevents double submission. New share links contain `?to=<slug>&wishId=<id>`; the recipient's name and wish are retrieved from the database. Anyone visiting the site can see the recipients and greetings, and the create endpoint is public; this version has no account or admin authentication.

Previously saved browser-only wishes are automatically imported on the next visit from that browser. Failed imports remain in local storage for recovery. Existing long links containing the greeting still open without being silently inserted into the database.

Share the deployed site's URL for other people to open links. A localhost link only opens on the computer running the site.

## API

- `GET /api/wishes`: list saved recipients and wishes, with caching disabled.
- `GET /api/wishes/:slug`: look up a saved personal wish; returns 404 when absent.
- `POST /api/wishes`: create a recipient and wish. JSON fields: `name`, `wish`, `appreciation`, and optional `slug` (a random slug is generated when omitted). IDs are assigned by the database. The response includes the saved wishId.

Creation returns 201, or 200 for an identical retry using the same slug. Recipient-name conflicts return 409. Different recipients may receive the same text. Invalid JSON or fields return 400, oversized payloads return 413, unsupported content types return 415, and cross-origin browser writes return 403. All database operations remain on the server; the client cannot execute arbitrary SQL.

## Photos and music

The photo library contains 38 photos: ten supplied HEIC files, the original group PNG, and 27 additional JPEG photos. Originals are copied unchanged into `public/photos/originals/`; the source files are untouched. The website uses generated WebP previews and thumbnails, so visitors do not need native HEIC browser support. The gallery shows the full photo without cropping, supports arrow keys and touch swipes, has an autoplay pause control, and provides original-file downloads.

Import more specific files (paths containing spaces must be quoted):

```powershell
npm run photos:import -- 'E:\Photos\new-photo.HEIC' 'E:\Photos\another-photo.jpg'
```

Or copy photos into `public/photos/originals/`, then run:

```sh
npm run photos:import
npm run test:photos
```

`app/lib/photoProcessing.ts` is the reusable local/server conversion library. It supports HEIC/HEIF using `heic-convert`, then uses `sharp` to generate WebP previews (up to 1920 pixels) and thumbnails (up to 240 pixels). JPEG, PNG, WebP, and AVIF are also supported. Container rotation and JPEG orientation are handled during conversion. Previews omit image metadata while originals remain intact. Conversion runs locally, not through an external photo service, and is not bundled into browser JavaScript.

The import command maintains `app/data/photo-library.json`, skips unchanged files with valid previews, and rejects same-name originals with different contents instead of overwriting them. The manifest is updated only after all conversions succeed. Edit captions in the manifest; they are retained on subsequent unchanged imports. The gallery reads the manifest through `app/data/photos.ts` and stays hidden if it is empty. Rebuild/redeploy after importing photos to a deployed site.

Music files are in `public/music/`. The player attempts autoplay, retries on user interaction if the browser blocks it, and shuffles all tracks before starting another round. Its last-track memory avoids repeating the previous visit's selection in the same browser. The music player has no floating button.

## All visitors' wishes

Every successful submission is stored in SQLite. Migration 3 preserves existing wishes and changes the one-wish-per-recipient schema to allow multiple messages. Retrying identical text and closing for the same recipient returns its existing row; new messages are appended rather than overwriting earlier wishes.

`GET /api/wishes` returns `recipients` (with each person's latest wish) and `wishes` (the complete list, newest first). The page displays the complete list, updates immediately after saving, and refreshes it every 20 seconds while visible and when the window regains focus. Clicking a person's card always opens the writing dialog, including after they have received wishes.

New links include `?to=<recipient-slug>&wishId=<wish-id>` to open the exact saved message. Existing recipient-only links open the latest wish. Failed saves leave the form content intact. Stored wishes are public on this website, not private messages. Persistent hosting is required for other visitors to access the same database.
