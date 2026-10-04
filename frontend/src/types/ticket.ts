
export type TicketType = 'SP' | 'SG' | 'SE';

export type TicketStatus =
  | 'EMITIDA'
  | 'AGUARDANDO'
  | 'CHAMADA'
  | 'CHAMADA_NOVAMENTE'
  | 'EM_ATENDIMENTO'
  | 'ATENDIDA'
  | 'NÃO_COMPARECEU';

export interface Ticket {
  id: string;
  numero: string;
  tipo: TicketType;
  status: TicketStatus;
  dataEmissao: Date;
  guiche: string | null;
}

