// The line between dialogs and the panel.
//
// A dialog's background work stops when it closes, so a dialog never changes
// anything itself. It posts a request into Herdr's shared store and the panel,
// which lives as long as the app, picks it up. The same store carries a
// per-machine "busy" lock, a one-line notice and a per-machine revision counter.
//
// `get(key)` and `set(key, value)` are Herdr's `shared` and `setShared`, passed
// in, so this module never imports Herdr. Every value written here is a fresh
// object; nothing read from the store is changed in place.
//
// A machine is keyed by its name, so the per-machine maps (busy, rev) are read
// by own properties only: a machine named "constructor" or "__proto__" is a
// machine like any other.
//
// The request slot holds one request. The panel clears it once it has taken
// the request; each request carries the time it was posted, and the panel
// ignores (and clears) one that was already older than 10 s when it first saw
// it. A lock left by a panel that was reloaded or closed in the middle of an
// operation keeps that machine busy until it goes stale, 150 s after it was
// last refreshed; a lock dated more than 150 s ahead of the clock (the clock
// was set back) is stale too.

import { machineKey } from "./model.js";

export const REQUEST = "skillsgate.request.v1";
export const BUSY = "skillsgate.busy.v1";
export const NOTICE = "skillsgate.notice.v1";
export const REV = "skillsgate.rev.v1";

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
// The value of an own property, or undefined: never one from Object.prototype.
const own = (record, key) => (Object.hasOwn(record, key) ? record[key] : undefined);

export function createChannel({ get, set, now = Date.now, staleMs = 150000, requestMs = 10000 }) {
  // Different for every call, and different between copies of the mod: the
  // counter separates calls in one copy, the random part separates copies.
  let counter = 0;
  const makeId = () => `${now().toString(36)}-${(counter++).toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  // The busy map with stale and malformed entries dropped, as a map with no
  // prototype. A missing or malformed value reads as no locks.
  function liveLocks() {
    const stored = get(BUSY);
    const live = Object.create(null);
    if (!isRecord(stored)) return live;
    const t = now();
    for (const [key, lock] of Object.entries(stored)) {
      if (isRecord(lock) && typeof lock.text === "string" && typeof lock.at === "number" && Math.abs(t - lock.at) <= staleMs) {
        live[key] = { text: lock.text, at: lock.at };
      }
    }
    return live;
  }

  function revs() {
    const stored = get(REV);
    return isRecord(stored) ? stored : {};
  }

  return {
    // request(op): post `{ ...op, id, at }` for the panel. `id` is a new string
    // on every call; `at` is the time it was posted.
    request(op) {
      set(REQUEST, { ...op, id: makeId(), at: now() });
    },

    // posted() -> request | null: a copy of the request in the slot now.
    posted() {
      const stored = get(REQUEST);
      return isRecord(stored) ? { ...stored } : null;
    },

    // fresh(req) -> boolean: whether the request was posted at most 10 s ago
    // (and not more than 10 s ahead of the clock). One without a time is not.
    fresh(req) {
      const at = isRecord(req) ? req.at : undefined;
      return typeof at === "number" && Math.abs(now() - at) <= requestMs;
    },

    // clearRequest(id): empty the slot while it still holds the request with
    // this id; a newer request is never wiped.
    clearRequest(id) {
      const stored = get(REQUEST);
      if (id !== undefined && isRecord(stored) && stored.id === id) set(REQUEST, null);
    },

    // listen() -> next: start listening now. A request already in the store is
    // never delivered. next() returns each later request once, then null.
    listen() {
      const current = get(REQUEST);
      let lastId = isRecord(current) ? current.id : undefined;
      return function next() {
        const stored = get(REQUEST);
        if (!isRecord(stored) || stored.id === undefined || stored.id === lastId) return null;
        lastId = stored.id;
        return { ...stored };
      };
    },

    // claim(on, text) -> boolean: take the lock for machine `on` (null is this
    // computer). Returns false and changes nothing when it already has a live lock.
    claim(on, text) {
      const key = machineKey(on);
      const live = liveLocks();
      if (live[key]) return false;
      set(BUSY, { ...live, [key]: { text, at: now() } });
      return true;
    },

    // release(on): drop machine `on`'s lock. Other machines keep theirs.
    release(on) {
      const key = machineKey(on);
      const live = liveLocks();
      if (!live[key]) return;
      delete live[key];
      set(BUSY, { ...live });
    },

    // touch(on): refresh the time of machine `on`'s lock, so a long operation
    // that touches it before each step never sees it go stale. Does nothing
    // when the machine holds no live lock; other machines keep theirs.
    touch(on) {
      const key = machineKey(on);
      const live = liveLocks();
      if (!live[key]) return;
      set(BUSY, { ...live, [key]: { text: live[key].text, at: now() } });
    },

    // busyAt(on) -> boolean: whether machine `on` has a live lock.
    busyAt(on) {
      return Boolean(liveLocks()[machineKey(on)]);
    },

    // textAt(on) -> string | null: the live lock's text, or null when not busy.
    textAt(on) {
      return liveLocks()[machineKey(on)]?.text ?? null;
    },

    // say(kind, text): show a one-line notice. `kind` is "done", "warn" or "error".
    say(kind, text) {
      set(NOTICE, { kind, text, at: now() });
    },

    // notice() -> { kind, text, at } | null: the current notice.
    notice() {
      const stored = get(NOTICE);
      return isRecord(stored) ? stored : null;
    },

    // clearNotice(): remove the notice.
    clearNotice() {
      set(NOTICE, null);
    },

    // bump(on): raise machine `on`'s revision by one; dialogs watch it to know
    // when to re-read. Other machines' revisions are left alone.
    bump(on) {
      const key = machineKey(on);
      const current = revs();
      const value = own(current, key);
      set(REV, { ...current, [key]: (Number.isFinite(value) ? value : 0) + 1 });
    },

    // rev(on) -> number: machine `on`'s revision, 0 when it has none yet.
    rev(on) {
      const value = own(revs(), machineKey(on));
      return Number.isFinite(value) ? value : 0;
    },
  };
}
