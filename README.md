# BalancePro - Sistema de Gestão Financeira

Sistema web completo para gestão financeira empresarial, desenvolvido com React + TypeScript no frontend e Node.js + Express + SQLite no backend.

## 🚀 Funcionalidades

- **Dashboard Interativo**: Visão geral com indicadores financeiros em tempo real
- **Gestão de Lançamentos**: CRUD completo para receitas e despesas
- **Relatórios Profissionais**: DRE e Balanço Patrimonial automatizados
- **Multi-empresa**: Gestão de múltiplas empresas por usuário
- **Plano de Contas**: Estrutura contábil hierárquica padronizada
- **Autenticação Segura**: Sistema de login/registro com JWT
- **Exportação**: Relatórios em CSV
- **Responsivo**: Interface adaptada para desktop e mobile

## 🛠️ Tecnologias

### Frontend

- React 19 + TypeScript
- Vite (build tool)
- TailwindCSS (estilização)
- React Router (roteamento)
- Recharts (gráficos)
- Lucide React (ícones)

### Backend

- Node.js + Express
- TypeScript
- SQLite + better-sqlite3
- JWT (autenticação)
- Zod (validação)
- bcryptjs (hash de senhas)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🚀 Instalação e Execução

### Método Rápido (Recomendado)

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd balancepro

# 2. Execute o setup automatizado
npm run setup

# 3. Inicie o ambiente de desenvolvimento
npm run dev
```

### Método Manual

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd balancepro

# 2. Instale dependências
npm run install:all

# 3. Configure variáveis de ambiente (opcional - já configurado)
# Backend: server/.env (JWT_SECRET será gerado automaticamente)
# Frontend: client/.env (já configurado)

# 4. Execute o projeto
npm run dev
```

### Acesso à Aplicação

- **Frontend**: http://localhost:5176
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 👤 Usuário Padrão

O sistema cria automaticamente um usuário administrador:

- **Email**: admin@balancepro.local
- **Senha**: admin123

## 📁 Estrutura do Projeto

```
balancepro/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── api/           # Cliente HTTP
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── hooks/         # Hooks customizados
│   │   ├── layouts/       # Layouts da aplicação
│   │   ├── pages/         # Páginas/rotas
│   │   └── assets/        # Recursos estáticos
│   ├── package.json
│   └── vite.config.ts
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── routes/        # Rotas da API
│   │   ├── middleware/    # Middlewares
│   │   ├── db.ts          # Configuração do banco
│   │   └── index.ts       # Servidor principal
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🔧 Scripts Disponíveis

### Backend (server/)

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Executa versão compilada

### Frontend (client/)

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run lint` - Executa linting

## 📊 Banco de Dados

O sistema utiliza SQLite com as seguintes tabelas principais:

- `users` - Usuários do sistema
- `empresas` - Empresas gerenciadas
- `plano_contas` - Plano de contas contábil
- `lancamentos` - Lançamentos financeiros

O banco é criado automaticamente na primeira execução com dados de exemplo.

## 🔐 Segurança

- **Autenticação**: JWT com expiração configurável
- **Senhas**: Hash com bcrypt e salt rounds configuráveis
- **CORS**: Configuração restritiva com origins específicas
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Validação**: Dados validados com Zod no backend
- **Middleware**: Autenticação obrigatória em rotas protegidas
- **Configuração**: JWT_SECRET obrigatório e gerado automaticamente

## 📈 Funcionalidades Detalhadas

### Dashboard

- Indicadores financeiros (receitas, despesas, resultado)
- Filtros por período (mês/intervalo customizado)
- Últimos lançamentos
- Resumo por categoria
- Atalhos para outras seções

### Lançamentos

- Cadastro de receitas e despesas
- Filtros avançados (período, tipo, categoria, empresa)
- Edição e exclusão
- Busca por descrição/categoria
- Resumo financeiro do período

### Relatórios

- **DRE**: Demonstrativo de Resultados com comparativo entre períodos
- **Balanço**: Balanço Patrimonial simplificado
- Exportação em CSV
- Filtros por empresa e período

### Multi-empresa

- Gestão de múltiplas empresas por usuário
- Filtros por empresa em todos os relatórios
- Isolamento de dados por empresa

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## � Melhorias Implementadas

### Segurança Aprimorada

- Rate limiting configurável
- JWT_SECRET obrigatório e gerado automaticamente
- CORS mais restritivo
- Tratamento robusto de erros de autenticação
- Validação de dados mais rigorosa

### Performance e UX

- Paginação nas consultas de lançamentos
- Loading states consistentes
- Sistema de notificações toast
- Tratamento de erros amigável
- Configurações centralizadas
- Cache de dados do usuário

### Infraestrutura

- Setup automatizado com script
- Configurações de ambiente robustas
- Documentação completa para desenvolvedores
- Scripts de desenvolvimento organizados
- Estrutura de projeto padronizada

## 📞 Suporte

- **Issues**: Para bugs e solicitações de funcionalidades
- **Discussions**: Para perguntas gerais e discussões
- **Contributing**: Veja [CONTRIBUTING.md](CONTRIBUTING.md) para contribuir
- **Changelog**: Veja [CHANGELOG.md](CHANGELOG.md) para histórico de versões
