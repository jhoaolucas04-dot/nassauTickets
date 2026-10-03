
import { useState } from 'react';
import type { TicketType } from '../types/ticket';

interface TicketIssuerProps {
  onIssue: (tipo: TicketType) => void;
}

function TicketIssuer({ onIssue }: TicketIssuerProps) {
  const [tipo, setTipo] = useState<TicketType>('SG');

  function handleSubmit() {
    onIssue(tipo);
  }

  return (
    <section className="ticket-issuer">
      <h2>Emissão de senha</h2>
      <p>Selecione o tipo de atendimento para emitir uma senha.</p>

      <label htmlFor="ticket-type">Tipo de senha</label>
      <select
        id="ticket-type"
        value={tipo}
        onChange={(event) => setTipo(event.target.value as TicketType)}
      >
        <option value="SP">SP — Senha Prioritária</option>
        <option value="SG">SG — Senha Geral</option>
        <option value="SE">SE — Retirada de Exames</option>
      </select>

      <button type="button" onClick={handleSubmit}>
        Emitir senha
      </button>
    </section>
  );
}

export default TicketIssuer;