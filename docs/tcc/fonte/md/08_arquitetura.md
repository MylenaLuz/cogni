# ARQUITETURA DO SISTEMA

Este capítulo apresenta a evolução arquitetural do Cogni, os direcionadores que orientaram as decisões, as visões de contexto e de contêineres segundo o modelo C4, os registros de decisão de arquitetura, a pilha tecnológica, os mecanismos de autenticação e autorização, a estratégia de privacidade, o papel da inteligência artificial e a estratégia de implantação, backup e integração contínua.

## EVOLUÇÃO ARQUITETURAL

A arquitetura do Cogni passou por três versões, representadas na {{fig:evolucao}}.

@@FIG|evolucao|Evolução arquitetural do Cogni|img/03_evolucao.png|Elaborado pelos autores (2026).|16

A **primeira versão** foi um protótipo navegável em React, com todos os dados simulados em um arquivo TypeScript. Ela permitiu validar fluxos e navegabilidade antes de investir em persistência.

A **segunda versão** integrou o protótipo a um provedor de *backend* como serviço (*Backend as a Service*, BaaS), o Supabase, que oferece PostgreSQL gerenciado, autenticação e uma API gerada automaticamente a partir do esquema, com controle de acesso por segurança em nível de linha (*Row Level Security*, RLS). Essa escolha, registrada no documento de definição de tecnologias (VALLE; VAZ; ALVES, 2026f), acelerou a implementação de login, cadastro em etapas e recuperação de senha.

A **terceira versão**, proposta neste trabalho, substitui o BaaS por uma arquitetura própria e portável. A seção seguinte explica por quê.

## O DESAFIO DA DEPENDÊNCIA DE FORNECEDOR

Durante a preparação para a defesa, a equipe antecipou uma pergunta provável da banca: **"e se o serviço sumir? O software some junto? Será preciso reestruturar?"**. A análise da pergunta levou a uma distinção que orientou toda a revisão arquitetural.

Há dois tipos de dependência. A **dependência de código** (*lock-in*) ocorre quando o código chama diretamente a API proprietária de um serviço. No protótipo, as telas chamavam funções específicas do cliente do Supabase para cadastrar, autenticar e inserir registros. Se o serviço desaparecesse ou mudasse suas condições, essas chamadas precisariam ser reescritas. A **dependência de infraestrutura** ocorre quando o software precisa de "um computador que o execute". Essa dependência é inevitável, mas pode ser tornada **trocável**: se o sistema estiver empacotado em contêineres e configurado por variáveis de ambiente, qualquer servidor que execute contêineres serve.

Vale registrar, por honestidade técnica, que o Supabase é um projeto de código aberto e pode ser auto-hospedado. Ainda assim, a auto-hospedagem exige operar um conjunto de serviços com arquitetura própria, e o código da aplicação permaneceria acoplado à biblioteca cliente. A decisão foi, portanto, eliminar a dependência de código e tornar trocável a dependência de infraestrutura.

## DIRECIONADORES ARQUITETURAIS

Os direcionadores, ou requisitos que mais influenciam a arquitetura (BASS; CLEMENTS; KAZMAN, 2021), foram:

a) **portabilidade e continuidade**: o sistema deve sobreviver à troca ou ao desaparecimento de qualquer fornecedor (RNF25 e RNF26);

b) **privacidade por arquitetura**: dados de saúde devem ser processados com o mínimo de exposição, preferencialmente sem sair do servidor da aplicação (LGPD, arts. 6º, 11, 33 e 46);

c) **custo próximo de zero**: a equipe não dispõe de orçamento, e a solução deve ser sustentável em escala acadêmica;

d) **manutenibilidade por equipe pequena**: três estudantes, com prazos curtos, precisam entender e evoluir todo o sistema;

e) **evolução para análise de dados**: o motor de métricas, a análise de fala e a simulação exigem um ecossistema maduro de computação científica;

