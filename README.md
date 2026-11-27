# nassauTickets

Sistema Web de Controle de Atendimento para um Laboratório de Análises Clínicas.

## Descrição

O nassauTickets é uma aplicação desenvolvida para gerenciar a emissão de senhas, organizar filas e controlar o atendimento de clientes em guichês de um laboratório de análises clínicas.

## Objetivo

Facilitar a organização do fluxo de atendimento, respeitando as prioridades das senhas e permitindo acompanhar o andamento dos atendimentos.

## Tecnologias

* React
* TypeScript
* Vite
* CSS
* Git e GitHub

## Interface e experiência de uso

A interface foi organizada por perfil de utilização, com prioridade para o autoatendimento do cliente. O totem apresenta três opções grandes e explicativas, confirma a senha emitida e orienta o cliente a acompanhar o painel. O painel destaca a chamada mais recente e mantém as quatro chamadas anteriores visíveis. A área interna separa as tarefas do atendente e do gestor.

O layout é responsivo para computadores, tablets e celulares, possui estados visuais para conexão e expediente, foco de teclado visível, formulários com rótulos e mensagens de orientação. A emissão no totem é anônima e não solicita dados pessoais.

## Funcionalidades

* Emissão de senhas prioritárias (SP), gerais (SG) e para retirada de exames (SE).
* Organização e seleção de senhas conforme as regras de prioridade.
* Chamada de senhas e identificação do guichê.
* Chamada novamente, início e finalização do atendimento.
* Registro de não comparecimento.
* Painel de acompanhamento das chamadas.

## Instalação e execução

Requer Node.js 22.13+ (preferencialmente 22.16 ou superior compatível com Vite) e npm.

Terminal 1:
```bash
cd backend
npm start
```
Terminal 2:
```bash
cd frontend
npm ci
npm run dev
```
Abra http://localhost:5173. O totem e o painel são públicos. Para testar fora do expediente, inicie o backend com `DEMO_MODE=1 npm start` (PowerShell: `$env:DEMO_MODE="1"; npm start`). Não utilize esse modo em produção.

Credenciais iniciais exclusivamente para demonstração: `gestor` / `Gestor123!` e `atendente` / `Atende123!`. Defina `ADMIN_PASSWORD` e `STAFF_PASSWORD` antes da primeira execução em ambientes reais. O gestor pode cadastrar atendentes e guichês e consultar relatórios. Ative o áudio no painel com o botão correspondente.

## Arquitetura e decisões

React/TypeScript/Vite mantidos do projeto original, conforme o Markdown da atividade. Interface web responsiva, não React Native. API REST em Node.js 22 com módulo HTTP nativo e SQLite integrado, alternativa ao Express/MySQL para facilitar execução local sem serviços externos. O servidor é a fonte de verdade; a interface consulta a cada 1,5 segundo. Transações SQLite serializam emissão e chamadas. Dados persistem em `backend/tickets.sqlite`; sessões ficam em memória e expiram com reinício do servidor. O horário usa America/Recife.

O ciclo adotado é SP, SE, SP, SG, pulando filas vazias, conforme o diagrama. O tempo médio usa duração real. Os 5% de ausências representam referência histórica, não descarte aleatório de pacientes reais; o documento de simulação descreve como testar esse cenário.

## Testes

`cd backend && npm test` executa testes de prioridade e integração HTTP. `cd frontend && npm run build` verifica TypeScript e gera a aplicação. Consulte `docs/requirements/testes.md` para validações manuais e limitações.

## Estrutura do projeto

* `backend/`: API e persistência SQLite.
* `frontend/`: código da interface React.
* `docs/`: documentação, requisitos, modelos e protótipos.

## Branches

* `main`: versão principal do projeto.
* `dev`: branch utilizada para o desenvolvimento e integração das alterações.

## Membros

| Nome          | Matrícula | Papel                        |
| ------------- | --------- | ---------------------------- |
| Jhoão Lucas   | 01848181  | Scrum Master                 |
| Caio Dourado  | 01795587  | Documentador                 |
| Inaldo Neto   | 01799355  | Desenvolvedor e documentador |
| Thomas Victor | 01613686  | Desenvolvedor                |
| Matheus Jones | 01778060  | Testador e Desenvolvedor     |

## Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo `LICENSE` para mais informações.