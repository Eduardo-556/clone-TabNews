# Clone TabNews

Implementação do [TabNews](https://tabnews.com.br) para acompanhar e praticar os conteúdos do [curso.dev](https://curso.dev) do Felipe Deschamps.

## Objetivo

Este projeto tem como principal objetivo servir de apoio prático para os estudos do curso.dev, permitindo experimentar conceitos de desenvolvimento web, backend, frontend, testes, integração contínua e boas práticas de programação.

## Tecnologias utilizadas

- **Node.js** (versão LTS recomendada no `.nvmrc`)
- **Next.js**
- **PostgreSQL** (via Docker)
- **Jest** (testes automatizados)
- **ESLint** e **Prettier** (padronização de código)
- **Docker Compose** (ambiente de desenvolvimento)
- **Husky** e **Commitizen** (convenções de commit)

## Como rodar o projeto

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Suba os serviços necessários:**
   ```bash
   npm run services:up
   ```

3. **Aguarde o banco de dados iniciar:**
   ```bash
   npm run services:wait:database
   ```

4. **Execute as migrations:**
   ```bash
   npm run migrations:up
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## Testes

Para rodar os testes automatizados:
```bash
npm test
```

## Estrutura do projeto

- `pages/` - Rotas e APIs do Next.js
- `infra/` - Scripts, configurações e banco de dados
- `models/` - Lógica de acesso aos dados
- `test/` - Testes de integração e unitários

## Observações

- Este projeto é **experimental** e acompanha o ritmo das aulas do curso.dev.
- O código pode sofrer alterações frequentes conforme novos conteúdos são abordados.

---

**Desenvolvido para fins de estudo no [curso.dev](https://curso.dev)
