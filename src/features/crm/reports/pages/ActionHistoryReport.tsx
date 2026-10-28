import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Download, FileText, History, RefreshCw, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Input } from 'src/components/ui/input';
import { fetchActionHistoryReport } from '../api/reportsService';

const actionLabels: Record<string, string> = {
  CONTRACT_CREATED: 'إنشاء العقد',
  CONTRACT_CHECKED: 'مراجعة الكول سنتر',
  CONTRACT_APPROVED: 'اعتماد العقد',
  CONTRACT_REJECTED: 'رفض العقد',
  CONTRACT_INSTALLED: 'تركيب العقد',
  CONTRACT_ACTIVATED: 'تفعيل العقد',
  CONTRACT_RETURNED_TO_MANAGER: 'إعادة للدعم الفني',
  CONTRACT_NOTE_ADDED: 'إضافة ملاحظة',
  CONTRACT_UPDATED: 'تعديل العقد',
  CUSTOMER_UPDATED: 'تعديل بيانات العميل',
  COLLECTION_CREATED: 'إنشاء تحصيل',
};

const dateTime = (value?: string) => value ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—';

export default function ActionHistoryReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userId, setUserId] = useState('');
  const [contractId, setContractId] = useState('');
  const [actionCode, setActionCode] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setData(await fetchActionHistoryReport({ startDate, endDate, userId, contractId, actionCode, limit: 1000 })); }
    catch (requestError: any) { setError(requestError?.response?.data?.message || 'تعذر تحميل سجل الإجراءات.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const rows = data?.rows || [];
  const summary = data?.summary || {};
  const exportRows = useMemo(() => rows.map((row: any) => [
    dateTime(row.created_at),
    actionLabels[row.action_code] || row.action_code,
    row.performed_by_name_ar || row.performed_by_name_en || row.performed_by_username || 'النظام',
    row.contract_id || '',
    row.customer_name_ar || row.customer_name_en || '',
    row.parent_customer_name_ar || row.parent_customer_name_en || '',
    row.from_status || '', row.to_status || '', row.description || '',
  ]), [rows]);

  const exportToExcel = () => {
    const headers = ['التاريخ والوقت', 'الإجراء', 'المستخدم', 'العقد', 'العميل', 'العميل / الصيدلية الرئيسية', 'من الحالة', 'إلى الحالة', 'الوصف'];
    const sheet = XLSX.utils.aoa_to_sheet([['سجل إجراءات النظام'], [], headers, ...exportRows]);
    sheet['!cols'] = headers.map((header) => ({ wch: Math.max(header.length + 5, 18) }));
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, 'سجل الإجراءات');
    XLSX.writeFile(book, `action-history-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return <div dir="rtl" className="space-y-6 text-right">
    <div><h1 className="text-2xl font-bold">سجل إجراءات النظام</h1><p className="mt-1 text-sm text-muted-foreground">مراجعة من قام بكل إجراء على العقود والتحصيلات ومسار التنفيذ.</p></div>
    <Card><CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-6">
      <label className="grid gap-1 text-sm"><span>من تاريخ</span><Input dir="ltr" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
      <label className="grid gap-1 text-sm"><span>إلى تاريخ</span><Input dir="ltr" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
      <label className="grid gap-1 text-sm"><span>المستخدم</span><select className="h-10 rounded-md border bg-background px-3" value={userId} onChange={(event) => setUserId(event.target.value)}><option value="">كل المستخدمين</option>{(data?.actors || []).map((actor: any) => <option key={actor.id} value={actor.id}>{actor.name_ar || actor.name_en || actor.username}</option>)}</select></label>
      <label className="grid gap-1 text-sm"><span>الإجراء</span><select className="h-10 rounded-md border bg-background px-3" value={actionCode} onChange={(event) => setActionCode(event.target.value)}><option value="">كل الإجراءات</option>{(data?.actionCodes || []).map((code: string) => <option key={code} value={code}>{actionLabels[code] || code}</option>)}</select></label>
      <label className="grid gap-1 text-sm"><span>رقم العقد</span><Input dir="ltr" type="number" min="1" value={contractId} onChange={(event) => setContractId(event.target.value)} placeholder="# العقد" /></label>
      <div className="flex items-end gap-2"><Button className="flex-1" onClick={() => void load()} disabled={loading}><RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />تحديث</Button><Button variant="outline" onClick={exportToExcel} disabled={!exportRows.length || loading}><Download className="h-4 w-4" /></Button></div>
    </CardContent></Card>
    <div className="grid gap-4 md:grid-cols-3"><Metric label="إجمالي الإجراءات" value={summary.action_count} icon={<History />} /><Metric label="المستخدمون المنفذون" value={summary.actor_count} icon={<Users />} /><Metric label="العقود المتأثرة" value={summary.contract_count} icon={<FileText />} /></div>
    <Card className="overflow-hidden"><CardHeader><CardTitle>التفاصيل {data?.limit && rows.length >= data.limit ? `(أول ${data.limit} نتيجة)` : ''}</CardTitle></CardHeader><CardContent className="overflow-x-auto p-0">
      {error ? <p className="p-6 text-destructive">{error}</p> : loading ? <p className="p-6 text-muted-foreground">جارٍ تحميل السجل...</p> : <table className="w-full min-w-[1300px] text-sm"><thead className="bg-muted"><tr>{['التاريخ', 'الإجراء', 'المستخدم', 'العقد / العميل', 'العميل / الصيدلية الرئيسية', 'من', 'إلى', 'الوصف'].map((header) => <th key={header} className="px-4 py-3 text-right font-semibold">{header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row: any) => <tr key={row.id} className="border-t"><td className="whitespace-nowrap px-4 py-3">{dateTime(row.created_at)}</td><td className="px-4 py-3 font-medium">{actionLabels[row.action_code] || row.action_code}</td><td className="px-4 py-3">{row.performed_by_name_ar || row.performed_by_name_en || row.performed_by_username || 'النظام'}</td><td className="px-4 py-3">{row.contract_id ? `#${row.contract_id}` : '—'}{row.customer_name_ar || row.customer_name_en ? <span className="mr-1 text-muted-foreground">— {row.customer_name_ar || row.customer_name_en}</span> : null}</td><td className="px-4 py-3">{row.parent_customer_name_ar || row.parent_customer_name_en || '—'}</td><td className="px-4 py-3">{row.from_status || '—'}</td><td className="px-4 py-3">{row.to_status || '—'}</td><td className="max-w-md px-4 py-3 whitespace-normal text-muted-foreground">{row.description || '—'}</td></tr>) : <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">لا توجد إجراءات مطابقة للفلاتر.</td></tr>}</tbody></table>}
    </CardContent></Card>
  </div>;
}

function Metric({ label, value, icon }: { label: string; value: number | undefined; icon: ReactNode }) {
  return <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{Number(value || 0).toLocaleString('ar-EG')}</p></div><div className="text-primary">{icon}</div></CardContent></Card>;
}
