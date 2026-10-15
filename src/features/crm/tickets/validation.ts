import type { CreateTicketPayload } from './api/ticketService';

export function validateTicket(payload: Partial<CreateTicketPayload>) {
  if (!payload.contractId) return 'اختر عقد العميل أولاً.';
  if (!payload.subject?.trim()) return 'اكتب عنوان المشكلة.';
  if (payload.subject.trim().length > 200) return 'عنوان المشكلة يجب ألا يتجاوز 200 حرف.';
  if (!payload.description?.trim()) return 'اكتب تفاصيل مشكلة العميل.';
  return '';
}