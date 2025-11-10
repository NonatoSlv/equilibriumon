# Guia de Contribuição - BalancePro

Obrigado por considerar contribuir com o BalancePro! Este documento fornece diretrizes para contribuições.

## 🚀 Começando

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Git

### Setup do Ambiente de Desenvolvimento

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd balancepro
```

2. **Execute o setup automatizado**
```bash
npm run setup
```

3. **Inicie o ambiente de desenvolvimento**
```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
balancepro/
├── client/                 # Frontend React + TypeScript
│   ├── src/
│   │   ├── api/           # Cliente HTTP e configurações de API
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── config/        # Configurações do cliente
│   │   ├── hooks/         # Hooks customizados
│   │   ├── layouts/       # Layouts da aplicação
│   │   └── pages/         # Páginas/rotas
├── server/                # Backend Node.js + Express
│   ├── src/
│   │   ├── config/        # Configurações do servidor
│   │   ├── middleware/    # Middlewares customizados
│   │   └── routes/        # Rotas da API
└── docs/                  # Documentação adicional
```

## 🛠️ Padrões de Desenvolvimento

### Frontend (React + TypeScript)

- **Componentes**: Use componentes funcionais com hooks
- **Tipagem**: Sempre use TypeScript, evite `any`
- **Estilização**: Use TailwindCSS com classes utilitárias
- **Estado**: Use hooks nativos do React ou Context API
- **Formulários**: Validação no cliente e servidor

### Backend (Node.js + Express)

- **Tipagem**: TypeScript obrigatório
- **Validação**: Use Zod para validação de dados
- **Autenticação**: JWT com middleware de autenticação
- **Banco**: SQLite com better-sqlite3
- **Erros**: Tratamento consistente de erros

### Padrões de Código

- **Nomenclatura**: camelCase para variáveis, PascalCase para componentes
- **Imports**: Organize imports (externos primeiro, depois internos)
- **Comentários**: Comente código complexo, evite comentários óbvios
- **Funções**: Prefira funções pequenas e focadas

## 🔧 Scripts Disponíveis

```bash
# Setup inicial
npm run setup

# Desenvolvimento
npm run dev              # Frontend + Backend
npm run dev:client       # Apenas frontend
npm run dev:server       # Apenas backend

# Build
npm run build           # Build completo
npm run build:client    # Build do frontend
npm run build:server    # Build do backend

# Produção
npm start              # Executar em produção

# Linting
npm run lint           # Lint completo
npm run lint:client    # Lint do frontend
```

## 📝 Processo de Contribuição

### 1. Issues
- Verifique se já existe uma issue similar
- Use templates de issue quando disponíveis
- Seja claro e específico na descrição
- Adicione labels apropriadas

### 2. Pull Requests

1. **Fork** o repositório
2. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/nome-da-feature
   ```
3. **Faça commits** pequenos e descritivos:
   ```bash
   git commit -m "feat: adicionar validação de email"
   ```
4. **Push** para sua branch:
   ```bash
   git push origin feature/nome-da-feature
   ```
5. **Abra um Pull Request** com descrição detalhada

### Padrão de Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação, sem mudança de lógica
- `refactor:` refatoração de código
- `test:` adição ou correção de testes
- `chore:` tarefas de manutenção

### Exemplo de PR

```markdown
## Descrição
Breve descrição das mudanças realizadas.

## Tipo de mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Como testar
1. Execute `npm run dev`
2. Navegue para `/lancamentos`
3. Teste a nova funcionalidade

## Checklist
- [ ] Código testado localmente
- [ ] Documentação atualizada
- [ ] Sem warnings de lint
```

## 🧪 Testes

Atualmente o projeto não possui testes automatizados, mas planejamos implementar:

- **Frontend**: Jest + React Testing Library
- **Backend**: Jest + Supertest
- **E2E**: Playwright ou Cypress

## 🐛 Reportando Bugs

Ao reportar bugs, inclua:

1. **Descrição clara** do problema
2. **Passos para reproduzir**
3. **Comportamento esperado vs atual**
4. **Screenshots** se aplicável
5. **Ambiente** (OS, Node.js version, browser)

## 💡 Sugerindo Funcionalidades

Para sugerir novas funcionalidades:

1. **Verifique** se já não existe uma issue similar
2. **Descreva** o problema que a funcionalidade resolve
3. **Proponha** uma solução detalhada
4. **Considere** alternativas e impactos

## 📚 Recursos Úteis

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

## 🤝 Código de Conduta

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mantenha discussões técnicas e profissionais

## 📞 Suporte

- **Issues**: Para bugs e funcionalidades
- **Discussions**: Para perguntas gerais
- **Email**: Para questões sensíveis

---

Obrigado por contribuir com o BalancePro! 🚀