import { useState } from 'react';
import Header from './components/header';
import SummaryCard from './components/sumarioCard';
import TicketIssuer from './components/ticketIssuer';
import GuicheSelector from './components/guicheselector';
import { formatTicketNumber } from './service/ticketNumero';
import { chooseNextTicket } from './service/escolhaTicket';
import {
  transitionTicket,
  type TicketAction,
} from './service/ticketTransitions';
import type { Ticket, TicketType } from './types/ticket';
import './App.css';

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [lastCalledType, setLastCalledType] = useState<TicketType | null>(null);
  const [guiche, setGuiche] = useState<string | null>(null);

  function handleIssueTicket(tipo: TicketType) {
    const hoje = new Date();

    const quantidadeDoTipoHoje = tickets.filter((ticket) => {
      const data = ticket.dataEmissao;

      return (
        ticket.tipo === tipo &&
        data.getFullYear() === hoje.getFullYear() &&
        data.getMonth() === hoje.getMonth() &&
        data.getDate() === hoje.getDate()
      );
    }).length;

    const novoTicket: Ticket = {
      id: crypto.randomUUID(),
      numero: formatTicketNumber(tipo, quantidadeDoTipoHoje + 1, hoje),
      tipo,
      status: 'EMITIDA',
      dataEmissao: hoje,
      guiche: null,
    };

    const ticketAguardando = transitionTicket(
      novoTicket,
      'COLOCAR_EM_ESPERA'
    );

    setTickets((atuais) => [...atuais, ticketAguardando]);
  }

  function handleCallNext() {
    if (!guiche) {
      return;
    }

    const nextTicket = chooseNextTicket(tickets, lastCalledType);

    if (!nextTicket) {
      return;
    }

    updateTicket(nextTicket.id, 'CHAMAR', guiche);
    setLastCalledType(nextTicket.tipo);
  }

  function updateTicket(
    id: string,
    action: TicketAction,
    guicheAtendimento?: string
  ) {
    setTickets((atuais) =>
      atuais.map((ticket) => {
        if (ticket.id !== id) {
          return ticket;
        }

        const ticketAtualizado = transitionTicket(ticket, action);

        return guicheAtendimento
          ? { ...ticketAtualizado, guiche: guicheAtendimento }
          : ticketAtualizado;
      })
    );
  }

  const waitingCount = tickets.filter(
    (ticket) => ticket.status === 'AGUARDANDO'
  ).length;

  const finishedCount = tickets.filter(
    (ticket) => ticket.status === 'ATENDIDA'
  ).length;

  return (
    <main className="app-container">
      <Header />

      <section className="welcome">
        <h2>Painel de atendimento</h2>
        <p>Acompanhe a situação das filas e dos atendimentos do laboratório.</p>
      </section>

      <section className="summary-grid">
        <SummaryCard title="Senhas emitidas" value={tickets.length} />
        <SummaryCard title="Aguardando" value={waitingCount} />
        <SummaryCard title="Finalizadas" value={finishedCount} />
      </section>

      <TicketIssuer onIssue={handleIssueTicket} />

      <section className="attendant-panel">
        <h2>Painel do atendente</h2>

        {!guiche ? (
          <GuicheSelector onSelect={setGuiche} />
        ) : (
          <>
            <p>
              Guichê em atendimento: <strong>{guiche}</strong>
            </p>

            <button
              type="button"
              onClick={handleCallNext}
              disabled={waitingCount === 0}
            >
              Chamar próxima senha
            </button>
          </>
        )}
      </section>

      <section className="ticket-list">
        <h2>Senhas emitidas</h2>

        {tickets.length === 0 ? (
          <p>Nenhuma senha emitida ainda.</p>
        ) : (
          <ul>
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <div>
                  <strong>{ticket.numero}</strong>
                  <span>{ticket.tipo}</span>
                  <span>{ticket.status}</span>

                  {ticket.guiche && (
                    <span>Guichê: {ticket.guiche}</span>
                  )}
                </div>

                <div className="ticket-actions">
                  {ticket.status === 'CHAMADA' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          updateTicket(ticket.id, 'CHAMAR_NOVAMENTE')
                        }
                      >
                        Chamar novamente
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateTicket(ticket.id, 'INICIAR_ATENDIMENTO')
                        }
                      >
                        Iniciar atendimento
                      </button>
                    </>
                  )}

                  {ticket.status === 'CHAMADA_NOVAMENTE' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          updateTicket(ticket.id, 'INICIAR_ATENDIMENTO')
                        }
                      >
                        Iniciar atendimento
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateTicket(ticket.id, 'MARCAR_NAO_COMPARECEU')
                        }
                      >
                        Não compareceu
                      </button>
                    </>
                  )}

                  {ticket.status === 'EM_ATENDIMENTO' && (
                    <button
                      type="button"
                      onClick={() =>
                        updateTicket(ticket.id, 'FINALIZAR_ATENDIMENTO')
                      }
                    >
                      Finalizar atendimento
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;