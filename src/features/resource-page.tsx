"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { api, ApiError, unpackList } from "@/src/lib/api/client";
import { dateTime, safe } from "@/src/lib/formatters";
import { EntityLabelContext, fieldValueLabel } from "@/src/lib/constants/labels";
import { Entity } from "@/src/types";
import {
  BackendOfflineState, Button, EmptyState, ErrorState, FormField, HumanData,
  LoadingState, Modal, Pagination, SearchInput, SelectFilter, StatusBadge,
  TechnicalData, TextAreaField,
} from "@/src/components/ui/ui";

type Column = { key: string; label: string };
type Config = { endpoint: string; columns: Column[]; statuses?: string[]; create?: boolean };

const configs: Record<string, Config> = {
  contacts: {
    endpoint: "/contacts", create: true,
    statuses: ["NEW", "IN_PROGRESS", "QUALIFIED", "REJECTED", "ERROR"],
    columns: [
      { key: "companyName", label: "Компания" }, { key: "phone", label: "Телефон" },
      { key: "city", label: "Город" }, { key: "businessType", label: "Тип бизнеса" },
      { key: "crmProvider", label: "CRM" }, { key: "strategyCode", label: "Стратегия" },
      { key: "status", label: "Статус" }, { key: "outreachEligible", label: "Можно обрабатывать" },
      { key: "createdAt", label: "Дата создания" },
    ],
  },
  conversations: {
    endpoint: "/conversations",
    statuses: ["NEW", "ACTIVE", "WAITING_CLIENT", "HANDOFF_REQUIRED", "QUALIFIED", "REJECTED", "CLOSED"],
    columns: [
      { key: "contact.companyName", label: "Контакт" }, { key: "contact.phone", label: "Телефон" },
      { key: "status", label: "Статус" }, { key: "strategyCode", label: "Стратегия" },
      { key: "messageCount", label: "Сообщений" }, { key: "lastMessageAt", label: "Последнее сообщение" },
    ],
  },
  leads: {
    endpoint: "/leads", statuses: ["NEW", "QUALIFIED", "TRANSFERRED", "CLOSED"],
    columns: [
      { key: "contact.companyName", label: "Компания" }, { key: "contact.phone", label: "Телефон" },
      { key: "status", label: "Статус" }, { key: "summary", label: "Резюме" },
      { key: "qualificationReason", label: "Причина квалификации" }, { key: "createdAt", label: "Создан" },
    ],
  },
  strategies: {
    endpoint: "/prompt-strategies", create: true, statuses: ["ACTIVE", "DRAFT", "ARCHIVED"],
    columns: [
      { key: "name", label: "Название" }, { key: "status", label: "Статус" },
      { key: "versionsCount", label: "Версий" }, { key: "activeVersion", label: "Активная версия" },
      { key: "updatedAt", label: "Изменён" },
    ],
  },
};

