# 🚀 Configuração do Vercel - Equilibrium

## ❌ Erro: "No Output Directory named 'dist' found"

### Solução:

O projeto tem uma estrutura monorepo (client + server). Siga estes passos:

---

## 📝 Configuração Manual no Vercel

### 1. No painel do Vercel, vá em **Project Settings**

### 2. Configure **Build & Development Settings**:

#### **Framework Preset:**
- Selecione: **Vite**

#### **Root Directory:**
- Deixe em branco OU
- Configure: `client`

#### **Build Command:**
```bash
cd client && npm install && npm run build
```

#### **Output Directory:**
```
client/dist
```

#### **Install Command:**
```bash
npm install --prefix client
```

---

## 🔧 Alternativa: Deploy Apenas o Frontend

Se quiser fazer deploy apenas do frontend (recomendado para começar):

### Opção 1: Configurar Root Directory

1. No Vercel, vá em **Project Settings**
2. Em **General** > **Root Directory**
3. Configure: `client`
4. Salve e faça novo deploy

### Opção 2: Criar projeto separado para o backend

**Frontend (Vercel):**
- Deploy do diretório `client`
- URL: `https://equilibrium.vercel.app`

**Backend (Railway ou Render):**
- Deploy do diretório `server`
- URL: `https://equilibrium-api.railway.app`

---

## 🎯 Passo a Passo Completo

### 1. Deletar o projeto atual no Vercel
- Vá em Settings > General
- Role até o final
- Clique em "Delete Project"

### 2. Criar novo projeto

1. No Vercel, clique em **"Add New..."** > **"Project"**
2. Selecione o repositório **equilibriumon**
3. Clique em **"Import"**

### 3. Configurar antes do deploy

**IMPORTANTE:** Antes de clicar em "Deploy", configure:

#### **Framework Preset:**
```
Vite
```

#### **Root Directory:**
```
client
```
(Clique em "Edit" ao lado de Root Directory e selecione `client`)

#### **Build Command:**
```bash
npm run build
```

#### **Output Directory:**
```
dist
```

#### **Install Command:**
```bash
npm install
```

### 4. Adicionar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

| Nome | Valor |
|------|-------|
| `VITE_API_URL` | `http://localhost:3002` (temporário) |

### 5. Deploy!

Clique em **"Deploy"** e aguarde.

---

## 🔄 Atualizar vercel.json

O arquivo `vercel.json` foi atualizado. Faça commit e push:

```bash
git add vercel.json
git commit -m "Corrigir configuração do Vercel"
git push equilibriumon main
```

---

## 🌐 Deploy do Backend Separado

### Opção 1: Railway (Recomendado)

1. Acesse: https://railway.app
2. New Project > Deploy from GitHub
3. Selecione: equilibriumon
4. Configure Root Directory: `server`
5. Adicione variáveis:
   ```env
   JWT_SECRET=sua_chave_segura
   NODE_ENV=production
   PORT=3002
   ```

### Opção 2: Render

1. Acesse: https://render.com
2. New > Web Service
3. Conecte o repositório
4. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

---

## 🔗 Conectar Frontend e Backend

Após deploy do backend, atualize a variável no Vercel:

1. Vá em **Project Settings** > **Environment Variables**
2. Edite `VITE_API_URL`
3. Novo valor: `https://seu-backend.railway.app`
4. Salve e faça **Redeploy**

---

## ✅ Checklist

- [ ] Root Directory configurado como `client`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Framework: Vite
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy bem-sucedido
- [ ] Site acessível

---

## 🐛 Problemas Comuns

### Erro: "Command failed"
**Solução:** Verifique se o Build Command está correto

### Erro: "Module not found"
**Solução:** Limpe cache e faça redeploy

### Página em branco
**Solução:** Verifique o console do navegador e logs do Vercel

---

## 📞 Precisa de Ajuda?

1. Verifique os logs no Vercel Dashboard
2. Teste build localmente: `cd client && npm run build`
3. Consulte: https://vercel.com/docs

**Boa sorte! 🚀**