f) **verificabilidade**: cada decisão deve poder ser defendida com contexto, alternativas e consequências.

## VISÃO DE CONTEXTO

A {{fig:contexto}} apresenta o diagrama de contexto (nível 1 do modelo C4), com os atores e os sistemas externos com os quais o Cogni interage (BROWN, 2018).

@@FIG|contexto|Diagrama de contexto do Cogni (C4, nível 1)|img/01_contexto.png|Elaborado pelos autores (2026).|16

O único sistema externo obrigatório é um servidor de e-mail, acessado pelo protocolo padrão SMTP. Qualquer provedor de e-mail serve, e a troca exige apenas alterar variáveis de configuração. A exportação para profissionais de saúde é iniciada pelo cuidador e não cria integração permanente.

## VISÃO DE CONTÊINERES

A {{fig:containers}} apresenta o diagrama de contêineres (nível 2 do modelo C4). Os elementos com borda tracejada são opcionais ou previstos para a segunda etapa.

@@FIG|containers|Diagrama de contêineres da arquitetura proposta (C4, nível 2)|img/02_containers.png|Elaborado pelos autores (2026).|16

A arquitetura adota o **monólito modular** como ponto de partida (FOWLER, 2015; NEWMAN, 2021). Uma única API concentra os módulos de domínio, organizados internamente por responsabilidade. Essa escolha evita a complexidade operacional de microsserviços em uma equipe de três pessoas, sem impedir a separação futura de módulos quando os limites do domínio estiverem consolidados. A única separação prevista desde já é a do *worker* assíncrono, porque a transcrição de áudio é uma tarefa demorada que não deve bloquear as requisições da interface.

## REGISTROS DE DECISÃO DE ARQUITETURA

Cada decisão relevante foi registrada como ADR, com contexto, decisão, alternativas e consequências (NYGARD, 2011). O {{qua:adr}} resume as onze decisões.

@@QUADRO|adr|Registros de decisão de arquitetura

| ID | Decisão | Alternativas consideradas | Motivo principal |
|---|---|---|---|
| D1 | Sair do BaaS (autenticação, banco e API) | Manter o Supabase; auto-hospedar o Supabase | Eliminar a dependência de código e responder à pergunta de continuidade |
| D2 | *Backend* em Python com FastAPI | Node.js com Express ou NestJS; Django | Tipagem com Pydantic, OpenAPI automático e ecossistema científico necessário ao motor de métricas e à análise de fala |
| D3 | PostgreSQL 16 em produção; SQLite apenas em testes | SQLite em produção; MySQL | Concorrência de escrita, permissões, backup e tipos avançados; SQLite tem um escritor por vez e é um arquivo local |
| D4 | SQLAlchemy 2 e Alembic | SQL manual; outro ORM | Padrão de mercado e esquema versionado no repositório |
| D5 | Autenticação própria: Argon2id, JWT de acesso curto e *refresh token* em *cookie* httpOnly | Provedor externo de identidade; sessões em servidor | Nenhum serviço externo e nenhum *token* em `localStorage` |
| D6 | Docker Compose com Caddy, API e PostgreSQL | Orquestrador Kubernetes; instalação direta | Portabilidade com baixa complexidade; roda igual em Windows, macOS e Linux |
| D7 | Servidor Linux comum (VPS) | Plataformas gerenciadas proprietárias | Custo, padrão de mercado e troca de provedor sem alteração de código |
| D8 | E-mail via SMTP padrão | API proprietária de e-mail | Qualquer provedor serve; troca por configuração |
| D9 | IA atrás de uma interface única (`LLMProvider`) | Integração direta com um provedor | IA opcional e trocável; o sistema funciona sem ela |
| D10 | Processamento de voz e fala local | API de transcrição externa | Voz é dado sensível; evita transferência internacional |
| D11 | Métricas comparadas ao baseline pessoal | Normas populacionais | Maior sensibilidade e menor risco de aparentar diagnóstico |

