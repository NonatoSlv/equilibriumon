# 🌐 Como Colocar o BalancePro Online

## 📋 Pré-requisitos

1. ✅ Conta no GitHub (para hospedar o código)
2. ✅ Projeto funcionando localmente
3. ✅ 10-15 minutos de tempo

---

## 🎯 Método Mais Simples: Vercel

### Passo 1: Preparar o Código

1. **Subir para o GitHub** (se ainda não fez):
   ```bash
   git init
   git add .
   git commit -m "Preparar para deploy"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/balancepro.git
   git push -u origin main
   ```

### Passo 2: Criar Conta no Vercel

1. Acesse: **https://vercel.com**
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"**
4. Autorize o Vercel a acessar seus repositórios

### Passo 3: Importar Projeto

1. No painel do Vercel, clique em **"Add New..."** > **"Project"**
2. Encontre seu repositório **"balancepro"**
3. Clique em **"Import"**

### Passo 4: Configurar Projeto

1. **Framework Preset:** Vite (será detectado automaticamente)
2. **Root Directory:** Deixe em branco ou selecione `client`
3. Clique em **"Environment Variables"**

### Passo 5: Adicionar Variáveis de Ambiente

Adicione estas variáveis:

| Nome | Valor |
|------|-------|
| `JWT_SECRET` | `sua_chave_secreta_aqui` |
| `NODE_ENV` | `production` |
| `VITE_API_URL` | `https://seu-projeto.vercel.app/api` |

**Como gerar JWT_SECRET:**
```bash
# No PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Passo 6: Deploy!

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. ✅ **Pronto!** Seu projeto está online!

**URL:** `https://seu-projeto.vercel.app`

---

## 🔄 Atualizações Automáticas

Toda vez que você fizer `git push`, o Vercel automaticamente:
1. Detecta as mudanças
2. Faz novo build
3. Atualiza o site

---

## 🎨 Domínio Personalizado (Opcional)

### Usar domínio próprio:

1. No painel do Vercel, vá em **Settings** > **Domains**
2. Adicione seu domínio (ex: `meubalancepro.com`)
3. Configure os DNS conforme instruções
4. Aguarde propagação (até 48h)

### Domínio gratuito:
- Vercel fornece: `seu-projeto.vercel.app`
- Você pode personalizar o nome do projeto

---

## 🐛 Solução de Problemas

### Problema: Build falhou
**Solução:**
1. Verifique os logs no Vercel
2. Teste o build localmente: `npm run build`
3. Corrija erros e faça novo push

### Problema: Erro 404 nas rotas
**Solução:**
1. Adicione arquivo `vercel.json` (já incluído no projeto)
2. Faça novo deploy

### Problema: API não responde
**Solução:**
1. Verifique se `VITE_API_URL` está correto
2. Verifique CORS no backend
3. Veja logs do servidor

### Problema: Erro de autenticação
**Solução:**
1. Confirme que `JWT_SECRET` está configurado
2. Limpe cache do navegador
3. Faça logout e login novamente

---

## 📊 Alternativas ao Vercel

### Railway (Melhor para banco de dados)
- **Vantagem:** Suporta PostgreSQL facilmente
- **Custo:** $5 grátis/mês
- **Site:** https://railway.app

### Render (Totalmente gratuito)
- **Vantagem:** 100% gratuito
- **Desvantagem:** Pode ser mais lento
- **Site:** https://render.com

### Netlify (Bom para frontend)
- **Vantagem:** Muito rápido
- **Desvantagem:** Backend precisa ser separado
- **Site:** https://netlify.com

---

## 💾 Banco de Dados em Produção

### Opção 1: SQLite (Atual)
- ✅ Simples
- ❌ Dados podem ser perdidos em reinicializações
- ✅ Bom para testes

### Opção 2: PostgreSQL (Recomendado)
- ✅ Dados persistentes
- ✅ Mais robusto
- ✅ Gratuito no Supabase ou Neon

**Para migrar para PostgreSQL:**
1. Crie conta no Supabase: https://supabase.com
2. Crie novo projeto
3. Copie a URL de conexão
4. Atualize código para usar PostgreSQL

---

## 📈 Monitoramento

### Verificar se está online:
- **Uptime Robot:** https://uptimerobot.com (gratuito)
- Receba alertas se o site cair

### Analytics:
- **Vercel Analytics:** Integrado automaticamente
- **Google Analytics:** Adicione o código de tracking

---

## ✅ Checklist Final

Antes de compartilhar seu projeto:

- [ ] Site acessível pela URL
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Lançamentos sendo salvos
- [ ] Relatórios funcionando
- [ ] Responsivo em mobile
- [ ] SSL/HTTPS ativo (cadeado verde)
- [ ] Sem erros no console

---

## 🎉 Pronto!

Seu projeto está online e acessível para qualquer pessoa!

**Compartilhe a URL:**
`https://seu-projeto.vercel.app`

---

## 📞 Precisa de Ajuda?

1. Verifique os logs no painel do Vercel
2. Teste localmente primeiro
3. Consulte a documentação do Vercel
4. Verifique as variáveis de ambiente

**Boa sorte! 🚀**
