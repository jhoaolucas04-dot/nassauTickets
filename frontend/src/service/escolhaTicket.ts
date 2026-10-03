
import type { Ticket, TicketType } from '../types/ticket';

export function chooseNextTicket(
  tickets: Ticket[],
  lastCalledType: TicketType | null
): Ticket | null {
  const waitingTickets = tickets.filter(
    (ticket) => ticket.status === 'AGUARDANDO'
  );

  if (waitingTickets.length === 0) {
    return null;
  }

  let priorityOrder: TicketType[];

  if (lastCalledType === 'SP') {
    priorityOrder = ['SE', 'SG', 'SP'];
  } else {
    priorityOrder = ['SP', 'SE', 'SG'];
  }

  for (const type of priorityOrder) {
    const nextTicket = waitingTickets.find(
      (ticket) => ticket.tipo === type
    );

    if (nextTicket) {
      return nextTicket;
    }
  }

  return null;
}