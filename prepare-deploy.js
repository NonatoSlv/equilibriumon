#!/usr/bin/env node

/**
 * Script de preparação para deploy
 * Verifica se o projeto está pronto para ser colocado online
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparando projeto para deploy...\n');

const checks = [];

// 1. Verificar se package.json existe
function checkPackageJson() {
  const serverPkg = path.join(__dirname, 'server', 'package.json');
  const clientPkg = path.join(__dirname, 'client', 'package.json');
  
  if (fs.existsSync(serverPkg) && fs.existsSync(clientPkg)) {
    checks.push({ name: 'package.json', status: '✅', message: 'Encontrados' });
    return true;
  }
  checks.push({ name: 'package.json', status: '❌', message: 'Não encontrados' });
  return false;
}

// 2. Verificar se .env.production existe
function checkEnvFiles() {
  const serverEnv = path.join(__dirname, 'server', '.env.production');
  const clientEnv = path.join(__dirname, 'client', '.env.production');
  
  const serverExists = fs.existsSync(serverEnv);
  const clientExists = fs.existsSync(clientEnv);
  
  if (serverExists && clientExists) {
    checks.push({ name: '.env.production', status: '✅', message: 'Configurados' });
    return true;
  }
  checks.push({ name: '.env.production', status: '⚠️', message: 'Faltando arquivos' });
  return false;
}

// 3. Verificar se vercel.json existe
function checkVercelConfig() {
  const vercelConfig = path.join(__dirname, 'vercel.json');
  
  if (fs.existsSync(vercelConfig)) {
    checks.push({ name: 'vercel.json', status: '✅', message: 'Configurado' });
    return true;
  }
  checks.push({ name: 'vercel.json', status: '⚠️', message: 'Não encontrado' });
  return false;
}

// 4. Verificar se node_modules estão instalados
function checkNodeModules() {
  const serverModules = path.join(__dirname, 'server', 'node_modules');
  const clientModules = path.join(__dirname, 'client', 'node_modules');
  
  if (fs.existsSync(serverModules) && fs.existsSync(clientModules)) {
    checks.push({ name: 'node_modules', status: '✅', message: 'Instalados' });
    return true;
  }
  checks.push({ name: 'node_modules', status: '❌', message: 'Execute: npm run install:all' });
  return false;
}

// 5. Testar build do servidor
function testServerBuild() {
  try {
    console.log('   Testando build do servidor...');
    execSync('cd server && npm run build', { stdio: 'pipe' });
    checks.push({ name: 'Build Servidor', status: '✅', message: 'Sucesso' });
    return true;
  } catch (error) {
    checks.push({ name: 'Build Servidor', status: '❌', message: 'Falhou' });
    return false;
  }
}

// 6. Testar build do cliente
function testClientBuild() {
  try {
    console.log('   Testando build do cliente...');
    execSync('cd client && npm run build', { stdio: 'pipe' });
    checks.push({ name: 'Build Cliente', status: '✅', message: 'Sucesso' });
    return true;
  } catch (error) {
    checks.push({ name: 'Build Cliente', status: '❌', message: 'Falhou' });
    return false;
  }
}

// 7. Verificar se Git está inicializado
function checkGit() {
  const gitDir = path.join(__dirname, '.git');
  
  if (fs.existsSync(gitDir)) {
    checks.push({ name: 'Git', status: '✅', message: 'Inicializado' });
    return true;
  }
  checks.push({ name: 'Git', status: '⚠️', message: 'Execute: git init' });
  return false;
}

// Executar verificações
console.log('📋 Verificando configurações...\n');

checkPackageJson();
checkEnvFiles();
checkVercelConfig();
checkNodeModules();
checkGit();

console.log('\n🔨 Testando builds...\n');

testServerBuild();
testClientBuild();

// Exibir resultados
console.log('\n📊 Resultados:\n');
console.log('━'.repeat(60));

checks.forEach(check => {
  console.log(`${check.status} ${check.name.padEnd(20)} - ${check.message}`);
});

console.log('━'.repeat(60));

// Verificar se passou em todos os checks críticos
const critical = checks.filter(c => c.status === '❌');
const warnings = checks.filter(c => c.status === '⚠️');

if (critical.length === 0 && warnings.length === 0) {
  console.log('\n✅ Projeto pronto para deploy!\n');
  console.log('📝 Próximos passos:');
  console.log('   1. Faça commit: git add . && git commit -m "Preparar deploy"');
  console.log('   2. Suba para GitHub: git push');
  console.log('   3. Acesse Vercel: https://vercel.com');
  console.log('   4. Importe seu repositório');
  console.log('   5. Configure as variáveis de ambiente');
  console.log('   6. Deploy! 🚀\n');
} else if (critical.length === 0) {
  console.log('\n⚠️  Projeto quase pronto, mas há avisos.\n');
  console.log('Você pode prosseguir, mas recomendamos corrigir os avisos.\n');
} else {
  console.log('\n❌ Projeto não está pronto para deploy.\n');
  console.log('Corrija os erros acima antes de continuar.\n');
  process.exit(1);
}
