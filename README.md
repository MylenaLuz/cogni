# Cogni

Cogni e uma plataforma para profissionais acompanharem a evolucao cognitiva de seus pacientes, organizarem atividades e consultarem indicadores em uma unica interface.

## Recursos

- Painel com indicadores e atividades recentes.
- Cadastro e acompanhamento de pacientes.
- Exercicios de atencao, memoria e categorizacao.
- Relatorios de desempenho e evolucao.
- Tela de insights para apoiar a analise clinica.

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS 4

## Requisitos

- Node.js 22
- pnpm 10

## Como executar

Instale as dependencias:

```bash
pnpm install
```

Inicie o ambiente de desenvolvimento:

```bash
pnpm dev
```

Para gerar a versao de producao:

```bash
pnpm build
```

## Scripts

| Comando | Descricao |
| --- | --- |
| `pnpm dev` | Inicia o servidor de desenvolvimento. |
| `pnpm build` | Gera os arquivos de producao. |
| `pnpm preview` | Visualiza a versao de producao localmente. |
| `pnpm format` | Formata os arquivos do projeto. |

## Estrutura

```text
src/
  components/    Componentes reutilizaveis
  screens/       Telas e exercicios da aplicacao
  data.ts        Dados de demonstracao
  App.tsx        Componente principal
  main.tsx       Ponto de entrada
```
