import { StatusBadge } from "@/src/components/ui/ui";
import { dateTime } from "@/src/lib/formatters";
import { Contact, contactLabel } from "./types";

export function ContactClassification({ contact }: { contact: Contact }) {
  const isZapis = contact.crmProvider === "ZAPIS" && contact.skipReason === "EXISTING_ZAPIS_CLIENT";
  return <section className="contact-panel classification-panel">
    <div className="section-heading"><div><h2>Определено системой</h2><p>Эти данные рассчитываются автоматически по информации о компании.</p></div><StatusBadge tone="info">Определено автоматически</StatusBadge></div>
    {isZapis && <div className="contact-warning"><strong>Клиент уже использует Zapis.kz</strong><span>Автоматическая продажа этому контакту отключена.</span></div>}
    {contact.skipReason === "MANUALLY_EXCLUDED" && <div className="contact-warning"><strong>Контакт исключён вручную</strong><span>Автоматическая обработка отключена.</span></div>}
    <dl className="contact-data-grid">
      <Data label="Тип бизнеса" value={contactLabel(contact.businessType)} />
      <Data label="CRM" value={contactLabel(contact.crmProvider, "Не определена")} />
      <Data label="Стратегия" value={contactLabel(contact.strategyCode, "Стратегия не определена")} />
      <div><dt>Можно обрабатывать</dt><dd><StatusBadge tone={contact.outreachEligible ? "success" : "danger"}>{contact.outreachEligible ? "Можно" : "Не обрабатывать"}</StatusBadge></dd></div>
      <Data label="Причина исключения" value={contact.skipReason ? contactLabel(contact.skipReason, "Причина не указана") : "—"} />
      <Data label="Дата классификации" value={dateTime(contact.classifiedAt)} />
    </dl>
    {!!contact.detectedDomains?.length && <div className="detected-domains"><span>Обнаруженные сервисы</span><div>{contact.detectedDomains.map(domain => <StatusBadge key={domain}>{domain}</StatusBadge>)}</div></div>}
  </section>;
}

function Data({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
