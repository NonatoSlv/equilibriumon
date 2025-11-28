# 🚀 Deploy do Backend - Equilibrium

## 🎯 Opções de Deploy

Vou mostrar 3 opções. **Recomendo o Railway** por ser mais fácil e ter banco de dados integrado.

---

## ⭐ Opção 1: Railway (RECOMENDADO)

### Vantagens:
- ✅ Muito fácil de configurar
- ✅ $5 crédito grátis/mês
- ✅ Suporta SQLite nativamente
- ✅ Logs em tempo real
- ✅ Deploy automático

### Passo a Passo:

#### 1. Criar conta no Railway

- Acesse: **https://railway.app**
- Clique em **"Login"**
- Escolha **"Login with GitHub"**
- Autorize o Railway

#### 2. Criar novo projeto

1. No dashboard, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório: **equilibriumon**
4. Clique em **"Deploy Now"**

#### 3. Configurar o serviço

Railway detectará automaticamente que é um projeto Node.js.

1. Clique no serviço criado
2. Vá em **"Settings"**
3. Configure:

**Root Directory:**
```
server
```

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

#### 4. Adicionar variáveis de ambiente

1. Clique na aba **"Variables"**
2. Adicione as seguintes variáveis:

```env
NODE_ENV=production
PORT=3002
HOST=0.0.0.0
JWT_SECRET=COLE_SUA_CHAVE_SEGURA_AQUI
DB_FILE=./db.sqlite
CORS_ORIGINS=https://seu-frontend.vercel.app
```

**Para gerar JWT_SECRET:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

#### 5. Deploy!

Railway fará o deploy automaticamente!

**Aguarde 2-3 minutos** e sua API estará online! 🎉

#### 6. Obter a URL da API

1. Vá em **"Settings"**
2. Role até **"Domains"**
3. Clique em **"Generate Domain"**
4. Copie a URL (ex: `equilibrium-production.up.railway.app`)

**Sua API estará em:**
```
https://equilibrium-production.up.railway.app
```

**Teste:**
```
https://equilibrium-production.up.railway.app/api/health
```

---

## 🎨 Opção 2: Render (100% Gratuito)

### Vantagens:
- ✅ Totalmente gratuito
- ✅ SSL automático
- ✅ Fácil de usar

### Desvantagens:
- ⚠️ Serviço gratuito "hiberna" após 15 min de inatividade
- ⚠️ Primeira requisição pode ser lenta

### Passo a Passo:

#### 1. Criar conta no Render

- Acesse: **https://render.com**
- Clique em **"Get Started"**
- Escolha **"GitHub"**

#### 2. Criar Web Service

1. No dashboard, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório **equilibriumon**
4. Clique em **"Connect"**

#### 3. Configurar o serviço

**Name:**
```
equilibrium-api
```

**Region:**
```
Oregon (US West) ou Frankfurt (Europe)
```

**Root Directory:**
```
server
```

**Environment:**
```
Node
```

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Plan:**
```
Free
```

#### 4. Adicionar variáveis de ambiente

Role até **"Environment Variables"** e adicione:

```env
NODE_ENV=production
PORT=3002
HOST=0.0.0.0
JWT_SECRET=sua_chave_segura_aqui
DB_FILE=./db.sqlite
CORS_ORIGINS=https://seu-frontend.vercel.app
```

#### 5. Criar o serviço

Clique em **"Create Web Service"**

Aguarde 5-10 minutos para o primeiro deploy.

**Sua API estará em:**
```
https://equilibrium-api.onrender.com
```

---

## 🔵 Opção 3: Vercel (Backend + Frontend Juntos)

### Vantagens:
- ✅ Tudo em um lugar
- ✅ Deploy automático

### Desvantagens:
- ⚠️ Mais complexo de configurar
- ⚠️ Limitações para APIs

### Configuração:

Crie arquivo `api/index.js` na raiz:

```javascript
// Este arquivo redireciona para o servidor
const app = require('../server/dist/index.js');
module.exports = app;
```

**Não recomendo esta opção para este projeto.**

---

## 🔗 Conectar Frontend ao Backend

Após o backend estar online:

### 1. Obter URL do backend

**Railway:** `https://equilibrium-production.up.railway.app`
**Render:** `https://equilibrium-api.onrender.com`

### 2. Atualizar variável no Vercel

