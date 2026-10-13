import { z } from 'zod';

const monthValueSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'صيغة الشهر غير صحيحة');

type CollectionValidationContext = {
  monthlyAmount: number;
  paidMonths: string[];
  allowedMonths: string[];
};

export function createCollectionSchema({ monthlyAmount, paidMonths, allowedMonths }: CollectionValidationContext) {
  return z
    .object({
      contractId: z.number().int('رقم العقد غير صالح').positive('رقم العقد غير صالح'),
      collectionDate: z.string().min(1, 'تاريخ التحصيل مطلوب').regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة تاريخ التحصيل غير صحيحة'),
      receiptNumber: z.string().trim().min(1, 'رقم الإيصال مطلوب').max(50, 'رقم الإيصال لا يمكن أن يتجاوز 50 حرفاً'),
      paymentMethodId: z.number().int('طريقة الدفع غير صالحة').positive('طريقة الدفع مطلوبة'),
      amount: z.number().positive('إجمالي المبلغ المحصل يجب أن يكون أكبر من صفر'),
      notes: z.string().trim().max(1000, 'الملاحظات لا يمكن أن تتجاوز 1000 حرف').optional(),
      selectedMonths: z.array(monthValueSchema).min(1, 'يجب اختيار شهر واحد على الأقل للتحصيل'),
      monthPayments: z.array(z.object({
        month: monthValueSchema,
        amount: z.number().positive('قيمة التحصيل لهذا الشهر يجب أن تكون أكبر من صفر').max(monthlyAmount, `لا يمكن أن تتجاوز قيمة تحصيل الشهر ${monthlyAmount} جنيه`),
      })).min(1, 'يجب تحديد قيمة التحصيل للشهور المختارة'),
    })
    .superRefine((data, ctx) => {
      const selectedSet = new Set(data.selectedMonths);
      if (selectedSet.size !== data.selectedMonths.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['selectedMonths'], message: 'لا يمكن اختيار نفس الشهر أكثر من مرة' });
      }
      for (const month of data.selectedMonths) {
        if (!allowedMonths.includes(month)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['selectedMonths'], message: 'أحد الشهور المختارة خارج فترة التحصيل المتاحة' });
        if (paidMonths.includes(month)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['selectedMonths'], message: 'لا يمكن تحصيل شهر تم سداده بالكامل' });
      }
      const paymentMonthSet = new Set<string>();
      data.monthPayments.forEach((payment, index) => {
        if (paymentMonthSet.has(payment.month)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthPayments', index, 'month'], message: 'يوجد شهر مكرر في قيم التحصيل' });
        paymentMonthSet.add(payment.month);
        if (!selectedSet.has(payment.month)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthPayments', index, 'month'], message: 'قيمة التحصيل مرتبطة بشهر غير مختار' });
      });
      for (const month of data.selectedMonths) {
        if (!paymentMonthSet.has(month)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['selectedMonths'], message: 'يجب تحديد قيمة التحصيل لكل شهر مختار' });
      }
      const calculatedTotal = data.monthPayments.reduce((total, payment) => total + payment.amount, 0);
      if (Math.abs(calculatedTotal - data.amount) > 0.001) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['amount'], message: 'إجمالي المبلغ المحصل لا يطابق مجموع قيم الشهور' });
    });
}

export function mapZodErrors(error: z.ZodError, payload: any) {
  const errors: any = { monthAmounts: {} };
  for (const issue of error.issues) {
    const [field, index] = issue.path;
    if (field === 'monthPayments' && typeof index === 'number') {
      const monthValue = payload.monthPayments?.[index]?.month;
      if (monthValue) errors.monthAmounts[monthValue] = issue.message;
      else if (!errors.selectedMonths) errors.selectedMonths = issue.message;
      continue;
    }
    const key = String(field || 'form');
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}