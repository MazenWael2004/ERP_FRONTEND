import { useEffect, useMemo, useState } from 'react';
import { Landmark, RefreshCw, RotateCcw } from 'lucide-react';
import { api } from 'src/shared/api/axios';
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Textarea } from 'src/components/ui/textarea';
const money = (v: any) =>
  `${Number(v || 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 })} ج.م`;
export default function ContractRefundsPage() {
  const [rows, setRows] = useState<any[]>([]),
    [loading, setLoading] = useState(true),
    [selected, setSelected] = useState<any>(null),
    [method, setMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH'),
    [reference, setReference] = useState(''),
    [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/contract-refunds/pending');
      setRows(r.data?.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'تعذر تحميل طلبات رد المبالغ.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const total = useMemo(() => rows.reduce((s, r) => s + Number(r.amount || 0), 0), [rows]);
  const refund = async () => {
    if (!selected) return;
    if (!reason.trim()) {
      setError('سبب رد المبلغ مطلوب.');
      return;
    }
    if (method === 'BANK_TRANSFER' && !reference.trim()) {
      setError('الرقم المرجعي للتحويل البنكي مطلوب.');
      return;
    }
    setBusy(true);
    try {
      await api.post(`/contract-refunds/${selected.collection_id}/refund`, {
        method,
        reference: reference.trim() || undefined,
        reason: reason.trim(),
      });
      setSelected(null);
      setReference('');
      setReason('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'تعذر تنفيذ رد المبلغ.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div dir="rtl" className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">رد مبالغ العقود المرفوضة</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            يتم رد كامل قيمة الإيصال مرة واحدة، نقدًا أو بتحويل بنكي.
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">إيصالات بانتظار الرد</p>
            <p className="mt-2 text-2xl font-bold">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">إجمالي المبالغ المطلوب ردها</p>
            <p className="mt-2 text-2xl font-bold">{money(total)}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>طلبات رد المبالغ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-right text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="p-3">العقد</th>
                  <th>العميل</th>
                  <th>الإيصال</th>
                  <th>المبلغ</th>
                  <th>سبب رفض العقد</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr className="border-b" key={row.collection_id}>
                    <td className="p-3">#{row.contract_id}</td>
                    <td>{row.customer_name_ar || row.customer_name_en || '—'}</td>
                    <td>{row.receipt_number}</td>
                    <td className="font-semibold">{money(row.amount)}</td>
                    <td>{row.rejection_reason || '—'}</td>
                    <td>
                      <Button
                        size="sm"
                        onClick={() => {
                          setError('');
                          setSelected(row);
                        }}
                      >
                        <RotateCcw className="ml-1 h-4 w-4" />
                        رد كامل
                      </Button>
                    </td>
                  </tr>
                ))}
                {!loading && !rows.length && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-muted-foreground">
                      لا توجد مبالغ بانتظار الرد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد رد كامل المبلغ</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-3 text-sm">
            الإيصال: {selected?.receipt_number} — المبلغ غير القابل للتعديل:{' '}
            <strong>{money(selected?.amount)}</strong>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={method === 'CASH' ? 'default' : 'outline'}
              onClick={() => setMethod('CASH')}
            >
              نقدي
            </Button>
            <Button
              type="button"
              variant={method === 'BANK_TRANSFER' ? 'default' : 'outline'}
              onClick={() => setMethod('BANK_TRANSFER')}
            >
              <Landmark className="ml-1 h-4 w-4" />
              تحويل بنكي
            </Button>
          </div>
          {method === 'BANK_TRANSFER' && (
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="الرقم المرجعي للتحويل (مطلوب)"
            />
          )}
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="سبب رد المبلغ (مطلوب)"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              إلغاء
            </Button>
            <Button disabled={busy} onClick={() => void refund()}>
              تأكيد رد كامل المبلغ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
