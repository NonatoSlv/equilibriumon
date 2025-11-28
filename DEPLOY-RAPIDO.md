# 🚀 Deploy Rápido - BalancePro

## Opção 1: Vercel (Mais Fácil) ⭐

### 1. Criar conta
- Acesse: https://vercel.com
- Faça login com GitHub

### 2. Conectar repositório
- Clique em "New Project"
- Importe seu repositório do GitHub
- Vercel detectará automaticamente

### 3. Configurar variáveis de ambiente
No painel do Vercel, adicione:
```
JWT_SECRET=cole_uma_chave_segura_aqui
NODE_ENV=production
```

### 4. Deploy!
- Clique em "Deploy"
- Aguarde alguns minutos
- Seu projeto estará online! 🎉

**URL:** `https://seu-projeto.vercel.app`

---

## Opção 2: Railway (Recomendado para Fullstack)

### 1. Criar conta
- Acesse: https://railway.app
- Faça login com GitHub

### 2. Novo projeto
- Clique em "New Project"
- Selecione "Deploy from GitHub repo"
- Escolha seu repositório

### 3. Configurar
Railway detectará automaticamente e fará o deploy!

**Crédito grátis:** $5/mês

---

## Opção 3: Render (Gratuito)

### Backend:
1. Acesse: https://render.com
2. New > Web Service
3. Conecte GitHub
4. Configure:
   - **Build Command:** `cd server && npm install && npm run build`
   - **Start Command:** `cd server && npm start`
   - **Environment:** Node

### Frontend:
1. New > Static Site
2. Configure:
   - **Build Command:** `cd client && npm install && npm run build`
   - **Publish Directory:** `client/dist`

---

## Gerar JWT_SECRET Seguro

Execute no terminal:

```bash
# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Atualizar URLs após Deploy

### 1. Anote a URL do backend
Exemplo: `https://balancepro-api.railway.app`

### 2. Atualize o frontend
Edite `client/.env.production`:
```env
VITE_API_URL=https://balancepro-api.railway.app
```

### 3. Atualize o backend
Edite `server/.env.production`:
```env
CORS_ORIGINS=https://seu-frontend.vercel.app
```

### 4. Faça novo deploy
```bash
git add .
git commit -m "Atualizar URLs de produção"
git push
```

---

## Testar Localmente em Modo Produção

```bash
# Build
npm run build

# Testar
cd server && npm start
cd client && npm run preview
```

---

## Problemas Comuns

### ❌ Erro de CORS
**Solução:** Adicione a URL do frontend em `CORS_ORIGINS`

### ❌ Erro 401 no login
**Solução:** Verifique se `JWT_SECRET` está configurado

### ❌ Banco de dados vazio
**Solução:** Execute o setup inicial ou importe dados

### ❌ Build falhou
**Solução:** Verifique os logs e dependências

---

## Checklist Final

- [ ] JWT_SECRET configurado
- [ ] URLs atualizadas (frontend e backend)
- [ ] CORS configurado corretamente
- [ ] Build testado localmente
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Teste de login funcionando
- [ ] Dados iniciais carregados

---

## Próximos Passos

1. ✅ Configurar domínio personalizado (opcional)
2. ✅ Adicionar SSL/HTTPS (automático)
3. ✅ Configurar backup do banco
4. ✅ Adicionar monitoramento
5. ✅ Configurar CI/CD

---

## Suporte

Precisa de ajuda? Verifique:
- Logs da plataforma de deploy
- Documentação oficial
- Issues no GitHub do projeto

**Boa sorte com seu deploy! 🚀**
