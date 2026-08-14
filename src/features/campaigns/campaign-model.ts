export function campaignSource(sourceType:string,importId:string,filters:Record<string,unknown>={}) { return {sourceType,...(sourceType==="IMPORT_JOB"?{sourceImportJobId:importId}:{}),filters}; }
export function canStartCampaign(preflight:{ready:boolean}|null|undefined) { return preflight?.ready===true; }
export function campaignPollingMs(status:string) { return status==="RUNNING"?5000:status==="PAUSED"?15000:null; }
export function issueHref(code:string) { const value=code.toUpperCase();if(value.includes("WHATSAPP"))return "/whatsapp";if(value.includes("STRATEG"))return "/prompt-strategies";if(value.includes("AUTOMATION")||value.includes("SETTING"))return "/settings";if(value.includes("CONTACT"))return "/campaigns";return null; }