@@FONTE|Elaborado pelos autores (2026).

### A escolha do banco de dados e a questão do SQLite

A decisão D3 merece detalhamento, porque a pergunta "o SQLite é escalável?" surgiu durante o projeto. O SQLite é um banco embutido, excelente em leitura e amplamente usado em aplicações locais. Suas limitações para este caso são estruturais: aceita **um escritor por vez**, o que enfileira gravações simultâneas de muitas sessões; é **um arquivo no disco** do servidor, o que impede múltiplas instâncias da API e é incompatível com hospedagens efêmeras; e não oferece usuários, permissões nem segurança em nível de linha no próprio banco, recursos relevantes para dados de saúde. O PostgreSQL, por sua vez, é um sistema de código aberto com mais de três décadas de desenvolvimento, é o mesmo dialeto já usado no modelo de dados (Capítulo 8) e torna a migração essencialmente uma troca de onde o banco é executado. O SQLite permanece útil nos testes automatizados, pela rapidez de criação de bancos temporários.

### A escolha do Python

A decisão D2 considerou que o Cogni não é apenas um sistema de cadastro. Seus componentes mais inovadores (motor de métricas, simulação de coortes, transcrição e extração de marcadores de fala) dependem de bibliotecas de computação científica e de processamento de áudio cujo ecossistema mais maduro está em Python. O FastAPI, por sua vez, gera automaticamente a especificação OpenAPI da API, o que permite gerar tipos TypeScript para o *front-end* e manter os dois lados do sistema sincronizados por contrato.

## PILHA TECNOLÓGICA

O {{qua:stack}} apresenta a pilha tecnológica completa, por camada.

@@QUADRO|stack|Pilha tecnológica por camada

| Camada | Tecnologia | Papel |
|---|---|---|
| Interface | React 19, TypeScript 5, Vite 8, Tailwind CSS 4 | Telas do cuidador e da pessoa idosa |
| Roteamento e dados no cliente | React Router, TanStack Query | URLs, guarda de autenticação, cache e sincronização |
| Contrato | OpenAPI, `openapi-typescript` | Tipos do cliente gerados a partir da API |
| API | Python 3.12, FastAPI, Pydantic 2 | Endpoints, validação e serialização |
| Persistência | SQLAlchemy 2, Alembic, PostgreSQL 16 | Mapeamento, migrações versionadas e armazenamento |
| Segurança | Argon2id (`argon2-cffi`), JWT, *cookies* httpOnly | Senhas, *tokens* e sessão |
| Servidor web | Caddy | HTTPS automático, arquivos estáticos e proxy reverso |
| Empacotamento | Docker, Docker Compose | Execução idêntica em qualquer ambiente |
| Qualidade | Vitest, Testing Library, Playwright, axe, pytest, ruff, mypy | Testes, acessibilidade e análise estática |
| Integração contínua | GitHub Actions | Verificação automática a cada alteração |
| IA (opcional) | Ollama com modelo aberto; Whisper | Redação de resumos, conversa e transcrição local |

@@FONTE|Elaborado pelos autores (2026).

## ORGANIZAÇÃO DO *BACKEND*

O *backend* segue uma organização em camadas, em que cada camada depende apenas da camada inferior:

```text
backend/app/
  main.py          criação da aplicação, CORS, rotas e /health
  core/            configuração, conexão com o banco, segurança
  models/          tabelas (SQLAlchemy)
  schemas/         contratos de entrada e saída (Pydantic)
  routers/         endpoints por domínio: auth, idosos, sessoes, relatorios
  services/        regras de negócio: pontuação, motor de métricas, alertas
  simulation/      gerador de coortes sintéticas
```

