import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openWishDatabase, WishConflictError } from "../app/lib/database.ts";
import { sisters } from "../app/data/sisters.ts";
import { DatabaseSync } from "node:sqlite";

test("migration preserves old wishes and allows many wishes for one person", () => {
  const directory = mkdtempSync(join(tmpdir(), "thuong-migration-"));
  const path = join(directory, "old.sqlite");
  try {
    const old = new DatabaseSync(path);
    old.exec(`CREATE TABLE schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT DEFAULT CURRENT_TIMESTAMP);
      INSERT INTO schema_migrations(version) VALUES (1), (2);
      CREATE TABLE recipients(id INTEGER PRIMARY KEY, slug TEXT UNIQUE, name TEXT, handle TEXT DEFAULT '', photo TEXT DEFAULT '', emoji TEXT DEFAULT '', traits TEXT DEFAULT '[]');
      CREATE TABLE wishes(id INTEGER PRIMARY KEY AUTOINCREMENT, recipient_id INTEGER UNIQUE REFERENCES recipients(id), body TEXT UNIQUE, closing TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
      INSERT INTO recipients(id,slug,name) VALUES (1,'person','Người nhận');
      INSERT INTO wishes(id,recipient_id,body) VALUES (42,1,'Lời chúc cũ');`);
    old.close();
    let database = openWishDatabase(path, []);
    assert.equal(database.allWishes()[0].wishId, 42);
    const saved = database.create({ slug: "person", name: "Người nhận", wish: "Lời chúc mới", appreciation: "" });
    assert.ok(saved.recipient.wishId! > 42);
    assert.equal(database.create({ slug: "other", name: "Người khác", wish: "Lời chúc mới", appreciation: "" }).created, true);
    assert.equal(database.allWishes().length, 3);
    database.close();
    database = openWishDatabase(path, []);
    try { assert.equal(database.allWishes().length, 3); assert.equal(database.find("person")?.wish, "Lời chúc mới"); }
    finally { database.close(); }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("seeds confirmed people once and persists Unicode wishes across reopening", () => {
  const directory = mkdtempSync(join(tmpdir(), "thuong-db-"));
  const path = join(directory, "test.sqlite");
  try {
    let database = openWishDatabase(path);
    assert.equal(database.list().length, 6);
    const input = { slug: "test-recipient", name: "Người nhận kiểm thử", wish: "Chúc bạn bình an 🌷 — 'quoted'", appreciation: "Lời nhắn riêng 💛" };
    const saved = database.create(input);
    assert.equal(saved.created, true);
    assert.equal(database.create(input).created, false);
    assert.throws(() => database.create({ ...input, name: "Khác" }), WishConflictError);
    assert.equal(database.create({ ...input, wish: "Another wish for this person" }).created, true);
    assert.equal(database.list().length, 7);
    database.close();
    database = openWishDatabase(path);
    try {
      assert.equal(database.list().length, 7);
      assert.equal(database.find(input.slug)?.wish, "Another wish for this person");
      assert.equal(database.allWishes().length, 2);
      assert.equal(database.find("huong-tra")?.handle, sisters[0].handle);
      assert.equal(database.find("not-found"), null);
      assert.equal(database.find("' OR 1=1 --"), null);
    } finally { database.close(); }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("a failed write rolls back its recipient and preserves the database", () => {
  const database = openWishDatabase(":memory:", []);
  try {
    assert.throws(() => database.create({ name: "Test", wish: "x".repeat(1501), appreciation: "" }));
    assert.equal(database.list().length, 0);
    assert.equal(database.create({ name: "Real recipient", wish: "Valid wish", appreciation: "" }).created, true);
    assert.equal(database.list().length, 1);
  } finally { database.close(); }
});

test("confirmed recipients start empty and an authored wish keeps their name and handle", () => {
  const database = openWishDatabase(":memory:");
  try {
    assert.equal(database.list().filter((recipient) => recipient.wish).length, 0);
    const recipient = database.find("huong-tra")!;
    assert.equal(recipient.wish, "");
    const input = { slug: recipient.slug, name: recipient.name, wish: "Lời chúc do chính mình viết cho Trà.", appreciation: "Lời nhắn của mình." };
    const saved = database.create(input);
    assert.equal(saved.recipient.id, recipient.id);
    assert.equal(saved.recipient.handle, recipient.handle);
    assert.equal(saved.recipient.wish, input.wish);
    assert.equal(database.list().length, 6);
    assert.equal(database.create(input).created, false);
    assert.equal(database.create({ ...input, wish: "A second visitor wish" }).created, true);
    assert.equal(database.find(recipient.slug)?.wish, "A second visitor wish");
    assert.deepEqual(database.allWishes().map((wish) => wish.wish), ["A second visitor wish", input.wish]);
  } finally { database.close(); }
});

test("updating seed names syncs into existing database while preserving wishes", () => {
  const directory = mkdtempSync(join(tmpdir(), "thuong-db-seed-"));
  const path = join(directory, "test.sqlite");
  try {
    let database = openWishDatabase(path, sisters);
    const original = database.find("huong-tra")!;
    database.create({ slug: "huong-tra", name: original.name, wish: "Lời chúc dành cho Trà.", appreciation: "" });
    database.close();

    const modifiedSeed = sisters.map((s) => s.slug === "huong-tra" ? { ...s, name: "Hoàng Thị Hương Trà Mới" } : s);
    database = openWishDatabase(path, modifiedSeed);
    try {
      const updated = database.find("huong-tra")!;
      assert.equal(updated.name, "Hoàng Thị Hương Trà Mới");
      assert.equal(updated.wish, "Lời chúc dành cho Trà.");
    } finally { database.close(); }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
