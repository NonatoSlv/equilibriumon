#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Configurando BalancePro...\n')

// Verificar se Node.js está na versão correta
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])

if (majorVersion < 18) {
  console.error('❌ Node.js 18+ é necessário. Versão atual:', nodeVersion)
  process.exit(1)
}

console.log('✅ Node.js versão:', nodeVersion)

// Função para executar comandos
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📦 Executando: ${command}`)
    execSync(command, { cwd, stdio: 'inherit' })
    return true
  } catch (error) {
    console.error(`❌ Erro ao executar: ${command}`)
    console.error(error.message)
    return false
  }
}

// Instalar dependências do projeto raiz
console.log('\n📦 Instalando dependências do projeto raiz...')
if (!runCommand('npm install')) {
  process.exit(1)
}

// Instalar dependências do servidor
console.log('\n📦 Instalando dependências do servidor...')
if (!runCommand('npm install', path.join(process.cwd(), 'server'))) {
  process.exit(1)
}

// Instalar dependências do cliente
console.log('\n📦 Instalando dependências do cliente...')
if (!runCommand('npm install', path.join(process.cwd(), 'client'))) {
  process.exit(1)
}

// Verificar e criar arquivo .env do servidor se não existir
const serverEnvPath = path.join(process.cwd(), 'server', '.env')
const serverEnvExamplePath = path.join(process.cwd(), 'server', '.env.example')

if (!fs.existsSync(serverEnvPath) && fs.existsSync(serverEnvExamplePath)) {
  console.log('\n⚙️ Criando arquivo .env do servidor...')
  fs.copyFileSync(serverEnvExamplePath, serverEnvPath)
  
  // Gerar JWT_SECRET aleatório
  const crypto = require('crypto')
  const jwtSecret = crypto.randomBytes(64).toString('hex')
  
  let envContent = fs.readFileSync(serverEnvPath, 'utf8')
  envContent = envContent.replace('sua_chave_secreta_super_forte_aqui_mude_em_producao', jwtSecret)
  fs.writeFileSync(serverEnvPath, envContent)
  
  console.log('✅ Arquivo .env criado com JWT_SECRET seguro')
}

// Verificar arquivo .env do cliente
const clientEnvPath = path.join(process.cwd(), 'client', '.env')
if (!fs.existsSync(clientEnvPath)) {
  console.log('\n⚙️ Criando arquivo .env do cliente...')
  fs.writeFileSync(clientEnvPath, 'VITE_API_URL=http://localhost:3001\n')
  console.log('✅ Arquivo .env do cliente criado')
}

console.log('\n🎉 Setup concluído com sucesso!')
console.log('\n📋 Próximos passos:')
console.log('1. Execute: npm run dev')
console.log('2. Acesse: http://localhost:5176')
console.log('3. Login padrão: admin@balancepro.local / admin123')
console.log('\n💡 Comandos úteis:')
console.log('- npm run dev          # Executar em desenvolvimento')
console.log('- npm run build        # Build para produção')
console.log('- npm run dev:server   # Apenas servidor')
console.log('- npm run dev:client   # Apenas cliente')