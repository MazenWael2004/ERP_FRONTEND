import React, { useEffect, useMemo, useState } from "react";
import { api } from 'src/shared/api/axios';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'src/components/ui/command';
import { Button } from 'src/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';

/** E-Operation | توريد التحصيلات. */
type Method = "CASH" | "BANK";
type Collection = {
  id: number;
  receiptNumber: string;
  customer: string;
  representativeId: number;
  collectedAt: string;
  amount: number;
  paymentMethod: string;
  isTransferred: boolean;
};
type Remittance = {
  id: number;
  representativeId: number;
  collectionIds: number[];
  total: number;
  method: Method;
  remittedAt: string;
  bank?: string;
  bankDate?: string;
  reference?: string;
  notes?: string;
};
const money = (n: number) => `${new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 }).format(n)} ج.م`;
const dateDisplay = (s: string) => new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(s));
const today = () => new Date().toLocaleDateString("en-CA");
const panel = "rounded-2xl border border-slate-200 bg-white shadow-sm";
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

export default function CollectionRemittancesPage() {
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [repId, setRepId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [method, setMethod] = useState<Method>("CASH");
  const [bank, setBank] = useState("");
  const [bankDate, setBankDate] = useState(today());
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const repCollections = collections;
  const pending = useMemo(() => repCollections.filter(c => !c.isTransferred), [repCollections]);
  const filtered = useMemo(() => pending.filter(c => `${c.receiptNumber} ${c.customer}`.toLowerCase().includes(search.toLowerCase())), [pending, search]);
  const selectedRecords = useMemo(() => pending.filter(c => selected.includes(c.id)), [pending, selected]);
  const selectedTotal = selectedRecords.reduce((sum, c) => sum + c.amount, 0);
  const pendingTotal = pending.reduce((sum, c) => sum + c.amount, 0);
  const transferredTotal = repCollections.filter(c => c.isTransferred).reduce((sum, c) => sum + c.amount, 0);
  const allFilteredSelected = filtered.length > 0 && filtered.every(c => selected.includes(c.id));
  const currentRep = representatives.find(r => r.id === repId);

  const loadRepresentative = async (id: number) => {
    if (!id) return;
    setIsLoading(true); setSelected([]);
    try {
      const response = await api.get(`/collection-remittances/users/${id}`);
      const data = response.data?.data || {};
      setCollections((data.collections || []).map((row: any) => ({ id: row.id, receiptNumber: row.receipt_number, customer: row.customer_name, representativeId: id, collectedAt: row.collected_at, amount: Number(row.amount), paymentMethod: row.payment_method_name, isTransferred: false })));
      setRemittances((data.history || []).map((row: any) => ({ id: row.id, representativeId: id, collectionIds: Array(Number(row.collection_count)).fill(0), total: Number(row.total_amount), method: row.remittance_method, remittedAt: row.remitted_at, bankDate: row.bank_deposit_date, reference: row.reference_number, notes: row.notes })));
    } catch { setError('تعذر تحميل تحصيلات المستخدم.'); } finally { setIsLoading(false); }
  };
  useEffect(() => { void Promise.all([api.get('/collection-remittances/users'), api.get('/banks')]).then(([usersResponse,banksResponse]) => { const users=usersResponse.data?.data||[]; setRepresentatives(users.map((u:any)=>({id:u.id,name:u.name_ar||u.name_en||u.username,zone:''}))); setBanks(Array.isArray(banksResponse.data?.data)?banksResponse.data.data:[]); if(users[0]) setRepId(users[0].id); }).catch(()=>setError('تعذر تحميل المستخدمين أو البنوك.')); }, []);
  useEffect(() => { if(repId) void loadRepresentative(repId); }, [repId]);

  function changeRep(id: number) {
    setRepId(id);
    setSearch("");
    setError("");
    setSuccess("");
  }
  function toggle(id: number) {
    setSelected(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
    setError("");
  }
  function toggleAll() {
    setSelected(old => allFilteredSelected ? old.filter(id => !filtered.some(c => c.id === id)) : [...new Set([...old, ...filtered.map(c => c.id)])]);
  }
  function validate(): string | null {
    if (selectedRecords.length === 0 || selectedRecords.length !== selected.length) return "اختر إيصالًا واحدًا على الأقل من التحصيلات غير الموردة.";
    if (method === "BANK" && (!bank || !bankDate || !reference.trim())) return "اختر البنك وأدخل تاريخ الإيداع ورقم المرجع.";
    return null;
  }
  function requestConfirmation() {
    setSuccess("");
    const message = validate();
    if (message) { setError(message); return; }
    setError("");
    setConfirmOpen(true);
  }
  async function submit() {
    try { const response=await api.post('/collection-remittances',{representativeId:repId,collectionIds:selected,method,bankDate,reference,notes}); const item=response.data?.data; setSelected([]); await loadRepresentative(repId);
    setNotes("");
    setReference("");
    setBank("");
    setConfirmOpen(false);
    setSuccess(`تم تسجيل التوريد رقم TRF-${String(item?.id || '').padStart(4, "0")} بنجاح.`);
    } catch (e:any) { setError(e?.response?.data?.message || 'تعذر تسجيل التوريد.'); setConfirmOpen(false); }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-4 text-slate-800 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 text-xs font-medium text-slate-400">المالية / التحصيلات / توريد التحصيلات</div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">توريد التحصيلات</h1>
            <p className="mt-1 text-sm text-slate-500">تسجيل توريد الإيصالات بالكامل نقديًا أو عن طريق البنك</p>
          </div>
          <button onClick={() => setHistoryOpen(v => !v)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50">
            {historyOpen ? "إخفاء سجل التوريدات" : "سجل التوريدات"}
          </button>
        </header>

        {success && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">✓ {success}</div>}
        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

        <section className={`${panel} p-5`}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold">المندوب
              <SearchablePicker value={String(repId || '')} onChange={(value) => changeRep(Number(value))} options={representatives.map((user) => [String(user.id), user.name])} placeholder="ابحث واختر المستخدم..." emptyMessage="لا يوجد مستخدمون" />
            </label>
            <div className="flex items-end text-sm text-slate-500">اختر المستخدم لعرض تحصيلاته المتاحة للتوريد.</div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "إجمالي تحصيلات المندوب", value: money(repCollections.reduce((s, c) => s + c.amount, 0)), color: "text-slate-900" },
            { label: "تم توريده", value: money(transferredTotal), color: "text-emerald-700" },
            { label: "المتبقي للتوريد", value: money(pendingTotal), color: "text-amber-700" },
          ].map(card => <div key={card.label} className={`${panel} p-5`}><p className="text-sm text-slate-500">{card.label}</p><p className={`mt-3 text-2xl font-bold ${card.color}`}>{card.value}</p></div>)}
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className={`${panel} overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
              <div><h2 className="font-bold">التحصيلات غير الموردة</h2><p className="mt-1 text-xs text-slate-500">{pending.length} إيصال متاح • {selected.length} محدد</p></div>
              <input aria-label="بحث عن إيصال أو عميل" className={`${inputClass} max-w-xs`} placeholder="بحث برقم الإيصال أو العميل..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-right text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500"><tr>
                  <th className="p-4"><input aria-label="تحديد جميع الإيصالات المعروضة" type="checkbox" checked={allFilteredSelected} onChange={toggleAll} disabled={!filtered.length} className="accent-sky-700" /></th>
                  <th className="p-4">رقم الإيصال</th><th className="p-4">العميل</th><th className="p-4">تاريخ التحصيل</th><th className="p-4">المبلغ</th><th className="p-4">الحالة</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(c => <tr key={c.id} className={`hover:bg-slate-50 ${selected.includes(c.id) ? "bg-sky-50/60" : ""}`}>
                    <td className="p-4"><input aria-label={`تحديد ${c.receiptNumber}`} type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} className="accent-sky-700" /></td>
                    <td className="p-4 font-semibold text-sky-700" dir="ltr">{c.receiptNumber}</td><td className="p-4">{c.customer}</td><td className="p-4 text-slate-500">{dateDisplay(c.collectedAt)}</td><td className="p-4 font-semibold">{money(c.amount)}</td>
                    <td className="p-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">غير مورد</span></td>
                  </tr>)}
                  {!filtered.length && <tr><td colSpan={6} className="p-10 text-center text-slate-400">لا توجد تحصيلات غير موردة مطابقة للبحث</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <aside className={`${panel} space-y-5 p-5`}>
            <div><h2 className="text-lg font-bold">إنشاء عملية توريد</h2><p className="mt-1 text-xs text-slate-500">المستخدم: {currentRep?.name || '—'}</p></div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setMethod("CASH"); setError(""); }} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${method === "CASH" ? "border-sky-600 bg-sky-50 text-sky-800" : "border-slate-200 hover:bg-slate-50"}`}>💵 نقدي</button>
              <button type="button" onClick={() => { setMethod("BANK"); setError(""); }} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${method === "BANK" ? "border-sky-600 bg-sky-50 text-sky-800" : "border-slate-200 hover:bg-slate-50"}`}>🏦 بنكي</button>
            </div>
            {method === "BANK" && <div className="space-y-3">
              <label className="block space-y-1 text-sm font-medium">البنك *<SearchablePicker value={bank} onChange={setBank} options={banks.map((item) => [String(item.id), item.nameAr || item.nameEn || item.code])} placeholder="ابحث واختر البنك..." emptyMessage="لا توجد بنوك متاحة" /></label>
              <label className="block space-y-1 text-sm font-medium">تاريخ الإيداع / التحويل *<input type="date" className={inputClass} value={bankDate} onChange={e => setBankDate(e.target.value)} /></label>
              <label className="block space-y-1 text-sm font-medium">رقم المرجع *<input className={inputClass} value={reference} onChange={e => setReference(e.target.value)} placeholder="رقم العملية البنكية" /></label>
            </div>}
            <label className="block space-y-1 text-sm font-medium">ملاحظات (اختياري)<textarea rows={3} className={inputClass} value={notes} onChange={e => setNotes(e.target.value)} placeholder="أضف ملاحظات التوريد..." /></label>
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <div className="flex justify-between text-sm"><span className="text-slate-500">الإيصالات المحددة</span><strong>{selected.length}</strong></div>
              <div className="border-t border-slate-200 pt-3"><p className="text-sm text-slate-500">إجمالي التوريد (غير قابل للتعديل)</p><p className="mt-1 text-2xl font-bold text-sky-800">{money(selectedTotal)}</p></div>
            </div>
            <button onClick={requestConfirmation} disabled={!selected.length} className="w-full rounded-xl bg-sky-700 px-4 py-3 font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300">تأكيد توريد التحصيلات</button>
            <p className="text-center text-xs leading-5 text-slate-500">كل إيصال يتم توريده بالكامل، ولا يمكن توريده مرة أخرى.</p>
          </aside>
        </div>

        {historyOpen && <section className={`${panel} overflow-hidden`}>
          <div className="border-b border-slate-100 p-5"><h2 className="font-bold">سجل التوريدات — {currentRep?.name || '—'}</h2></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-right text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">رقم التوريد</th><th className="p-4">التاريخ</th><th className="p-4">الطريقة</th><th className="p-4">عدد الإيصالات</th><th className="p-4">الإجمالي</th><th className="p-4">مرجع البنك</th></tr></thead><tbody className="divide-y divide-slate-100">{remittances.filter(r => r.representativeId === repId).map(r => <tr key={r.id}><td className="p-4 font-semibold" dir="ltr">TRF-{String(r.id).padStart(4, "0")}</td><td className="p-4">{dateDisplay(r.remittedAt)}</td><td className="p-4">{r.method === "CASH" ? "نقدي" : "بنكي"}</td><td className="p-4">{r.collectionIds.length}</td><td className="p-4 font-bold">{money(r.total)}</td><td className="p-4" dir="ltr">{r.reference || "—"}</td></tr>)}{!remittances.some(r => r.representativeId === repId) && <tr><td colSpan={6} className="p-8 text-center text-slate-400">لا توجد توريدات مسجلة</td></tr>}</tbody></table></div>
        </section>}
      </div>

      {confirmOpen && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={e => { if (e.target === e.currentTarget) setConfirmOpen(false); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <h2 id="confirm-title" className="text-xl font-bold">تأكيد عملية التوريد</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">سيتم توريد <strong>{selected.length} إيصال</strong> للمندوب <strong>{currentRep.name}</strong> بقيمة <strong>{money(selectedTotal)}</strong> عن طريق <strong>{method === "CASH" ? "النقدية" : "البنك"}</strong>.</p>
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">بعد التأكيد ستصبح الإيصالات موردة بالكامل ولن تظهر في قائمة الإيصالات غير الموردة.</p>
          <div className="mt-6 flex gap-3"><button onClick={() => setConfirmOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 font-semibold">إلغاء</button><button onClick={submit} className="flex-1 rounded-xl bg-sky-700 py-2.5 font-semibold text-white hover:bg-sky-800">تأكيد التوريد</button></div>
        </div>
      </div>}
    </main>
  );
}

function SearchablePicker({ value, onChange, options, placeholder, emptyMessage }: { value: string; onChange: (value: string) => void; options: [string, string][]; placeholder: string; emptyMessage: string }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(([id]) => id === value);
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button type="button" variant="outline" className="mt-1 w-full justify-between rounded-xl font-normal"><span className="truncate">{selected?.[1] || placeholder}</span><ChevronsUpDown className="h-4 w-4 text-muted-foreground" /></Button></PopoverTrigger><PopoverContent dir="rtl" className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="ابحث..." /><CommandList><CommandEmpty>{emptyMessage}</CommandEmpty><CommandGroup>{options.map(([id,label]) => <CommandItem key={id} value={`${label} ${id}`} onSelect={() => { onChange(id); setOpen(false); }}><Check className={`ml-2 h-4 w-4 ${id === value ? 'opacity-100' : 'opacity-0'}`} />{label}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>;
}
