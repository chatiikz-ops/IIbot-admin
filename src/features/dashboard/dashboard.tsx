"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, api, unpackList } from "@/src/lib/api/client";
import { Entity } from "@/src/types";
import { BackendOfflineState, ErrorState, LoadingState, StatusBadge } from "@/src/components/ui/ui";
import { dateTime, safe } from "@/src/lib/formatters";

type Metric = { label: string; path: string; query?: Record<string,string>; value?: (payload: unknown) => number };
const requests: Metric[] = [
  {label:"Контакты",path:"/contacts"},
  {label:"Новые",path:"/contacts",query:{status:"NEW"}},
  {label:"В работе",path:"/contacts",query:{status:"IN_PROGRESS"}},
  {label:"Квалифицированы",path:"/contacts",query:{status:"QUALIFIED"}},
  {label:"Отклонены",path:"/contacts",query:{status:"REJECTED"}},
  {label:"Исключены",path:"/classification/stats",value:excludedCount},
  {label:"Лиды",path:"/leads"},
  {label:"Активные диалоги",path:"/conversations",query:{status:"ACTIVE"}},
];

export function Dashboard(){
  const [stats,setStats]=useState<(number|null)[]>([]); const [contacts,setContacts]=useState<Entity[]>([]); const [leads,setLeads]=useState<Entity[]>([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [offline,setOffline]=useState(false);
  const load=useCallback(async()=>{setLoading(true);setError("");setOffline(false);
    const metricResults=await Promise.allSettled(requests.map(item=>api.get(item.path,{query:{...item.query,page:item.path==="/classification/stats"?undefined:1,limit:item.path==="/classification/stats"?undefined:1}})));
    const successful=metricResults.filter(item=>item.status==="fulfilled");
    if(!successful.length){const reason=metricResults[0]?.status==="rejected"?metricResults[0].reason:undefined;setOffline(reason instanceof ApiError&&reason.status===0);setError(reason instanceof Error?reason.message:"Не удалось загрузить показатели");setLoading(false);return}
    setStats(metricResults.map((result,index)=>result.status==="fulfilled"?(requests[index].value?.(result.value)??unpackList(result.value).total):null));
    const recent=await Promise.allSettled([api.get("/contacts",{query:{page:1,limit:5}}),api.get("/leads",{query:{page:1,limit:5}})]);
    if(recent[0].status==="fulfilled")setContacts(unpackList<Entity>(recent[0].value).items); if(recent[1].status==="fulfilled")setLeads(unpackList<Entity>(recent[1].value).items);
    if(metricResults.some(item=>item.status==="rejected")||recent.some(item=>item.status==="rejected"))setError("Часть показателей временно недоступна. Остальные данные актуальны.");setLoading(false)
  },[]);
  useEffect(()=>{const id=setTimeout(load,0);return()=>clearTimeout(id)},[load]);
  if(loading)return <LoadingState/>; if(offline)return <BackendOfflineState retry={load}/>;
  return <section className="page">{error&&<ErrorState message={error} retry={load}/>}<div className="stat-grid">{requests.map((item,i)=><article className="stat" key={item.label}><span>{item.label}</span><strong>{stats[i]??"—"}</strong><small>{stats[i]===null?"Не удалось получить":"По данным backend"}</small></article>)}</div><div className="two-columns"><Recent title="Последние контакты" rows={contacts}/><Recent title="Последние лиды" rows={leads}/></div></section>
}

function excludedCount(payload:unknown){const value=(payload||{}) as {outreachEligible?:Record<string,number|string>};return Number(value.outreachEligible?.false||0)}
function Recent({title,rows}:{title:string;rows:Entity[]}){return <article className="panel"><div className="panel-head"><h2>{title}</h2><StatusBadge>{rows.length}</StatusBadge></div>{rows.length?rows.map((r,i)=><div className="recent" key={r.id||i}><div><b>{safe(r.companyName||(r.contact as Entity)?.companyName)}</b><span>{safe(r.phone||(r.contact as Entity)?.phone)}</span></div><span>{dateTime(r.createdAt)}</span></div>):<p className="muted">Нет данных</p>}</article>}
