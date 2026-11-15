import test from "node:test";
import assert from "node:assert/strict";
import { BUSY, NOTICE, REQUEST, REV, createChannel } from "../skillsgate/mods/skillsgate/channel.js";

// A Map stands in for Herdr's shared store; `clock.now` is advanced by the test.
function setup(options = {}) {
  const store = new Map();
  const clock = { now: 1_000_000 };
  const channel = createChannel({
    get: (key) => store.get(key),
    set: (key, value) => store.set(key, value),
    now: () => clock.now,
    ...options,
  });
  return { store, clock, channel };
}

test("the shared keys have the agreed names", () => {
  assert.equal(REQUEST, "skillsgate.request.v1");
  assert.equal(BUSY, "skillsgate.busy.v1");
  assert.equal(NOTICE, "skillsgate.notice.v1");
  assert.equal(REV, "skillsgate.rev.v1");
});

test("a request reaches a listener once", () => {
  const { channel } = setup();
  channel.request({ op: "remove", on: null, key: "/a" });
  const next = channel.listen();
  assert.equal(next(), null, "a request made before listen() is not delivered");
  channel.request({ op: "link", on: "vps", key: "/b", tool: "claude" });
  const got = next();
  assert.equal(got.op, "link");
  assert.equal(got.on, "vps");
  assert.equal(got.key, "/b");
  assert.equal(got.tool, "claude");
  assert.equal(typeof got.id, "string");
  assert.ok(got.id.length > 0);
  assert.equal(next(), null, "delivered exactly once");
  assert.equal(next(), null);
});

test("two requests made in the same millisecond get different ids and are both delivered", () => {
  const { channel, clock } = setup();
  const next = channel.listen();
  channel.request({ op: "remove", on: null, key: "/a" });
  const first = next();
  clock.now += 0;
  channel.request({ op: "remove", on: null, key: "/a" });
  const second = next();
  assert.ok(first && second, "both requests were delivered");
  assert.notEqual(first.id, second.id);
  assert.equal(next(), null);
});

test("two listeners each receive the same request once", () => {
  const { channel } = setup();
  const a = channel.listen();
  const b = channel.listen();
  channel.request({ op: "unlink", on: null, key: "/a", tool: "cursor" });
  const fromA = a();
  const fromB = b();
  assert.equal(fromA.op, "unlink");
  assert.equal(fromB.id, fromA.id);
  assert.equal(a(), null);
  assert.equal(b(), null);
});

test("claim locks one machine only", () => {
  const { channel } = setup();
  assert.equal(channel.claim(null, "Scanning"), true);
  assert.equal(channel.claim(null, "Again"), false);
  assert.equal(channel.claim("vps", "Installing"), true);
  assert.equal(channel.busyAt(null), true);
  assert.equal(channel.busyAt("vps"), true);
  channel.release(null);
  assert.equal(channel.busyAt(null), false);
  assert.equal(channel.busyAt("vps"), true);
  assert.equal(channel.claim(null, "Third"), true);
});

test("claim on a busy machine leaves the stored text unchanged", () => {
  const { channel } = setup();
  channel.claim("vps", "Installing pdf");
  assert.equal(channel.claim("vps", "Removing pdf"), false);
  assert.equal(channel.textAt("vps"), "Installing pdf");
});

test("release of one machine keeps another machine's lock", () => {
  const { channel } = setup();
  channel.claim(null, "here");
  channel.claim("vps", "there");
  channel.release("vps");
  assert.equal(channel.busyAt("vps"), false);
  assert.equal(channel.busyAt(null), true);
  assert.equal(channel.textAt(null), "here");
});

test("textAt is the lock's text, or null when the machine is not busy", () => {
  const { channel } = setup();
  assert.equal(channel.textAt(null), null);
  channel.claim(null, "Linking pdf");
  assert.equal(channel.textAt(null), "Linking pdf");
  assert.equal(channel.textAt("vps"), null);
});

test("a stale lock is dropped", () => {
  const { channel, clock } = setup();
  assert.equal(channel.claim(null, "Installing"), true);
  clock.now += 150001;
  assert.equal(channel.busyAt(null), false);
  assert.equal(channel.textAt(null), null);
  assert.equal(channel.claim(null, "Next"), true);
});

test("a lock younger than staleMs still holds", () => {
  const { channel, clock } = setup({ staleMs: 1000 });
  channel.claim(null, "Installing");
  clock.now += 1000;
  assert.equal(channel.busyAt(null), true);
  clock.now += 1;
  assert.equal(channel.busyAt(null), false);
});

test("a stale lock on one machine does not free another", () => {
  const { channel, clock } = setup();
  channel.claim(null, "old");
  clock.now += 100000;
  channel.claim("vps", "new");
  clock.now += 100000;
  assert.equal(channel.busyAt(null), false);
  assert.equal(channel.busyAt("vps"), true);
});

test("a malformed busy value is treated as no locks", () => {
  for (const bad of ["oops", null, [], 7, { "": "text" }, { "": { text: "x" } }]) {
    const { channel, store } = setup();
    store.set(BUSY, bad);
    assert.equal(channel.busyAt(null), false, JSON.stringify(bad));
    assert.equal(channel.textAt(null), null, JSON.stringify(bad));
    assert.equal(channel.claim(null, "ok"), true, JSON.stringify(bad));
    assert.equal(channel.busyAt(null), true);
  }
});

test("bump raises one machine's rev", () => {
  const { channel } = setup();
  assert.equal(channel.rev("vps"), 0);
  channel.bump("vps");
  assert.equal(channel.rev("vps"), 1);
  assert.equal(channel.rev(null), 0);
  channel.bump("vps");
  channel.bump(null);
  assert.equal(channel.rev("vps"), 2);
  assert.equal(channel.rev(null), 1);
});

test("say, notice, clearNotice", () => {
  const { channel, clock } = setup();
  assert.equal(channel.notice(), null);
  channel.say("error", "x");
  assert.deepEqual(channel.notice(), { kind: "error", text: "x", at: clock.now });
  clock.now += 5;
  channel.say("done", "y");
  assert.deepEqual(channel.notice(), { kind: "done", text: "y", at: clock.now });
  channel.clearNotice();
  assert.equal(channel.notice(), null);
});

test("channel functions do not change an object they read from the store", () => {
  const { channel, store } = setup();
  channel.claim(null, "a");
  const busyBefore = store.get(BUSY);
  const snapshot = JSON.stringify(busyBefore);
  channel.claim("vps", "b");
  channel.release("vps");
  assert.equal(JSON.stringify(busyBefore), snapshot);
  channel.bump("vps");
  const revBefore = store.get(REV);
  channel.bump("vps");
  assert.deepEqual(revBefore, { vps: 1 });
});
