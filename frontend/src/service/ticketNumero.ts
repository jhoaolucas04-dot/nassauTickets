
import type { TicketType } from '../types/ticket';

export function formatTicketNumber(
  tipo: TicketType,
  sequencia: number,
  data: Date = new Date()
): string {
  if (!Number.isInteger(sequencia) || sequencia < 1 || sequencia > 999) {
    throw new Error('A sequência deve ser um número inteiro entre 1 e 999.');
  }

  const ano = String(data.getFullYear()).slice(-2);
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  const numeroSequencial = String(sequencia).padStart(3, '0');

  return `${ano}${mes}${dia}-${tipo}${numeroSequencial}`;
}
formatTicketNumber('SP', 1, new Date(2026, 9, 2));