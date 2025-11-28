# 🚀 Guia Completo de Deploy - BalancePro

## 📚 Índice

1. [Preparação](#preparação)
2. [Deploy no Vercel](#deploy-no-vercel)
3. [Deploy no Railway](#deploy-no-railway)
4. [Deploy no Render](#deploy-no-render)
5. [Configuração de Domínio](#configuração-de-domínio)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Preparação

### 1. Verificar se o projeto está pronto

Execute o script de verificação:

```bash
npm run prepare-deploy
```

Este script irá verificar:
- ✅ Arquivos de configuração
- ✅ Dependências instaladas
- ✅ Build do servidor e cliente
- ✅ Git inicializado

### 2. Gerar JWT_SECRET seguro

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copie o resultado e guarde para usar nas variáveis de ambiente.

### 3. Subir para o GitHub

```bash
# Inicializar Git (se ainda não fez)
git init

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Preparar para deploy"

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/seu-usuario/balancepro.git

# Enviar código
git push -u origin main
```

---

## 🌐 Deploy no Vercel (Recomendado)

### Vantagens:
- ✅ Deploy automático a cada push
- ✅ SSL/HTTPS gratuito
- ✅ CDN global
- ✅ Fácil configuração
- ✅ 100GB bandwidth grátis

### Passo a Passo:

#### 1. Criar conta
- Acesse: https://vercel.com
- Clique em "Sign Up"
- Escolha "Continue with GitHub"

#### 2. Importar projeto
- No dashboard, clique em "Add New..." > "Project"
- Selecione seu repositório "balancepro"
- Clique em "Import"

#### 3. Configurar build

**Framework Preset:** Vite (detectado automaticamente)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `client/dist`
- Install Command: `npm install`

#### 4. Adicionar variáveis de ambiente

Clique em "Environment Variables" e adicione:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `JWT_SECRET` | `sua_chave_gerada` | Production |
| `NODE_ENV` | `production` | Production |
| `PORT` | `3002` | Production |
| `VITE_API_URL` | `https://seu-projeto.vercel.app/api` | Production |

#### 5. Deploy!

- Clique em "Deploy"
- Aguarde 2-3 minutos
- ✅ Pronto! Acesse: `https://seu-projeto.vercel.app`

### Deploys Futuros:

Toda vez que você fizer `git push`, o Vercel automaticamente:
1. Detecta mudanças
2. Faz novo build
3. Atualiza o site

---

## 🚂 Deploy no Railway

### Vantagens:
- ✅ Suporta banco de dados facilmente
- ✅ $5 crédito grátis/mês
- ✅ Fácil escalar
- ✅ Logs em tempo real

### Passo a Passo:

#### 1. Criar conta
- Acesse: https://railway.app
- Faça login com GitHub

#### 2. Novo projeto
- Clique em "New Project"
- Selecione "Deploy from GitHub repo"
- Escolha seu repositório

#### 3. Configurar variáveis

Railway detectará automaticamente o projeto. Adicione as variáveis:

```env
JWT_SECRET=sua_chave_gerada
NODE_ENV=production
PORT=3002
```

#### 4. Deploy automático

Railway fará o deploy automaticamente!

**URL:** `https://seu-projeto.up.railway.app`

---

## 🎨 Deploy no Render

### Vantagens:
- ✅ 100% gratuito
- ✅ SSL automático
- ✅ Deploy contínuo

### Desvantagens:
- ⚠️ Pode ser mais lento
- ⚠️ Serviço gratuito "hiberna" após inatividade

### Passo a Passo:

#### Backend:

1. Acesse: https://render.com
2. Clique em "New +" > "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name:** balancepro-api
   - **Environment:** Node
   - **Build Command:** `cd server && npm install && npm run build`
   - **Start Command:** `cd server && npm start`
   - **Plan:** Free

5. Adicione variáveis de ambiente:
   ```env
   JWT_SECRET=sua_chave_gerada
   NODE_ENV=production
   PORT=3002
   ```

6. Clique em "Create Web Service"

#### Frontend:

1. Clique em "New +" > "Static Site"
2. Conecte o mesmo repositório
3. Configure:
   - **Name:** balancepro-frontend
   - **Build Command:** `cd client && npm install && npm run build`
   - **Publish Directory:** `client/dist`

4. Adicione variável:
   ```env
   VITE_API_URL=https://balancepro-api.onrender.com
   ```

5. Clique em "Create Static Site"

---

## 🌍 Configuração de Domínio

### Usar domínio personalizado:

#### No Vercel:

1. Vá em "Settings" > "Domains"
2. Adicione seu domínio (ex: `meubalancepro.com`)
3. Configure DNS:
   - Tipo: `CNAME`
   - Nome: `@` ou `www`
   - Valor: `cname.vercel-dns.com`
4. Aguarde propagação (até 48h)

#### No Railway:

1. Vá em "Settings" > "Domains"
2. Clique em "Custom Domain"
3. Adicione seu domínio
4. Configure DNS conforme instruções

### Onde comprar domínio:

- **Registro.br** (Brasil): https://registro.br
- **Namecheap**: https://namecheap.com
- **GoDaddy**: https://godaddy.com
- **Hostinger**: https://hostinger.com.br

**Custo:** R$ 40-60/ano

---

## 🐛 Troubleshooting

### Problema: Build falhou

**Sintomas:**
- Deploy não completa
- Erro durante build

**Soluções:**
1. Verifique os logs da plataforma
2. Teste build localmente:
   ```bash
   npm run build
   ```
3. Verifique se todas as dependências estão no `package.json`
4. Confirme versão do Node (>=18.0.0)

### Problema: Erro 404 nas rotas

**Sintomas:**
- Página inicial funciona
- Outras rotas retornam 404

**Soluções:**
1. Verifique se `vercel.json` está configurado
2. Para Render/Railway, configure rewrites:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

### Problema: API não responde

**Sintomas:**
- Frontend carrega
- Requisições para API falham

**Soluções:**
1. Verifique `VITE_API_URL` no frontend
2. Confirme CORS no backend:
   ```env
   CORS_ORIGINS=https://seu-frontend.vercel.app
   ```
3. Verifique logs do servidor
4. Teste endpoint diretamente: `https://seu-api.vercel.app/api/health`

### Problema: Erro de autenticação

**Sintomas:**
- Login não funciona
- Erro 401 ou 403

**Soluções:**
1. Confirme `JWT_SECRET` está configurado
2. Verifique se é o mesmo secret em todos os ambientes
3. Limpe cache do navegador
4. Teste com Postman/Insomnia

### Problema: Banco de dados vazio

**Sintomas:**
- Login não funciona
- Sem dados iniciais

**Soluções:**
1. Execute setup inicial:
   ```bash
   npm run setup
   ```
2. Importe dados de backup
3. Verifique se `db.sqlite` está sendo criado

### Problema: CORS Error

**Sintomas:**
- Erro no console: "CORS policy"
- Requisições bloqueadas

**Soluções:**
1. Adicione URL do frontend em `CORS_ORIGINS`:
   ```env
   CORS_ORIGINS=https://seu-frontend.vercel.app,https://outro-dominio.com
   ```
2. Verifique se backend está rodando
3. Confirme headers CORS no servidor

---

## 📊 Monitoramento

### Uptime Monitoring:

**Uptime Robot** (Gratuito):
1. Acesse: https://uptimerobot.com
2. Adicione novo monitor
3. URL: `https://seu-projeto.vercel.app`
4. Receba alertas por email

### Analytics:

**Vercel Analytics:**
- Já integrado automaticamente
- Veja no dashboard do Vercel

**Google Analytics:**
1. Crie conta: https://analytics.google.com
2. Adicione código de tracking no `index.html`

---

## 💾 Backup do Banco de Dados

### SQLite:

```bash
# Fazer backup
cp server/db.sqlite server/db.backup.sqlite

# Restaurar backup
cp server/db.backup.sqlite server/db.sqlite
```

### PostgreSQL (se migrar):

```bash
# Backup
pg_dump database_url > backup.sql

# Restaurar
psql database_url < backup.sql
```

---

## 🔒 Segurança

### Checklist de Segurança:

- [ ] JWT_SECRET forte e único
- [ ] HTTPS ativo (cadeado verde)
- [ ] CORS configurado corretamente
- [ ] Variáveis de ambiente não expostas
- [ ] Rate limiting ativo
- [ ] Senhas com hash (bcrypt)
- [ ] Validação de inputs (Zod)
- [ ] Headers de segurança configurados

---

## 📈 Próximos Passos

Após deploy bem-sucedido:

1. ✅ Configurar domínio personalizado
2. ✅ Adicionar monitoramento
3. ✅ Configurar backup automático
4. ✅ Implementar CI/CD
5. ✅ Adicionar testes automatizados
6. ✅ Configurar analytics
7. ✅ Otimizar performance
8. ✅ Adicionar documentação da API

---

## 🎉 Conclusão

Parabéns! Seu projeto está online e acessível para o mundo!

**Compartilhe:**
- URL: `https://seu-projeto.vercel.app`
- GitHub: `https://github.com/seu-usuario/balancepro`

**Precisa de ajuda?**
- Documentação Vercel: https://vercel.com/docs
- Documentação Railway: https://docs.railway.app
- Documentação Render: https://render.com/docs

**Boa sorte! 🚀**
