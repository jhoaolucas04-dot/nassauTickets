import { useState } from 'react';
import "./guicheselector.css";

interface GuicheSelectorProps {
  onSelect: (guiche: string) => void;
  disabled?: boolean;
}

function GuicheSelector({
  onSelect,
  disabled = false,
}: GuicheSelectorProps) {
  const [guiche, setGuiche] = useState('');

  function handleSelect() {
    const guicheInformado = guiche.trim();

    if (!guicheInformado) {
      return;
    }

    onSelect(guicheInformado);
  }

  return (
    <section className="guiche-selector">
      <h2>Guichê de atendimento</h2>

      <p>Informe o identificador do guichê em que você está.</p>

      <label htmlFor="guiche">Número ou identificação do guichê</label>

      <input
        id="guiche"
        type="text"
        value={guiche}
        onChange={(event) => setGuiche(event.target.value)}
        placeholder="Ex.: 1 ou A"
        disabled={disabled}
      />

      <button
        type="button"
        onClick={handleSelect}
        disabled={disabled || !guiche.trim()}
      >
        Confirmar guichê
      </button>
    </section>
  );
}

export default GuicheSelector;