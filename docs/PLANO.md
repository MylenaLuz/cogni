# Plano de execução do Cogni

> Documento vivo. É a fonte de verdade do que falta fazer, em que ordem e por quê.
> Quem executa os itens é o Claude (Claude Code), revisado pela equipe.
> Última revisão: 19/11/2026.

---

## Como usar este documento

### Regras de trabalho (para o Claude e para a equipe)

1. **Um item por vez.** Antes de começar, ler o item inteiro: *Contexto*, *Onde* e *Pronto quando*.
2. **Respeitar as dependências.** Um item só começa quando os itens listados em *Depende de* estão `[x]`.
3. **Marcar no mesmo commit.** Ao terminar um item, trocar `[ ]` por `[x]` **no mesmo commit** da mudança e colocar o ID do item na mensagem. Exemplo: `fix(jogos): nível muda o número de pares [F0.2]`.
4. **Registrar no log.** Adicionar uma linha no [Registro de progresso](#registro-de-progresso) com a data, o ID, o commit e qualquer observação.
5. **Mudou de ideia? Registre.** Se um item for alterado, dividido ou abandonado, edite o item aqui e explique no log. Não apague itens: marque como `[~]` (cancelado) com o motivo.
6. **Decisão de arquitetura vira ADR.** Toda decisão relevante ganha um arquivo em `docs/adr/` (ver F1.6).
7. **Nada de dados reais de pacientes** até existir aprovação do comitê de ética (ver [Riscos](#riscos-e-limites)). Em desenvolvimento e na demo, só dados sintéticos ou da própria equipe.
8. **Linguagem clínica cuidadosa** em toda a interface e documentação: o Cogni *acompanha mudanças em relação ao padrão da própria pessoa*. Ele **nunca** "detecta", "diagnostica" ou "prevê Alzheimer".

### Legenda

| Marca | Significado |
| :-: | --- |
| `[ ]` | A fazer |
| `[>]` | Em andamento (no máximo um ou dois itens por vez) |
| `[x]` | Concluído |
| `[~]` | Cancelado ou substituído (com o motivo) |
| 🔴 | Prioridade alta: bloqueia outros itens ou a apresentação |
| 🟡 | Prioridade média |
| 🟢 | Desejável |

Os IDs seguem o formato `F<fase>.<n>` (ex.: `F3.2`). Eles nunca são reaproveitados.

---

## Visão em uma página

**O problema:** o que retarda o declínio cognitivo já é conhecido (treino de velocidade com reforços, intervenção multidomínio estruturada, controle de fatores de risco). O que falta é **adesão de longo prazo** e **detecção precoce de mudança**, e ambas hoje dependem de profissionais e não escalam.

**A tese do Cogni:** *a intervenção é a medição.* As atividades que estimulam o idoso (jogos e conversas de reminiscência sobre a própria família) também geram, sem que ele perceba, medidas comparadas ao **padrão da própria pessoa**. Essas medidas alimentam um ciclo fechado:

```
medir continuamente → comparar com o baseline pessoal → personalizar a intervenção
        ↑                                                          │
        └──────────────── medir a resposta ◄───────────────────────┘
```

Quando a trajetória se desvia de forma consistente, o Cogni **não diagnostica**: sugere ao cuidador conversar com um profissional de saúde.

**Princípios de engenharia:**

- **Sem dependência de serviço proprietário.** Tudo é open source e roda com `docker compose up` em qualquer servidor.
- **Privacidade por arquitetura.** O dado sensível é processado localmente sempre que possível, e só o mínimo necessário sai do dispositivo ou do servidor.
- **IA como módulo opcional.** O sistema funciona sem LLM. A IA só redige e conversa sobre resultados que regras determinísticas já calcularam.
- **Dado bruto preservado.** Os eventos são guardados crus, e as métricas são recalculáveis e versionadas.

---

## Marcos e prazos

| Marco | Data | Objetivo | Fases |
| --- | --- | --- | --- |
| **M1: Defesa TCC1** | 24–25/nov/2026 | App sem bugs visíveis, salvando dados reais. Arquitetura nova apresentada, com o início da migração funcionando. Visão do produto e cadeia de evidências nos slides. | F0, F1 (parcial), F17.1–F17.3 |
| **M2: Entrega TCC1** | 01–02/dez/2026 | Backend próprio em FastAPI + Postgres com auth própria. Front sem Supabase. Jogos gravando eventos. CI rodando. | F1, F2, F3, F4, F5, F6 |
| **M3: Base sólida** | início do TCC2 | Modo Idoso, acessibilidade, LGPD e deploy em VPS com backup testado. | F7, F8, F16 |
| **M4: Inteligência** | meio do TCC2 | Baseline pessoal, detecção de mudança, dificuldade adaptativa e avaliação em coorte sintética. | F9, F10 |
| **M5: Diferencial** | fim do TCC2 | Voz, biomarcadores de fala, reminiscência com IA, ciclo fechado, relatórios, FHIR e PWA. | F11–F15, F17 |

> Os prazos de M1 e M2 são curtos. Se apertar, a regra é: **funcionando e honesto vale mais que muita coisa pela metade.** O que não couber vai para o slide de "próximos passos", não para a demo.

---

## Decisões já tomadas

Cada decisão abaixo vira uma ADR em F1.6.

| # | Decisão | Motivo principal |
| --- | --- | --- |
| D1 | Sair do Supabase (auth, banco e API) | Responder à banca: "se o serviço sumir, o software some junto?". Eliminar o lock-in de código. |
| D2 | Backend em **Python + FastAPI** | Tipado, gera OpenAPI automático, e o ecossistema de ciência de dados é necessário em F9–F11. |
| D3 | **PostgreSQL 16** em produção. SQLite só nos testes. | Concorrência de escrita, dado sensível, backup e permissões. SQLite é um arquivo local com um escritor por vez. |
| D4 | **SQLAlchemy 2 + Alembic** | ORM padrão, e o schema fica versionado no git. |
| D5 | **Auth própria**: Argon2id, JWT de acesso curto e refresh em cookie httpOnly | Sem serviço externo de auth e sem token no `localStorage`. |
| D6 | **Docker Compose** com Caddy, API e Postgres | Portabilidade total: roda igual em Windows (Docker Desktop), Mac e Linux. |
| D7 | Servidor de produção: **VPS Linux comum** | Custo, padrão de mercado e nenhum serviço proprietário. Trocar de provedor é copiar o compose e o backup. |
| D8 | E-mail via **SMTP padrão** | Qualquer provedor serve. Trocar é mudar o `.env`. |
| D9 | IA atrás de uma interface `LLMProvider` (Ollama, API externa ou Null) | A IA é opcional e trocável, e o app funciona sem ela. |
| D10 | Processamento de voz e fala **local** (Whisper e extração em Python) | A voz de um idoso é dado sensível. Processar localmente evita transferência internacional (LGPD, art. 33). |
| D11 | Métricas comparadas ao **baseline pessoal**, nunca a normas populacionais | Mais sensível e mais honesto. Evita aparentar diagnóstico. |

---

## Fase 0: Correções imediatas 🔴

> Bugs que podem constranger na demo de M1. Fazer **antes de tudo**, em commits pequenos.

- [ ] **F0.1** 🔴 O botão "Salvar sessão" não salva nada
  - **Contexto:** `handleSave`/`onSave` só mudam o estado visual e navegam. Na demo, a banca pode perguntar onde o dado foi parar.
  - **Onde:** `src/screens/GameSession.tsx` (`handleSave`), `src/screens/games/MemoryPairs.tsx` (~l.191), `src/screens/games/Categories.tsx` (~l.212), `src/screens/games/AttentionSpeed.tsx`.
  - **Solução até M1:** gravar a sessão numa tabela `sessoes` (Supabase, temporariamente). Isso será substituído pela API em F5.4/F6. Criar `src/services/sessions.ts` com a função `saveSession()`, para que a troca futura aconteça num só lugar.
  - **Pronto quando:** salvar uma sessão e vê-la aparecer na lista de sessões recentes do paciente depois de recarregar a página.

- [ ] **F0.2** 🔴 O nível da Associação de Imagens não muda o jogo
  - **Contexto:** a tela promete 2, 4 ou 6 pares, mas `gamePairs` tem sempre os mesmos 4.
  - **Onde:** `src/screens/GameSession.tsx`.
  - **Solução:** banco de pares maior e `LEVELS = [{pares:2},{pares:4},{pares:6}]`, sorteando os pares de acordo com o nível.
  - **Pronto quando:** cada nível exibe o número de pares descrito.

- [ ] **F0.3** 🔴 Atualizar a página desloga, e não há guarda de rota
  - **Contexto:** `App.tsx` começa sempre em `"login"` e nunca lê a sessão existente. As telas internas também não verificam se há usuário logado.
  - **Onde:** `src/App.tsx`.
  - **Solução até M1:** no `useEffect` inicial, chamar `supabase.auth.getSession()`. Com sessão, ir para `dashboard`. Sem sessão, permanecer no `login`. `navigate()` deve bloquear telas internas sem sessão. A solução definitiva vem em F4.1 e F4.3.
  - **Pronto quando:** recarregar a página logado mantém o usuário dentro, e não há forma de ver o dashboard sem login.

- [ ] **F0.4** 🔴 Logout
  - **Contexto:** não existe botão de sair. Isso é necessário para a demo e para trocar de usuário.
  - **Onde:** `src/components/NavBar.tsx` ou o cabeçalho do `Dashboard`.
  - **Pronto quando:** o botão "Sair" encerra a sessão e volta ao login.

- [ ] **F0.5** 🟡 Embaralhamento enviesado
  - **Contexto:** `sort(() => Math.random() - 0.5)` não é uniforme. Num jogo que mede cognição, isso é ruído no dado.
  - **Onde:** `MemoryPairs.tsx:28`, `Categories.tsx:128`, `GameSession.tsx:15`.
  - **Solução:** criar `src/lib/shuffle.ts` com Fisher–Yates e usá-lo nos três lugares.
  - **Pronto quando:** não há mais nenhum `sort(() => Math.random()` no código.

- [ ] **F0.6** 🟡 Cadastro não atômico
  - **Contexto:** `Signup.tsx` cria o usuário no Auth e depois insere em `cuidadores`. Se o insert falhar, o usuário fica órfão e não consegue se cadastrar de novo ("e-mail já cadastrado").
  - **Solução até M1:** tratar a falha e mostrar uma mensagem clara. A solução definitiva é a transação única no backend (F3.2).
  - **Pronto quando:** está documentado e mitigado. A correção completa fica em F3.2.

- [ ] **F0.7** 🟡 Validar variáveis de ambiente
  - **Onde:** `src/supabase.ts`.
  - **Solução:** se `VITE_SUPABASE_URL` ou a chave faltarem, lançar um erro com mensagem explicativa. Criar `.env.example`.
  - **Pronto quando:** rodar sem `.env` mostra um erro legível, e `.env.example` existe.

- [ ] **F0.8** 🟡 Lockfiles duplicados
  - **Contexto:** `package-lock.json` e `pnpm-lock.yaml` coexistem e divergem. O gerenciador declarado é o pnpm.
  - **Solução:** apagar `package-lock.json`, rodar `pnpm install` e conferir que o build passa.
  - **Pronto quando:** só existe `pnpm-lock.yaml`, e `pnpm build` passa.

- [ ] **F0.9** 🟡 README desatualizado
  - **Contexto:** o README cita a credencial mock `cuidador@cogni.app / cogni123`, que não funciona mais com a auth real. Também menciona Supabase e Vercel como "planejados".
  - **Solução:** atualizar as seções "Como executar", "Credenciais" e "Estado atual". As menções à arquitetura nova entram depois de F2.
  - **Pronto quando:** seguir o README do zero resulta num app funcionando.

- [ ] **F0.10** 🟢 Conferir que `pnpm build` e o typecheck passam limpos
  - **Pronto quando:** `pnpm build` termina sem erros nem avisos de tipo.

---

## Fase 1: Fundação do repositório 🔴

- [ ] **F1.1** 🔴 Reorganizar como monorepo
  - **Contexto:** o backend Python vai morar no mesmo repositório.
  - **Estrutura-alvo:**
    ```
    cogni/
      frontend/        (conteúdo atual: src/, index.html, vite.config.ts…)
      backend/         (FastAPI, ver F2)
      docs/            (PLANO.md, adr/, arquitetura/)
      infra/           (Caddyfile, scripts de backup)
      docker-compose.yml
      .github/workflows/
    ```
  - **Atenção:** usar `git mv` para preservar o histórico. Atualizar o README e o `.mise.toml` (adicionar Python 3.12).
  - **Depende de:** F0 concluída (para evitar conflitos).
  - **Pronto quando:** `cd frontend && pnpm dev` funciona como antes.

- [ ] **F1.2** 🟡 Mover a especificação para `docs/`
  - **Onde:** `src/imports/pasted_text/cognitive-app-spec.md` → `docs/especificacao-original.md`.
  - **Pronto quando:** a pasta `src/imports/` deixou de existir.

- [ ] **F1.3** 🔴 Lint no front
  - **Solução:** oxlint (mesmo ecossistema do oxfmt) ou ESLint com `typescript-eslint` e `eslint-plugin-react-hooks`. Script `pnpm lint`.
  - **Também:** trocar `catch (err: any)` por `catch (err: unknown)` com narrowing.
  - **Pronto quando:** `pnpm lint` passa sem erros.

- [ ] **F1.4** 🔴 Testes no front
  - **Solução:** Vitest + Testing Library. Script `pnpm test`. Primeiros testes: `shuffle` (F0.5) e as funções de pontuação.
  - **Pronto quando:** `pnpm test` roda pelo menos 3 testes verdes.

- [ ] **F1.5** 🔴 CI no GitHub Actions
  - **Onde:** `.github/workflows/ci.yml`.
  - **Jobs:** front (install, lint, typecheck, test, build) e back (ruff, mypy, pytest), este último depois de F2.
  - **Pronto quando:** um push no branch mostra os checks verdes no GitHub.

- [ ] **F1.6** 🔴 ADRs (Architecture Decision Records)
  - **Onde:** `docs/adr/0001-…md` em diante, no formato: Contexto, Decisão, Alternativas consideradas, Consequências.
  - **Escrever:** uma ADR para cada decisão D1–D11 da tabela acima.
  - **Por que importa:** é exatamente o tipo de pergunta que a banca faz ("por que não SQLite?", "e se o serviço sumir?").
  - **Pronto quando:** existem as 11 ADRs e um `docs/adr/README.md` com o índice.

- [ ] **F1.7** 🟡 Diagramas de arquitetura
  - **Onde:** `docs/arquitetura/`.
  - **Conteúdo:** diagrama C4 (níveis 1 e 2) em Mermaid, modelo entidade-relacionamento (depois de F5) e fluxo de dados sensíveis (o que sai de onde para onde).
  - **Pronto quando:** os diagramas aparecem renderizados no GitHub.

- [ ] **F1.8** 🟢 Convenções de contribuição
  - **Conteúdo:** Conventional Commits, branch por funcionalidade e template de PR em `.github/pull_request_template.md`.

---

## Fase 2: Backend FastAPI + PostgreSQL + Docker 🔴

- [ ] **F2.1** 🔴 Esqueleto do backend
  - **Estrutura:**
    ```
    backend/
      app/
        main.py            (cria o app, CORS, routers, /health)
        core/config.py     (pydantic-settings, lê o .env)
        core/db.py         (engine e sessão SQLAlchemy)
        core/security.py   (hash e JWT, ver F3)
        models/            (tabelas)
        schemas/           (Pydantic: entrada e saída)
        routers/           (endpoints por domínio)
        services/          (regras de negócio)
      alembic/
      tests/
      pyproject.toml       (dependências e ferramentas, gerenciado com uv)
      Dockerfile
    ```
  - **Ferramentas:** `uv` para dependências, `ruff` para lint e formatação, `mypy` para tipos, `pytest` + `httpx` para testes.
  - **Pronto quando:** `GET /health` retorna `{"status":"ok"}` e `/docs` mostra o Swagger.

- [ ] **F2.2** 🔴 Docker Compose de desenvolvimento
  - **Serviços:** `postgres` (16, com volume nomeado), `api` (com hot reload) e, opcionalmente, `frontend`.
  - **Arquivos:** `docker-compose.yml` e `.env.example` com todas as variáveis documentadas.
  - **Pronto quando:** `docker compose up` sobe a API ligada ao Postgres, e `/health` verifica também a conexão com o banco.

- [ ] **F2.3** 🔴 Migrações com Alembic
  - **Pronto quando:** `alembic upgrade head` cria o schema do zero num banco vazio, e `alembic downgrade` funciona.

- [ ] **F2.4** 🟡 Tratamento de erros padronizado
  - **Solução:** formato único de erro (`{"error": {"code", "message", "details"}}`), handlers globais, log estruturado em JSON e `request_id` em cada requisição.
  - **Pronto quando:** qualquer erro da API segue o formato, e o log mostra o `request_id`.

- [ ] **F2.5** 🟡 Testes do backend com banco real
  - **Solução:** pytest com fixture de banco temporário. Pode ser Postgres via `testcontainers` ou SQLite em memória para testes unitários (D3).
  - **Pronto quando:** `pytest` roda verde localmente e no CI (F1.5).

- [ ] **F2.6** 🟢 Script de dados de exemplo (`seed`)
  - **Contexto:** a demo precisa de pacientes com histórico plausível. A versão completa vem da coorte sintética (F10).
  - **Pronto quando:** `python -m app.seed` popula 3 pacientes com algumas semanas de sessões.

---

## Fase 3: Autenticação própria 🔴

- [ ] **F3.1** 🔴 Modelo de usuário e hash de senha
  - **Solução:** tabela `usuarios` (id UUID, email único com normalização para minúsculas, `senha_hash`, `criado_em`, `email_verificado_em`). Hash com **Argon2id** via `argon2-cffi`.
  - **Pronto quando:** o teste confirma que a senha nunca é gravada em texto puro e que o hash é verificado corretamente.

- [ ] **F3.2** 🔴 Cadastro em transação única
  - **Endpoint:** `POST /auth/cadastro` cria usuário, cuidador e idoso (opcional) **na mesma transação**. Se qualquer parte falhar, nada é gravado. Corrige F0.6 de vez.
  - **Política de senha:** mínimo de 8 caracteres, sem regras de composição obrigatórias (recomendação do NIST SP 800-63B) e bloqueio de senhas comuns (lista local das mais usadas).
  - **Pronto quando:** o teste força uma falha no insert do idoso e confirma que nenhum usuário foi criado.

- [ ] **F3.3** 🔴 Login, refresh e logout
  - **Solução:** `POST /auth/login` devolve um access token JWT (15 min) no corpo e o refresh token (7 dias) em **cookie httpOnly, Secure, SameSite=Strict**. `POST /auth/refresh` emite tokens novos e rotaciona o refresh. `POST /auth/logout` revoga.
  - **Refresh tokens:** guardados com hash no banco (tabela `refresh_tokens`) para permitir revogação.
  - **Pronto quando:** os testes cobrem login válido, senha errada, token expirado, refresh e logout.

- [ ] **F3.4** 🔴 Recuperação de senha
  - **Solução:** `POST /auth/esqueci-senha` sempre responde 200 (não revela se o e-mail existe). Gera um token aleatório de uso único, guardado com hash e válido por 30 min, e envia o link por SMTP (D8). `POST /auth/redefinir-senha` consome o token.
  - **Desenvolvimento:** usar o Mailpit no compose para ver os e-mails sem enviá-los de verdade.
  - **Pronto quando:** o fluxo completo funciona localmente, com o e-mail aparecendo no Mailpit.

- [ ] **F3.5** 🟡 Proteções
  - **Solução:** rate limit no login e na recuperação (por IP e por e-mail), bloqueio temporário após N falhas e mensagem genérica de erro ("e-mail ou senha incorretos").
  - **Pronto quando:** o teste confirma o bloqueio depois de N tentativas.

- [ ] **F3.6** 🟡 Autorização por dono do dado
  - **Contexto:** substitui o Row Level Security do Supabase. **Toda** consulta filtra pelo `cuidador_id` do usuário logado.
  - **Solução:** uma dependência FastAPI `get_current_user` e um helper que carrega um recurso já checando o dono.
  - **Pronto quando:** existe teste em que o cuidador A tenta acessar o paciente do cuidador B e recebe 404.

- [ ] **F3.7** 🟢 Migração de usuários existentes do Supabase
  - **Contexto:** só é necessária se já houver contas reais.
  - **Solução:** `pg_dump` das tabelas. O Supabase usa hashes bcrypt, então o login aceita bcrypt e regrava em Argon2 no primeiro acesso bem-sucedido.
  - **Pronto quando:** uma conta antiga consegue entrar no sistema novo.

---

## Fase 4: Front-end conectado à API própria 🔴

- [ ] **F4.1** 🔴 Rotas de verdade
  - **Solução:** React Router com URLs (`/login`, `/pacientes/:id`, `/jogos/atencao`…). Botão voltar do navegador e deep links funcionando. Substitui o `useState<Screen>` do `App.tsx`.
  - **Pronto quando:** toda tela tem URL própria, e recarregar mantém o usuário na mesma tela.

- [ ] **F4.2** 🔴 Cliente de API tipado
  - **Solução:** gerar os tipos TypeScript a partir do OpenAPI do FastAPI (`openapi-typescript`) e criar o cliente em `src/api/`. O access token fica em memória, e o refresh é automático ao receber 401.
  - **Pronto quando:** uma mudança de schema no backend faz o typecheck do front acusar o erro.

- [ ] **F4.3** 🔴 Contexto de autenticação e guarda de rota
  - **Solução:** `AuthProvider` com `user`, `login`, `logout`, e um componente `<RequireAuth>` nas rotas internas.
  - **Depende de:** F3.3, F4.1, F4.2.
  - **Pronto quando:** cobre o critério de F0.3 sem usar Supabase.

- [ ] **F4.4** 🔴 Camada de dados com TanStack Query
  - **Solução:** hooks por domínio (`usePatients`, `useSessions`…) com cache, recarregamento e estados de carregamento e erro.
  - **Pronto quando:** as telas não importam mais nada de `data.ts`.

- [ ] **F4.5** 🔴 Remover o Supabase
  - **Solução:** apagar `src/supabase.ts`, remover `@supabase/supabase-js` e as variáveis `VITE_SUPABASE_*`.
  - **Depende de:** F4.3, F4.4 e F0.1 (com `saveSession` já migrado).
  - **Pronto quando:** `grep -ri supabase frontend/src` não encontra nada.

- [ ] **F4.6** 🟡 Componentes de UI reutilizáveis
  - **Contexto:** o logo SVG está copiado em todas as telas de auth, `fmt()` está duplicada, e há dezenas de ícones SVG escritos à mão.
  - **Solução:** `src/components/ui/` (Button, Input, Card, Logo, EmptyState, Spinner) e `lucide-react` para ícones. `fmt` vai para `src/lib/format.ts`.
  - **Pronto quando:** não há mais SVG de ícone escrito à mão nas telas.

- [ ] **F4.7** 🟡 Error Boundary e estados vazios
  - **Solução:** um erro num jogo não derruba o app. Toda lista tem estado vazio ("Nenhum paciente ainda. Cadastre o primeiro.").
  - **Pronto quando:** forçar um erro num componente mostra uma tela amigável.

- [ ] **F4.8** 🟡 Separar tipos de domínio e mocks
  - **Solução:** os tipos passam a vir do OpenAPI (F4.2). `data.ts` é apagado ou fica só para testes. Isso remove o `mockCaregiver` com senha e as fotos hotlinkadas do Unsplash.
  - **Pronto quando:** `data.ts` não é mais importado pelo app.

---

## Fase 5: Modelo de dados do domínio 🔴

- [ ] **F5.1** 🔴 Modelagem
  - **Tabelas iniciais:**
    - `cuidadores`: perfil, telefone, tipo de vínculo, instituição.
    - `idosos`: nome, nascimento, condição informada pelo cuidador, nível de familiaridade com tecnologia, observações.
    - `vinculos`: cuidador ↔ idoso (N:N, para permitir vários cuidadores), com papel (`principal`, `familiar`, `profissional`).
    - `sessoes`: idoso, jogo, nível, início e fim, `versao_pontuacao`, métricas calculadas e observações.
    - `eventos_sessao`: eventos brutos (ver F6.1), em JSONB ou colunas tipadas.
    - `consentimentos`: quem aceitou, qual versão do termo e quando (ver F8.3).
    - `auditoria`: quem acessou o quê e quando (ver F8.5).
  - **Entregável:** diagrama ER em `docs/arquitetura/` (F1.7) e migração Alembic.
  - **Pronto quando:** a migração aplica sem erros, e o diagrama está no repositório.

- [ ] **F5.2** 🔴 CRUD de idosos
  - **Endpoints:** listar, criar, ver, editar e arquivar (*soft delete*). Sempre filtrado pelo vínculo (F3.6).
  - **Front:** telas de cadastro e edição de idoso. Isso cumpre o item "cadastros básicos" do cronograma.
  - **Pronto quando:** o cuidador cadastra, edita e arquiva um idoso pela interface.

- [ ] **F5.3** 🟡 Convidar outro cuidador
  - **Contexto:** em geral há vários familiares envolvidos no cuidado.
  - **Solução:** convite por e-mail com token e escolha de papel.
  - **Pronto quando:** dois cuidadores veem o mesmo idoso.

- [ ] **F5.4** 🔴 Endpoints de sessão
  - **Endpoints:** `POST /sessoes` (recebe os eventos brutos, F6), `GET /idosos/:id/sessoes` e `GET /sessoes/:id`.
  - **Pronto quando:** a tela de sessões recentes do paciente mostra dados reais.

---

## Fase 6: Medição de verdade nos jogos 🔴

> Sem isso, toda a tese (F9–F13) não tem dado.

- [ ] **F6.1** 🔴 Registro de eventos brutos
  - **Contexto:** hoje `AttentionSpeed` só conta acertos e **não grava o tempo de reação** de cada toque nem os toques errados. A variabilidade do tempo de reação é o biomarcador mais promissor, e ela não existe no sistema.
  - **Solução:** um hook `useSessionRecorder()` que registra `{t: performance.now(), tipo, alvo, posicao, correto, meta}` para cada estímulo exibido, toque, acerto, erro e omissão. Ao final, os eventos vão para `POST /sessoes`.
  - **Também:** registrar o contexto da sessão (horário, dispositivo e tamanho de tela), porque o horário influencia o desempenho do idoso.
  - **Pronto quando:** uma sessão de cada jogo gera no banco uma lista de eventos com timestamps em milissegundos.

- [ ] **F6.2** 🔴 Trocar `setInterval` por timestamps
  - **Contexto:** a duração é contada com `setInterval` de 1 s, impreciso demais para tempo de reação.
  - **Solução:** calcular durações por diferença de `performance.now()`. O `setInterval` fica só para atualizar o relógio na tela.
  - **Pronto quando:** o tempo de reação é medido com precisão de milissegundos.

- [ ] **F6.3** 🔴 Pontuação padronizada e versionada (`scoring v1`)
  - **Contexto:** cada jogo usa uma fórmula arbitrária própria (`hits / floor(duration/1.8)`, `acertos - erros*0.5`…). Elas não são comparáveis entre jogos nem ao longo do tempo.
  - **Solução:** um módulo no **backend** (`app/services/scoring/`) que calcula a partir dos eventos brutos:
    - **Atenção:** tempo de reação médio e mediano, **variabilidade intra-individual (desvio-padrão e coeficiente de variação)**, omissões e erros de comissão.
    - **Pares:** tentativas por par, erros de perseveração (repetir a mesma carta errada) e tempo até o primeiro acerto.
    - **Categorias:** acertos, intrusões (distratores tocados) e tempo por item.
    - **Imagens:** precisão e tempo por associação.
    - Um índice de 0 a 100 por jogo, só para a interface, sempre acompanhado das métricas brutas.
  - **Versionamento:** cada sessão guarda `versao_pontuacao`. Se a fórmula mudar, um script recalcula tudo a partir dos eventos.
  - **Pronto quando:** existem testes unitários com eventos conhecidos → métricas esperadas para os 4 jogos.

- [ ] **F6.4** 🟡 Padronizar a estrutura dos jogos
  - **Contexto:** `GameSession.tsx` (Associação de Imagens) não usa `GameHeader` nem `GameResult` como os outros três e duplica a tela de resultado.
  - **Solução:** os 4 jogos seguem o mesmo ciclo (instruções → jogo → resultado) e os mesmos componentes. Mover `GameSession.tsx` para `games/ImageAssociation.tsx`.
  - **Pronto quando:** os 4 jogos compartilham `GameHeader`, `GameResult` e `useSessionRecorder`.

- [ ] **F6.5** 🟡 Rodada de prática não pontuada
  - **Contexto:** a primeira interação mede principalmente o entendimento da tarefa, não a cognição.
  - **Pronto quando:** cada jogo tem 2–3 estímulos de prática que não entram nas métricas.

---

## Fase 7: Modo Idoso e acessibilidade 🟡

- [ ] **F7.1** 🔴 Modo Idoso separado
  - **Contexto:** a especificação original (`docs/especificacao-original.md`) pede um "Modo Usuário" com corpo de texto de 18–20 px, botões de pelo menos 20 px, alvos de toque de 48 px e no máximo 3–4 opções por tela. Hoje o idoso joga dentro da interface do cuidador, que tem 81 usos de `text-xs`/`text-[10px]`.
  - **Solução:** o cuidador abre "Iniciar atividades com [nome]", e o app entra num modo de tela cheia, travado, sem navegação. Para sair, é preciso um gesto do cuidador (ex.: segurar um botão por 3 s ou digitar um PIN).
  - **Pronto quando:** o idoso consegue fazer uma sequência de atividades sem ver nenhuma tela do cuidador.

- [ ] **F7.2** 🔴 Contraste WCAG
  - **Contexto:** `text-light` (#8A9E9E sobre #F7F2E9) provavelmente não passa no nível AA.
  - **Solução:** medir todas as combinações de cor do tema e ajustar os tokens em `index.css`. Mínimo AA no modo cuidador e AAA no Modo Idoso.
  - **Pronto quando:** existe uma tabela de contraste em `docs/` com todas as combinações aprovadas.

- [ ] **F7.3** 🟡 Semântica e leitor de tela
  - **Contexto:** há só 5 atributos `aria-*`/`alt` no código inteiro.
  - **Solução:** rótulos em todos os botões só com ícone, `alt` nas imagens, `aria-live` para os feedbacks de jogo e foco visível.
  - **Pronto quando:** o Lighthouse Accessibility dá ≥ 95 nas telas principais, e `axe` roda no teste E2E (F7.6).

- [ ] **F7.4** 🟡 Barra de rolagem visível
  - **Contexto:** `index.css` esconde a barra de rolagem globalmente, o que atrapalha quem tem pouca habilidade motora.
  - **Pronto quando:** o `scrollbar-width: none` global foi removido.

- [ ] **F7.5** 🟡 Preferências de acessibilidade
  - **Solução:** tamanho de fonte (normal, grande, extra grande), respeitar `prefers-reduced-motion`, som liga/desliga e alto contraste.
  - **Pronto quando:** as preferências persistem por idoso no backend.

- [ ] **F7.6** 🟡 Testes E2E com Playwright
  - **Fluxos:** cadastro → login → criar idoso → jogar uma sessão de cada jogo → ver no relatório. Rodar com `--trace off` no CI.
  - **Pronto quando:** o E2E roda verde no CI.

---

## Fase 8: Segurança e LGPD 🟡

- [ ] **F8.1** 🔴 Hospedar a fonte localmente
  - **Contexto:** o `@import` do Google Fonts em `index.css` envia o IP de cada usuário ao Google. Isso já gerou condenação na Alemanha com base no GDPR. Hospedar localmente também permite usar o app offline.
  - **Solução:** `@fontsource/nunito` ou os arquivos `.woff2` dentro do projeto.
  - **Pronto quando:** o app não faz nenhuma requisição a domínios externos.

- [ ] **F8.2** 🟡 Cabeçalhos de segurança
  - **Solução:** CSP restritiva, HSTS, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy` no Caddy. CORS restrito ao domínio do front.
  - **Pronto quando:** o securityheaders.com dá nota A ou A+ (depois do deploy, F16).

- [ ] **F8.3** 🔴 Consentimento explícito
  - **Contexto:** dado de saúde é dado pessoal sensível (LGPD, art. 11).
  - **Solução:** termo de consentimento e política de privacidade em linguagem simples, aceitos no cadastro. Gravar versão, data e hora. Consentimentos separados para cada finalidade opcional (ex.: gravação de voz em F11).
  - **Pronto quando:** não é possível criar conta sem aceitar, e o aceite fica registrado na tabela `consentimentos`.

- [ ] **F8.4** 🟡 Direitos do titular
  - **Solução:** "Exportar meus dados" (JSON completo) e "Excluir minha conta" (com confirmação e remoção real ou anonimização).
  - **Pronto quando:** os dois fluxos funcionam pela interface.

- [ ] **F8.5** 🟡 Log de auditoria
  - **Solução:** registrar quem acessou os dados de qual idoso, quando e qual ação foi feita.
  - **Pronto quando:** o cuidador vê o histórico de acessos ao perfil do idoso.

- [ ] **F8.6** 🟡 Minimização de dados
  - **Solução:** revisar cada campo coletado e justificar a necessidade. O diagnóstico deve ser opcional. Documentar o inventário de dados (o que é coletado, por quê, onde fica e por quanto tempo).
  - **Pronto quando:** `docs/lgpd/inventario-de-dados.md` existe.

- [ ] **F8.7** 🟢 Criptografia de campos sensíveis em repouso
  - **Solução:** criptografar observações clínicas e áudio em nível de aplicação, com a chave no `.env` e fora do banco.

---

## Fase 9: Motor de métricas inteligente 🟡

> O núcleo técnico da tese. Tudo é determinístico, testável e auditável, sem LLM.

- [ ] **F9.1** 🔴 Baseline pessoal
  - **Solução:** para cada idoso e cada métrica, estimar o padrão pessoal (média e dispersão robustas, como mediana e MAD) a partir das primeiras N sessões válidas, atualizado de forma lenta e controlada.
  - **Atenção:** separar o efeito de aprendizado (melhora natural nas primeiras sessões) do baseline real.
  - **Pronto quando:** existem testes com séries conhecidas.

- [ ] **F9.2** 🔴 Detecção de mudança
  - **Solução:** CUSUM ou detecção bayesiana de ponto de mudança sobre as métricas normalizadas pelo baseline. A regra precisa distinguir "um dia ruim" de "tendência sustentada", com parâmetros configuráveis e documentados.
  - **Também:** usar o contexto (horário, sono informado pelo cuidador) para não alarmar por motivos óbvios.
  - **Pronto quando:** em séries sintéticas, detecta um declínio inserido e ignora um outlier isolado (testes).

- [ ] **F9.3** 🔴 Alertas para o cuidador
  - **Solução:** os alertas da tela de Insights passam a vir do motor, cada um com explicação ("a variabilidade do tempo de reação da Maria está acima da faixa dela há 3 semanas"), nível de confiança e o que fazer. Os alertas graves sugerem conversar com um profissional de saúde.
  - **Pronto quando:** `AIInsights.tsx` não usa mais `mockInsights`.

- [ ] **F9.4** 🟡 Dificuldade adaptativa
  - **Contexto:** está no README como item 6 ("parcial").
  - **Solução:** ajuste por escada (*staircase*) ou modelo tipo Elo, mirando 70–80% de acerto. O nível inicial vem do histórico.
  - **Pronto quando:** em simulação, um jogador sintético de habilidade fixa converge para a taxa-alvo.

- [ ] **F9.5** 🟡 Domínios cognitivos derivados de dados
  - **Contexto:** o gráfico radar (memória, atenção, linguagem, executiva e visuoespacial) hoje mostra números inventados.
  - **Solução:** mapear explicitamente quais métricas de quais jogos alimentam cada domínio, documentando o racional.
  - **Pronto quando:** o radar é calculado e o mapeamento está documentado.

---

## Fase 10: Coorte sintética e avaliação 🟡

> Transforma "funciona" em "funciona com X% de sensibilidade". É o que faz o trabalho parecer pesquisa, não só um app.

- [ ] **F10.1** 🔴 Gerador de pacientes sintéticos
  - **Solução:** simular idosos com habilidade inicial, ruído diário, efeito de aprendizado, efeito de horário e, em uma parte deles, **declínio de intensidade e início conhecidos**. Gerar eventos brutos no formato de F6.1, para que passem pelo mesmo pipeline real.
  - **Onde:** `backend/app/simulation/` ou `research/`.
  - **Pronto quando:** gera uma coorte de N pacientes com sementes reproduzíveis.

- [ ] **F10.2** 🔴 Avaliação do detector
  - **Métricas:** sensibilidade, taxa de falsos alarmes por paciente-ano e tempo até a detecção, em função da intensidade do declínio e da frequência de uso.
  - **Entregável:** notebook ou relatório em `research/` com tabelas e gráficos. Os resultados entram no documento do TCC.
  - **Pronto quando:** há uma tabela com intervalos de confiança.

- [ ] **F10.3** 🟡 Frequência mínima de uso
  - **Pergunta:** com quantas sessões por semana o detector ainda funciona? A resposta ajuda a definir a recomendação ao cuidador.

- [ ] **F10.4** 🟡 Dados de demo vêm da coorte
  - **Solução:** o `seed` (F2.6) usa pacientes da coorte, incluindo um com declínio que o sistema detecta na demo.

---

## Fase 11: Voz e biomarcadores de fala 🟢

- [ ] **F11.1** 🟡 Captura de áudio no navegador
  - **Solução:** MediaRecorder, com consentimento específico (F8.3) e indicador visual claro de gravação.

- [ ] **F11.2** 🟡 Transcrição local
  - **Solução:** Whisper (por exemplo, `faster-whisper`) rodando no backend, em container. O áudio nunca sai do servidor.
  - **Atenção:** medir o tempo de transcrição numa VPS sem GPU. Se for lento, usar um modelo menor ou processar em fila assíncrona.

- [ ] **F11.3** 🟡 Extração de marcadores
  - **Marcadores:** taxa de pausas e duração média das pausas, velocidade de fala, diversidade lexical (MATTR), proporção de palavras vagas ("coisa", "aquilo"), repetições e densidade de ideias (aproximada).
  - **Pronto quando:** há testes com transcrições e alinhamentos conhecidos.

- [ ] **F11.4** 🟡 Integrar ao motor (F9)
  - **Solução:** os marcadores de fala entram no baseline pessoal e na detecção de mudança, como as métricas dos jogos.

- [ ] **F11.5** 🟢 Comandos por voz no Modo Idoso
  - **Contexto:** está no README como item 4.

- [ ] **F11.6** 🟢 Política de retenção de áudio
  - **Solução:** apagar o áudio bruto depois de extrair os marcadores, mantendo só a transcrição e as métricas, salvo consentimento explícito em contrário.

---

## Fase 12: Reminiscência conversacional com IA 🟢

- [ ] **F12.1** 🟡 Cadastro de memórias afetivas
  - **Contexto:** está no README como itens 2 e 3.
  - **Solução:** o cuidador cadastra fotos e histórias de pessoas e lugares importantes, com legenda, data aproximada e relação com o idoso.

- [ ] **F12.2** 🟡 Interface `LLMProvider`
  - **Solução:** uma interface única, compatível com o formato OpenAI, com as implementações `OllamaProvider` (modelo aberto local, container no compose), `ExternalAPIProvider` (opcional) e `NullProvider` (sem IA). A troca é feita pelo `.env` (D9).
  - **Pronto quando:** trocar o provedor é mudar uma variável, e com `NullProvider` o app continua funcionando.

- [ ] **F12.3** 🟡 Escolha do modelo aberto
  - **Solução:** testar 2 ou 3 modelos instruct de 7–8B (famílias Qwen, Llama, Gemma ou Mistral) com 20 perguntas reais em português. Registrar a comparação numa ADR.

- [ ] **F12.4** 🟡 Sessão de reminiscência
  - **Solução:** a IA mostra uma foto e conduz uma conversa por voz com perguntas abertas, acolhedoras e sem cobrar acerto ("Quem está nessa foto com você?"). A fala alimenta F11.
  - **Guardrails:** nunca corrigir o idoso de forma brusca, nunca falar de diagnóstico, encerrar com gentileza se houver sinal de angústia, e o cuidador revisa as memórias cadastradas.

- [ ] **F12.5** 🟡 Resumos em linguagem natural para o cuidador
  - **Solução:** o LLM redige o resumo **a partir das métricas que o motor (F9) já calculou**. Ele não calcula nada. Só envia números agregados, nunca nome ou foto. O resumo é gerado uma vez por dia e guardado.

- [ ] **F12.6** 🟢 Chat do cuidador
  - **Solução:** substituir as `aiQuickReplies` pré-definidas por um chat que responde com base nos dados do idoso, citando de onde veio cada informação.

---

## Fase 13: Ciclo fechado de intervenção 🟢

- [ ] **F13.1** 🟡 Plano de atividades personalizado
  - **Solução:** a partir do perfil e da trajetória, sugerir um plano semanal. Inclui treino de velocidade com **sessões de reforço** (evidência do estudo ACTIVE) e variação entre domínios.

- [ ] **F13.2** 🟡 Rotina e lembretes
  - **Contexto:** está no README como item 5.
  - **Solução:** agenda de atividades e notificações para o cuidador.

- [ ] **F13.3** 🟡 Fatores de risco modificáveis
  - **Solução:** check-ins simples feitos pelo cuidador (atividade física, sono, contato social, audição avaliada, pressão acompanhada), baseados nos 14 fatores da Lancet Commission 2024. Lembretes gentis, sem caráter clínico.

- [ ] **F13.4** 🟡 Medir a resposta à intervenção
  - **Solução:** comparar a trajetória antes e depois das mudanças de plano. Fechar o ciclo no painel.

- [ ] **F13.5** 🟢 Mensagens afetivas de familiares
  - **Contexto:** está no README como item 7.

---

## Fase 14: Relatórios e interoperabilidade 🟢

- [ ] **F14.1** 🟡 Gráficos com baseline e faixa pessoal
  - **Contexto:** os SVGs feitos à mão em `Reports.tsx` e `PatientDetail.tsx` não mostram incerteza.
  - **Solução:** gráficos com a faixa normal da própria pessoa sombreada e os pontos fora dela destacados. Visualmente, isso mostra a tese.

- [ ] **F14.2** 🟡 Relatório em PDF para o profissional de saúde
  - **Contexto:** hoje o botão de exportar não faz nada.
  - **Solução:** PDF gerado no backend com período, métricas, tendências, alertas e o aviso de que não substitui avaliação clínica.

- [ ] **F14.3** 🟢 Exportação em HL7 FHIR
  - **Contexto:** FHIR é o padrão adotado pela RNDS brasileira.
  - **Solução:** exportar as métricas como recursos `Observation` em um `Bundle`, validado com um validador FHIR.

---

## Fase 15: Experiência e apresentação 🟢

- [ ] **F15.1** 🟡 PWA
  - **Solução:** instalável no tablet, funciona offline durante a sessão (com fila de envio), e a Wake Lock API mantém a tela acesa durante o jogo.

- [ ] **F15.2** 🟢 Microanimações e feedback sonoro nos jogos
  - **Solução:** sons opcionais, sempre respeitando `prefers-reduced-motion` e a preferência de som (F7.5).

- [ ] **F15.3** 🟢 Onboarding do cuidador
  - **Solução:** um passo a passo na primeira vez (cadastrar o idoso, a primeira sessão, como ler o painel).

- [ ] **F15.4** 🟢 Landing page
  - **Solução:** uma tela explicando o produto, que também serve de abertura da apresentação.

---

## Fase 16: Deploy, backup e operação 🟡

- [ ] **F16.1** 🔴 Compose de produção
  - **Serviços:** Caddy (HTTPS automático, serve o build do front, proxy para a API), api (sem hot reload, com vários workers) e postgres. Variáveis só via `.env` e nenhum segredo no repositório.
  - **Pronto quando:** `docker compose -f docker-compose.prod.yml up -d` sobe tudo numa máquina limpa.

- [ ] **F16.2** 🔴 Backup automático
  - **Solução:** `pg_dump` diário com rotação (ex.: 7 diários e 4 semanais), copiado **para fora do servidor**. Script em `infra/backup.sh`.

- [ ] **F16.3** 🔴 Teste de restauração
  - **Contexto:** backup que nunca foi restaurado não é backup.
  - **Solução:** `infra/restore.sh` e um roteiro documentado. Fazer o teste e registrar o tempo total.
  - **Pronto quando:** o app sobe em outra máquina a partir do backup, e o tempo medido está registrado. Isso também é a demo de F17.4.

- [ ] **F16.4** 🟡 Deploy numa VPS
  - **Solução:** documentar o passo a passo do zero: criar a VPS, instalar o Docker, configurar o DNS, subir o compose.

- [ ] **F16.5** 🟡 Monitoramento básico
  - **Solução:** `/health` monitorado externamente (ex.: Uptime Kuma, também em container) e logs com retenção.

- [ ] **F16.6** 🟢 CD
  - **Solução:** deploy automático a partir da `main` via GitHub Actions (SSH ou pull da imagem).

---

## Fase 17: Preparação da banca 🔴

- [ ] **F17.1** 🔴 Slide: cadeia de evidências
  - **Conteúdo:** ACTIVE 20 anos (reforços importam), US POINTER (estruturado > autoguiado), Lancet 2024 (45% e 14 fatores), exames de sangue para Alzheimer liberados pelo FDA (o gargalo agora é saber quem testar) e a lacuna: ninguém fecha o ciclo medir → intervir → medir. As fontes estão na seção [Referências](#referências-da-pesquisa).

- [ ] **F17.2** 🔴 Slide: arquitetura e independência de fornecedor
  - **Conteúdo:** diagrama do compose, a frase de resposta à banca (ver abaixo) e as ADRs.
  - **Resposta pronta:** *"O Cogni não depende de nenhum serviço proprietário. Toda a aplicação é empacotada em containers e sobe com um comando em qualquer servidor. Se o provedor sumir, restauramos o backup em outra máquina e rodamos o mesmo comando, em minutos e sem alterar código."*

- [ ] **F17.3** 🔴 Roteiro de perguntas prováveis da banca
  - **Onde:** `docs/banca/perguntas.md`.
  - **Perguntas a preparar:** e se o serviço sumir? Por que não SQLite? Por que Python? É dispositivo médico (ANVISA)? Como fica a LGPD? Vocês usaram dados reais? (Não, ver os riscos.) Como sabem que o alerta funciona? (Ver F10.) Qual é o modelo de negócio? Por que um cuidador usaria isso?

- [ ] **F17.4** 🟡 Demo de restauração ao vivo
  - **Depende de:** F16.3.
  - **Roteiro:** derrubar o servidor, subir em outra máquina a partir do backup e mostrar que todos os dados voltaram.

- [ ] **F17.5** 🟢 Demo offline
  - **Depende de:** F11 e F12.
  - **Roteiro:** desligar a internet e mostrar a conversa de reminiscência e a análise de fala funcionando localmente.

- [ ] **F17.6** 🟡 Slide: modelo de negócio
  - **Conteúdo:** porta de entrada do diagnóstico precoce, planos de saúde (o idoso é o paciente mais caro), recrutamento para ensaios clínicos e SUS (Lei 14.878/2024). Deixar claro que é visão de futuro, que depende de validação clínica.

---

## Riscos e limites

| Risco | Mitigação |
| --- | --- |
| **Pesquisa com seres humanos** sem aprovação ética | Qualquer coleta de dados de pessoas reais, inclusive voluntários saudáveis, exige aprovação do CEP via Plataforma Brasil. No TCC, usar só dados sintéticos (F10) e testes funcionais da própria equipe, apresentados como teste de software e não como pesquisa. |
| **Enquadramento como dispositivo médico** (SaMD, ANVISA, RDC 657/2022) | O Cogni apoia o cuidador e acompanha mudanças em relação ao padrão da própria pessoa. Não diagnostica nem indica tratamento. Revisar todos os textos da interface (regra 8). Confirmar com o orientador. |
| **Exagerar as alegações** na apresentação | Deixar claro: protótipo não validado clinicamente, com viabilidade técnica demonstrada e desempenho do detector medido em dados simulados. |
| **Prazo de M1/M2** (dias, não semanas) | Priorizar F0 e os itens 🔴. O que não couber vai para "próximos passos" nos slides. |
| **LLM local lento** numa VPS sem GPU | A IA é opcional (D9). Para a demo, rodar no notebook. Usar processamento assíncrono. |
| **Qualidade de modelos abertos em português** | Avaliação com perguntas reais (F12.3). O LLM só redige sobre números já calculados. |
| **Perda de dados** | Backup diário fora do servidor e teste de restauração (F16.2, F16.3). |

### Fora de escopo (por enquanto)

- Validação clínica e estudo com pacientes reais.
- Registro na ANVISA.
- Integração direta com a RNDS (além da exportação FHIR).
- Aplicativo nativo para lojas (o PWA atende).

---

## Registro de progresso

> Uma linha por item concluído, alterado ou cancelado. A mais recente fica embaixo.

| Data | Item | Commit | Observação |
| --- | --- | --- | --- |
| 19/11/2026 | — | — | Plano criado a partir da análise do repositório e da pesquisa de 2026. |

---

## Referências da pesquisa

Evidências que embasam a visão do produto (F17.1). Confirmar cada número na fonte primária antes de citar no documento do TCC.

- **ACTIVE, 20 anos:** treino de velocidade com reforços foi associado a cerca de 25% menos diagnósticos de demência. Sem reforços, não houve efeito. *Alzheimer's & Dementia: TRCI*, fev/2026. [News-Medical](https://www.news-medical.net/news/20260302/Can-brain-training-prevent-dementia-Long-term-trial-shows-speed-training-with-boosters-makes-a-difference.aspx)
- **US POINTER:** intervenção multidomínio estruturada superou a autoguiada. *JAMA*, jul/2025. [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12725448/)
- **Lancet Commission 2024:** 14 fatores modificáveis, cerca de 45% dos casos. Livingston et al., *Lancet* 2024;404:572-628. [DPUK](https://www.dementiasplatform.uk/news-and-media/latest-news/new-modifiable-risks-included-in-lancet-report-on-dementia)
- **ACHIEVE:** intervenção auditiva sem efeito no total e com 48% de desaceleração no subgrupo de maior risco. *Lancet*, 2023. [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10737284/)
- **Exames de sangue:** Lumipulse (FDA, mai/2025) e Roche Elecsys pTau217 para atenção primária (FDA, ago/2026). [Pharmaphorum](https://pharmaphorum.com/news/fda-greenlights-roches-biomarker-blood-test-alzheimers)
- **Cognito HOPE:** dispositivo de 40 Hz não atingiu o desfecho principal em fase 3 (nov/2026). [AllSci](https://allsci.com/news/clinical-trials/spectris-ad-cognitos-misses-phase-iii-alzheimers/)
- **Biomarcadores de fala:** [Alzheimer's & Dementia 2026](https://alz-journals.onlinelibrary.wiley.com/doi/10.1002/alz.71462), [npj Digital Medicine 2026](https://www.nature.com/articles/s41746-026-02360-8), [revisão de escopo (medRxiv)](https://www.medrxiv.org/content/10.1101/2025.05.02.25326845v1.full)
- **Sensoriamento passivo e digitação:** [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12784374/), [JMIR 2022](https://www.jmir.org/2022/11/e37614)
- **Navegação espacial (Sea Hero Quest):** *PNAS*, 2019. [Healio](https://www.healio.com/psychiatry/alzheimers-disease-dementia/news/online/%7B00982760-977e-4059-8f17-09f85874ce64%7D/sea-hero-quest-gaming-app-can-detect-alzheimers-risk)
- **Reminiscência com IA:** ensaio NCT07499570 em recrutamento, com previsão de término em 2027. [Registro](https://www.findatrial.com/trial/multi-modal-virtual-reminiscence-therapy-with-an-ai-avatar-for-older-adults-with-NCT07499570)
- **Lei 14.878/2024:** Política Nacional de Cuidado Integral às Pessoas com Alzheimer e Outras Demências. [Planalto](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/L14878.htm)
- **Cochrane:** Woods et al. (2018), reminiscência; Woods et al. (2023), estimulação cognitiva (já citados no README).
