# MODELO DE DADOS

O modelo de dados do Cogni foi derivado diretamente dos dez casos de uso e dos 46 requisitos funcionais, de modo que cada estrutura possa ser rastreada até uma necessidade concreta (VALLE; VAZ; ALVES, 2026d). Este capítulo apresenta a metodologia de modelagem, o modelo conceitual, as decisões do modelo lógico, as restrições de integridade, as rotinas automatizadas, a estratégia de segurança e as adaptações necessárias para a arquitetura proposta.

## METODOLOGIA DE MODELAGEM

A modelagem seguiu os três níveis de abstração consagrados na literatura (HEUSER, 2009; ELMASRI; NAVATHE, 2018). No **nível conceitual**, independente de tecnologia, foram identificadas entidades, atributos e relacionamentos a partir da leitura dos casos de uso, com a notação entidade-relacionamento de Chen (1976). No **nível lógico**, o esquema foi convertido para o modelo relacional de Codd (1970), com chaves primárias, chaves estrangeiras e resolução dos relacionamentos muitos-para-muitos por entidades associativas. No **nível físico**, o esquema foi expresso na linguagem de definição de dados do PostgreSQL, com tipos, restrições, índices, gatilhos e políticas de acesso.

As entidades foram identificadas a partir dos substantivos recorrentes nos casos de uso e nas regras de negócio. Cada candidato foi avaliado quanto à existência própria, à presença de atributos descritivos e à necessidade de persistência, critérios que distinguem uma entidade de um atributo (HEUSER, 2009). Assim, "paciente" e "sessão" tornaram-se entidades, enquanto "tendência" e "nível" permaneceram como atributos de domínio enumerado.

O esquema está na **terceira forma normal**: não há grupos repetitivos nem atributos multivalorados, os atributos não chave dependem da totalidade da chave primária e não há dependências transitivas. A única redundância admitida está nas tabelas de índice cognitivo e de relatório, que armazenam valores agregados recalculáveis a partir das sessões. Trata-se de desnormalização deliberada, justificada pela frequência de leitura dos gráficos de evolução e pela necessidade de preservar o valor apurado em cada período (SILBERSCHATZ; KORTH; SUDARSHAN, 2012).

## MODELO CONCEITUAL

A análise resultou em dezessete entidades, agrupadas em cinco conjuntos funcionais, conforme o {{qua:entidades}}.

@@QUADRO|entidades|Entidades do modelo de dados por conjunto funcional

| Conjunto | Entidades | Responsabilidade |
|---|---|---|
| Identidade e acesso | `cuidador`, `paciente`, `cuidador_paciente` | Quem usa o sistema, quem é acompanhado e o vínculo que autoriza o acesso |
| Catálogos | `dominio_cognitivo`, `jogo`, `jogo_dominio` | Informação de referência, estável e compartilhada |
| Operação das sessões | `sessao`, `sessao_dominio`, `sessao_evento`, `observacao_clinica` | Aplicação dos jogos e desempenho observado |
| Análise e acompanhamento | `indice_cognitivo`, `indice_dominio`, `insight`, `relatorio` | Consolidação em indicadores de evolução |
| Assistente e auditoria | `conversa_ia`, `mensagem_ia`, `log_acesso` | Assistente conversacional e trilha de auditoria |

@@FONTE|Adaptado de Valle, Vaz e Alves (2026d).

A entidade `paciente` ocupa posição estrutural privilegiada: praticamente todas as entidades transacionais a referenciam, direta ou indiretamente, o que permite concentrar nela o critério único de autorização. A {{fig:der}} apresenta o diagrama entidade-relacionamento completo.

@@FIG|der|Diagrama entidade-relacionamento do Cogni|img/der.png|Valle, Vaz e Alves (2026d).|16

Os dois relacionamentos originalmente muitos-para-muitos, entre cuidador e paciente e entre jogo e domínio cognitivo, foram decompostos nas entidades associativas `cuidador_paciente` e `jogo_dominio`. A primeira permite que mais de um cuidador acompanhe o mesmo paciente, com papéis distintos (principal, secundário e somente leitura), o que resolve a decisão DEC-004 da matriz integrada. A segunda associa cada jogo aos domínios que estimula, com um **peso**: o jogo de associação de imagens, por exemplo, estimula memória com peso 1,0, habilidade visuoespacial com peso 0,6 e linguagem com peso 0,4.

## MODELO LÓGICO

O {{qua:decisoes_logicas}} apresenta as principais decisões do modelo lógico e sua justificativa.

@@QUADRO|decisoes_logicas|Decisões do modelo lógico

| Decisão | Justificativa |
|---|---|
| Chaves UUID geradas no banco nas entidades transacionais | Não revelam volume de registros nem permitem enumeração por tentativa, propriedade relevante para dados de saúde |
| Chaves inteiras nos catálogos | Conjuntos pequenos e estáveis, frequentemente usados em junções |
| Quinze tipos enumerados nativos | Validação pelo próprio sistema de tipos, sem junções de leitura |
| `TIMESTAMPTZ` em todos os campos temporais | Preserva o fuso horário e evita ambiguidade na apuração de semanas (DEC-007) |
| Exclusão lógica (`ativo`) em cuidador, paciente e jogo | Preserva o histórico quando o acompanhamento é encerrado |
| Separação entre eventos brutos e indicadores consolidados | Permite recalcular toda a série histórica se a fórmula mudar |

