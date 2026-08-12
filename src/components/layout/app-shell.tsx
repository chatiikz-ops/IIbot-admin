"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, BrainCircuit, Contact, FileUp, LayoutDashboard, Megaphone, Menu, MessageCircle, RefreshCw, Settings, Target, Wifi, WifiOff, X } from "lucide-react";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { api } from "@/src/lib/api/client";
import { BackendState } from "@/src/types";
import { Button, StatusBadge } from "@/src/components/ui/ui";

const nav = [
  ["/","Главная",LayoutDashboard],["/contacts","Контакты",Contact],["/imports","Импорт базы",FileUp],["/classification","Классификация",BarChart3],["/prompt-strategies","AI-стратегии",BrainCircuit],["/conversations","Диалоги",MessageCircle],["/leads","Лиды",Target],["/campaigns","Кампании",Megaphone],["/whatsapp","WhatsApp",MessageCircle],["/settings","Настройки",Settings],
] as const;
const info: Record<string,[string,string]> = { "/":["Главная","Обзор ключевых показателей продаж"], "/contacts":["Контакты","Управление базой компаний"], "/imports":["Импорт базы","Загрузка и проверка таблиц"], "/classification":["Классификация","Распределение контактов и стратегии"], "/prompt-strategies":["AI-стратегии","Версии сценариев общения"], "/conversations":["Диалоги","Переписка AI, клиентов и менеджеров"], "/leads":["Лиды","Квалифицированные обращения"], "/campaigns":["Кампании","Управление исходящими кампаниями"], "/whatsapp":["WhatsApp","Подключение канала сообщений"], "/settings":["Настройки","Интеграции и параметры системы"] };
export function AppShell({ children }: { children: ReactNode }) {
  const path=usePathname(); const [mobile,setMobile]=useState(false); const [status,setStatus]=useState<BackendState>("checking"); const [tick,setTick]=useState(0);
  const check=useCallback(async()=>{setStatus("checking");try{await api.get("/contacts",{query:{page:1,limit:1},timeout:5000});setStatus("online")}catch{setStatus("offline")}},[]);
  useEffect(()=>{const first=setTimeout(check,0);const id=setInterval(check,45000);return()=>{clearTimeout(first);clearInterval(id)}},[check,tick]);
  const current=info[path]||["Zapis.kz AI Sales","Рабочая панель"];
  return <div className="shell"><aside className={`sidebar ${mobile?"open":""}`}><div className="brand"><span><Bot size={19}/></span><div><b>Zapis.kz</b><small>AI Sales</small></div><button className="mobile-close" onClick={()=>setMobile(false)}><X/></button></div><nav>{nav.map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setMobile(false)} className={path===href?"active":""}><Icon size={17}/>{label}</Link>)}</nav><div className="sidebar-foot"><b>Zapis.kz AI Sales</b><span>Интерфейс v0.1.0</span><span className={status==="online"?"online":"offline"}>{status==="online"?<Wifi size={13}/>:<WifiOff size={13}/>} {status==="checking"?"Проверка backend":status==="online"?"Backend подключён":"Backend недоступен"}</span></div></aside>{mobile&&<div className="scrim" onClick={()=>setMobile(false)}/>}<div className="workspace"><header className="topbar"><button className="menu" onClick={()=>setMobile(true)}><Menu/></button><div><h1>{current[0]}</h1><p>{current[1]}</p></div><div className="header-actions"><StatusBadge tone={status==="online"?"success":status==="offline"?"danger":"neutral"}>{status==="checking"?"Проверка":status==="online"?"Backend подключён":"Backend недоступен"}</StatusBadge><Button variant="secondary" onClick={()=>setTick(x=>x+1)}><RefreshCw size={15}/>Обновить</Button></div></header><main key={tick}>{children}</main></div></div>
}
