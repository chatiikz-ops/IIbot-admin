import assert from "node:assert/strict";
import test from "node:test";
import {
  belongsToCurrentGeneration, connectionActionsDisabled,
  resolveWhatsAppConnectionView, runSingleFlight, shouldRequestQr,
  whatsappPollingMs, WHATSAPP_ACTION_ENDPOINTS,
} from "../src/features/whatsapp/whatsapp-state.ts";

const snapshot = (state, overrides = {}) => ({
  enabled: state !== "DISABLED", state, connected: state === "CONNECTED",
  qrAvailable: state === "QR_REQUIRED", phoneNumber: null, displayName: null,
  lastConnectedAt: null, lastDisconnectedAt: null, lastError: null,
  generation: 1, ...overrides,
});

test("IDLE -> Connect -> STARTING",()=>assert.deepEqual([resolveWhatsAppConnectionView(snapshot("IDLE")),resolveWhatsAppConnectionView(snapshot("STARTING"))],["idle","starting"]));
test("STARTING -> QR_REQUIRED",()=>assert.deepEqual([resolveWhatsAppConnectionView(snapshot("STARTING")),resolveWhatsAppConnectionView(snapshot("QR_REQUIRED"))],["starting","qr"]));
test("QR_REQUIRED requests and shows QR",()=>{const state=snapshot("QR_REQUIRED");assert.equal(shouldRequestQr(state),true);assert.equal(resolveWhatsAppConnectionView(state),"qr")});
test("QR_REQUIRED -> AUTHENTICATING removes QR",()=>{const state=snapshot("AUTHENTICATING",{qrAvailable:false});assert.equal(shouldRequestQr(state),false);assert.equal(resolveWhatsAppConnectionView(state),"authenticating")});
test("AUTHENTICATING -> CONNECTED",()=>assert.deepEqual([resolveWhatsAppConnectionView(snapshot("AUTHENTICATING")),resolveWhatsAppConnectionView(snapshot("CONNECTED"))],["authenticating","connected"]));
test("ERROR -> reconnect -> CONNECTED",()=>assert.deepEqual([resolveWhatsAppConnectionView(snapshot("ERROR")),resolveWhatsAppConnectionView(snapshot("STARTING")),resolveWhatsAppConnectionView(snapshot("CONNECTED"))],["error","starting","connected"]));
test("CONNECTED -> destroy -> IDLE",()=>assert.deepEqual([resolveWhatsAppConnectionView(snapshot("CONNECTED")),resolveWhatsAppConnectionView(snapshot("DISCONNECTING")),resolveWhatsAppConnectionView(snapshot("IDLE"))],["connected","disconnecting","idle"]));
test("CONNECTED -> logout -> IDLE",()=>assert.deepEqual([resolveWhatsAppConnectionView(snapshot("CONNECTED")),resolveWhatsAppConnectionView(snapshot("LOGGING_OUT")),resolveWhatsAppConnectionView(snapshot("IDLE"))],["connected","logging-out","idle"]));
test("old QR generation is hidden",()=>{const state=snapshot("QR_REQUIRED",{generation:2});assert.equal(belongsToCurrentGeneration(state,{available:true,generation:1}),false);assert.equal(belongsToCurrentGeneration(state,{available:true,generation:2}),true);assert.equal(belongsToCurrentGeneration(state,{available:true}),false)});
test("CONNECTED snapshot after ERROR contains no stale error UI state",()=>{const connected=snapshot("CONNECTED",{lastError:null,qrAvailable:false});assert.equal(resolveWhatsAppConnectionView(connected),"connected");assert.equal(connected.lastError,null);assert.equal(shouldRequestQr(connected),false)});
test("repeated actions are disabled while operation or transition is active",()=>{assert.equal(connectionActionsDisabled(snapshot("CONNECTED"),"destroy"),true);assert.equal(connectionActionsDisabled(snapshot("DISCONNECTING"),""),true);assert.equal(connectionActionsDisabled(snapshot("LOGGING_OUT"),""),true)});
test("polling uses one single-flight request and state-based cadence",async()=>{let calls=0;let release;const slot={current:null};const task=()=>{calls++;return new Promise(resolve=>{release=resolve})};const first=runSingleFlight(slot,task);const second=runSingleFlight(slot,task);assert.equal(calls,1);release();await Promise.all([first,second]);assert.equal(slot.current,null);assert.equal(whatsappPollingMs("QR_REQUIRED"),1500);assert.equal(whatsappPollingMs("CONNECTED"),12000)});
test("all canonical states resolve without guessing",()=>{const expected={DISABLED:"disabled",IDLE:"idle",STARTING:"starting",QR_REQUIRED:"qr",AUTHENTICATING:"authenticating",CONNECTED:"connected",DISCONNECTING:"disconnecting",LOGGING_OUT:"logging-out",ERROR:"error"};for(const[state,view]of Object.entries(expected))assert.equal(resolveWhatsAppConnectionView(snapshot(state)),view)});
test("CONNECTED requires backend connected=true",()=>assert.equal(resolveWhatsAppConnectionView(snapshot("CONNECTED",{connected:false})),"unknown"));
test("canonical API actions use backend lifecycle endpoints",()=>assert.deepEqual(WHATSAPP_ACTION_ENDPOINTS,{initialize:"/whatsapp/initialize",reconnect:"/whatsapp/reconnect",destroy:"/whatsapp/destroy",logout:"/whatsapp/logout"}));
