# 🚀 Deploy Completo no Vercel (Frontend + Backend)

## ✅ Solução Mais Simples

Vamos colocar TUDO no Vercel! Frontend e Backend juntos.

---

## 📝 PASSO 1: Atualizar Código no GitHub

Vamos fazer commit das alterações:

```bash
git add .
git commit -m "Configurar Vercel para frontend e backend"
git push equilibriumon main
```

---

## 🔧 PASSO 2: Reconfigurar Projeto no Vercel

### Opção A: Deletar e Recriar (Mais Fácil)

1. **No Vercel, vá em Settings** do seu projeto
2. **Role até o final** > **"Delete Project"**
3. **Confirme a exclusão**
4. **Clique em "Add New..."** > **"Project"**
5. **Selecione:** equilibriumon
6. **Configure:**

**Framework Preset:**
```
Other
```

**Root Directory:**
```
(deixe em branco)
```

**Build Command:**
```
cd client && npm install && npm run build && cd ../server && npm install && npm run build
```

**Output Directory:**
```
client/dist
```

**Install Command:**
```
npm install --prefix client && npm install --prefix server
```

---

### Opção B: Reconfigurar Projeto Atual

1. **Settings** > **General**
2. **Root Directory:** (deixe em branco)
3. **Settings** > **Build & Development Settings**
4. **Framework Preset:** Other
5. **Build Command:**
   ```
   cd client && npm install && npm run build && cd ../server && npm install && npm run build
   ```
6. **Output Directory:**
   ```
   client/dist
   ```
7. **Install Command:**
   ```
   npm install --prefix client && npm install --prefix server
   ```

---

## 🔐 PASSO 3: Adicionar Variáveis de Ambiente

**Settings** > **Environment Variables**

Adicione TODAS estas variáveis:

### Para o Frontend:
```
VITE_API_URL = /api
```

### Para o Backend:
```
NODE_ENV = production
PORT = 3002
HOST = 0.0.0.0
JWT_SECRET = [SUA_CHAVE_SEGURA]
DB_FILE = /tmp/db.sqlite
```

⚠️ **IMPORTANTE:** No Vercel, use `/tmp/db.sqlite` porque é serverless.

**Não precisa de CORS_ORIGINS** porque está tudo no mesmo domínio!

---

## 🚀 PASSO 4: Deploy

1. **Deployments** > **Redeploy**
2. Aguarde 3-5 minutos

---

## 🧪 PASSO 5: Testar

**Teste a API:**
```
https://seu-projeto.vercel.app/api/health
```

**Teste o Frontend:**
```
https://seu-projeto.vercel.app
```

**Teste o Login:**
- Email: `admin@balancepro.local`
- Senha: `admin123`

---

## ⚠️ Limitação do Vercel

O Vercel usa **Serverless Functions**, então:

- ✅ Funciona perfeitamente
- ⚠️ Banco SQLite é temporário (dados podem ser perdidos)
- ✅ Ideal para demonstrações e testes
- ⚠️ Para produção, recomendo banco externo (Supabase)

---

## 🎉 Pronto!

Tudo em um só lugar:
- Frontend: `https://seu-projeto.vercel.app`
- Backend: `https://seu-projeto.vercel.app/api`

**Vantagens:**
- ✅ Tudo no mesmo lugar
- ✅ Sem problemas de CORS
- ✅ Deploy automático
- ✅ 100% gratuito
- ✅ Muito rápido

---

## 🐛 Se der erro de build:

Tente este Build Command mais simples:

```bash
npm install --prefix client && npm run build --prefix client && npm install --prefix server && npm run build --prefix server
```

---

**Boa sorte! 🚀**
