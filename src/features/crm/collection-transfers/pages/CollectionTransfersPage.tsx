import { useEffect, useMemo, useState } from 'react';
import { api } from 'src/shared/api/axios';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Checkbox } from 'src/components/ui/checkbox';
import { Input } from 'src/components/ui/input';
import { Textarea } from 'src/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'src/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Check, ChevronsUpDown, Landmark, RefreshCw, Send, WalletCards } from 'lucide-react';

const money = (value: any) =>
  `${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} EGP`;
const date = (value: string) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Cairo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(value))
    : '—';
// SQL datetime values are business-local Cairo times. Keep their clock value as
// stored instead of parsing them as UTC and adding a timezone offset.
const time12 = (value: string) => {
  const match = String(value || '').match(/(?:T|\s)(\d{1,2}):(\d{2})/);
  if (!match) return '—';

  const hour = Number(match[1]);
  const minute = match[2];
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${minute} ${period}`;
};
const status: any = {
  TRANSFERRED: 'تم التوريد',
  SETTLED: 'تمت التسوية',
  REJECTED: 'مرفوض',
  COLLECTED: 'محصل',
};

const bankName = (bank: any) => bank.name_ar || bank.nameAr || bank.name_en || bank.nameEn || `بنك #${bank.id}`;

function BankSelect({ banks, value, onChange }: { banks: any[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selectedBank = banks.find((bank) => String(bank.id) === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open} className="h-10 w-full justify-between font-normal">
          <span className="truncate">{selectedBank ? bankName(selectedBank) : 'اختر البنك'}</span>
          <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="ابحث باسم البنك..." />
          <CommandList>
            <CommandEmpty>لا يوجد بنك مطابق.</CommandEmpty>
            <CommandGroup>
              {banks.map((bank) => (
                <CommandItem
                  key={bank.id}
                  value={`${bankName(bank)} ${bank.id}`}
                  onSelect={() => {
                    onChange(String(bank.id));
                    setOpen(false);
                  }}
                >
                  <Check className={`ml-2 h-4 w-4 ${value === String(bank.id) ? 'opacity-100' : 'opacity-0'}`} />
                  {bankName(bank)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function CollectionTransfersPage() {
  const [collections, setCollections] = useState<any[]>([]),
    [transfers, setTransfers] = useState<any[]>([]),
    [selected, setSelected] = useState<number[]>([]),
    [notes, setNotes] = useState(''),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(''),
    [transferMethod, setTransferMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH'),
    [banks, setBanks] = useState<any[]>([]),
    [transferDate, setTransferDate] = useState(''),
    [bankId, setBankId] = useState(''),
    [referenceNumber, setReferenceNumber] = useState(''),
    [cashVoucherNumber, setCashVoucherNumber] = useState(''),
    [confirm, setConfirm] = useState(false),
    [receipt, setReceipt] = useState(''),
    [customer, setCustomer] = useState(''),
    [customerCode, setCustomerCode] = useState(''),
    [contractId, setContractId] = useState(''),
    [fromDate, setFromDate] = useState(''),
    [toDate, setToDate] = useState('');
  const load = async (filterValues = { receipt, customer, customerCode, contractId, fromDate, toDate }) => {
    setLoading(true);
    setError('');
    try {
      const [eligible, mine] = await Promise.all([
        api.get('/collection-transfers/eligible-collections', {
          params: {
            receiptNumber: filterValues.receipt || undefined,
            customerName: filterValues.customer || undefined,
            customerCode: filterValues.customerCode || undefined,
            contractId: filterValues.contractId || undefined,
            fromDate: filterValues.fromDate || undefined,
            toDate: filterValues.toDate || undefined,
            pageSize: 100,
          },
        }),
        api.get('/collection-transfers/my-transfers'),
      ]);
      setCollections(eligible.data?.data?.rows || []);
      setTransfers(mine.data?.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'تعذر تحميل التحصيلات المتاحة.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    api.get('/banks').then((response) => setBanks(response.data?.data || [])).catch(() => setBanks([]));
  }, []);
  const selectedRows = useMemo(
    () => collections.filter((row) => selected.includes(row.id)),
    [collections, selected],
  );
  const total = selectedRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const all = collections.length > 0 && collections.every((row) => selected.includes(row.id));
  const toggle = (id: number) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  const submitTransfer = async () => {
    if (!selected.length) {
      setError('اختر إيصالًا واحدًا على الأقل.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        collectionIds: selected,
        notes,
        transferMethod,
        transferDate: transferMethod === 'BANK_TRANSFER' ? transferDate : undefined,
        bankId: transferMethod === 'BANK_TRANSFER' ? Number(bankId) : undefined,
        referenceNumber: transferMethod === 'BANK_TRANSFER' ? referenceNumber.trim() : undefined,
        cashVoucherNumber: transferMethod === 'CASH' ? cashVoucherNumber.trim() : undefined,
      };
      console.log('[CollectionTransfers] Creating transfer payload:', payload);
      await api.post('/collection-transfers', payload);
      setSelected([]);
      setNotes('');
      setTransferDate('');
      setBankId('');
      setReferenceNumber('');
      setCashVoucherNumber('');
      setConfirm(false);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'تعذر إرسال التوريدة للمالية.');
    } finally {
      setSaving(false);
    }
  };
  const openConfirmation = () => {
    if (transferMethod === 'BANK_TRANSFER' && (!transferDate || !bankId || !referenceNumber.trim())) {
      setError('أدخل تاريخ الحوالة والبنك والرقم المرجعي للتحويل البنكي.');
      return;
    }
    if (transferMethod === 'CASH' && !cashVoucherNumber.trim()) {
      setError('أدخل رقم الإذن للتوريد النقدي.');
      return;
    }
    setError('');
    setConfirm(true);
  };
  return (
    <div dir="rtl" className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">المبالغ المطلوب سدادها للشركة</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            اختر إيصالاتك المسجلة وأرسلها مباشرةً للمالية للتسوية.
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_330px]">
        <Card className="min-w-0">
          <CardHeader>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Input value={receipt} onChange={(e) => setReceipt(e.target.value)} placeholder="رقم الإيصال" />
              <Input value={contractId} onChange={(e) => setContractId(e.target.value)} placeholder="كود العميل" />
              <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="اسم العميل / الصيدلية" />
              <label className="grid gap-1 text-xs text-muted-foreground"><span>من تاريخ التحصيل</span><Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></label>
              <label className="grid gap-1 text-xs text-muted-foreground"><span>إلى تاريخ التحصيل</span><Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></label>
              <div className="flex gap-2 xl:col-span-3">
                <Button variant="secondary" onClick={() => void load()}>بحث</Button>
                <Button variant="outline" onClick={() => { const reset = { receipt: '', customer: '', customerCode: '', contractId: '', fromDate: '', toDate: '' }; setReceipt(''); setCustomer(''); setCustomerCode(''); setContractId(''); setFromDate(''); setToDate(''); void load(reset); }}>إعادة تعيين</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-w-0">
            <p className="mb-2 text-xs text-muted-foreground">اسحب الجدول أفقياً لعرض جميع الأعمدة.</p>
            <div className="max-w-full overflow-x-scroll pb-3">
              <table className="w-full min-w-[2450px] text-right text-sm">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th className="p-3">
                      <Checkbox
                        checked={all}
                        onCheckedChange={() => setSelected(all ? [] : collections.map((r) => r.id))}
                      />
                    </th>
                    {['كود العميل', 'اسم العميل', 'تاريخ التحصيل', 'وقت إنشاء التحصيل', 'اسم المحصل', 'المشرف', 'المدير', 'رقم الإيصال', 'المبلغ', 'طريقة الدفع', 'اسم البنك', 'الرقم المرجعي', 'رقم الشيك', 'الخدمة', 'شهر الاشتراك', 'سنة الاشتراك', 'حالة التحصيل'].map((header) => <th key={header} className="whitespace-nowrap px-3">{header}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {collections.map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="p-3">
                        <Checkbox
                          checked={selected.includes(row.id)}
                          onCheckedChange={() => toggle(row.id)}
                        />
                      </td>
                      <td className="px-3">{row.customer_code || '—'}</td>
                      <td className="px-3">{row.customer_name || '—'}</td>
                      <td className="whitespace-nowrap px-3">{date(row.collected_at)}</td>
                      <td className="whitespace-nowrap px-3">{time12(row.collection_created_at)}</td>
                      <td className="px-3">{row.collector_name || '—'}</td>
                      <td className="px-3">{row.supervisor_name || '—'}</td>
                      <td className="px-3">{row.manager_name || '—'}</td>
                      <td className="px-3">{row.receipt_number || '—'}</td>
                      <td className="whitespace-nowrap px-3 font-semibold">{money(row.amount)}</td>
                      <td className="px-3">{row.payment_method_name || '—'}</td>
                      <td className="px-3">{row.bank_name || '—'}</td>
                      <td className="px-3">{row.reference_number || '—'}</td>
                      <td className="px-3">{row.cheque_number || '—'}</td>
                      <td className="px-3">{row.service_name || '—'}</td>
                      <td className="px-3">{row.subscription_month ?? '—'}</td>
                      <td className="px-3">{row.subscription_year ?? '—'}</td>
                      <td className="px-3">{status[row.workflow_status] || row.workflow_status || '—'}</td>
                    </tr>
                  ))}
                  {!loading && !collections.length && (
                    <tr>
                      <td colSpan={18} className="p-10 text-center text-muted-foreground">
                        لا توجد تحصيلات متاحة للتوريد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletCards className="h-5 w-5 text-primary" />
              بيانات التوريد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">الإيصالات المختارة</p>
              <p className="mt-1 text-2xl font-bold">{selected.length}</p>
              <p className="mt-3 text-sm text-muted-foreground">الإجمالي</p>
              <p className="mt-1 text-xl font-bold text-primary">{money(total)}</p>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات اختيارية"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">طريقة التوريد</p>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={transferMethod === 'CASH' ? 'default' : 'outline'} onClick={() => setTransferMethod('CASH')}>
                  نقدي
                </Button>
                <Button type="button" variant={transferMethod === 'BANK_TRANSFER' ? 'default' : 'outline'} onClick={() => setTransferMethod('BANK_TRANSFER')}>
                  <Landmark className="ml-1 h-4 w-4" />
                  تحويل بنكي
                </Button>
              </div>
            </div>
            {transferMethod === 'BANK_TRANSFER' && (
              <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm font-medium">بيانات الحوالة البنكية</p>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="collection-transfer-date">تاريخ الحوالة</label>
                  <Input id="collection-transfer-date" type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} />
                </div>
                <BankSelect banks={banks} value={bankId} onChange={setBankId} />
                <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="الرقم المرجعي للحوالة" />
              </div>
            )}
            {transferMethod === 'CASH' && (
              <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <label className="text-sm font-medium" htmlFor="collection-transfer-cash-voucher">رقم الإذن</label>
                <Input
                  id="collection-transfer-cash-voucher"
                  value={cashVoucherNumber}
                  onChange={(e) => setCashVoucherNumber(e.target.value)}
                  placeholder="أدخل رقم إذن التوريد النقدي"
                  maxLength={100}
                />
              </div>
            )}
            <Button className="w-full" onClick={openConfirmation} disabled={saving || !selected.length}>
              <Send className="ml-2 h-4 w-4" />
              إرسال للمالية
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* <Card>
        <CardHeader>
          <CardTitle>توريداتي السابقة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-right text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="p-3">رقم التوريدة</th>
                  <th>التاريخ</th>
                  <th>عدد التحصيلات</th>
                  <th>الإجمالي</th>
                  <th>طريقة التوريد</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="p-3 font-medium">{row.transfer_number}</td>
                    <td>{date(row.created_at)}</td>
                    <td>{row.collection_count}</td>
                    <td>{money(row.total_amount)}</td>
                    <td>{row.transfer_method === 'BANK_TRANSFER' ? 'تحويل بنكي' : 'نقدي'}</td>
                    <td>{status[row.workflow_status] || row.workflow_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card> */}
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد إرسال التوريدة</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            سيتم إرسال {selected.length} إيصال بإجمالي {money(total)} إلى المالية بطريقة{' '}
            {transferMethod === 'BANK_TRANSFER' ? 'تحويل بنكي' : 'نقدية'}. بعد الإرسال لا يمكن تعديلها.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              إلغاء
            </Button>
            <Button onClick={() => void submitTransfer()} disabled={saving}>
              تأكيد الإرسال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
