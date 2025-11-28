# Guia de Deploy - BalancePro

Este guia mostra como colocar o BalancePro online usando diferentes plataformas de hospedagem.

## Opções de Hospedagem

### 1. Vercel (Recomendado para Iniciantes) - GRÁTIS
**Melhor para:** Frontend + Backend Node.js
**Custo:** Gratuito para projetos pessoais

#### Passos:

1. **Criar conta no Vercel**
   - Acesse: https://vercel.com
   - Faça login com GitHub

2. **Preparar o projeto**
   ```bash
   # Criar arquivo vercel.json na raiz do projeto
   ```

3. **Fazer deploy**
   - Conecte seu repositório GitHub
   - Vercel detectará automaticamente o projeto
   - Configure as variáveis de ambiente

**Variáveis de Ambiente necessárias:**
- `JWT_SECRET`: Sua chave secreta JWT
- `NODE_ENV`: production
- `DATABASE_URL`: URL do banco de dados (se usar PostgreSQL)

---

### 2. Railway - GRÁTIS (com limites)
**Melhor para:** Fullstack com banco de dados
**Custo:** $5/mês de crédito grátis

#### Passos:

1. **Criar conta no Railway**
   - Acesse: https://railway.app
   - Faça login com GitHub

2. **Criar novo projeto**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha seu repositório

3. **Configurar variáveis de ambiente**
   - Adicione as variáveis necessárias no painel

---

### 3. Render - GRÁTIS
**Melhor para:** Backend Node.js + Frontend estático
**Custo:** Gratuito (com limitações)

#### Passos:

1. **Criar conta no Render**
   - Acesse: https://render.com
   - Faça login com GitHub

2. **Deploy do Backend**
   - New > Web Service
   - Conecte seu repositório
   - Configure:
     - Build Command: `cd server && npm install && npm run build`
     - Start Command: `cd server && npm start`

3. **Deploy do Frontend**
   - New > Static Site
   - Configure:
     - Build Command: `cd client && npm install && npm run build`
     - Publish Directory: `client/dist`

---

### 4. Netlify + Backend separado
**Melhor para:** Frontend estático
**Custo:** Gratuito

---

## Preparação do Projeto

### 1. Criar arquivo de configuração para Vercel

Crie `vercel.json` na raiz:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/src/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "client/$1"
    }
  ]
}
```

### 2. Atualizar package.json do servidor

Adicione script de build:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts"
  }
}
```

### 3. Configurar variáveis de ambiente

Crie `.env.production` no servidor:

```env
NODE_ENV=production
PORT=3002
JWT_SECRET=sua_chave_secreta_super_segura_aqui
DB_FILE=./db.sqlite
CORS_ORIGINS=https://seu-dominio.vercel.app
```

### 4. Atualizar configuração do cliente

Atualize `client/.env.production`:

```env
VITE_API_URL=https://seu-backend.vercel.app
```

---

## Deploy Rápido com Vercel (Recomendado)

### Passo a Passo Completo:

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Fazer login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configurar variáveis de ambiente**
   ```bash
   vercel env add JWT_SECRET
   vercel env add NODE_ENV
   ```

5. **Deploy para produção**
   ```bash
   vercel --prod
   ```

---

## Banco de Dados em Produção

### Opção 1: SQLite (Simples, mas limitado)
- Mantém o arquivo `db.sqlite` no servidor
- **Limitação:** Dados podem ser perdidos em alguns serviços

### Opção 2: PostgreSQL (Recomendado)
- Use serviços como:
  - **Supabase** (Gratuito): https://supabase.com
  - **Neon** (Gratuito): https://neon.tech
  - **Railway** (Gratuito com limites): https://railway.app

#### Migrar de SQLite para PostgreSQL:

1. Instalar dependências:
   ```bash
   cd server
   npm install pg
   ```

2. Atualizar código para usar PostgreSQL
3. Exportar dados do SQLite
4. Importar para PostgreSQL

---

## Checklist Pré-Deploy

- [ ] Remover console.logs desnecessários
- [ ] Configurar variáveis de ambiente
- [ ] Testar build local: `npm run build`
- [ ] Atualizar CORS_ORIGINS com domínio de produção
- [ ] Gerar JWT_SECRET seguro: `openssl rand -base64 32`
- [ ] Configurar banco de dados de produção
- [ ] Testar aplicação localmente em modo produção
- [ ] Criar backup do banco de dados

---

## Domínio Personalizado

Após o deploy, você pode adicionar um domínio personalizado:

1. **Comprar domínio** (opcional)
   - Registro.br (Brasil)
   - Namecheap
   - GoDaddy

2. **Configurar DNS**
   - Adicione os registros DNS fornecidos pela plataforma
   - Aguarde propagação (até 48h)

---

## Monitoramento

### Ferramentas gratuitas:
- **Uptime Robot**: https://uptimerobot.com
- **Better Uptime**: https://betteruptime.com
- **Vercel Analytics**: Integrado no Vercel

---

## Custos Estimados

| Plataforma | Custo Mensal | Limites |
|------------|--------------|---------|
| Vercel Free | R$ 0 | 100GB bandwidth |
| Railway Free | R$ 0 | $5 crédito/mês |
| Render Free | R$ 0 | 750h/mês |
| Netlify Free | R$ 0 | 100GB bandwidth |

---

## Suporte

Se tiver problemas durante o deploy:
1. Verifique os logs da plataforma
2. Confirme as variáveis de ambiente
3. Teste localmente em modo produção
4. Consulte a documentação da plataforma

---

## Próximos Passos

Após o deploy:
1. Configure SSL/HTTPS (automático na maioria das plataformas)
2. Configure backup automático do banco
3. Implemente monitoramento
4. Configure CI/CD para deploys automáticos
5. Adicione analytics (Google Analytics, Plausible, etc.)
