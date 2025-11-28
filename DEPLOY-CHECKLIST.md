# ✅ Checklist de Deploy - Equilibrium

## 📋 Antes de Começar

- [ ] Código funcionando localmente
- [ ] Projeto no GitHub (equilibriumon)
- [ ] Conta no Vercel criada
- [ ] Conta no Railway criada

---

## 🎨 Frontend (Vercel)

### Configuração:

- [ ] Projeto importado do GitHub
- [ ] Root Directory: `client`
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### Variáveis de Ambiente:

- [ ] `VITE_API_URL` configurada (temporariamente com localhost)

### Deploy:

- [ ] Deploy bem-sucedido
- [ ] Site acessível
- [ ] Sem erros no console do navegador
- [ ] URL copiada (ex: `https://equilibrium-xxx.vercel.app`)

---

## 🚂 Backend (Railway)

### Configuração:

- [ ] Projeto criado do GitHub
- [ ] Root Directory: `server`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`

### Variáveis de Ambiente:

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3002`
- [ ] `HOST` = `0.0.0.0`
- [ ] `JWT_SECRET` = (chave segura gerada)
- [ ] `DB_FILE` = `./db.sqlite`
- [ ] `CORS_ORIGINS` = (URL do Vercel)

### Deploy:

- [ ] Deploy bem-sucedido
- [ ] Domínio gerado
- [ ] Health check funcionando (`/api/health`)
- [ ] URL copiada (ex: `https://equilibrium-xxx.railway.app`)

---

## 🔗 Conectar Frontend e Backend

### No Vercel:

- [ ] Atualizar `VITE_API_URL` com URL do Railway
- [ ] Fazer Redeploy

### No Railway:

- [ ] Confirmar `CORS_ORIGINS` com URL do Vercel
- [ ] Verificar logs

---

## 🧪 Testes

### Frontend:

- [ ] Site carrega corretamente
- [ ] Sem erros no console
- [ ] Página de login aparece
- [ ] Design está correto

### Backend:

- [ ] Health check retorna OK
  ```
  https://sua-api.railway.app/api/health
  ```
- [ ] Logs sem erros
- [ ] Serviço rodando

### Integração:

- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Lançamentos podem ser criados
- [ ] Dados são salvos
- [ ] Relatórios funcionam

---

## 🔒 Segurança

- [ ] JWT_SECRET forte e único
- [ ] HTTPS ativo (cadeado verde)
- [ ] CORS configurado corretamente
- [ ] Variáveis de ambiente não expostas
- [ ] `.env` no `.gitignore`

---

## 📊 Monitoramento

- [ ] Logs do Vercel verificados
- [ ] Logs do Railway verificados
- [ ] Uptime Robot configurado (opcional)
- [ ] Analytics configurado (opcional)

---

## 📝 Documentação

- [ ] URLs anotadas:
  - Frontend: `_______________________`
  - Backend: `_______________________`
  - Health: `_______________________`

- [ ] Credenciais salvas:
  - Email admin: `admin@balancepro.local`
  - Senha admin: `admin123`

- [ ] JWT_SECRET salvo em local seguro

---

## 🎉 Finalização

- [ ] Projeto totalmente funcional
- [ ] Todos os testes passando
- [ ] URLs compartilhadas
- [ ] Documentação atualizada
- [ ] Backup do banco feito

---

## 📞 Suporte

Se algo não funcionar:

1. ✅ Verifique os logs
2. ✅ Confirme variáveis de ambiente
3. ✅ Teste endpoints individualmente
4. ✅ Consulte documentação
5. ✅ Limpe cache e tente novamente

---

## 🚀 Próximos Passos

Após deploy bem-sucedido:

- [ ] Configurar domínio personalizado
- [ ] Adicionar mais usuários
- [ ] Configurar backup automático
- [ ] Implementar CI/CD
- [ ] Adicionar testes automatizados
- [ ] Otimizar performance
- [ ] Adicionar analytics

---

**Parabéns! Seu projeto está online! 🎊**
