# Requisitos e regras de negócio

| ID | Requisito funcional |
|---|---|
| RF01 | Emitir SP, SG e SE anonimamente, com sequência diária por tipo. |
| RF02 | Chamar próxima senha pelo guichê livre em ordem de prioridade. |
| RF03 | Repetir chamada, iniciar, finalizar ou registrar ausência após duas chamadas. |
| RF04 | Mostrar cinco últimas chamadas e guichês, sem antecipar próxima senha. |
| RF05 | Login de atendentes; único gestor adicional com acesso a cadastros e relatórios. |
| RF06 | Relatórios diários e mensais com totais, tipos, duração média, detalhes e auditoria. |
| RF07 | Anunciar chamada e última chamada por áudio no painel. |
| RF08 | Descartar senhas pendentes ao encerrar expediente e permitir concluir atendimentos iniciados. |

## Regras
- RN01: ciclo SP, SE, SP, SG; filas vazias são puladas, FIFO por tipo.
- RN02: expediente 07:00–17:00, Recife; nenhuma nova emissão/chamada fora do período.
- RN03: YYMMDD-PPSQ, sequência 001–999 por dia e tipo.
- RN04: qualquer guichê atende qualquer tipo, mas apenas um atendimento ativo por guichê e atendente.
- RN05: após segunda chamada, o atendente confirma ausência; não há tempo limite especificado.
- RN06: referência de simulação: SP uniforme 10–20 min, SG uniforme 2–8 min; SE 1 min em 95% e 5 min em 5%; ausência histórica 5%. Na operação real não se descarta aleatoriamente uma senha; a duração é medida.

## Não funcionais
- Segurança: hash scrypt com salt, tokens aleatórios, controle de perfis no servidor. Para produção: HTTPS, limitação de tentativas, expiração de sessões e troca de credenciais.
- Concorrência: transação BEGIN IMMEDIATE serializa chamadas e numeração.
- Disponibilidade: aviso de desconexão, ações bloqueadas, polling para recuperação. Backup consistente via comando SQLite `.backup` com servidor em operação ou cópia após desligamento; testar restauração em ambiente separado.
- Auditoria: horários e transições persistidos; para produção, trilha imutável e política de retenção.
- Desempenho: atualização a cada 1,5 s; monitorar latência, quantidade em espera e TM. Banco em documento único adequado a demonstração, não dimensionado para alto volume.
- LGPD: não coletar nome ou informação clínica do cliente; restringir acesso aos registros de funcionários; definir retenção e descarte antes de produção.
- Acessibilidade: teclado, foco visível, rótulos, alertas e texto junto ao áudio; validar com leitores de tela.