@@FONTE|Adaptado de Valle, Vaz e Alves (2026d).

Entre os tipos enumerados estão o diagnóstico informado (Alzheimer, Parkinson, demência vascular, demência com corpos de Lewy, CCL e outro), o estágio da doença (leve, moderado e avançado), o papel do vínculo, o nível de dificuldade, o estado da sessão (em andamento, concluída e interrompida), a tendência (melhora, estável e declínio), o tipo de *insight*, a origem do *insight* (regra ou IA) e a ação de auditoria (consulta, inserção, alteração, exclusão e exportação).

### Dicionário de dados das tabelas centrais

O dicionário de dados completo descreve todos os atributos das dezessete tabelas. O {{qua:dic_sessao}} e o {{qua:dic_evento}} apresentam as duas tabelas mais importantes para o motor de métricas.

@@QUADRO|dic_sessao|Dicionário de dados da tabela sessao

| Atributo | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador da sessão |
| `paciente_id` | UUID | FK, NOT NULL, CASCADE | Paciente que realizou a sessão |
| `cuidador_id` | UUID | FK, NOT NULL, RESTRICT | Cuidador que aplicou a sessão |
| `jogo_id` | SMALLINT | FK, NOT NULL, RESTRICT | Jogo aplicado |
| `nivel_aplicado` | `nivel_dificuldade` | NOT NULL | Nível efetivamente jogado |
| `nivel_recomendado` | `nivel_dificuldade` | NULL | Nível sugerido pelo sistema (RF25) |
| `status` | `status_sessao` | NOT NULL | Em andamento, concluída ou interrompida |
| `iniciada_em`, `finalizada_em` | TIMESTAMPTZ | CHECK fim ≥ início | Início e fim |
| `duracao_segundos` | INTEGER | Derivado por gatilho | Duração (RF30) |
| `total_itens`, `total_acertos`, `total_erros` | SMALLINT | CHECK acertos + erros ≤ itens | Contagens |
| `pontuacao` | NUMERIC(5,2) | CHECK 0 a 100 | Pontuação (RF12) |
| `observacoes_clinicas` | TEXT | NULL | Observações do cuidador (RF31) |

@@FONTE|Adaptado de Valle, Vaz e Alves (2026d).

@@QUADRO|dic_evento|Dicionário de dados da tabela sessao_evento

| Atributo | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | BIGINT | PK, identidade | Identificador do evento |
| `sessao_id` | UUID | FK, CASCADE | Sessão a que o evento pertence |
| `ordem` | SMALLINT | UNIQUE com `sessao_id` | Ordem do evento na sessão |
| `item_apresentado` | VARCHAR(120) | NOT NULL | Estímulo exibido |
| `resposta_informada` | VARCHAR(120) | NULL | Resposta dada, se houver |
| `correta` | BOOLEAN | NOT NULL | Acerto ou erro |
| `tempo_resposta_ms` | INTEGER | CHECK ≥ 0 | Tempo de reação em milissegundos |
| `registrado_em` | TIMESTAMPTZ | NOT NULL | Momento do registro |

@@FONTE|Adaptado de Valle, Vaz e Alves (2026d).

A existência da tabela `sessao_evento` no modelo é um acerto importante da modelagem: ela já prevê o registro de cada interação com seu tempo de resposta, base para a variabilidade intraindividual discutida no Capítulo 2. O protótipo atual, porém, ainda não grava esses eventos, lacuna tratada no Capítulo 12.

## RESTRIÇÕES DE INTEGRIDADE

A integridade de entidade é garantida por chaves primárias em todas as tabelas. A integridade referencial usa ações de propagação escolhidas conforme a semântica de cada vínculo:

a) `ON DELETE CASCADE` nos registros que não existem sem o pai, como as sessões e os índices de um paciente excluído. A medida também operacionaliza o direito de eliminação previsto na LGPD;

b) `ON DELETE RESTRICT` nas referências a catálogos e ao cuidador responsável, impedindo que a remoção de um jogo ou usuário apague o histórico;

c) `ON DELETE SET NULL` nas referências opcionais, como a sessão associada a uma observação, para que a anotação sobreviva à exclusão da sessão.

As regras de negócio verificáveis em uma única linha foram implementadas como restrições `CHECK`, de modo que sua observância independa da aplicação: pontuação entre 0 e 100; soma de acertos e erros limitada ao total de itens; data de nascimento anterior à data atual; sessão concluída obrigada a ter data de encerramento e pontuação (formalização da RN02 do UC07); observação pós-sessão obrigada a referenciar uma sessão; e descrição livre do diagnóstico obrigatória quando o valor é "outro". Restrições de unicidade impedem duplicação semântica, como um único índice consolidado por paciente e semana.

## ROTINAS, ÍNDICES E VISÕES

