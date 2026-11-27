# Casos de uso e máquina de estados

```mermaid
flowchart LR
 AC[Cliente] --> E[Emitir senha]
 AC --> P[Consultar painel]
 AA[Atendente] --> L[Login]
 AA --> C[Chamar / repetir]
 AA --> A[Iniciar / finalizar / ausência]
 G[Gestor] --> L
 G --> R[Relatórios]
 G --> D[Cadastros]
 E --> AS[API Sistema]
 C --> AS
 A --> AS
 AS --> P
```

```mermaid
stateDiagram-v2
 [*] --> EMITIDA
 EMITIDA --> AGUARDANDO
 AGUARDANDO --> CHAMADA
 CHAMADA --> CHAMADA_NOVAMENTE
 CHAMADA --> EM_ATENDIMENTO
 CHAMADA_NOVAMENTE --> EM_ATENDIMENTO
 CHAMADA_NOVAMENTE --> NAO_COMPARECEU
 EM_ATENDIMENTO --> ATENDIDA
 AGUARDANDO --> NAO_COMPARECEU: fim expediente
 CHAMADA --> NAO_COMPARECEU: fim expediente
 CHAMADA_NOVAMENTE --> NAO_COMPARECEU: fim expediente
```

Caso de uso chamar: atendente autenticado seleciona guichê livre; sistema verifica expediente e fila, escolhe senha em transação, registra atendente e horário e atualiza painel. Alternativas: fila vazia, guichê ocupado, falha de conexão.
