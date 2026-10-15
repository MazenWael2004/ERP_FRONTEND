import { api } from 'src/shared/api/axios';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type CustomerTicket = {
  id: number;
  ticket_number: string;
  contract_id: number;
  customer_id: number;
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  resolution_note?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  customer_name_ar?: string | null;
  customer_name_en?: string | null;
  customer_code?: string | null;
};

export type CreateTicketPayload = {
  contractId: number;
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
};

export async function getTickets(filters: { status?: string; priority?: string; search?: string } = {}) {
  const response = await api.get<{ data?: CustomerTicket[] }>('/tickets', { params: filters });
  return response.data.data ?? [];
}

export async function createTicket(payload: CreateTicketPayload) {
  const response = await api.post('/tickets', payload);
  return response.data.data as CustomerTicket;
}

export async function updateTicket(ticketId: number, payload: Partial<Pick<CustomerTicket, 'status' | 'priority' | 'subject' | 'description'>> & { resolutionNote?: string }) {
  const response = await api.patch(`/tickets/${ticketId}`, payload);
  return response.data.data as CustomerTicket;
}