Cinco rotinas em PL/pgSQL automatizam comportamentos que, de outro modo, dependeriam da disciplina da aplicação: atualização automática da data de alteração; cálculo da duração da sessão; criação automática do vínculo entre o cuidador e o paciente que ele cadastra; consolidação do índice cognitivo semanal a partir das sessões concluídas; e verificação de acesso, base de todas as políticas de segurança.

A rotina de consolidação, `fn_consolidar_indice`, calcula a média semanal das pontuações e classifica a tendência com **limiar de 5%** sobre o índice do período anterior: variação positiva igual ou superior a 5% caracteriza melhora, variação negativa de mesma magnitude caracteriza declínio e os demais casos, estabilidade. Essa regra, a primeira formalização concreta da decisão DEC-001, foi avaliada quantitativamente no Capítulo 11, com resultado que motivou a proposta do motor de métricas.

Treze índices atendem aos padrões de consulta dos casos de uso, incluindo um índice de trigramas para a busca por nome em tempo real (RF10), índices compostos por paciente e data decrescente para as listagens e índices parciais para sessões em andamento e *insights* não lidos. Duas visões encapsulam as consultas mais complexas: `vw_paciente_resumo`, que reúne índice mais recente, tendência, última sessão e total de sessões (RF07, RF11 e RF12), e `vw_dashboard_totais`, que calcula os totais do painel por cuidador (RF05 e RF06). O esquema foi verificado em uma instância PostgreSQL 16, com inserção de dados de teste e validação das restrições, dos gatilhos e das visões.

## SEGURANÇA E PROTEÇÃO DE DADOS

O modelo aplica o controle de acesso no próprio banco, e não apenas na interface. Todas as tabelas com dados de pacientes têm segurança em nível de linha habilitada, e todas as políticas derivam de uma única função, `fn_tem_acesso_paciente`, que verifica a existência de vínculo ativo entre o usuário autenticado e o paciente. A centralização elimina a possibilidade de regras divergentes entre tabelas. As tabelas de catálogo, sem dados pessoais, são legíveis por qualquer usuário autenticado.

O princípio da minimização orientou a escolha dos atributos: o esquema não armazena documento de identificação, endereço, dado financeiro nem prontuário completo. A tabela `log_acesso` registra as operações sobre dados pessoais, atendendo ao dever de registro do art. 37 da LGPD.

## ADAPTAÇÕES PARA A ARQUITETURA PROPOSTA

A migração para a arquitetura do Capítulo 7 preservou quase todo o modelo, porque ele já foi escrito em PostgreSQL padrão. As adaptações feitas na versão final, aplicadas por duas migrações versionadas com Alembic, estão no {{qua:adaptacoes}}.

@@QUADRO|adaptacoes|Adaptações do modelo de dados na versão final

| Ponto | Modelo original | Versão final |
|---|---|---|
| Identidade | `cuidador.id` referencia `auth.users`, do BaaS | Nova tabela `usuario`, com e-mail único e *hash* Argon2id, e tabela `refresh_token` |
| Controle de acesso | Políticas de segurança em nível de linha com a função `auth.uid()` do BaaS | Autorização na API, por papel, em todas as rotas, coberta por testes automatizados. As políticas no banco, como segunda barreira, ficam para o TCC II |
| Eventos de sessão | Tabela `sessao_evento` com item, resposta, acerto e tempo | Acrescentar tipo de evento (estímulo, toque, omissão), posição e metadados em JSONB |
| Versão da pontuação | Inexistente | Coluna `versao_pontuacao` em `sessao`, para recálculo controlado |
| Consentimento | Inexistente | Tabela `consentimento`, com titular, finalidade, versão do termo e data |
| Papéis no acompanhamento | Coluna `papel` em `cuidador_paciente`, sem regras | Papéis `responsavel`, `cuidador` e `acompanhante`, com restrição de valores e data do vínculo; o valor antigo "principal" é convertido em "responsavel" pela migração |
| Instituições | Inexistente | Tabelas `instituicao` e `membro_instituicao` (papéis `gestor` e `profissional`; cada cuidador em no máximo uma instituição) e coluna `instituicao_id` em `paciente` |
| Convites | Inexistente | Tabela `convite`, com resumo criptográfico do código, alvo (pessoa ou instituição), papel, validade e uso |
| Memória afetiva | Inexistente | Prevista para o TCC II |
| Nomes no código | O protótipo gravava em `cuidadores` e `idosos` | Alinhados ao modelo (`cuidador` e `paciente`) |
| Migrações | *Script* SQL único | Migrações versionadas com Alembic, testadas na subida e na reversão |

@@FONTE|Elaborado pelos autores (2026).

Na versão final, a barreira de acesso está na API: toda consulta a dados de uma pessoa passa por uma única função que verifica o papel do cuidador, e os testes automatizados cobrem cada papel e o isolamento entre cuidadores e instituições. Reativar as políticas de segurança em nível de linha no PostgreSQL, como segunda barreira independente da API, é um item do roteiro do TCC II: uma falha em uma das camadas deixaria de expor, sozinha, dados de outros cuidadores.
