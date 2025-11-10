# Deploy com Docker + Nginx

Este guia publica o BalancePro em produção usando Docker Compose e Nginx com TLS.

## Pré-requisitos
- Domínio próprio (ex.: `seu-dominio.com`) apontado para o servidor
- Docker e Docker Compose instalados
- Certificados TLS (Let's Encrypt) válidos

## Estrutura
- `Dockerfile`: imagem multi-stage que compila client+server e roda o backend servindo o frontend
- `docker-compose.yml`: orquestra `app` (Node) e `nginx` (proxy)
- `deploy/nginx.conf`: configuração do Nginx com proxy e TLS
- `deploy/certs/`: coloque aqui `fullchain.pem` e `privkey.pem`

## Variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com:
```
JWT_SECRET=troque_por_uma_chave_segura
# Se for usar um domínio, inclua as origens abaixo para o CORS da API
# Em mesma origem atrás do Nginx, não é estritamente necessário, mas recomendado
CORS_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
```

## Ajuste o Nginx para seu domínio
Edite `deploy/nginx.conf` substituindo:
- `exemplo.com` por `seu-dominio.com`
- caminhos dos certificados em `/etc/nginx/certs/fullchain.pem` e `/etc/nginx/certs/privkey.pem`

Coloque os certificados em `deploy/certs/` antes de subir os serviços.

## Build e subida
```bash
# Na raiz do projeto
docker compose build
docker compose up -d
```

- App (Node) fica ouvindo internamente em `3001`
- Nginx expõe `80` e `443` e faz proxy para o app

## Verificações
- `curl -I https://seu-dominio.com/` deve retornar `200` com `index.html`
- `curl https://seu-dominio.com/api/health` deve retornar `{"ok":true,...}`

## Renovação de certificados
Você pode usar Certbot no host ou containers como `nginx-proxy` + `acme-companion`. Se preferir, posso integrar um fluxo automatizado de emissão/renovação com Docker.

## Dicas de produção
- Defina `NODE_ENV=production` (já feito pelo container)
- Use uma senha segura para `JWT_SECRET`
- Faça backup do volume `app_data` (contém o `db.sqlite`)
- Utilize um serviço como `watchtower` para atualizar imagens automaticamente