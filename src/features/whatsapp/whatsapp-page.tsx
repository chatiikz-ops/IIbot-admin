"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Link2,
  LogOut,
  RefreshCw,
  RotateCcw,
  Send,
  Smartphone,
} from "lucide-react";
import { api, ApiError, unpackList } from "@/src/lib/api/client";
import { dateTime, safe } from "@/src/lib/formatters";
import {
  WHATSAPP_DIRECTION_LABELS,
  WHATSAPP_MESSAGE_STATUS_LABELS,
  WHATSAPP_STATUS_LABELS,
  enumLabel,
} from "@/src/lib/constants/labels";
import {
  BackendOfflineState,
  Button,
  EmptyState,
  ErrorState,
  FormField,
  LoadingState,
  Modal,
  Pagination,
  StatusBadge,
  TechnicalData,
  TextAreaField,
} from "@/src/components/ui/ui";
import { WhatsAppMessage, WhatsAppQr, WhatsAppStatus } from "./types";
import {
  belongsToCurrentGeneration,
  connectionActionsDisabled,
  resolveWhatsAppConnectionView,
  runSingleFlight,
  shouldRequestQr,
  WHATSAPP_ACTION_ENDPOINTS,
  type WhatsAppAction,
  whatsappPollingMs,
} from "./whatsapp-state";

