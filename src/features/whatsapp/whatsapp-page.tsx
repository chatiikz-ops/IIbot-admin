"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
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
  resolveWhatsAppConnectionView,
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
  const [switchOpen, setSwitchOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("messages");
  const [notice, setNotice] = useState("");
  const [messagesRefresh, setMessagesRefresh] = useState(0);
  const loadStatus = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const value = await api.get<WhatsAppStatus>("/whatsapp/status", {
        timeout: 6000,
      });
      setStatus(value);
      setOffline(false);
      setConnectionError("");
      if (value.status === "CONNECTED" || !value.qrAvailable) setQr(null);
    } catch (caught) {
      setOffline(true);
      setConnectionError(
        caught instanceof Error ? caught.message : "Backend недоступен",
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);
  const loadQr = useCallback(async () => {
    setQrError("");
    try {
      const value = await api.get<WhatsAppQr>("/whatsapp/qr");
      if (
        value.available &&
        value.qrDataUrl &&
        !value.qrDataUrl.startsWith("data:image/png;base64,")
      ) {
        setQr(null);
        setQrError("Backend вернул некорректный QR-код");
        return;
      }
      setQr(value);
    } catch (caught) {
      setQrError(
        caught instanceof Error ? caught.message : "Не удалось получить QR-код",
      );
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(loadStatus, 0);
    return () => clearTimeout(timer);
  }, [loadStatus]);
  useEffect(() => {
    if (!status?.qrAvailable) return;
    const timer = setTimeout(loadQr, 0);
    return () => clearTimeout(timer);
  }, [status?.qrAvailable, status?.generation, loadQr]);
  useEffect(() => {
    if (
      status?.status !== "INITIALIZING" &&
      status?.status !== "QR_REQUIRED" &&
      status?.status !== "AUTHENTICATING" &&
      status?.status !== "AUTH_FAILURE" &&
      busy !== "reconnect"
    )
      return;
    const interval = setInterval(() => loadStatus(true), 2000);
    return () => clearInterval(interval);
  }, [status?.status, busy, loadStatus]);
  useEffect(() => {
    if (!["CONNECTED", "DISCONNECTED", "DISABLED", "ERROR"].includes(status?.status || "")) return;
    const interval = setInterval(() => loadStatus(true), 10000);
    return () => clearInterval(interval);
  }, [status?.status, loadStatus]);
  useEffect(() => {
    if (!status?.qrAvailable) return;
    const interval = setInterval(loadQr, 15000);
    return () => clearInterval(interval);
  }, [status?.qrAvailable, status?.generation, loadQr]);
  async function action(endpoint: string, success: string) {
    if (busy) return;
    setBusy(endpoint);
    setConnectionError("");
    setQrError("");
    try {
      await api.post(`/whatsapp/${endpoint}`);
      setNotice(success);
      setTimeout(() => setNotice(""), 2500);
      await loadStatus(true);
    } catch (caught) {
      setConnectionError(
        caught instanceof ApiError ? caught.message : "Операция не выполнена",
      );
    } finally {
      setBusy("");
    }
  }
  async function logout() {
    await action("logout", "WhatsApp отключён");
    setLogoutOpen(false);
    setQr(null);
  }
  async function switchNumber() {
    if (busy) return;
    setBusy("switch-number");
    setConnectionError("");
    setQr(null);
    try {
      await api.post("/whatsapp/logout");
      await loadStatus(true);
      setStatus((current) => current ? {
        ...current,
        status: "INITIALIZING",
        connected: false,
        phoneNumber: null,
        displayName: null,
        qrAvailable: false,
      } : current);
      await api.post("/whatsapp/initialize");
      await loadStatus(true);
      setSwitchOpen(false);
    } catch (caught) {
      setConnectionError(caught instanceof ApiError ? caught.message : "Не удалось подключить другой номер");
      await loadStatus(true);
    } finally {
      setBusy("");
    }
  }
  async function requestNewQr() {
    if (busy) return;
    setBusy("reconnect");
    setConnectionError("");
    setQrError("");
    setQr(null);
    setStatus((current) =>
      current
        ? {
            ...current,
            status: "INITIALIZING",
            connected: false,
            qrAvailable: false,
          }
        : current,
    );
    try {
      await api.post("/whatsapp/reconnect");
      setNotice("Создание нового QR запущено");
      setTimeout(() => setNotice(""), 2500);
    } catch (caught) {
      setConnectionError(
        caught instanceof ApiError ? caught.message : "Операция не выполнена",
      );
      await loadStatus(true);
    } finally {
      setBusy("");
    }
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
  return (
    <section className="page whatsapp-page">
      <div className="whatsapp-status-card">
        <div>
          <div className="wa-title">
            <Smartphone />
            <h2>WhatsApp</h2>
            <StatusBadge tone={statusTone(status.status)}>
              {WHATSAPP_STATUS_LABELS[status.status] || enumLabel(status.status)}
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
          {status.lifecycleState && <p className="muted">Этап подключения: {status.lifecycleState}</p>}
          <div className="wa-actions">
            {["DISABLED", "DISCONNECTED", "AUTH_FAILURE", "ERROR"].includes(
              status.status,
            ) && (
              <Button loading={busy === "reconnect"} onClick={requestNewQr}>
                <Link2 size={15} />
                Получить новый QR
              </Button>
            )}
            {status.status === "CONNECTED" && (
              <>
                <Button
                  variant="secondary"
                  loading={busy === "reconnect"}
                  onClick={() =>
                    action("reconnect", "Переподключение запущено")
                  }
                >
                  <RotateCcw size={15} />
                  Переподключить
                </Button>
                <Button
                  variant="secondary"
                  disabled={!!busy}
                  onClick={() => setSwitchOpen(true)}
                >
                  <Link2 size={15} />
                  Подключить другой номер
                </Button>
                <Button
                  variant="danger"
                  disabled={!!busy}
                  onClick={() => setLogoutOpen(true)}
                >
                  <LogOut size={15} />
                  Отключить
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              disabled={!!busy}
              onClick={() => loadStatus()}
            >
              <RefreshCw size={15} />
              Обновить
            </Button>
          </div>
        </div>
        <div className={`wa-state-orb ${status.status.toLowerCase()}`}>
          <span />
        </div>
      </div>
      {notice && <div className="toast-inline">{notice}</div>}
      {connectionError && <p className="form-error">{connectionError}</p>}
      {connectionView === "connected" ? (
        <WhatsAppConnectedDashboard />
      ) : connectionView === "qr" ? (
        <WhatsAppQrConnect qr={visibleQr} error={qrError} retry={loadQr} />
      ) : connectionView === "initializing" ? (
        <WhatsAppInitializing />
      ) : connectionView === "authenticating" ? (
        <WhatsAppInitializing title="Авторизация WhatsApp" description="Подтверждаем подключение устройства" />
      ) : connectionView === "auth-failure" ? (
        <WhatsAppDisconnected
          title="Не удалось авторизоваться"
          error={status.lastError}
          busy={busy === "reconnect"}
          retry={requestNewQr}
        />
      ) : connectionView === "disconnected" ? (
        <WhatsAppDisconnected
          title="WhatsApp не подключён"
          busy={busy === "reconnect"}
          retry={requestNewQr}
        />
      ) : connectionView === "error" ? (
        <WhatsAppDisconnected
          title="Ошибка подключения WhatsApp"
          error={status.lastError}
          busy={busy === "reconnect"}
          retry={requestNewQr}
        />
      ) : connectionView === "disabled" ? (
        <WhatsAppDisconnected title="WhatsApp отключён" busy={busy === "reconnect"} retry={requestNewQr} />
      ) : (
        <WhatsAppDisconnected title="Неизвестный статус WhatsApp" error={String(status.status)} busy={busy === "reconnect"} retry={requestNewQr} />
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
        title="Отключить WhatsApp?"
        onClose={() => !busy && setLogoutOpen(false)}
      >
        <p>
          Текущая авторизация будет завершена. Для повторного подключения
          потребуется новый QR-код.
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
            Отключить
          </Button>
        </div>
      </Modal>
      <Modal
        open={switchOpen}
        title="Подключить другой номер?"
        onClose={() => !busy && setSwitchOpen(false)}
      >
        <p>Текущий WhatsApp будет отключён. Для другого номера потребуется новый QR-код.</p>
        <div className="form-actions">
          <Button variant="secondary" disabled={!!busy} onClick={() => setSwitchOpen(false)}>Отмена</Button>
          <Button loading={busy === "switch-number"} onClick={switchNumber}>Продолжить</Button>
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
      <h3>Подключите устройство</h3>
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
function WhatsAppDisconnected({
  title,
  busy,
  retry,
  error,
}: {
  title: string;
  busy: boolean;
  retry: () => void;
  error?: string | null;
}) {
  return (
    <div className="qr-panel">
      <h3>{title}</h3>
      {error && <p className="form-error">{error}</p>}
      <Button loading={busy} onClick={retry}>
        <RotateCcw size={15} /> Получить новый QR
      </Button>
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
    : status === "ERROR" || status === "AUTH_FAILURE"
      ? "danger"
      : status === "INITIALIZING" || status === "AUTHENTICATING"
        ? "info"
        : "warning";
}
