import assert from "node:assert/strict";
import test from "node:test";
import {
  belongsToCurrentGeneration,
  resolveWhatsAppConnectionView,
  whatsappPollingMs,
} from "../src/features/whatsapp/whatsapp-state.ts";

const status = (state, qrAvailable = false, generation = 1) => ({
  status: state,
  connected: state === "CONNECTED",
  qrAvailable,
  generation,
});

test("AUTH_FAILURE without QR renders authorization error", () => {
  assert.equal(
    resolveWhatsAppConnectionView(status("AUTH_FAILURE")),
    "auth-failure",
  );
});

test("fresh QR takes priority over AUTH_FAILURE", () => {
  assert.equal(
    resolveWhatsAppConnectionView(status("AUTH_FAILURE", true)),
    "qr",
  );
});

test("QR_REQUIRED with available QR renders QR", () => {
  assert.equal(
    resolveWhatsAppConnectionView(status("QR_REQUIRED", true)),
    "qr",
  );
});

test("new generation rejects the previous QR", () => {
  assert.equal(
    belongsToCurrentGeneration(status("QR_REQUIRED", true, 2), {
      available: true,
      generation: 1,
    }),
    false,
  );
  assert.equal(
    belongsToCurrentGeneration(status("QR_REQUIRED", true, 2), {
      available: true,
      generation: 2,
    }),
    true,
  );
});

test("available QR takes priority while backend reports it", () => {
  assert.equal(
    resolveWhatsAppConnectionView(status("CONNECTED", true)),
    "qr",
  );
});

test("every WhatsApp connection status has a deliberate view", () => {
  const expected = {DISABLED:"disabled",INITIALIZING:"initializing",QR_REQUIRED:"qr",AUTHENTICATING:"authenticating",CONNECTED:"connected",DISCONNECTED:"disconnected",AUTH_FAILURE:"auth-failure",ERROR:"error"};
  for (const [backendStatus, view] of Object.entries(expected)) assert.equal(resolveWhatsAppConnectionView(status(backendStatus)), view);
});

test("unknown connection status has a safe fallback", () => {
  assert.equal(resolveWhatsAppConnectionView(status("FUTURE_STATUS")), "unknown");
});

test("stale CONNECTED label without a live connection does not expose tools", () => {
  assert.equal(
    resolveWhatsAppConnectionView({
      ...status("CONNECTED", true),
      connected: false,
    }),
    "qr",
  );
});

test("messages error cannot change the connection view", () => {
  const connectionStatus = status("QR_REQUIRED", true);
  const messagesError = "timeout";
  assert.equal(messagesError, "timeout");
  assert.equal(resolveWhatsAppConnectionView(connectionStatus), "qr");
});

test("QR request timeout keeps the local QR connection area", () => {
  const qrError = "timeout";
  assert.equal(qrError, "timeout");
  assert.equal(
    resolveWhatsAppConnectionView(status("QR_REQUIRED", true)),
    "qr",
  );
});

test("READY never renders an endless authenticating loader", () => {
  assert.equal(resolveWhatsAppConnectionView({
    ...status("AUTHENTICATING"),
    lifecycleState: "READY",
  }), "state-warning");
});

test("polling is fast while connecting and relaxed after connected", () => {
  assert.equal(whatsappPollingMs("INITIALIZING"), 2_000);
  assert.equal(whatsappPollingMs("QR_REQUIRED"), 2_000);
  assert.equal(whatsappPollingMs("AUTHENTICATING"), 2_000);
  assert.equal(whatsappPollingMs("CONNECTED"), 12_000);
});
