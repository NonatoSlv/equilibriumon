# Backend (Express + SQLite)

Este backend foi ajustado para iniciar de forma previsível e estável.

## Requisitos
- Node.js 18+
- Dependências instaladas (`npm install` na pasta `server`)

## Configuração
1. Copie `.env.example` para `.env` e ajuste se necessário:
   - `HOST` (padrão `0.0.0.0`)
   - `PORT` (padrão `3001`)
   - `CORS_ORIGINS` (origens permitidas para o cliente)
   - `DB_FILE` (caminho do arquivo SQLite)
2. O banco é criado automaticamente e recebe seed inicial.

## Rodar em desenvolvimento
```bash
npm run dev
```
Logs esperados:
```
API listening on http://localhost:3001
```
Saúde da API:
- `GET /api/health` -> `{"ok": true}`

## Notas de robustez
- Caminho do banco é resolvido de forma estável e diretório é criado automaticamente.
- Inicialização do schema e seed protegida com `try/catch` para mensagens claras em caso de erro.
- CORS e HOST configuráveis via `.env` para evitar conflitos em ambientes diferentes.