1. Acesse seu projeto no Vercel
2. Vá em **"Settings"** > **"Environment Variables"**
3. Edite `VITE_API_URL`
4. Novo valor: `https://sua-api.railway.app`
5. Clique em **"Save"**

### 3. Atualizar CORS no backend

1. No Railway/Render, vá em **"Variables"**
2. Edite `CORS_ORIGINS`
3. Adicione a URL do seu frontend Vercel:
   ```
   https://seu-projeto.vercel.app
   ```

### 4. Fazer Redeploy

**No Vercel:**
- Vá em "Deployments"
- Clique nos 3 pontinhos
- "Redeploy"

**No Railway/Render:**
- Deploy automático ao salvar variáveis

---

## 🧪 Testar a API

### 1. Health Check

Abra no navegador:
```
https://sua-api.railway.app/api/health
```

Deve retornar:
```json
{
  "ok": true,
  "timestamp": "2025-01-15T...",
  "version": "1.0.0",
  "environment": "production"
}
```

### 2. Testar Login

Use Postman ou curl:

```bash
curl -X POST https://sua-api.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@balancepro.local","password":"admin123"}'
```

Deve retornar um token JWT.

---

## 📊 Banco de Dados

### SQLite (Atual)

**Vantagens:**
- ✅ Simples
- ✅ Sem configuração extra

**Desvantagens:**
- ⚠️ Dados podem ser perdidos em redeploys
- ⚠️ Não recomendado para produção

### Migrar para PostgreSQL (Recomendado)

Se quiser dados persistentes:

#### 1. Criar banco no Supabase

1. Acesse: https://supabase.com
2. Crie novo projeto
3. Copie a URL de conexão

#### 2. Atualizar código

Instalar dependência:
```bash
cd server
npm install pg
```

#### 3. Adicionar variável

No Railway/Render:
```env
DATABASE_URL=postgresql://...
```

---

## 🐛 Troubleshooting

### Erro: "Application failed to respond"

**Solução:**
1. Verifique se `PORT` está configurado
2. Confirme que o servidor está escutando em `0.0.0.0`
3. Veja os logs no painel

### Erro: "Build failed"

**Solução:**
1. Verifique os logs de build
2. Teste localmente: `cd server && npm run build`
3. Confirme que todas as dependências estão no `package.json`

### Erro: CORS

**Solução:**
1. Adicione URL do frontend em `CORS_ORIGINS`
2. Formato: `https://seu-frontend.vercel.app` (sem barra no final)
3. Faça redeploy

### Erro: "Cannot find module"

**Solução:**
1. Verifique se o Build Command está correto
2. Confirme que `npm run build` funciona localmente
3. Limpe cache e faça redeploy

---

## 📈 Monitoramento

### Railway:

- Logs em tempo real no dashboard
- Métricas de CPU e memória
- Alertas automáticos

### Render:

- Logs na aba "Logs"
- Métricas na aba "Metrics"
- Alertas por email

### Uptime Monitoring:

Use **Uptime Robot** (gratuito):
1. Acesse: https://uptimerobot.com
2. Adicione monitor HTTP(s)
3. URL: `https://sua-api.railway.app/api/health`
4. Intervalo: 5 minutos

---

## 💾 Backup do Banco

### Fazer backup:

1. Acesse o painel do Railway/Render
2. Vá em "Settings" > "Data"
3. Faça download do arquivo `db.sqlite`

### Restaurar backup:

1. Faça upload do arquivo via FTP/SFTP
2. Ou use variável de ambiente para URL do banco

---

## ✅ Checklist Final

- [ ] Backend deployado com sucesso
- [ ] URL da API acessível
- [ ] Health check funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado com URL do frontend
- [ ] Frontend atualizado com URL da API
- [ ] Login funcionando
- [ ] Dados sendo salvos

---

## 🎉 Pronto!

Seu backend está online e funcionando!

**URLs:**
- Frontend: `https://seu-projeto.vercel.app`
- Backend: `https://sua-api.railway.app`
- Health: `https://sua-api.railway.app/api/health`

---

## 📞 Precisa de Ajuda?

1. Verifique os logs no painel
2. Teste endpoints com Postman
3. Consulte documentação:
   - Railway: https://docs.railway.app
   - Render: https://render.com/docs

**Boa sorte! 🚀**
