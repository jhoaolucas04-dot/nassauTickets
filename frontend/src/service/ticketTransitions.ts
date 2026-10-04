import type { Ticket, TicketStatus } from '../types/ticket';

export type TicketAction =
  | 'COLOCAR_EM_ESPERA'
  | 'CHAMAR'
  | 'CHAMAR_NOVAMENTE'
  | 'INICIAR_ATENDIMENTO'
  | 'FINALIZAR_ATENDIMENTO'
  | 'MARCAR_NAO_COMPARECEU';

const transitions: Record<
  TicketAction,
  {
    from: TicketStatus[];
    to: TicketStatus;
  }
> = {
  COLOCAR_EM_ESPERA: {
    from: ['EMITIDA'],
    to: 'AGUARDANDO',
  },
  CHAMAR: {
    from: ['AGUARDANDO'],
    to: 'CHAMADA',
  },
  CHAMAR_NOVAMENTE: {
    from: ['CHAMADA'],
    to: 'CHAMADA_NOVAMENTE',
  },
  INICIAR_ATENDIMENTO: {
    from: ['CHAMADA', 'CHAMADA_NOVAMENTE'],
    to: 'EM_ATENDIMENTO',
  },
  FINALIZAR_ATENDIMENTO: {
    from: ['EM_ATENDIMENTO'],
    to: 'ATENDIDA',
  },
  MARCAR_NAO_COMPARECEU: {
    from: ['CHAMADA_NOVAMENTE'],
    to: 'NÃO_COMPARECEU',
  },
};

export function transitionTicket(
  ticket: Ticket,
  action: TicketAction,
  guiche?: string
): Ticket {
  const transition = transitions[action];

  if (!transition.from.includes(ticket.status)) {
    throw new Error(
      `A ação ${action} não é permitida para uma senha no estado ${ticket.status}.`
    );
  }

  if (action === 'CHAMAR' && !guiche) {
    throw new Error('É necessário selecionar um guichê para chamar a senha.');
  }

  return {
    ...ticket,
    status: transition.to,
    guiche: action === 'CHAMAR' ? guiche! : ticket.guiche,
  };
}