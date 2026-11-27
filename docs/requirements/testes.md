# Validação

Automatizado: ciclo SP/SE/SP/SG e fila vazia; login; emissão; duas chamadas concorrentes; transição inválida; repetição, início e fim; acesso negado a relatório; auditoria e painel.

Manual (a executar pelo grupo): abrir totem e painel em abas distintas; emitir três tipos, chamar no atendente; ativar áudio e conferir repetição; testar ausência; verificar filtros e CSV; reiniciar API e verificar persistência; desligar servidor e conferir alerta; testar expediente real; navegar por teclado e celular.

Simulação: gerar 1000 observações sintéticas, sortear ausência com probabilidade 0,05 e duração conforme RN06, comparar médias e percentuais. Não aplicar sorteio a clientes reais. A simulação não está integrada ao fluxo operacional.

Limitações: não foi feito teste visual em navegador ou carga, nem publicação remota. SQLite local e sessões em memória; para produção, adicionar controles descritos em requisitos.
