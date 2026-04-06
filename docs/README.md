# feira-lanc-pedido

## Objetivo

Disponibilizar uma interface web para lançamento de pedidos da campanha Experiência BRF1 por fornecedores ou vendedores autorizados.

## Problema que resolve

Evita lançamentos manuais dispersos e aplica validações de negócio na entrada dos pedidos antes do envio para a API.

## Áreas ou setores atendidos

- Comercial
- Trade marketing
- Operação da campanha

## Público principal

Usuários internos ou parceiros responsáveis por registrar pedidos da campanha.

## Escopo resumido

Frontend web em Vite com autenticação, busca de cliente por CNPJ e formulário de lançamento de pedido com regras de valor e quantidade de moedas.

## Funcionamento lógico resumido

- Origem dos dados: API da campanha em `https://api.grupobrf1.com:10000`.
- Entrada: credenciais do usuário, CNPJ do cliente e dados do pedido.
- Processamento principal: autentica o usuário, busca dados do cliente por CNPJ, valida faixas de valor do pedido e limite de moedas, e envia o pedido.
- Saída: confirmação ou erro do lançamento do pedido.
- Integrações: rotas de autenticação e endpoints `consultarclienteporcnpj` e `lancarpedido`.
- Regra principal de negócio: o valor do pedido deve respeitar faixa mínima e máxima, e a quantidade de moedas não pode ultrapassar 30% do valor do pedido.
- Fluxo resumido: usuário autentica -> informa CNPJ -> frontend preenche dados do cliente -> valida regras -> envia pedido para a API.

## Tecnologias principais

- Vite
- JavaScript
- HTML/CSS
- Bootstrap
- Amazon Cognito

## Como executar ou acessar

```bash
cd /Users/lucas/Projetos/feira-lanc-pedido
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Integrações

- API `https://api.grupobrf1.com:10000`
- autenticação baseada em Amazon Cognito

## Publicação web

### Nginx

```nginx
server {
    listen 80;
    server_name <subdominio>;

    root /var/www/feira-lanc-pedido/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Cloudflare

- criar registro DNS do subdomínio
- apontar para o servidor da aplicação
- ajustar proxy e SSL conforme o padrão do ambiente

## Status de produção

Há indício de uso como frontend operacional da campanha. Solicitante original, URL final e período de uso ainda precisam de confirmação retroativa.

## Pendências para registro retroativo

- Confirmar solicitante original
- Confirmar URL ou subdomínio final
- Confirmar período de uso em produção
