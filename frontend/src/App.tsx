
import { useState } from 'react';
import Header from './components/header';
import SummaryCard from './components/sumarioCard';
import TicketIssuer from './components/ticketIssuer';
import { formatTicketNumber } from './service/ticketNumero';
import type { Ticket, TicketType } from './types/ticket';
import './App.css';

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  function handleIssueTicket(tipo: TicketType) {
    const hoje = new Date();

    const quantidadeDoTipoHoje = tickets.filter((ticket) => {
      const mesmaData =
        ticket.dataEmissao.getFullYear() === hoje.getFullYear() &&
        ticket.dataEmissao.getMonth() === hoje.getMonth() &&
        ticket.dataEmissao.getDate() === hoje.getDate();

      return ticket.tipo === tipo && mesmaData;
    }).length;

    const sequencia = quantidadeDoTipoHoje + 1;

    const novoTicket: Ticket = {
      id: crypto.randomUUID(),
      numero: formatTicketNumber(tipo, sequencia, hoje),
      tipo,
      status: 'AGUARDANDO',
      dataEmissao: hoje,
    };

    setTickets((ticketsAtuais) => [...ticketsAtuais, novoTicket]);
  }

  return (
    <main className="app-container">
      <Header />

      <section className="welcome">
        <h2>Painel de atendimento</h2>
        <p>Acompanhe a situação das filas e dos atendimentos do laboratório.</p>
      </section>

      <section className="summary-grid">
        <SummaryCard title="Senhas emitidas" value={tickets.length} />
        <SummaryCard
          title="Aguardando"
          value={tickets.filter((ticket) => ticket.status === 'AGUARDANDO').length}
        />
        <SummaryCard
          title="Finalizadas"
          value={tickets.filter((ticket) => ticket.status === 'ATENDIDA').length}
        />
      </section>

      <TicketIssuer onIssue={handleIssueTicket} />

      <section className="ticket-list">
        <h2>Senhas emitidas</h2>

        {tickets.length === 0 ? (
          <p>Nenhuma senha emitida ainda.</p>
        ) : (
          <ul>
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <strong>{ticket.numero}</strong>
                <span>{ticket.tipo}</span>
                <span>{ticket.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;