As **rotas** recebem a requisição e validam a entrada com os **esquemas**. Os **serviços** concentram as regras de negócio e não conhecem detalhes do protocolo HTTP. Os **modelos** representam as tabelas. Essa separação permite testar as regras de negócio, como a pontuação e a detecção de mudança, sem subir o servidor, e trocar a forma de entrega (por exemplo, uma fila assíncrona) sem reescrever as regras.

## AUTENTICAÇÃO E AUTORIZAÇÃO

A {{fig:auth}} apresenta o fluxo de autenticação e de acesso a dados protegidos.

@@FIG|auth|Diagrama de sequência da autenticação e do acesso a dados protegidos|img/04_auth.png|Elaborado pelos autores (2026).|15

As decisões de segurança seguem as recomendações da OWASP e do NIST discutidas no Capítulo 2:

a) as senhas são armazenadas com *hash* Argon2id (BIRYUKOV *et al.*, 2021). A política exige no mínimo 8 caracteres, bloqueia senhas comuns e **não impõe regras de composição**, conforme a revisão 4 das diretrizes do NIST (NATIONAL INSTITUTE OF STANDARDS AND TECHNOLOGY, 2025). O protótipo atual exige seis caracteres com letra maiúscula e número, prática que será substituída;

b) o *token* de acesso é um JWT (JONES; BRADLEY; SAKIMURA, 2015) de curta duração (15 minutos), mantido apenas na memória do navegador. O *token* de renovação tem validade de 7 dias, trafega em *cookie* com os atributos `HttpOnly`, `Secure` e `SameSite=Strict`, é guardado no banco apenas na forma de *hash* e é **rotacionado** a cada uso, o que permite revogação;

c) a recuperação de senha sempre responde com sucesso, sem revelar se o e-mail existe, e gera um *token* aleatório de uso único, válido por 30 minutos e armazenado como *hash*;

d) o *login* e a recuperação têm limite de tentativas por endereço e por conta;

e) o **cadastro ocorre em uma única transação**: usuário, perfil do cuidador e, opcionalmente, pessoa idosa são gravados juntos ou nada é gravado. Essa decisão corrige um defeito do protótipo atual, discutido no Capítulo 12.

A **autorização** substitui a segurança em nível de linha do BaaS. Toda consulta a dados de pacientes é filtrada pelo vínculo entre o cuidador autenticado e o paciente, por meio de uma dependência única da API que carrega o recurso já verificando o vínculo. O critério é o mesmo da função `fn_tem_acesso_paciente` do modelo de dados (Capítulo 8), mas aplicado na camada de serviço. Um teste automatizado específico verifica que um cuidador que tenta acessar o paciente de outro cuidador recebe a resposta "não encontrado", e não "proibido", para não revelar a existência do registro.

## PRIVACIDADE POR ARQUITETURA

Além do controle de acesso, a arquitetura incorpora quatro medidas de privacidade:

a) **nenhuma requisição externa na interface**: a fonte tipográfica, hoje carregada de um serviço externo a cada acesso, será hospedada junto com a aplicação (RNF28). Isso evita que o endereço IP de cada usuário seja enviado a terceiros e permite o uso *offline*;

b) **processamento local de dados sensíveis**: a transcrição de voz e a extração de marcadores de fala ocorrem no servidor da aplicação, sem envio a serviços externos (D10);

c) **minimização**: o modelo de dados não armazena documento de identificação, endereço, dados financeiros nem prontuário (Capítulo 8);

d) **retenção mínima de áudio**: o áudio bruto é apagado após a extração dos marcadores, mantendo-se apenas a transcrição e as métricas, salvo consentimento explícito em contrário.

## INTELIGÊNCIA ARTIFICIAL COMO MÓDULO OPCIONAL

Coerente com os princípios do Capítulo 2, a IA generativa é isolada atrás de uma interface única. A maior parte dos servidores de modelos, incluindo servidores locais de modelos abertos, aceita o formato de requisição compatível com a API da OpenAI, o que permite trocar de provedor alterando apenas o endereço e o nome do modelo na configuração:

```python
class LLMProvider(Protocol):
    def gerar(self, instrucao: str, contexto: dict) -> str: ...

class OllamaProvider:    # modelo aberto executado no próprio servidor
    ...
class ExternalProvider:  # API externa, apenas com números agregados
    ...
class NullProvider:      # sem IA: o painel exibe apenas os alertas calculados
    def gerar(self, instrucao, contexto):
        return ""
```

Com o `NullProvider`, o sistema continua funcional, apenas sem a redação em linguagem natural. Essa propriedade permite responder à pergunta de continuidade também para a IA: **se o provedor de IA sumir, o Cogni continua funcionando**.

## IMPLANTAÇÃO, BACKUP E RESTAURAÇÃO

O sistema completo é descrito em um arquivo do Docker Compose e sobe com um único comando. O servidor de produção é uma VPS Linux comum. A escolha do Linux se deve ao custo (sem licença), à execução nativa de contêineres e ao fato de ser o padrão de mercado para servidores. O mesmo pacote roda no Windows e no macOS por meio do Docker Desktop, o que permite que cada integrante da equipe desenvolva no próprio sistema operacional com ambiente idêntico.

A {{fig:deploy}} apresenta a estratégia de backup e de troca de provedor.

@@FIG|deploy|Estratégia de backup, restauração e troca de provedor|img/08_deploy.png|Elaborado pelos autores (2026).|16

O backup é feito diariamente com a ferramenta padrão do PostgreSQL, com rotação de sete cópias diárias e quatro semanais, e copiado **para fora do servidor**. Um roteiro de restauração documentado e testado completa a estratégia, porque um backup que nunca foi restaurado não oferece garantia. A troca de provedor consiste em instalar o Docker em uma nova máquina, copiar o arquivo de composição e as variáveis de ambiente, restaurar o backup, subir os contêineres e apontar o DNS.

## INTEGRAÇÃO CONTÍNUA

A {{fig:ci}} apresenta o fluxo de integração contínua previsto. Cada alteração enviada ao repositório dispara verificações de *front-end*, *back-end*, testes de ponta a ponta com auditoria automática de acessibilidade e a validação da matriz integrada. Uma alteração só pode ser incorporada quando todas as verificações passam (HUMBLE; FARLEY, 2010).

@@FIG|ci|Fluxo de integração e entrega contínuas|img/07_ci.png|Elaborado pelos autores (2026).|16

## SÍNTESE: E SE O SERVIÇO SUMIR?

O {{qua:continuidade}} responde, componente a componente, à pergunta que motivou a revisão arquitetural.

@@QUADRO|continuidade|Plano de continuidade por componente

| Componente | Se o fornecedor deixar de existir | Esforço de substituição |
|---|---|---|
| Servidor (VPS) | Restaurar o backup em outra VPS e subir os contêineres | Minutos a poucas horas; nenhuma alteração de código |
| Banco de dados | PostgreSQL é código aberto e roda em qualquer servidor | Nenhum: faz parte do pacote |
| Autenticação | Implementada na própria API | Nenhum |
| E-mail | Trocar as variáveis SMTP | Minutos |
| Domínio e DNS | Registrar outro domínio e apontar para o servidor | Horas (propagação) |
| IA generativa | Trocar o provedor na configuração ou usar `NullProvider` | Minutos; o sistema funciona sem IA |
| Repositório de código | Cópias locais completas em cada máquina da equipe (Git distribuído) | Nenhum |

@@FONTE|Elaborado pelos autores (2026).

A resposta sintética à banca é: o Cogni não depende de nenhum serviço proprietário. A aplicação inteira, incluindo interface, API em Python e banco PostgreSQL, é empacotada em contêineres e sobe com um único comando em qualquer servidor. Se o provedor deixar de existir, o backup é restaurado em outra máquina e o mesmo comando é executado, sem alteração de código.
