"use client";

import Link from "next/link";
import { ChangeEvent, DragEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  RotateCcw,
  UploadCloud,
  X,
} from "lucide-react";
import { api, ApiError, unpackList } from "@/src/lib/api/client";
import {
  Button,
  ErrorState,
  HumanData,
  Modal,
  Pagination,
  StatusBadge,
  TechnicalData,
} from "@/src/components/ui/ui";
import { Entity } from "@/src/types";
import { FIELD_LABELS, fieldValueLabel } from "@/src/lib/constants/labels";

const targets = [
  "companyName", "phone", "city", "category", "website", "instagram",
  "twoGisUrl", "bookingUrl", "email", "address", "notes", "ignore",
];

type Mapping = Record<string, string>;

export function ImportWizard() {
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [importId, setImportId] = useState("");
  const [previewData, setPreviewData] = useState<Entity | null>(null);
  const [mapping, setMapping] = useState<Mapping>({});
  const [rows, setRows] = useState<Entity[]>([]);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const id = new URLSearchParams(location.search).get("importId")
        || localStorage.getItem("zapis-import-id");
      if (!id) return;
      setImportId(id);
      try {
        const value = await api.get<Entity>(`/imports/${id}`);
        const rowPayload = await api.get(`/imports/${id}/rows`, { query: { page: 1, limit: 20 } });
        const savedRows = unpackList<Entity>(rowPayload).items;
        setPreviewData(value);
        setMapping(readMapping(value));
        setRows(savedRows);
        setStep(isConfirmed(value) ? 4 : savedRows.length ? 3 : 2);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Ошибка загрузки импорта");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function resetLocalImport() {
    setImportId("");
    setFile(null);
    setFileInputKey((value) => value + 1);
    setMapping({});
    setPreviewData(null);
    setRows([]);
    setPage(1);
    setError("");
    setStep(1);
    setConfirmResetOpen(false);
    localStorage.removeItem("zapis-import-id");
    history.replaceState(null, "", location.pathname);
  }

  function requestNewImport() {
    if (importId && step !== 4 && !isConfirmed(previewData)) {
      setConfirmResetOpen(true);
      return;
    }
    resetLocalImport();
  }

  async function closeCurrentAndReset() {
    setBusy(true);
    setError("");
    try {
      if (importId) await api.delete(`/imports/${importId}`);
      resetLocalImport();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Не удалось закрыть текущий импорт");
      setConfirmResetOpen(false);
    } finally {
      setBusy(false);
    }
  }

  function choose(nextFile?: File) {
    setError("");
    if (!nextFile) return;
    if (nextFile.size > 10 * 1024 * 1024) {
      setError("Размер файла превышает 10 МБ");
      return;
    }
    if (!/\.(xlsx?|csv)$/i.test(nextFile.name)) {
      setError("Поддерживаются только XLS, XLSX и CSV");
      return;
    }
    setFile(nextFile);
  }

  async function analyzeFile() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const value = await api.post<Entity>("/imports/preview", form);
      const id = String(value.id || value.importId || "");
      if (!id) throw new ApiError("Backend не вернул importId", 0, value);
      setImportId(id);
      setPreviewData(value);
      setMapping(readMapping(value));
      setRows([]);
      setPage(1);
      localStorage.setItem("zapis-import-id", id);
      history.replaceState(null, "", `${location.pathname}?importId=${encodeURIComponent(id)}`);
      setStep(2);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Ошибка анализа файла");
    } finally {
      setBusy(false);
    }
  }

  async function loadPreviewRows(nextPage = page) {
    if (!importId) return;
    setBusy(true);
    setError("");
    try {
      const value = await api.get<Entity>(`/imports/${importId}`);
      const rowPayload = await api.get(`/imports/${importId}/rows`, {
        query: { page: nextPage, limit: 20 },
      });
      setPreviewData(value);
      setMapping(readMapping(value));
      setRows(unpackList<Entity>(rowPayload).items);
      setPage(nextPage);
      setStep(3);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ошибка загрузки импорта");
    } finally {
      setBusy(false);
    }
  }

  async function confirmImport() {
    setBusy(true);
    setError("");
    try {
      setPreviewData(await api.post<Entity>(`/imports/${importId}/confirm`));
      setStep(4);
      localStorage.removeItem("zapis-import-id");
      history.replaceState(null, "", location.pathname);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ошибка импорта");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page">
      <div className="toolbar import-toolbar">
        <Button variant="secondary" onClick={requestNewImport} disabled={busy && !confirmResetOpen}>
          <RotateCcw size={15} />
          Новый импорт
        </Button>
      </div>

      <div className="steps">
        {["Файл", "Сопоставление", "Проверка", "Готово"].map((label, index) => (
          <div className={step >= index + 1 ? "done" : ""} key={label}>
            <span>{step > index + 1 ? <CheckCircle2 size={18} /> : index + 1}</span>
            {label}
          </div>
        ))}
      </div>

      {error && <ErrorState message={error} />}

      {step === 1 && (
        <div
          className="upload"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event: DragEvent) => {
            event.preventDefault();
            choose(event.dataTransfer.files[0]);
          }}
        >
          <UploadCloud size={38} />
          <h2>Перетащите таблицу сюда</h2>
          <p>XLS, XLSX или CSV, до 10 МБ</p>
          <label className="button secondary">
            Выбрать файл
            <input
              key={fileInputKey}
              hidden
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={(event: ChangeEvent<HTMLInputElement>) => choose(event.target.files?.[0])}
            />
          </label>
          {file && (
            <div className="chosen">
              <FileSpreadsheet />
              <div><b>{file.name}</b><span>{(file.size / 1024).toFixed(1)} КБ</span></div>
              <button onClick={() => setFile(null)} aria-label="Убрать файл"><X /></button>
            </div>
          )}
          <Button disabled={!file} loading={busy} onClick={analyzeFile}>
            Проанализировать файл
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="panel">
          <h2>Сопоставление колонок</h2>
          <p className="muted">Проверьте автоматическое сопоставление. Контакты будут созданы только после подтверждения.</p>
          <HumanData value={previewData} context="import" />
          <div className="mapping-sample">
            {targets.map((target) => <StatusBadge key={target}>{FIELD_LABELS[target] || target}</StatusBadge>)}
          </div>
          {Object.keys(mapping).length > 0 && <div className="human-data">{Object.entries(mapping).map(([source,target])=><div className="human-row" key={source}><span>{FIELD_LABELS[source] || source}</span><b>{FIELD_LABELS[target] || target}</b></div>)}</div>}
          <TechnicalData value={previewData} />
          <Button loading={busy} onClick={() => loadPreviewRows(1)}>Пересчитать и проверить</Button>
        </div>
      )}

      {step === 3 && (
        <div className="panel">
          <h2>Проверка строк</h2>
          <HumanData value={previewData} context="import" />
          {rows.length > 0 && (
            <>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Статус</th><th>Нормализованные данные</th><th>Ошибки</th></tr></thead>
                  <tbody>{rows.map((row, index) => (
                    <tr key={row.id || index}>
                      <td>{fieldValueLabel("status", row.status, "import")}</td>
                      <td><HumanData value={row.normalizedData} context="import" /></td>
                      <td>{String(row.errors || "—")}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <Pagination
                page={page}
                total={Number(previewData?.total || rows.length)}
                limit={20}
                onChange={loadPreviewRows}
              />
            </>
          )}
          <div className="notice">Будут импортированы только корректные контакты. Дубликаты и ошибочные строки останутся без изменений.</div>
          <div className="form-actions import-actions">
            <Button variant="secondary" onClick={() => setStep(2)} disabled={busy}>
              <ArrowLeft size={15} /> Назад
            </Button>
            <Button loading={busy} onClick={confirmImport}>Импортировать корректные контакты</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="state success-state">
          <CheckCircle2 />
          <h2>Импорт завершён</h2>
          <HumanData value={previewData} context="import" />
          <TechnicalData value={previewData} />
          <div className="form-actions">
            <Button variant="secondary" onClick={requestNewImport}>Импортировать ещё файл</Button>
            <Link className="button primary" href="/contacts">Перейти в Контакты</Link>
          </div>
        </div>
      )}

      <Modal
        open={confirmResetOpen}
        title="Начать новый импорт?"
        onClose={() => !busy && setConfirmResetOpen(false)}
      >
        <p className="muted">Текущий импорт будет закрыт. Продолжить?</p>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setConfirmResetOpen(false)} disabled={busy}>Отмена</Button>
          <Button variant="danger" loading={busy} onClick={closeCurrentAndReset}>Продолжить</Button>
        </div>
      </Modal>
    </section>
  );
}

function readMapping(value: Entity | null): Mapping {
  const candidate = value?.mapping;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return {};
  return Object.entries(candidate).reduce<Mapping>((result, [key, mappedValue]) => {
    if (typeof mappedValue === "string") result[key] = mappedValue;
    return result;
  }, {});
}

function isConfirmed(value: Entity | null): boolean {
  const status = String(value?.status || "").toUpperCase();
  return ["CONFIRMED", "COMPLETED", "IMPORTED", "DONE"].includes(status);
}
