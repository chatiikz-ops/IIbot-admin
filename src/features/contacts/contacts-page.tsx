/* eslint-disable @next/next/no-location-assign-relative-destination */
"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Archive, Eye, Pencil, Plus, RefreshCw } from "lucide-react";
import { api, ApiError, unpackList } from "@/src/lib/api/client";
import {
  BUSINESS_TYPE_LABELS,
  CRM_PROVIDER_LABELS,
  STRATEGY_LABELS,
} from "@/src/lib/constants/labels";
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  Pagination,
  SearchInput,
  SelectFilter,
  StatusBadge,
} from "@/src/components/ui/ui";
import { dateTime } from "@/src/lib/formatters";
import { ContactForm } from "./contact-form";
import {
  Contact,
  CONTACT_STATUSES,
  ContactStatus,
  contactLabel,
} from "./types";
export function ContactsPage() {
  const [rows, setRows] = useState<Contact[]>([]),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(1),
    [limit, setLimit] = useState(20),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [crmProvider, setCrm] = useState(""),
    [businessType, setBusiness] = useState(""),
    [outreachEligible, setEligible] = useState(""),
    [strategyCode, setStrategy] = useState(""),
    [city, setCity] = useState(""),
    [loading, setLoading] = useState(true),
    [refreshing, setRefreshing] = useState(false),
    [error, setError] = useState(""),
    [editing, setEditing] = useState<Contact | null | undefined>(undefined),
    [archiving, setArchiving] = useState<Contact | null>(null),
    [archiveBusy, setArchiveBusy] = useState(false);
  const load = useCallback(
    async (background = false) => {
      if (background) setRefreshing(true);
      else setLoading(true);
      setError("");
      try {
        const list = unpackList<Contact>(
          await api.get("/contacts", {
            query: {
              page,
              limit,
              search,
              status,
              crmProvider,
              businessType,
              outreachEligible,
              strategyCode,
              city,
            },
          }),
        );
        setRows(list.items);
        setTotal(list.total);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Не удалось загрузить контакты",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      limit,
      search,
      status,
      crmProvider,
      businessType,
      outreachEligible,
      strategyCode,
      city,
    ],
  );
  useEffect(() => {
    const timer = setTimeout(load, search || city ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, search, city]);
  const reset = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };
  async function archive() {
    if (!archiving) return;
    setArchiveBusy(true);
    try {
      await api.delete(`/contacts/${archiving.id}`);
      setArchiving(null);
      await load(true);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Не удалось переместить контакт в архив",
      );
    } finally {
      setArchiveBusy(false);
    }
  }
  if (loading && !rows.length && !error) return <LoadingState />;
  return (
    <section className="page contacts-page">
      <div className="contacts-title">
        <div>
          <h2>Контакты</h2>
          <p>База компаний для работы AI-продавца</p>
        </div>
        <div>
          <Link className="button secondary" href="/contacts/deleted">
            <Archive size={15} />
            Архив
          </Link>
          <Button onClick={() => setEditing(null)}>
            <Plus size={15} />
            Добавить контакт
          </Button>
        </div>
      </div>
      <div className="toolbar contact-filters">
        <SearchInput
          placeholder="Компания, телефон или email…"
          value={search}
          onChange={(e) => reset(setSearch)(e.target.value)}
        />
        <Select
          label="Статус"
          value={status}
          set={reset(setStatus)}
          options={Object.fromEntries(
            CONTACT_STATUSES.map((x) => [x, contactLabel(x)]),
          )}
        />
        <Select
          label="CRM"
          value={crmProvider}
          set={reset(setCrm)}
          options={CRM_PROVIDER_LABELS}
        />
        <Select
          label="Тип бизнеса"
          value={businessType}
          set={reset(setBusiness)}
          options={BUSINESS_TYPE_LABELS}
        />
        <SelectFilter
          label="Обработка"
          value={outreachEligible}
          onChange={(e) => reset(setEligible)(e.target.value)}
        >
          <option value="">Все</option>
          <option value="true">Можно обрабатывать</option>
          <option value="false">Исключены</option>
        </SelectFilter>
        <Select
          label="Стратегия"
          value={strategyCode}
          set={reset(setStrategy)}
          options={STRATEGY_LABELS}
        />
        <label className="field city-filter">
          <span>Город</span>
          <input
            value={city}
            onChange={(e) => reset(setCity)(e.target.value)}
            placeholder="Например, Алматы"
          />
        </label>
        <SelectFilter
          label="Строк"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
        >
          {[20, 50, 100].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </SelectFilter>
        <Button
          variant="secondary"
          loading={refreshing}
          onClick={() => load(true)}
        >
          <RefreshCw size={15} />
          Обновить
        </Button>
      </div>
      {error ? (
        <ErrorState message={error} retry={() => load(false)} />
      ) : !rows.length ? (
        <EmptyState
          title="Контакты не найдены"
          description="Измените параметры поиска или фильтры."
        />
      ) : (
        <>
          <div className="table-wrap contact-table">
            <table>
              <thead>
                <tr>
                  <th>Компания</th>
                  <th>Телефон</th>
                  <th>Город</th>
                  <th>Тип бизнеса</th>
                  <th>CRM</th>
                  <th>Стратегия</th>
                  <th>Статус</th>
                  <th>Обработка</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/contacts/${c.id}`}>{c.companyName}</Link>
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.city || "—"}</td>
                    <td>{contactLabel(c.businessType)}</td>
                    <td>{contactLabel(c.crmProvider)}</td>
                    <td>{contactLabel(c.strategyCode, "Не назначена")}</td>
                    <td>
                      <StatusBadge tone={tone(c.status)}>
                        {contactLabel(c.status)}
                      </StatusBadge>
                    </td>
                    <td>{c.outreachEligible ? "Можно" : "Исключён"}</td>
                    <td>{dateTime(c.createdAt)}</td>
                    <td>
                      <div className="row-actions">
                        <Link href={`/contacts/${c.id}`} aria-label="Открыть">
                          <Eye size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditing(c)}
                          aria-label="Изменить"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setArchiving(c)}
                          aria-label="В архив"
                        >
                          <Archive size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            total={total}
            limit={limit}
            onChange={setPage}
          />
        </>
      )}
      <ContactForm
        key={editing === undefined ? "closed" : editing?.id || "new"}
        open={editing !== undefined}
        contact={editing}
        onClose={() => setEditing(undefined)}
        onSaved={(saved) => {
          setEditing(undefined);
          location.href = `/contacts/${saved.id}`;
        }}
      />
      <Modal
        open={!!archiving}
        title="Переместить контакт в архив?"
        onClose={() => !archiveBusy && setArchiving(null)}
      >
        <p>
          Контакт перестанет участвовать в новых кампаниях. История сохранится.
        </p>
        <div className="form-actions">
          <Button
            variant="secondary"
            disabled={archiveBusy}
            onClick={() => setArchiving(null)}
          >
            Отмена
          </Button>
          <Button variant="danger" loading={archiveBusy} onClick={archive}>
            В архив
          </Button>
        </div>
      </Modal>
    </section>
  );
}
function Select({
  label,
  value,
  set,
  options,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  options: Record<string, string>;
}) {
  return (
    <SelectFilter
      label={label}
      value={value}
      onChange={(e) => set(e.target.value)}
    >
      <option value="">Все</option>
      {Object.entries(options).map(([key, text]) => (
        <option value={key} key={key}>
          {text}
        </option>
      ))}
    </SelectFilter>
  );
}
function tone(
  status: ContactStatus,
): "success" | "danger" | "warning" | "info" {
  return status === "QUALIFIED"
    ? "success"
    : status === "REJECTED" || status === "ERROR"
      ? "danger"
      : status === "IN_PROGRESS"
        ? "warning"
        : "info";
}
