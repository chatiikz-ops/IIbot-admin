"use client";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Copy, LoaderCircle, RefreshCw, Search, X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { EntityLabelContext, FIELD_LABELS, fieldLabel, fieldValueLabel } from "@/src/lib/constants/labels";
import { dateTime } from "@/src/lib/formatters";

export function Button({ children, variant = "primary", loading, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger"; loading?: boolean }) {
  return <button className={`button ${variant}`} disabled={loading || props.disabled} {...props}>{loading ? <LoaderCircle size={15} className="spin" /> : children}</button>;
}
export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "success" | "danger" | "warning" | "neutral" | "info" }) { return <span className={`badge ${tone}`}>{children}</span>; }
export function SearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) { return <label className="search"><Search size={16}/><input aria-label="Поиск" {...props}/></label>; }
export function SelectFilter(props: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) { return <label className="select-label"><span>{props.label}</span><select {...props}/></label>; }
export function LoadingState() { return <div className="state"><LoaderCircle className="spin"/><b>Загрузка данных</b><span>Получаем актуальную информацию из backend</span></div>; }
export function EmptyState({ title = "Данных пока нет", description = "Записи появятся здесь после добавления." }: { title?: string; description?: string }) { return <div className="state"><div className="state-icon">∅</div><b>{title}</b><span>{description}</span></div>; }
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) { return <div className="state"><AlertTriangle/><b>Не удалось загрузить данные</b><span>{message}</span>{retry && <Button variant="secondary" onClick={retry}><RefreshCw size={15}/>Повторить</Button>}</div>; }
export function BackendOfflineState({ retry }: { retry?: () => void }) { return <ErrorState message="Backend недоступен. Проверьте, что NestJS запущен на настроенном адресе." retry={retry}/>; }
export function Pagination({ page, total, limit, onChange }: { page: number; total: number; limit: number; onChange: (page: number) => void }) { const pages = Math.max(1, Math.ceil(total / limit)); return <div className="pagination"><span>{total ? `${(page-1)*limit+1}–${Math.min(page*limit,total)} из ${total}` : "0 записей"}</span><Button variant="secondary" disabled={page<=1} onClick={()=>onChange(page-1)} aria-label="Предыдущая"><ChevronLeft size={16}/></Button><span>{page} / {pages}</span><Button variant="secondary" disabled={page>=pages} onClick={()=>onChange(page+1)} aria-label="Следующая"><ChevronRight size={16}/></Button></div>; }
export function CopyButton({ value }: { value: string }) { const [done,setDone]=useState(false); return <button className="icon-button" onClick={async()=>{await navigator.clipboard.writeText(value);setDone(true);setTimeout(()=>setDone(false),1200)}} aria-label="Копировать">{done?<Check size={15}/>:<Copy size={15}/>}</button> }
export function JsonViewer({ value }: { value: unknown }) { return <pre className="json">{JSON.stringify(value, null, 2)}</pre>; }
export function TechnicalData({ value }: { value: unknown }) { return <details className="technical-data"><summary>Технические данные</summary><JsonViewer value={value}/></details>; }
export function HumanData({ value, context = "generic" }: { value: unknown; context?: EntityLabelContext }) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return <span>{fieldValueLabel("", value, context)}</span>;
  return <div className="human-data">{Object.entries(value as Record<string, unknown>).filter(([key])=>!isTechnicalField(key)).map(([key,item])=><div className="human-row" key={key}><span>{fieldLabel(key,context)}</span><b>{renderHumanValue(key,item,context)}</b></div>)}</div>;
}
export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) { useEffect(()=>{const fn=(e:KeyboardEvent)=>e.key==="Escape"&&onClose();window.addEventListener("keydown",fn);return()=>window.removeEventListener("keydown",fn)},[onClose]); if(!open)return null; return <div className="overlay" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X/></button></div>{children}</div></div> }
export const Drawer = Modal;
export function FormField({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="field"><span>{label}</span><input {...props}/></label> }
export function TextAreaField({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) { return <label className="field"><span>{label}</span><textarea {...props}/></label> }
export function ArrayFieldEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (v:string[])=>void }) { return <div className="field"><span>{label}</span>{values.map((v,i)=><div className="array-row" key={i}><input value={v} onChange={e=>onChange(values.map((x,j)=>j===i?e.target.value:x))}/><button onClick={()=>onChange(values.filter((_,j)=>j!==i))}><X size={15}/></button></div>)}<Button variant="secondary" onClick={()=>onChange([...values,""])}>Добавить элемент</Button></div> }

function renderHumanValue(key:string,value:unknown,context:EntityLabelContext):ReactNode {
  if (Array.isArray(value)) return value.length ? value.map((item)=>typeof item==="string"?(FIELD_LABELS[item]||fieldValueLabel(key,item,context)):String(item)).join(", ") : "—";
  if (value && typeof value === "object") return <HumanData value={value} context={context}/>;
  if (key.toLowerCase().endsWith("at")) return dateTime(value);
  return fieldValueLabel(key,value,context);
}
function isTechnicalField(key:string){return ["id","rawData","importId","contactId","conversationId"].includes(key)}
