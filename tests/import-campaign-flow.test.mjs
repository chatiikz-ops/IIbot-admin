import assert from "node:assert/strict";
import test from "node:test";
import { canConfirmMapping, importCampaignHref, missingRequiredMapping } from "../src/features/imports/import-model.ts";
import { campaignPollingMs, campaignSource, canStartCampaign, issueHref } from "../src/features/campaigns/campaign-model.ts";
import { CAMPAIGN_TARGET_STATUS_LABELS, STRATEGY_LABELS } from "../src/lib/constants/labels.ts";

test("mapping can be changed and requires company plus phone",()=>{const mapping={Компания:"companyName"};assert.deepEqual(missingRequiredMapping(mapping),{companyName:false,phone:true});mapping.Телефон="phone";assert.equal(canConfirmMapping(mapping),true)});
test("completed import creates an opaque preselected campaign route",()=>assert.equal(importCampaignHref("job id"),"/campaigns?importId=job%20id"));
test("import source sends sourceImportJobId without exposing it as input",()=>assert.deepEqual(campaignSource("IMPORT_JOB","abc",{city:"Алматы"}),{sourceType:"IMPORT_JOB",sourceImportJobId:"abc",filters:{city:"Алматы"}}));
test("preflight controls start and blockers have actionable routes",()=>{assert.equal(canStartCampaign({ready:true}),true);assert.equal(canStartCampaign({ready:false}),false);assert.equal(issueHref("WHATSAPP_DISCONNECTED"),"/whatsapp");assert.equal(issueHref("STRATEGY_MISSING"),"/prompt-strategies")});
test("running and paused campaigns use bounded polling",()=>{assert.equal(campaignPollingMs("RUNNING"),5000);assert.equal(campaignPollingMs("PAUSED"),15000);assert.equal(campaignPollingMs("COMPLETED"),null)});
test("target and strategy codes have human labels",()=>{assert.ok(CAMPAIGN_TARGET_STATUS_LABELS.SENT);assert.ok(CAMPAIGN_TARGET_STATUS_LABELS.SKIPPED);assert.ok(STRATEGY_LABELS.BARBERSHOP_GENERAL)});
