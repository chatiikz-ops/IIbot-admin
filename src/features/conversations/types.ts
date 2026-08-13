export type ConversationStatus="NEW"|"ACTIVE"|"WAITING_CLIENT"|"HANDOFF_REQUIRED"|"QUALIFIED"|"REJECTED"|"CLOSED";
export type MessageRole="CLIENT"|"AI"|"MANAGER"|"SYSTEM";
export type ContactSummary={id:string;companyName:string;phone:string;city?:string};
export type MediaAttachment={id:string;messageId?:string;type:string;caption?:string;transcription?:string;imageDescription?:string;processingStatus?:string};
export type Message={id:string;role:MessageRole;text:string;createdAt:string;mediaAttachments?:MediaAttachment[]};
export type Conversation={id:string;status:ConversationStatus;strategyCode:string;preferredLanguage?:string;messageCount:number;lastMessageAt:string;startedAt:string;metadata?:Record<string,unknown>;contact:ContactSummary;messages?:Message[];lead?:Record<string,unknown>;promptStrategy?:{id:string;name:string;status:string};promptVersion?:{version:number};};
export const STATUSES:ConversationStatus[]=["NEW","ACTIVE","WAITING_CLIENT","HANDOFF_REQUIRED","QUALIFIED","REJECTED","CLOSED"];
export const statusLabel=(v?:string)=>({NEW:"Новый",ACTIVE:"Активный",WAITING_CLIENT:"Ждём клиента",HANDOFF_REQUIRED:"Нужен менеджер",QUALIFIED:"Квалифицирован",REJECTED:"Не заинтересован",CLOSED:"Завершён"}[v||""]||"—");
export const languageLabel=(v?:string)=>({ru:"Русский",kk:"Қазақша",en:"English"}[v||""]||"Не определён");
