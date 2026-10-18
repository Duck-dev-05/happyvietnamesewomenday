import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { sisters, type Sister } from "../data/sisters.ts";
import { legacyWishHashes } from "./legacyWishHashes.ts";

import { WishConflictError } from "./databaseErrors.ts";
export { WishConflictError } from "./databaseErrors.ts";

type WishRow = { id: number; slug: string; name: string; handle: string; photo: string; emoji: string; traits: string; wish: string; appreciation: string };
const selection = `SELECT r.id, r.slug, r.name, r.handle, r.photo, r.emoji, r.traits,
  COALESCE(w.body, '') AS wish, COALESCE(w.closing, '') AS appreciation, w.id AS wishId, w.created_at AS createdAt
  FROM recipients r LEFT JOIN wishes w ON w.id = (SELECT id FROM wishes WHERE recipient_id = r.id ORDER BY id DESC LIMIT 1)`;

function fromRow(row: unknown): Sister {
  const value = row as WishRow;
  return { ...value, traits: JSON.parse(value.traits) as string[] };
}

export function openWishDatabase(filename: string, seed: Sister[] = sisters) {
  if (filename !== ":memory:") mkdirSync(dirname(resolve(filename)), { recursive: true });
  const db = new DatabaseSync(filename, { timeout: 5000 });
  db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  try {
    db.exec(`BEGIN IMMEDIATE;
      CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS recipients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 100),
        handle TEXT NOT NULL DEFAULT '', photo TEXT NOT NULL DEFAULT '',
        emoji TEXT NOT NULL DEFAULT '💌', traits TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS wishes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient_id INTEGER NOT NULL UNIQUE REFERENCES recipients(id) ON DELETE CASCADE,
        body TEXT NOT NULL UNIQUE CHECK(length(trim(body)) BETWEEN 1 AND 1500),
        closing TEXT NOT NULL DEFAULT '' CHECK(length(closing) <= 500),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      INSERT OR IGNORE INTO schema_migrations(version) VALUES (1);`);
    const insertRecipient = db.prepare("INSERT INTO recipients(slug, name, handle, photo, emoji, traits) VALUES (?, ?, ?, ?, ?, ?)");
    const updateRecipient = db.prepare("UPDATE recipients SET name = ?, handle = ?, photo = ?, emoji = ?, traits = ? WHERE slug = ?");
    const insertWish = db.prepare("INSERT INTO wishes(recipient_id, body, closing) VALUES (?, ?, ?)");
    for (const recipient of seed) {
      const existing = db.prepare("SELECT id FROM recipients WHERE slug = ?").get(recipient.slug);
      if (existing) {
        updateRecipient.run(recipient.name.trim(), recipient.handle, recipient.photo, recipient.emoji, JSON.stringify(recipient.traits), recipient.slug);
        continue;
      }
      const result = insertRecipient.run(recipient.slug, recipient.name.trim(), recipient.handle, recipient.photo, recipient.emoji, JSON.stringify(recipient.traits));
      if (recipient.wish.trim()) insertWish.run(result.lastInsertRowid, recipient.wish, recipient.appreciation);
    }
    if (!db.prepare("SELECT version FROM schema_migrations WHERE version = 2").get()) {
      // Remove only exact generated seed content, preserving all user-authored messages.
      for (const [slug, hash] of Object.entries(legacyWishHashes)) {
        const row = db.prepare(`${selection} WHERE r.slug = ?`).get(slug);
        if (!row) continue;
        const recipient = fromRow(row);
        const fingerprint = createHash("sha256").update(JSON.stringify([recipient.wish, recipient.appreciation])).digest("hex");
        if (fingerprint === hash) db.prepare("DELETE FROM wishes WHERE recipient_id = ?").run(recipient.id);
      }
      db.prepare("INSERT INTO schema_migrations(version) VALUES (2)").run();
    }
    if (!db.prepare("SELECT version FROM schema_migrations WHERE version = 3").get()) {
      db.exec(`CREATE TABLE wishes_multiple (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient_id INTEGER NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
        body TEXT NOT NULL CHECK(length(trim(body)) BETWEEN 1 AND 1500),
        closing TEXT NOT NULL DEFAULT '' CHECK(length(closing) <= 500),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(recipient_id, body, closing)
      );
      INSERT INTO wishes_multiple(id, recipient_id, body, closing, created_at) SELECT id, recipient_id, body, closing, created_at FROM wishes;
      DROP TABLE wishes;
      ALTER TABLE wishes_multiple RENAME TO wishes;
      CREATE INDEX wishes_recipient ON wishes(recipient_id, id);
      INSERT INTO schema_migrations(version) VALUES (3);`);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK"); db.close(); throw error;
  }

  return {
    list(): Sister[] { return db.prepare(`${selection} ORDER BY r.id`).all().map(fromRow); },
    find(slug: string): Sister | null {
      const row = db.prepare(`${selection} WHERE r.slug = ?`).get(slug);
      return row ? fromRow(row) : null;
    },
    allWishes(): Sister[] {
      return db.prepare(`SELECT r.id, r.slug, r.name, r.handle, r.photo, r.emoji, r.traits,
        w.id AS wishId, w.body AS wish, w.closing AS appreciation, w.created_at AS createdAt
        FROM wishes w JOIN recipients r ON r.id = w.recipient_id ORDER BY w.id DESC`).all().map(fromRow);
    },
    create(input: Pick<Sister, "name" | "wish" | "appreciation"> & { slug?: string }): { recipient: Sister; created: boolean } {
      const name = input.name.trim();
      const wish = input.wish.trim();
      const appreciation = input.appreciation.trim();
      const slug = input.slug ?? `nguoi-thuong-${randomUUID()}`;
      db.exec("BEGIN IMMEDIATE");
      try {
        let recipient = db.prepare(`${selection} WHERE r.slug = ?`).get(slug);
        if (recipient && fromRow(recipient).name !== name) throw new WishConflictError("Tên người nhận không khớp với link này.");
        if (!recipient) {
          db.prepare("INSERT INTO recipients(slug, name) VALUES (?, ?)").run(slug, name);
          recipient = db.prepare(`${selection} WHERE r.slug = ?`).get(slug);
        }
        const profile = fromRow(recipient);
        // An identical retry returns its original row; other wishes are appended.
        const previous = db.prepare("SELECT id, created_at FROM wishes WHERE recipient_id = ? AND body = ? AND closing = ?").get(profile.id, wish, appreciation) as { id: number; created_at: string } | undefined;
        let wishId = previous?.id;
        if (!previous) wishId = Number(db.prepare("INSERT INTO wishes(recipient_id, body, closing) VALUES (?, ?, ?)").run(profile.id, wish, appreciation).lastInsertRowid);
        const row = db.prepare("SELECT created_at FROM wishes WHERE id = ?").get(wishId!) as { created_at: string };
        db.exec("COMMIT");
        return { recipient: { ...profile, wish, appreciation, wishId, createdAt: row.created_at }, created: !previous };
      } catch (error) { db.exec("ROLLBACK"); throw error; }
    },    close() { db.close(); },
  };
}

let database: ReturnType<typeof openWishDatabase> | undefined;
export function getWishDatabase() {
  database ??= openWishDatabase(resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH || "data/wishes.sqlite"));
  return database;
}
