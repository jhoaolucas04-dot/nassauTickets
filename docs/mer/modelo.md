# Modelo lógico de entidades

```mermaid
erDiagram
 ATENDENTE ||--o{ SENHA : atende
 GUICHE ||--o{ SENHA : recebe
 SENHA ||--o{ CHAMADA : gera
 SENHA ||--o{ TRANSICAO : registra
 ATENDENTE { string login PK
 string nome
 string hash
 boolean gestor }
 GUICHE { string nome PK }
 SENHA { string id PK
 string numero
 string tipo
 string estado
 datetime emissao
 datetime inicio
 datetime fim }
 CHAMADA { string id PK
 datetime horario
 boolean repetida }
 TRANSICAO { string estado
 datetime horario }
```

Modelo conceitual: no protótipo as entidades são persistidas como documento JSON transacional em SQLite (tabela state). Em uma migração para MySQL, normalizar em tabelas com chaves estrangeiras e índice único em dia/tipo/sequência.