export function ResourcePage({ type }: { type: keyof typeof configs }) {
  const cfg = configs[type];
  const context = contextFor(type);
  const [rows, setRows] = useState<Entity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Entity | null>(null);
  const [editing, setEditing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Entity | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const payload = await api.get<unknown>(cfg.endpoint, { query: { page, limit, search, status } });
      const list = unpackList<Entity>(payload);
      setRows(list.items); setTotal(list.total);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ошибка загрузки");
    } finally { setLoading(false); }
  }, [cfg.endpoint, page, limit, search, status]);

  useEffect(() => { const id = setTimeout(load, search ? 350 : 0); return () => clearTimeout(id); }, [load, search]);

  async function remove() {
    if (!pendingDelete?.id) return;
    setDeleting(true);
    try { await api.delete(`${cfg.endpoint}/${pendingDelete.id}`); setPendingDelete(null); await load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Ошибка удаления"); }
    finally { setDeleting(false); }
  }

  if (loading && !rows.length) return <LoadingState />;
  return (
    <section className="page">
      <div className="toolbar">
        <SearchInput placeholder="Поиск…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        {cfg.statuses && <SelectFilter label="Статус" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">Все</option>
          {cfg.statuses.map((value) => <option key={value} value={value}>{fieldValueLabel("status", value, context)}</option>)}
        </SelectFilter>}
        <SelectFilter label="Строк" value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}>
          {[20, 50, 100].map((value) => <option key={value}>{value}</option>)}
        </SelectFilter>
        <Button variant="secondary" onClick={load}><RefreshCw size={15} />Обновить</Button>
        {cfg.create && <Button onClick={() => { setSelected(null); setEditing(true); }}><Plus size={15} />Новая запись</Button>}
      </div>
      {error && (error.includes("подключ") ? <BackendOfflineState retry={load} /> : <ErrorState message={error} retry={load} />)}
      {!error && (!rows.length ? <EmptyState /> : <>
        <div className="table-wrap"><table><thead><tr>{cfg.columns.map((column) => <th key={column.key}>{column.label}</th>)}<th>Действия</th></tr></thead>
          <tbody>{rows.map((row, index) => <tr key={row.id || index}>
            {cfg.columns.map((column) => <td key={column.key}>{displayValue(type, column.key, at(row, column.key))}</td>)}
            <td><div className="row-actions">
              <button onClick={() => setSelected(row)} aria-label="Открыть"><Eye size={16} /></button>
              {type === "contacts" && <button onClick={() => { setSelected(row); setEditing(true); }} aria-label="Изменить"><Pencil size={16} /></button>}
              {type === "contacts" && <button className="danger-icon" onClick={() => setPendingDelete(row)} aria-label="Удалить"><Trash2 size={16} /></button>}
            </div></td>
          </tr>)}</tbody></table></div>
        <Pagination page={page} total={total} limit={limit} onChange={setPage} />
      </>)}
      <Modal open={!!selected && !editing} title="Карточка записи" onClose={() => setSelected(null)}>
        <HumanData value={selected} context={context} />
        <TechnicalData value={selected} />
        {type === "conversations" && selected?.id && <Link className="button primary" href={`/conversations/${selected.id}`}>Открыть переписку</Link>}
      </Modal>
      <EntityForm key={`${selected?.id || "new"}-${editing}`} open={editing} type={type} endpoint={cfg.endpoint} entity={selected} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); setSelected(null); load(); }} />
      <Modal open={!!pendingDelete} title="Удалить контакт?" onClose={() => !deleting && setPendingDelete(null)}>
        <p className="muted">Запись будет удалена без возможности восстановления.</p>
        <div className="form-actions"><Button variant="secondary" onClick={() => setPendingDelete(null)} disabled={deleting}>Отмена</Button><Button variant="danger" onClick={remove} loading={deleting}>Удалить</Button></div>
      </Modal>
    </section>
  );
}

function EntityForm({ open, type, endpoint, entity, onClose, onSaved }: { open:boolean; type:string; endpoint:string; entity:Entity|null; onClose:()=>void; onSaved:()=>void }) {
  const [form, setForm] = useState<Record<string,string>>(() => entity ? Object.entries(entity).reduce<Record<string,string>>((result,[key,value]) => { if (typeof value === "string") result[key] = value; return result; }, {}) : {});
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const fields = useMemo(() => type === "strategies" ? [["code","Идентификатор"],["name","Название"],["description","Описание"]] : [["companyName","Компания"],["phone","Телефон"],["city","Город"],["category","Категория"],["website","Сайт"],["instagram","Instagram"],["twoGisUrl","2GIS"],["bookingUrl","Ссылка записи"],["email","Email"],["address","Адрес"],["notes","Заметки"]], [type]);
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError("");try{if(entity?.id)await api.patch(`${endpoint}/${entity.id}`,form);else await api.post(endpoint,form);onSaved()}catch(caught){setError(caught instanceof ApiError?caught.message:"Не удалось сохранить")}finally{setBusy(false)}}
  return <Modal open={open} title={entity?"Редактирование":"Новая запись"} onClose={onClose}><form onSubmit={submit} className="form-grid">{fields.map(([key,label])=>key==="notes"||key==="description"?<TextAreaField key={key} label={label} value={form[key]||""} onChange={event=>setForm({...form,[key]:event.target.value})}/>:<FormField key={key} label={label} required={["companyName","phone","code","name"].includes(key)} value={form[key]||""} onChange={event=>setForm({...form,[key]:event.target.value})}/>)}{error&&<p className="form-error">{error}</p>}<div className="form-actions"><Button variant="secondary" type="button" onClick={onClose}>Отмена</Button><Button type="submit" loading={busy}>Сохранить</Button></div></form></Modal>;
}

function contextFor(type:string):EntityLabelContext{return type==="contacts"?"contact":type==="conversations"?"conversation":type==="leads"?"lead":type==="strategies"?"strategy":"generic"}
function at(row:Entity,key:string):unknown{return key.split(".").reduce<unknown>((value,part)=>value&&typeof value==="object"?(value as Record<string,unknown>)[part]:undefined,row)}
function displayValue(type:string,key:string,value:unknown){if(key.toLowerCase().endsWith("at"))return dateTime(value);if(["status","businessType","crmProvider","strategyCode","outreachEligible","skipReason"].includes(key))return <StatusBadge tone={key==="outreachEligible"?(value?"success":"danger"):"info"}>{fieldValueLabel(key,value,contextFor(type))}</StatusBadge>;return safe(value)}
