# 🚂 Railway - Guia Rápido de 5 Minutos

## 🎯 Deploy do Backend em 5 Passos

### 1️⃣ Criar Conta (1 minuto)

1. Acesse: **https://railway.app**
2. Clique em **"Login"**
3. Escolha **"Login with GitHub"**
4. Autorize o Railway ✅

---

### 2️⃣ Criar Projeto (30 segundos)

1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha: **equilibriumon**
4. Clique em **"Deploy Now"**

Railway começará o deploy automaticamente! 🚀

---

### 3️⃣ Configurar Root Directory (1 minuto)

1. Clique no serviço criado (card roxo)
2. Vá na aba **"Settings"**
3. Role até **"Service"**
4. Em **"Root Directory"**, clique em **"/"** e mude para:
   ```
   server
   ```
5. Clique em **"Update"**

---

### 4️⃣ Adicionar Variáveis de Ambiente (2 minutos)

1. Clique na aba **"Variables"**
2. Clique em **"New Variable"**
3. Adicione uma por uma:

```env
NODE_ENV = production
PORT = 3002
HOST = 0.0.0.0
JWT_SECRET = COLE_AQUI_SUA_CHAVE_SEGURA
DB_FILE = ./db.sqlite
CORS_ORIGINS = https://seu-frontend.vercel.app
```

**🔑 Gerar JWT_SECRET:**

Abra PowerShell e execute:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copie o resultado e cole em `JWT_SECRET`

**📝 CORS_ORIGINS:**

Substitua `https://seu-frontend.vercel.app` pela URL real do seu frontend no Vercel.

Exemplo: `https://equilibrium-nonatoslv.vercel.app`

---

### 5️⃣ Gerar Domínio (30 segundos)

1. Volte para **"Settings"**
2. Role até **"Networking"**
3. Em **"Public Networking"**, clique em **"Generate Domain"**
4. Copie a URL gerada! 📋

Exemplo: `equilibrium-production.up.railway.app`

---

## ✅ Pronto! Seu Backend Está Online!

**Teste agora:**

Abra no navegador:
```
https://sua-url.up.railway.app/api/health
```

Deve aparecer:
```json
{
  "ok": true,
  "timestamp": "...",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## 🔗 Conectar ao Frontend

### 1. Copie a URL do Railway

Exemplo: `https://equilibrium-production.up.railway.app`

### 2. Atualize no Vercel

1. Acesse seu projeto no Vercel
2. Vá em **"Settings"** > **"Environment Variables"**
3. Encontre `VITE_API_URL`
4. Clique em **"Edit"**
5. Cole a URL do Railway
6. Clique em **"Save"**

### 3. Redeploy no Vercel

1. Vá em **"Deployments"**
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **"Redeploy"**

---

## 🎉 Tudo Funcionando!

Agora você tem:

✅ **Frontend no Vercel**
- URL: `https://seu-projeto.vercel.app`

✅ **Backend no Railway**
- URL: `https://sua-api.railway.app`

✅ **Conectados e funcionando!**

---

## 📊 Monitorar

### Ver Logs:

1. No Railway, clique no seu serviço
2. Vá na aba **"Deployments"**
3. Clique no deploy ativo
4. Veja os logs em tempo real! 📝

### Ver Métricas:

1. Aba **"Metrics"**
2. Veja CPU, memória e rede

---

## 🐛 Problemas?

### Deploy falhou?

1. Veja os logs na aba "Deployments"
2. Verifique se Root Directory está como `server`
3. Confirme que todas as variáveis estão corretas

### API não responde?

1. Verifique se o domínio foi gerado
2. Teste: `https://sua-url.railway.app/api/health`
3. Veja logs para erros

### CORS Error?

1. Confirme que `CORS_ORIGINS` tem a URL correta do Vercel
2. Sem barra `/` no final
3. Faça redeploy

---

## 💰 Custos

**Railway Free Tier:**
- $5 de crédito grátis por mês
- Suficiente para projetos pequenos
- Sem cartão de crédito necessário

**Uso estimado:**
- ~$3-4/mês para este projeto
- Sobra crédito! 💰

---

## 🔄 Deploys Futuros

Toda vez que você fizer `git push`:

1. Railway detecta automaticamente
2. Faz novo build
3. Atualiza a API
4. Tudo automático! 🎉

---

## 📞 Precisa de Ajuda?

- Documentação: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

**Boa sorte! 🚀**
