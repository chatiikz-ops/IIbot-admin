"use client";
import { FormEvent, useState } from "react";
import { ApiError, api } from "@/src/lib/api/client";
import { Button, FormField, Modal, TextAreaField } from "@/src/components/ui/ui";
import { Contact, ContactPayload } from "./types";

const optionalKeys: (keyof ContactPayload)[] = ["city", "category", "website", "instagram", "twoGisUrl", "bookingUrl", "email", "address", "notes"];

export function ContactForm({ open, contact, onClose, onSaved }: { open: boolean; contact?: Contact | null; onClose: () => void; onSaved: (contact: Contact) => void }) {
  const [form, setForm] = useState<ContactPayload>(() => ({
    companyName: contact?.companyName || "", phone: contact?.phone || "", city: contact?.city || "", category: contact?.category || "",
    website: contact?.website || "", instagram: contact?.instagram || "", twoGisUrl: contact?.twoGisUrl || "", bookingUrl: contact?.bookingUrl || "",
    email: contact?.email || "", address: contact?.address || "", notes: contact?.notes || "",
  }));
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const set = (key: keyof ContactPayload, value: string) => setForm(current => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!form.companyName.trim() || !form.phone.trim()) { setError("Укажите компанию и телефон"); return; }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) { setError("Проверьте адрес электронной почты"); return; }
    const payload: ContactPayload = { companyName: form.companyName.trim(), phone: form.phone.trim() };
    optionalKeys.forEach(key => { const value = form[key]?.trim(); if (value) payload[key] = value; });
    setBusy(true);
    try { const saved = contact ? await api.patch<Contact>(`/contacts/${contact.id}`, payload) : await api.post<Contact>("/contacts", payload); onSaved(saved); }
    catch (caught) { setError(caught instanceof ApiError ? caught.message : "Не удалось сохранить контакт"); }
    finally { setBusy(false); }
  }
  return <Modal open={open} title={contact ? "Изменить контакт" : "Добавить контакт"} onClose={() => !busy && onClose()}>
    <form className="form-grid" onSubmit={submit}>
      <FormField label="Компания *" required autoFocus value={form.companyName} onChange={e => set("companyName", e.target.value)} />
      <FormField label="Телефон *" required placeholder="8 701 123 45 67" value={form.phone} onChange={e => set("phone", e.target.value)} />
      <FormField label="Город" value={form.city} onChange={e => set("city", e.target.value)} />
      <FormField label="Категория" value={form.category} onChange={e => set("category", e.target.value)} />
      <FormField label="Сайт" placeholder="example.com" value={form.website} onChange={e => set("website", e.target.value)} />
      <FormField label="Instagram" placeholder="@beauty_room или ссылка" value={form.instagram} onChange={e => set("instagram", e.target.value)} />
      <FormField label="2GIS" value={form.twoGisUrl} onChange={e => set("twoGisUrl", e.target.value)} />
      <FormField label="Ссылка записи" value={form.bookingUrl} onChange={e => set("bookingUrl", e.target.value)} />
      <FormField label="Email" type="email" value={form.email} onChange={e => set("email", e.target.value)} />
      <FormField label="Адрес" value={form.address} onChange={e => set("address", e.target.value)} />
      <TextAreaField label="Заметки" value={form.notes} onChange={e => set("notes", e.target.value)} />
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><Button type="button" variant="secondary" onClick={onClose} disabled={busy}>Отмена</Button><Button type="submit" loading={busy}>Сохранить</Button></div>
    </form>
  </Modal>;
}

