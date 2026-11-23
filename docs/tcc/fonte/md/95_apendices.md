# APÊNDICE A – LISTA COMPLETA DOS REQUISITOS FUNCIONAIS {.unnumbered .apendice}

@@QUADRO|rf_completo|Requisitos funcionais RF01 a RF46

| ID | Requisito | UC |
|---|---|---|
| RF01 | Exibir tela de login com campos de e-mail e senha | UC01 |
| RF02 | Validar as credenciais e exibir mensagem de erro em caso de falha | UC01 |
| RF03 | Alternar a visibilidade da senha | UC01 |
| RF04 | Oferecer fluxo de recuperação de senha | UC01 |
| RF05 | Exibir totais de pacientes ativos, sessões do dia e alertas críticos | UC02 |
| RF06 | Destacar cartão de alerta para paciente com mudança desfavorável | UC02 |
| RF07 | Exibir lista resumida de pacientes com índice e tendência | UC02 |
| RF08 | Exibir sessões recentes com pontuação e data | UC02 |
| RF09 | Oferecer atalhos para nova sessão e para *insights* | UC02 |
| RF10 | Buscar pacientes por nome ou diagnóstico em tempo real | UC03 |
| RF11 | Exibir indicador visual de tendência (melhora, estável, declínio) | UC03 |
| RF12 | Exibir barra de progresso do índice cognitivo | UC03 |
| RF13 | Cadastrar novo paciente | UC04 |
| RF14 | Exibir gráfico radar dos cinco domínios cognitivos | UC05 |
| RF15 | Exibir gráfico de evolução do índice nas últimas oito semanas | UC05 |
| RF16 | Exibir barras de desempenho por domínio | UC05 |
| RF17 | Exibir observações registradas do paciente | UC05 |
| RF18 | Exibir histórico de sessões com jogo, data, duração, nível e pontuação | UC05 |
| RF19 | Oferecer atalho para iniciar nova sessão a partir do perfil | UC05 |
| RF20 | Exibir alerta no topo do perfil, quando aplicável | UC05 |
| RF21 | Exibir catálogo com os jogos disponíveis | UC06 |
| RF22 | Exibir categoria, duração estimada e número de níveis de cada jogo | UC06 |
| RF23 | Exibir o paciente ativo com opção de troca | UC06 |
| RF24 | Exibir área reservada para novos jogos | UC06 |
| RF25 | Selecionar o nível a partir de recomendação automática | UC07 |
| RF26 | Apresentar o jogo de associação imagem–palavra | UC07 |
| RF27 | Fornecer *feedback* visual imediato de acerto e erro | UC07 |
| RF28 | Exibir barra de progresso da sessão | UC07 |
| RF29 | Exibir cronômetro de duração | UC07 |
| RF30 | Exibir tela de resultado com pontuação, duração e erros | UC07 |
| RF31 | Registrar observações pós-sessão | UC07 |
| RF32 | Salvar a sessão no perfil do paciente | UC07 |
| RF33 | Selecionar paciente e período (semana, mês, três meses) | UC08 |
| RF34 | Exibir cartões de resumo: índice geral, total de sessões e duração média | UC08 |
| RF35 | Exibir gráfico de evolução do índice cognitivo | UC08 |
| RF36 | Exibir gráfico de barras de sessões por semana | UC08 |
| RF37 | Exibir desempenho por domínio com cores distintas | UC08 |
| RF38 | Exibir tabela com o histórico completo de sessões | UC08 |
| RF39 | Exportar o relatório | UC08 |
| RF40 | Exibir histórico de mensagens do assistente | UC09 |
| RF41 | Apresentar sugestões de perguntas rápidas | UC09 |
| RF42 | Retornar resposta contextual baseada nos dados dos pacientes | UC09 |
| RF43 | Exibir indicador de processamento da resposta | UC09 |
| RF44 | Exibir *insights* categorizados em alerta, melhora, recomendação e tendência | UC10 |
| RF45 | Filtrar *insights* por tipo e por paciente | UC10 |
| RF46 | Navegar do *insight* ao perfil do paciente relacionado | UC10 |

@@FONTE|Adaptado de Valle, Vaz e Alves (2026a).

# APÊNDICE B – EXEMPLO DE REGISTRO DE DECISÃO DE ARQUITETURA {.unnumbered .apendice}

**ADR 0003 – Banco de dados de produção**

**Situação:** aceita.

**Contexto.** O Cogni armazena dados pessoais sensíveis de saúde, com gravações concorrentes de sessões de jogo por muitos cuidadores e necessidade de backup, controle de acesso e auditoria. A equipe questionou se o SQLite seria suficiente, por sua simplicidade.

**Decisão.** Usar PostgreSQL 16 em produção e SQLite apenas em testes automatizados.

**Alternativas consideradas.** (1) SQLite em produção: simples e sem servidor, mas com um escritor por vez, armazenamento em arquivo local, ausência de usuários e permissões no banco e incompatibilidade com múltiplas instâncias da API. (2) MySQL: maduro, mas o modelo de dados já foi escrito em PostgreSQL, com tipos enumerados, `TIMESTAMPTZ`, índices de trigramas e segurança em nível de linha. (3) Banco gerenciado proprietário: conveniente, mas contrário à decisão D1.

**Consequências.** Positivas: concorrência adequada, segurança em nível de linha como defesa em profundidade, ferramentas padrão de backup e migração quase direta do modelo existente. Negativas: um contêiner a mais para operar e necessidade de rotina de backup e de teste de restauração, ambas incluídas no plano de execução.

# APÊNDICE C – CÓDIGO-FONTE DA SIMULAÇÃO DA COORTE SINTÉTICA {.unnumbered .apendice}

O código a seguir, em Python, gera a coorte sintética, aplica os dois detectores e calcula as métricas apresentadas no Capítulo 11. A execução com a semente indicada reproduz exatamente os resultados relatados.

[[SIMCODE]]