type Tab = "messages" | "unmatched";
export function WhatsAppPage() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [qr, setQr] = useState<WhatsAppQr | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [qrError, setQrError] = useState("");
  const [busy, setBusy] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("messages");
  const [notice, setNotice] = useState("");
  const [messagesRefresh, setMessagesRefresh] = useState(0);
  const statusRequestInFlight = useRef<Promise<void> | null>(null);
  const qrRequestInFlight = useRef<Promise<void> | null>(null);
  const actionInFlight = useRef(false);
  const currentStatus = useRef<WhatsAppStatus | null>(null);
  const loadStatus = useCallback(async (silent = false) => {
    return runSingleFlight(statusRequestInFlight, async () => {
      if (!silent) setLoading(true);
      try {
        const value = await api.get<WhatsAppStatus>("/whatsapp/status", { timeout: 6000 });
        setStatus(value);
        currentStatus.current = value;
        setOffline(false);
        setConnectionError("");
        if (!shouldRequestQr(value)) { setQr(null); setQrError(""); }
      } catch (caught) {
        setOffline(true);
        setConnectionError(caught instanceof Error ? caught.message : "Backend недоступен");
      } finally {
        if (!silent) setLoading(false);
      }
    });
  }, []);
  const loadQr = useCallback(async () => {
    if (!currentStatus.current || !shouldRequestQr(currentStatus.current)) return;
    return runSingleFlight(qrRequestInFlight, async () => {
      setQrError("");
      try {
        const value = await api.get<WhatsAppQr>("/whatsapp/qr");
        if (!currentStatus.current || !shouldRequestQr(currentStatus.current) || !belongsToCurrentGeneration(currentStatus.current, value)) return;
        if (value.available && value.qrDataUrl && !value.qrDataUrl.startsWith("data:image/png;base64,")) { setQr(null); setQrError("Backend вернул некорректный QR-код"); return; }
        setQr(value);
      } catch (caught) { setQrError(caught instanceof Error ? caught.message : "Не удалось получить QR-код"); }
    });
  }, []);
  const currentState = status?.state;
  const qrShouldLoad = status ? shouldRequestQr(status) : false;
  useEffect(() => {
    const timer = setTimeout(loadStatus, 0);
    return () => clearTimeout(timer);
  }, [loadStatus]);
  useEffect(() => {
    if (!qrShouldLoad) return;
    const timer = setTimeout(loadQr, 0);
    return () => clearTimeout(timer);
  }, [qrShouldLoad, status?.generation, loadQr]);
  useEffect(() => {
    if (!currentState) return;
    const interval = setInterval(
      () => void loadStatus(true),
      whatsappPollingMs(currentState),
    );
    return () => clearInterval(interval);
  }, [currentState, loadStatus]);
  async function action(endpoint: WhatsAppAction, success: string) {
    if (busy || actionInFlight.current) return;
    actionInFlight.current = true;
    let actionFailure = "";
    setBusy(endpoint);
    setConnectionError("");
    setQrError("");
    try {
      await api.post(WHATSAPP_ACTION_ENDPOINTS[endpoint]);
      setNotice(success);
      setTimeout(() => setNotice(""), 2500);
    } catch (caught) {
      actionFailure = caught instanceof ApiError ? caught.message : "Операция не выполнена";
    } finally {
      if (statusRequestInFlight.current) await statusRequestInFlight.current;
      await loadStatus(true);
      if (actionFailure) setConnectionError(actionFailure);
      actionInFlight.current = false;
      setBusy("");
    }
  }
  async function logout() {
    await action("logout", "Выход из аккаунта WhatsApp запущен");
    setLogoutOpen(false);
    setQr(null);
  }
  if (loading && !status)
    return (
      <section className="page">
        <LoadingState />
      </section>
    );
  if (offline)
    return (
      <section className="page">
        <div className="whatsapp-offline">
          <BackendOfflineState retry={() => loadStatus()} />
        </div>
      </section>
    );
  if (!status) return null;
  const connectionView = resolveWhatsAppConnectionView(status);
  const visibleQr = qr && belongsToCurrentGeneration(status, qr) ? qr : null;
  const actionsDisabled = connectionActionsDisabled(status, busy);
  return (
    <section className="page whatsapp-page">
      <div className="whatsapp-status-card">
        <div>
          <div className="wa-title">
            <Smartphone />
            <h2>WhatsApp</h2>
            <StatusBadge tone={statusTone(status.state)}>
              {WHATSAPP_STATUS_LABELS[status.state] || enumLabel(status.state)}
            </StatusBadge>
          </div>
          {connectionView === "connected" && <div className="wa-facts">
            <Fact label="Номер" value={status.phoneNumber} />
            <Fact label="Имя WhatsApp" value={status.displayName} />
            <Fact
              label="Последнее подключение"
              value={dateTime(status.lastConnectedAt)}
            />
            <Fact
              label="QR доступен"
              value={status.qrAvailable ? "Да" : "Нет"}
            />
          </div>}
          <div className="wa-actions">
            {status.state === "IDLE" && (
              <Button loading={busy === "initialize"} disabled={actionsDisabled} onClick={() => action("initialize", "Подключение WhatsApp запущено")}>
                <Link2 size={15} />
                Подключить
              </Button>
            )}
            {status.state === "ERROR" && (
              <Button loading={busy === "reconnect"} disabled={actionsDisabled} onClick={() => action("reconnect", "Переподключение WhatsApp запущено")}><RotateCcw size={15} />Переподключить</Button>
            )}
            {status.state === "CONNECTED" && status.connected && (
              <>
                <Button
                  variant="secondary"
                  loading={busy === "reconnect"}
                  disabled={actionsDisabled}
                  onClick={() => action("reconnect", "Переподключение WhatsApp запущено")}
                >
                  <RotateCcw size={15} />
                  Переподключить
                </Button>
                <Button
                  variant="secondary"
                  disabled={actionsDisabled}
                  loading={busy === "destroy"}
                  onClick={() => action("destroy", "Отключение WhatsApp запущено")}
                >
                  <Smartphone size={15} />
                  Отключить
                </Button>
                <Button
                  variant="danger"
                  disabled={actionsDisabled}
                  onClick={() => setLogoutOpen(true)}
                >
                  <LogOut size={15} />
                  Выйти из аккаунта
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              disabled={actionsDisabled}
              onClick={() => loadStatus()}
            >
              <RefreshCw size={15} />
              Обновить
            </Button>
          </div>
        </div>
        <div className={`wa-state-orb ${status.state.toLowerCase()}`}>
          <span />
        </div>
      </div>
      {notice && <div className="toast-inline">{notice}</div>}
      {connectionError && <p className="form-error">{connectionError}</p>}
      {connectionView === "connected" ? (
        <WhatsAppConnectedDashboard />
      ) : connectionView === "qr" ? (
        <WhatsAppQrConnect qr={visibleQr} error={qrError} retry={loadQr} />
      ) : connectionView === "starting" ? (
        <WhatsAppInitializing title="Запускаем WhatsApp..." description="Подготавливаем подключение" />
      ) : connectionView === "authenticating" ? (
        <WhatsAppInitializing title="QR подтверждён. Завершаем подключение..." description="Подключение обновится автоматически" />
      ) : connectionView === "disconnecting" ? (
        <WhatsAppInitializing title="Отключаем WhatsApp..." description="Дождитесь завершения операции" />
      ) : connectionView === "logging-out" ? (
        <WhatsAppInitializing title="Выходим из WhatsApp..." description="Дождитесь завершения операции" />
      ) : connectionView === "idle" ? (
        <WhatsAppStateMessage title="WhatsApp не подключён" />
      ) : connectionView === "error" ? (
        <WhatsAppStateMessage title="Ошибка подключения WhatsApp" error={status.lastError} />
      ) : connectionView === "disabled" ? (
        <WhatsAppStateMessage title="WhatsApp отключён в конфигурации" />
      ) : (
        <WhatsAppStateMessage title="Некорректное состояние WhatsApp" error={String(status.state)} />
      )}
      {connectionView === "connected" && status.connected && <div className="whatsapp-grid">
        <WhatsAppMessages tab={tab} onTab={setTab} refreshKey={messagesRefresh} />
        <WhatsAppTestSend
          connected={status.connected}
          ownNumber={status.phoneNumber}
          onSent={() => {
            setMessagesRefresh((value) => value + 1);
            setNotice("Сообщение отправлено");
            setTimeout(() => setNotice(""), 2500);
          }}
        />
      </div>}
      <Modal
        open={logoutOpen}
        title="Выйти из аккаунта WhatsApp?"
        onClose={() => !busy && setLogoutOpen(false)}
      >
        <p>
          Локальная авторизация будет удалена. Следующее подключение потребует новый QR-код.
        </p>
        <div className="form-actions">
          <Button
            variant="secondary"
            disabled={!!busy}
            onClick={() => setLogoutOpen(false)}
          >
            Отмена
          </Button>
          <Button variant="danger" loading={busy === "logout"} onClick={logout}>
            Выйти из аккаунта
          </Button>
        </div>
      </Modal>
    </section>
  );
}

function WhatsAppConnectedDashboard() {
  return <div className="connected-panel"><CheckCircle2 /><h3>WhatsApp подключён</h3><p>Канал готов к ручной проверке сообщений.</p></div>;
}
function WhatsAppInitializing({title="Подготавливаем WhatsApp...",description="QR-код появится автоматически"}:{title?:string;description?:string}) {
  return <div className="qr-panel"><div className="qr-skeleton" /><h3>{title}</h3><p>{description}</p></div>;
}
function WhatsAppQrConnect({
  qr,
  error,
  retry,
}: {
  qr: WhatsAppQr | null;
  error: string;
  retry: () => void;
}) {
  return (
    <div className="qr-panel">
      {qr?.available && qr.qrDataUrl ? (
        // QR is a local PNG data URL and must bypass Next image optimization.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qr.qrDataUrl}
          alt="QR-код для подключения WhatsApp"
          width={276}
          height={276}
        />
      ) : (
        <div className="qr-skeleton" />
      )}
      {error && (
        <p className="form-error">
          {error} <button onClick={retry}>Повторить</button>
        </p>
      )}
      {qr?.expiresAt && <p className="muted">Действителен до {dateTime(qr.expiresAt)}</p>}
      <h3>Отсканируйте QR-код в WhatsApp</h3>
      <div className="qr-steps">
        <span>
          <b>1</b>Откройте WhatsApp
        </span>
        <i>↓</i>
        <span>
          <b>2</b>Связанные устройства
        </span>
        <i>↓</i>
        <span>
          <b>3</b>Привязать устройство
        </span>
        <i>↓</i>
        <span>
          <b>4</b>Отсканируйте QR
        </span>
      </div>
    </div>
  );
}
function WhatsAppStateMessage({title,error}:{title:string;error?:string|null}) {
  return (
    <div className="qr-panel">
      <h3>{title}</h3>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
function WhatsAppMessages({
  tab,
  onTab,
  refreshKey,
}: {
  tab: Tab;
  onTab: (tab: Tab) => void;
  refreshKey: number;
}) {
  const [items, setItems] = useState<WhatsAppMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<WhatsAppMessage | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const path =
        tab === "messages" ? "/whatsapp/messages" : "/whatsapp/unmatched";
      const result = unpackList<WhatsAppMessage>(
        await api.get(path, { query: { page, limit: 20 } }),
      );
      setItems(result.items);
      setTotal(result.total);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Не удалось загрузить сообщения",
      );
    } finally {
      setLoading(false);
    }
  }, [tab, page]);
  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load, refreshKey]);
  useEffect(() => {
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);
  async function open(message: WhatsAppMessage) {
    if (tab === "unmatched") {
      setDetail(message);
      return;
    }
    try {
      setDetail(
        await api.get<WhatsAppMessage>(`/whatsapp/messages/${message.id}`),
      );
    } catch {
      setDetail(message);
    }
  }
  return (
    <article className="panel messages-panel">
      <div className="tabs">
        <button
          className={tab === "messages" ? "active" : ""}
          onClick={() => {
            onTab("messages");
            setPage(1);
          }}
        >
          Последние сообщения
        </button>
        <button
          className={tab === "unmatched" ? "active" : ""}
          onClick={() => {
            onTab("unmatched");
            setPage(1);
          }}
        >
          Неизвестные номера
        </button>
      </div>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} retry={load} />
      ) : !items.length ? (
        <EmptyState
          title={
            tab === "messages"
              ? "Сообщений пока нет"
              : "Неизвестных номеров нет"
          }
        />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {tab === "messages" && <th>Направление</th>}
                  <th>Телефон</th>
                  <th>Сообщение</th>
                  {tab === "messages" && <th>Статус</th>}
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id || index}
                    onClick={() => open(item)}
                    className="clickable-row"
                  >
                    {tab === "messages" && (
                      <td>
                        {WHATSAPP_DIRECTION_LABELS[String(item.direction)] ||
                          safe(item.direction)}
                      </td>
                    )}
                    <td>
                      {safe(
                        item.phoneNumber || item.phone || item.from || item.to,
                      )}
                    </td>
                    <td>{safe(item.body || item.text || item.message)}</td>
                    {tab === "messages" && (
                      <td>
                        <StatusBadge>
                          {WHATSAPP_MESSAGE_STATUS_LABELS[
                            String(item.status)
                          ] || safe(item.status)}
                        </StatusBadge>
                      </td>
                    )}
                    <td>{dateTime(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} limit={20} onChange={setPage} />
        </>
      )}
      <Modal open={!!detail} title="Сообщение" onClose={() => setDetail(null)}>
        <TechnicalData value={detail} />
      </Modal>
    </article>
  );
}
function WhatsAppTestSend({
  connected,
  ownNumber,
  onSent,
}: {
  connected: boolean;
  ownNumber: string | null;
  onSent: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function send(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/whatsapp/messages/send", { phone, text });
      setText("");
      onSent();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Не удалось отправить сообщение",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="panel test-message">
      <h3>Отправить тест</h3>
      <p className="muted">
        Только для ручной проверки подключённого аккаунта.
      </p>
      {ownNumber && (
        <button
          className="self-number"
          type="button"
          onClick={() => setPhone(ownNumber)}
        >
          Использовать подключённый номер
        </button>
      )}
      <form onSubmit={send}>
        <FormField
          label="Телефон"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+7…"
        />
        <TextAreaField
          label="Текст"
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <p className="form-error">{error}</p>}
        <Button
          type="submit"
          loading={busy}
          disabled={!connected || !phone.trim() || !text.trim()}
        >
          <Send size={15} />
          Отправить
        </Button>
        {!connected && (
          <small>Отправка станет доступна после подключения WhatsApp.</small>
        )}
      </form>
    </article>
  );
}
function Fact({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <span>{label}</span>
      <b>{safe(value)}</b>
    </div>
  );
}
function statusTone(status: string) {
  return status === "CONNECTED"
    ? "success"
    : status === "ERROR"
      ? "danger"
      : ["STARTING", "AUTHENTICATING", "DISCONNECTING", "LOGGING_OUT"].includes(status)
        ? "info"
        : "warning";
}
