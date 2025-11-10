import { db } from '../db'

/**
 * Cria o plano de contas padrão para um novo usuário
 */
export function criarPlanoContasPadrao(userId: number): void {
  console.log('🌱 Criando plano de contas padrão para usuário:', userId)
  
  const insertConta = db.prepare('INSERT INTO plano_contas (codigo, nome, tipo, nivel, conta_pai_id, user_id) VALUES (?, ?, ?, ?, ?, ?)')
  
  try {
    // 1. ATIVOS
    const ativoId = insertConta.run('1', 'ATIVOS', 'ativo', 1, null, userId).lastInsertRowid
    const ativoCircId = insertConta.run('1.1', 'Ativo Circulante', 'ativo', 2, ativoId, userId).lastInsertRowid
    insertConta.run('1.1.1', 'Caixa', 'ativo', 3, ativoCircId, userId)
    insertConta.run('1.1.2', 'Bancos', 'ativo', 3, ativoCircId, userId)
    insertConta.run('1.1.3', 'Aplicações Financeiras', 'ativo', 3, ativoCircId, userId)
    insertConta.run('1.1.4', 'Contas a Receber', 'ativo', 3, ativoCircId, userId)
    insertConta.run('1.1.5', 'Estoque', 'ativo', 3, ativoCircId, userId)
    
    const ativoNaoCircId = insertConta.run('1.2', 'Ativo Não Circulante', 'ativo', 2, ativoId, userId).lastInsertRowid
    const imobilizadoId = insertConta.run('1.2.3', 'Imobilizado', 'ativo', 3, ativoNaoCircId, userId).lastInsertRowid
    insertConta.run('1.2.3.1', 'Terrenos', 'ativo', 4, imobilizadoId, userId)
    insertConta.run('1.2.3.2', 'Edificações', 'ativo', 4, imobilizadoId, userId)
    insertConta.run('1.2.3.3', 'Máquinas e Equipamentos', 'ativo', 4, imobilizadoId, userId)
    insertConta.run('1.2.3.4', 'Móveis e Utensílios', 'ativo', 4, imobilizadoId, userId)
    insertConta.run('1.2.3.5', 'Veículos', 'ativo', 4, imobilizadoId, userId)

    // 2. PASSIVOS
    const passivoId = insertConta.run('2', 'PASSIVOS', 'passivo', 1, null, userId).lastInsertRowid
    const passivoCircId = insertConta.run('2.1', 'Passivo Circulante', 'passivo', 2, passivoId, userId).lastInsertRowid
    insertConta.run('2.1.1', 'Fornecedores', 'passivo', 3, passivoCircId, userId)
    insertConta.run('2.1.2', 'Empréstimos e Financiamentos', 'passivo', 3, passivoCircId, userId)
    insertConta.run('2.1.3', 'Contas a Pagar', 'passivo', 3, passivoCircId, userId)
    insertConta.run('2.1.4', 'Salários a Pagar', 'passivo', 3, passivoCircId, userId)
    insertConta.run('2.1.6', 'Impostos a Pagar', 'passivo', 3, passivoCircId, userId)

    // 3. PATRIMÔNIO LÍQUIDO
    const patrimonioId = insertConta.run('3', 'PATRIMÔNIO LÍQUIDO', 'patrimonio_liquido', 1, null, userId).lastInsertRowid
    insertConta.run('3.1', 'Capital Social', 'patrimonio_liquido', 2, patrimonioId, userId)
    insertConta.run('3.4', 'Lucros Acumulados', 'patrimonio_liquido', 2, patrimonioId, userId)

    // 4. RECEITAS
    const receitaId = insertConta.run('4', 'RECEITAS', 'receita', 1, null, userId).lastInsertRowid
    const receitaBrutaId = insertConta.run('4.1', 'Receita Bruta', 'receita', 2, receitaId, userId).lastInsertRowid
    insertConta.run('4.1.1', 'Vendas de Produtos', 'receita', 3, receitaBrutaId, userId)
    insertConta.run('4.1.2', 'Prestação de Serviços', 'receita', 3, receitaBrutaId, userId)
    
    const receitaFinId = insertConta.run('4.3', 'Receitas Financeiras', 'receita', 2, receitaId, userId).lastInsertRowid
    insertConta.run('4.3.1', 'Juros Ativos', 'receita', 3, receitaFinId, userId)
    insertConta.run('4.3.2', 'Rendimentos de Aplicações', 'receita', 3, receitaFinId, userId)

    // 5. DESPESAS
    const despesaId = insertConta.run('5', 'DESPESAS', 'despesa', 1, null, userId).lastInsertRowid
    const custoId = insertConta.run('5.1', 'Custo dos Produtos Vendidos', 'despesa', 2, despesaId, userId).lastInsertRowid
    insertConta.run('5.1.1', 'Matéria-Prima', 'despesa', 3, custoId, userId)
    
    const despOpId = insertConta.run('5.2', 'Despesas Operacionais', 'despesa', 2, despesaId, userId).lastInsertRowid
    const despAdmId = insertConta.run('5.2.1', 'Despesas Administrativas', 'despesa', 3, despOpId, userId).lastInsertRowid
    insertConta.run('5.2.1.1', 'Salários e Encargos', 'despesa', 4, despAdmId, userId)
    insertConta.run('5.2.1.2', 'Aluguéis', 'despesa', 4, despAdmId, userId)
    insertConta.run('5.2.1.3', 'Energia Elétrica', 'despesa', 4, despAdmId, userId)
    insertConta.run('5.2.1.4', 'Telefone', 'despesa', 4, despAdmId, userId)
    insertConta.run('5.2.1.5', 'Material de Escritório', 'despesa', 4, despAdmId, userId)
    
    const despComId = insertConta.run('5.2.2', 'Despesas Comerciais', 'despesa', 3, despOpId, userId).lastInsertRowid
    insertConta.run('5.2.2.2', 'Propaganda e Marketing', 'despesa', 4, despComId, userId)
    
    const despFinId = insertConta.run('5.3', 'Despesas Financeiras', 'despesa', 2, despesaId, userId).lastInsertRowid
    insertConta.run('5.3.1', 'Juros Passivos', 'despesa', 3, despFinId, userId)
    insertConta.run('5.3.2', 'Tarifas Bancárias', 'despesa', 3, despFinId, userId)

    console.log('✅ Plano de contas padrão criado com sucesso para usuário:', userId)
  } catch (error) {
    console.error('❌ Erro ao criar plano de contas padrão:', error)
    throw error
  }
}

/**
 * Verifica se o usuário já possui plano de contas
 */
export function usuarioTemPlanoContas(userId: number): boolean {
  const count = db.prepare('SELECT COUNT(*) as c FROM plano_contas WHERE user_id = ?').get(userId) as { c: number }
  return count.c > 0
}