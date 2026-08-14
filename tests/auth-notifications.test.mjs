import assert from "node:assert/strict";
import test from "node:test";
import {
  getAccessToken,
  setAccessToken,
  subscribeAuth,
} from "../src/lib/api/client.ts";

test("session-expired followed by listener clear does not recurse", () => {
  setAccessToken(null);
  let calls = 0;
  const unsubscribe = subscribeAuth((event) => {
    calls += 1;
    assert.equal(event, "session-expired");
    setAccessToken(null);
  });

  setAccessToken(null, "session-expired");

  unsubscribe();
  assert.equal(getAccessToken(), null);
  assert.equal(calls, 1);
});

test("changed notifications are idempotent", () => {
  setAccessToken(null);
  let calls = 0;
  const unsubscribe = subscribeAuth(() => { calls += 1; });
  setAccessToken("test-token");
  setAccessToken("test-token");
  setAccessToken(null);
  setAccessToken(null);
  unsubscribe();
  assert.equal(calls, 2);
});
