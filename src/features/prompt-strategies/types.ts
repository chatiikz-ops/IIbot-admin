export type PromptStrategy = Record<string,unknown> & { id:string; code:string; name:string; description?:string; status:"DRAFT"|"ACTIVE"|"ARCHIVED"; activeVersionId?:string|null; activeVersion?:PromptVersion|null; versions?:PromptVersion[]; _count?:{versions:number}; createdAt?:string; updatedAt?:string };
export type PromptVersion = Record<string,unknown> & { id?:string; version:number; systemInstruction:string; objective:string; firstMessage:string; communicationRules:string; qualificationQuestions:string[]; sellingPoints:string[]; competitorContext?:string|null; handoffRules:string; stopRules:string; forbiddenActions:string[]; closingRules:string; maxAssistantMessages:number; changeNote?:string|null; metadata?:Record<string,unknown>|null; createdAt?:string; isActive?:boolean };
export type PromptDraft = {
  systemInstruction:string; objective:string; firstMessage:string; communicationRules:string;
  qualificationQuestions:string[]; sellingPoints:string[]; competitorContext:string;
  handoffRules:string; stopRules:string; forbiddenActions:string[]; closingRules:string;
  maxAssistantMessages:number; changeNote:string; metadata:Record<string,unknown>|null;
};
