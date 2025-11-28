import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const dbFile = process.env.DB_FILE || path.resolve(__dirname, '../db.sqlite')
const dbDir = path.dirname(dbFile)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

export const db = new Database(dbFile)

db.pragma('journal_mode = WAL')

try {
  db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS empresas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT UNIQUE NOT NULL,
  user_id INTEGER
);

CREATE TABLE IF NOT EXISTS plano_contas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT CHECK(tipo IN ('ativo','passivo','patrimonio_liquido','receita','despesa')) NOT NULL,
  nivel INTEGER NOT NULL,
  conta_pai_id INTEGER,
  user_id INTEGER,
  FOREIGN KEY (conta_pai_id) REFERENCES plano_contas(id)
);

CREATE TABLE IF NOT EXISTS lancamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tipo TEXT CHECK(tipo IN ('receita','despesa')) NOT NULL,
  valor REAL NOT NULL,
  empresa_id INTEGER,
  user_id INTEGER,
  conta_debito_id INTEGER,
  conta_credito_id INTEGER,
  FOREIGN KEY (conta_debito_id) REFERENCES plano_contas(id),
  FOREIGN KEY (conta_credito_id) REFERENCES plano_contas(id)
);
`)

  // Garantir colunas em bases já existentes
  const lancCols = db.prepare("PRAGMA table_info(lancamentos)").all() as any[]
  const hasEmpresaCol = lancCols.some((c: any) => c.name === 'empresa_id')
  if (!hasEmpresaCol) {
    db.exec('ALTER TABLE lancamentos ADD COLUMN empresa_id INTEGER')
  }
  const hasLancUserCol = lancCols.some((c: any) => c.name === 'user_id')
  if (!hasLancUserCol) {
    db.exec('ALTER TABLE lancamentos ADD COLUMN user_id INTEGER')
  }
  const hasContaDebitoCol = lancCols.some((c: any) => c.name === 'conta_debito_id')
  if (!hasContaDebitoCol) {
    db.exec('ALTER TABLE lancamentos ADD COLUMN conta_debito_id INTEGER')
  }
  const hasContaCreditoCol = lancCols.some((c: any) => c.name === 'conta_credito_id')
  if (!hasContaCreditoCol) {
    db.exec('ALTER TABLE lancamentos ADD COLUMN conta_credito_id INTEGER')
  }

  const empCols = db.prepare("PRAGMA table_info(empresas)").all() as any[]
  const hasEmpUserCol = empCols.some((c: any) => c.name === 'user_id')
  if (!hasEmpUserCol) {
    db.exec('ALTER TABLE empresas ADD COLUMN user_id INTEGER')
  }

  const planoCols = db.prepare("PRAGMA table_info(plano_contas)").all() as any[]
  const hasPlanoUserCol = planoCols.some((c: any) => c.name === 'user_id')
  if (!hasPlanoUserCol) {
    db.exec('ALTER TABLE plano_contas ADD COLUMN user_id INTEGER')
  }

  // Seed básico
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }
  if (userCount.c === 0) {
    const hash = bcrypt.hashSync('admin123', 10)
    db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
      .run('admin@equilibrium.local', hash, 'Administrador')
  }

  const admin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@equilibrium.local') as any
  const adminId = admin?.id as number | undefined
  console.log('🔍 Admin user found:', admin, 'adminId:', adminId)

  const empCount = db.prepare('SELECT COUNT(*) as c FROM empresas').get() as { c: number }
  if (empCount.c === 0) {
    db.prepare('INSERT INTO empresas (nome, user_id) VALUES (?, ?)').run('Empresa A', adminId ?? null)
    db.prepare('INSERT INTO empresas (nome, user_id) VALUES (?, ?)').run('Empresa B', adminId ?? null)
  }

  // Seed do plano de contas
  const planoCount = db.prepare('SELECT COUNT(*) as c FROM plano_contas').get() as { c: number }
  console.log('📊 Plano de contas count:', planoCount.c)
  if (planoCount.c === 0) {
    console.log('🌱 Criando plano de contas para adminId:', adminId)
    const insertConta = db.prepare('INSERT INTO plano_contas (codigo, nome, tipo, nivel, conta_pai_id, user_id) VALUES (?, ?, ?, ?, ?, ?)')
    
    // 1. ATIVOS
    const ativoId = insertConta.run('1', 'ATIVOS', 'ativo', 1, null, adminId ?? null).lastInsertRowid
    const ativoCircId = insertConta.run('1.1', 'Ativo Circulante', 'ativo', 2, ativoId, adminId ?? null).lastInsertRowid
    insertConta.run('1.1.1', 'Caixa', 'ativo', 3, ativoCircId, adminId ?? null)
    insertConta.run('1.1.2', 'Bancos', 'ativo', 3, ativoCircId, adminId ?? null)
    insertConta.run('1.1.3', 'Aplicações Financeiras', 'ativo', 3, ativoCircId, adminId ?? null)
    insertConta.run('1.1.4', 'Contas a Receber', 'ativo', 3, ativoCircId, adminId ?? null)
    insertConta.run('1.1.5', 'Estoque', 'ativo', 3, ativoCircId, adminId ?? null)
    
    const ativoNaoCircId = insertConta.run('1.2', 'Ativo Não Circulante', 'ativo', 2, ativoId, adminId ?? null).lastInsertRowid
    const imobilizadoId = insertConta.run('1.2.3', 'Imobilizado', 'ativo', 3, ativoNaoCircId, adminId ?? null).lastInsertRowid
    insertConta.run('1.2.3.1', 'Terrenos', 'ativo', 4, imobilizadoId, adminId ?? null)
    insertConta.run('1.2.3.2', 'Edificações', 'ativo', 4, imobilizadoId, adminId ?? null)
    insertConta.run('1.2.3.3', 'Máquinas e Equipamentos', 'ativo', 4, imobilizadoId, adminId ?? null)
    insertConta.run('1.2.3.4', 'Móveis e Utensílios', 'ativo', 4, imobilizadoId, adminId ?? null)
    insertConta.run('1.2.3.5', 'Veículos', 'ativo', 4, imobilizadoId, adminId ?? null)

    // 2. PASSIVOS
    const passivoId = insertConta.run('2', 'PASSIVOS', 'passivo', 1, null, adminId ?? null).lastInsertRowid
    const passivoCircId = insertConta.run('2.1', 'Passivo Circulante', 'passivo', 2, passivoId, adminId ?? null).lastInsertRowid
    insertConta.run('2.1.1', 'Fornecedores', 'passivo', 3, passivoCircId, adminId ?? null)
    insertConta.run('2.1.2', 'Empréstimos e Financiamentos', 'passivo', 3, passivoCircId, adminId ?? null)
    insertConta.run('2.1.3', 'Contas a Pagar', 'passivo', 3, passivoCircId, adminId ?? null)
    insertConta.run('2.1.4', 'Salários a Pagar', 'passivo', 3, passivoCircId, adminId ?? null)
    insertConta.run('2.1.6', 'Impostos a Pagar', 'passivo', 3, passivoCircId, adminId ?? null)

    // 3. PATRIMÔNIO LÍQUIDO
    const patrimonioId = insertConta.run('3', 'PATRIMÔNIO LÍQUIDO', 'patrimonio_liquido', 1, null, adminId ?? null).lastInsertRowid
    insertConta.run('3.1', 'Capital Social', 'patrimonio_liquido', 2, patrimonioId, adminId ?? null)
    insertConta.run('3.4', 'Lucros Acumulados', 'patrimonio_liquido', 2, patrimonioId, adminId ?? null)

    // 4. RECEITAS
    const receitaId = insertConta.run('4', 'RECEITAS', 'receita', 1, null, adminId ?? null).lastInsertRowid
    const receitaBrutaId = insertConta.run('4.1', 'Receita Bruta', 'receita', 2, receitaId, adminId ?? null).lastInsertRowid
    insertConta.run('4.1.1', 'Vendas de Produtos', 'receita', 3, receitaBrutaId, adminId ?? null)
    insertConta.run('4.1.2', 'Prestação de Serviços', 'receita', 3, receitaBrutaId, adminId ?? null)
    
    const receitaFinId = insertConta.run('4.3', 'Receitas Financeiras', 'receita', 2, receitaId, adminId ?? null).lastInsertRowid
    insertConta.run('4.3.1', 'Juros Ativos', 'receita', 3, receitaFinId, adminId ?? null)
    insertConta.run('4.3.2', 'Rendimentos de Aplicações', 'receita', 3, receitaFinId, adminId ?? null)

    // 5. DESPESAS
    const despesaId = insertConta.run('5', 'DESPESAS', 'despesa', 1, null, adminId ?? null).lastInsertRowid
    const custoId = insertConta.run('5.1', 'Custo dos Produtos Vendidos', 'despesa', 2, despesaId, adminId ?? null).lastInsertRowid
    insertConta.run('5.1.1', 'Matéria-Prima', 'despesa', 3, custoId, adminId ?? null)
    
    const despOpId = insertConta.run('5.2', 'Despesas Operacionais', 'despesa', 2, despesaId, adminId ?? null).lastInsertRowid
    const despAdmId = insertConta.run('5.2.1', 'Despesas Administrativas', 'despesa', 3, despOpId, adminId ?? null).lastInsertRowid
    insertConta.run('5.2.1.1', 'Salários e Encargos', 'despesa', 4, despAdmId, adminId ?? null)
    insertConta.run('5.2.1.2', 'Aluguéis', 'despesa', 4, despAdmId, adminId ?? null)
    insertConta.run('5.2.1.3', 'Energia Elétrica', 'despesa', 4, despAdmId, adminId ?? null)
    insertConta.run('5.2.1.4', 'Telefone', 'despesa', 4, despAdmId, adminId ?? null)
    insertConta.run('5.2.1.5', 'Material de Escritório', 'despesa', 4, despAdmId, adminId ?? null)
    
    const despComId = insertConta.run('5.2.2', 'Despesas Comerciais', 'despesa', 3, despOpId, adminId ?? null).lastInsertRowid
    insertConta.run('5.2.2.2', 'Propaganda e Marketing', 'despesa', 4, despComId, adminId ?? null)
    
    const despFinId = insertConta.run('5.3', 'Despesas Financeiras', 'despesa', 2, despesaId, adminId ?? null).lastInsertRowid
    insertConta.run('5.3.1', 'Juros Passivos', 'despesa', 3, despFinId, adminId ?? null)
    insertConta.run('5.3.2', 'Tarifas Bancárias', 'despesa', 3, despFinId, adminId ?? null)
  }

  const lancCount = db.prepare('SELECT COUNT(*) as c FROM lancamentos').get() as { c: number }
  if (lancCount.c === 0) {
    const insert = db.prepare('INSERT INTO lancamentos (date, description, category, tipo, valor, empresa_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
    // Receitas (Empresa A)
    insert.run('2025-10-01', 'Venda de produtos', 'Vendas de produtos', 'receita', 2500, 1, adminId ?? null)
    insert.run('2025-10-02', 'Serviços prestados', 'Prestação de serviços', 'receita', 1800, 1, adminId ?? null)
    insert.run('2025-10-03', 'Rendimentos de aplicações', 'Juros e rendimentos financeiros', 'receita', 220, 1, adminId ?? null)
    insert.run('2025-10-04', 'Aluguel recebido', 'Aluguéis recebidos', 'receita', 900, 1, adminId ?? null)
    insert.run('2025-10-05', 'Venda de equipamento', 'Venda de ativos', 'receita', 1200, 2, adminId ?? null)
    // Despesas (mistas)
    insert.run('2025-10-06', 'Folha de pagamento', 'Salários e encargos', 'despesa', 3200, 1, adminId ?? null)
    insert.run('2025-10-07', 'Aluguel da sede', 'Aluguel', 'despesa', 1200, 2, adminId ?? null)
    insert.run('2025-10-08', 'Conta de luz', 'Energia elétrica', 'despesa', 450, 2, adminId ?? null)
    insert.run('2025-10-09', 'Frete e entregas', 'Transporte e logística', 'despesa', 300, 1, adminId ?? null)
    insert.run('2025-10-10', 'Compra de insumos', 'Matéria-prima / insumos', 'despesa', 800, 1, adminId ?? null)
    insert.run('2025-10-11', 'Campanha digital', 'Publicidade e marketing', 'despesa', 600, 2, adminId ?? null)
    insert.run('2025-10-12', 'Tributos municipais', 'Impostos e taxas', 'despesa', 400, 1, adminId ?? null)
    insert.run('2025-10-13', 'Encargos bancários', 'Juros e encargos financeiros', 'despesa', 150, 2, adminId ?? null)
    insert.run('2025-10-14', 'Materiais de escritório', 'Despesas administrativas gerais', 'despesa', 200, 1, adminId ?? null)
  }
} catch (err) {
  console.error('Falha na inicialização do banco:', err)
  throw err
}