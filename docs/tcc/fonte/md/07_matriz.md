# MATRIZ INTEGRADA DE PROCESSOS, DADOS E INTELIGÊNCIA ARTIFICIAL

Em um projeto pequeno, cada documento descreve uma parte do sistema: os casos de uso descrevem interações, os diagramas descrevem fluxos, o modelo de dados descreve tabelas e o código implementa telas. Nenhum deles mostra as ligações. Quando uma regra muda, a pergunta "quais telas, tabelas e testes são afetados?" não tem resposta imediata. Este capítulo relata como a equipe construiu e automatizou uma **matriz integrada de processos, dados e IA** para responder a essa pergunta, e o que a matriz revelou sobre o próprio projeto (VALLE; VAZ; ALVES, 2026c; 2026e).

## ESTRUTURA DA MATRIZ

A matriz segue o modelo proposto na disciplina, com onze abas: Leia-me, Funcionalidades, Processos, Atividades, Regras, Dicionário de Tabelas, Dicionário de Campos, Atividade–Dados, Rastreabilidade, IA–*Prompts* e Decisões–Dúvidas. Cada registro recebe um identificador estável e nunca reaproveitado, com prefixo que indica o tipo (FUN, PROC, ATV, REG, TAB, CAM, REL, TR e DEC). A {{fig:matriz}} mostra como as abas se encadeiam.

@@FIG|matriz|Encadeamento das abas da matriz integrada|img/09_matriz.png|Elaborado pelos autores (2026).|15

A construção seguiu sete passos:

a) cada caso de uso tornou-se uma **funcionalidade**, com ator, prioridade e situação;

b) as funcionalidades foram agrupadas em **processos de negócio**, com evento de início, resultado e responsável;

c) cada processo foi decomposto em **atividades** ordenadas, com regras associadas e fluxo de exceção;

d) as **regras** de negócio, de segurança e de proteção de dados foram registradas;

e) o modelo de dados virou um **dicionário de tabelas e campos**, com classificação de sensibilidade;

f) cada atividade foi ligada aos dados que **lê, cria, atualiza ou exclui**;

g) tudo foi consolidado na aba de **rastreabilidade**, com o impacto esperado de mudanças.

## A MATRIZ EM NÚMEROS

A {{tab:matriz_numeros}} apresenta a dimensão da matriz na última revisão.

@@TABELA|matriz_numeros|Dimensão da matriz integrada

| Elemento | Quantidade |
|---|---|
| Funcionalidades (FUN) | 11 |
| Processos de negócio (PROC) | 6 |
| Atividades (ATV) | 23 |
| Regras (REG) | 13 |
| Tabelas (TAB) | 7 |
| Campos (CAM) | 50 |
| Relações atividade–dados (REL) | 21 |
| Itens de rastreabilidade gerados (TR) | 57 |
| Decisões e dúvidas registradas (DEC) | 7 |
| Referências cruzadas verificadas automaticamente | 386 |

@@FONTE|Valle, Vaz e Alves (2026e).

Os seis processos de negócio são: autenticação do cuidador (PROC-001), acompanhamento no painel de métricas (PROC-002), gestão de pacientes (PROC-003), sessão de estimulação cognitiva (PROC-004), relatórios de desempenho (PROC-005) e *insights* e assistente de IA (PROC-006). A sessão de estimulação cognitiva é o maior processo, com cinco atividades, e o que mais grava dados no sistema.

## AUTOMATIZAÇÃO

Uma matriz mantida à mão tende a perder consistência: identificadores são referenciados sem existir, a aba de rastreabilidade fica defasada e as contagens precisam ser refeitas a cada alteração. Esse é o principal motivo de abandono de matrizes de rastreabilidade (CLELAND-HUANG *et al.*, 2014). Para evitar esse destino, a equipe automatizou a geração da matriz com três artefatos:

a) **cogni_matriz.json**: fonte única de verdade com todos os registros;

b) **gerar_matriz.py**: *script* em Python que lê o JSON, valida as referências e escreve a planilha com a mesma estrutura, cores, filtros e painéis congelados do modelo;

c) **planilha gerada**: as onze abas do modelo e duas abas adicionais produzidas automaticamente, Validação e Resumo.

A equipe edita apenas o JSON e executa o *script*. A aba de rastreabilidade nunca é editada à mão: ela é derivada das relações declaradas nas demais abas. O *script* verifica 386 referências cruzadas e detecta identificadores inexistentes, duplicados, campos associados à tabela errada, atividades cujo processo não confere e funcionalidades que apontam para processos que não as listam de volta. Em caso de problema, lista cada ocorrência e encerra com código de erro, o que permite integrá-lo à integração contínua. Em um teste com um arquivo deliberadamente errado, em que a atividade ATV-001 apontava para a regra inexistente REG-099, o *script* acusou o erro e encerrou com falha. Os indicadores da aba Resumo são escritos como fórmulas da planilha, de modo que permanecem corretos mesmo se alguém editar a planilha diretamente.

## O QUE A MATRIZ REVELOU

Preencher uma estrutura com relações obrigatórias funcionou como uma revisão sistemática dos documentos do projeto, efeito também descrito na literatura sobre problemas de documentação (AGHAJANI *et al.*, 2019). Seis achados se destacam.

**A interface estava à frente das regras e dos dados.** Na revisão, 15 das 23 atividades tinham protótipo de tela, mas apenas 7 das 13 regras estavam validadas e nenhuma das 7 tabelas estava implementada. A consequência prática foi a decisão de tratar a definição das regras pendentes como **condição** para implementar o banco, e não como tarefa posterior.

**Os documentos se contradiziam.** O catálogo de jogos dos casos de uso (Associação de Imagens, Sequência de Palavras, Reconheça o Som e Labirinto Cognitivo) tinha apenas um jogo em comum com o catálogo implementado no protótipo (Velocidade de Atenção, Associação de Pares, Categorias e Associação de Imagens), divergência registrada como DEC-003. Nenhum documento definia como calcular a tendência do paciente nem o índice cognitivo geral (DEC-001 e DEC-002).

**Uma regra atravessa o sistema.** Oito das 23 atividades dependem da REG-002 (cada cuidador só vê os seus pacientes). Por isso, a decisão sobre permitir mais de um cuidador por paciente (DEC-004) foi antecipada para antes da implementação dos cadastros.

**Os pontos críticos de teste ficaram evidentes.** O {{qua:crud}} mostra quem lê e quem grava cada tabela. As tabelas de sessão e de métrica cognitiva concentram 10 das 21 relações. A métrica é lida por quatro atividades e atualizada por apenas uma (ATV-017): um erro nela se propaga para o painel, o perfil, a recomendação de nível e os relatórios.

@@QUADRO|crud|Operações de cada processo sobre as tabelas (L = lê; C = cria; A = atualiza)

| Processo | cuidador | paciente | jogo | sessão | métrica cognitiva | insight | mensagem |
|---|---|---|---|---|---|---|---|
| Autenticação | L | | | | | | |
| Painel de métricas | | L | | L | L | L | |
| Gestão de pacientes | | L·C | | L | L | | |
| Sessão de estimulação | | | L | C | L·A | | |
| Relatórios | | | | L | L | | |
| *Insights* e IA | | | | | | L·C | C |

@@FONTE|Valle, Vaz e Alves (2026c).

**A matriz mostrou as próprias lacunas.** As atividades de relatório (ATV-018 e ATV-020) não declaravam a leitura dos dados que usam. A atividade de geração de *insights* (ATV-021) criava registros sem declarar a leitura das métricas que deveriam fundamentá-los. E **nenhuma relação excluía dados**, embora a LGPD exija a eliminação a pedido do titular. Uma célula vazia também é informação.

**Sete decisões estavam em aberto.** O {{qua:decisoes}} apresenta as decisões registradas, o encaminhamento proposto na matriz e a resolução adotada neste trabalho.

@@QUADRO|decisoes|Decisões em aberto e resolução adotada

| ID | Questão | Encaminhamento proposto na matriz | Resolução neste trabalho |
|---|---|---|---|
| DEC-001 | Como calcular a tendência do paciente | Comparar médias de quatro semanas | Baseline pessoal robusto e CUSUM, avaliados em coorte sintética (Capítulos 10 e 11) |
| DEC-002 | Pontuação por jogo, índice geral e nível | Documentar por jogo e alinhar com o orientador | Métricas padronizadas e versionadas calculadas a partir de eventos brutos (Capítulo 10) |
| DEC-003 | Catálogo de jogos divergente | Unificar a documentação e a carga da tabela de jogos | Catálogo do protótipo adotado como oficial; jogos dos casos de uso mantidos como planejados |
| DEC-004 | LGPD: consentimento, retenção, exclusão e multicuidador | Definir antes dos cadastros básicos | Tabela de vínculos N:N com papéis, consentimento versionado, exportação e exclusão (Capítulo 8) |
| DEC-005 | *Insights* por regras fixas ou por LLM | Regras determinísticas no TCC I; LLM depois | Mantido: regras determinísticas; LLM opcional apenas para redação (Capítulo 10) |
| DEC-006 | Exportar relatório sem bibliotecas pesadas | Impressão nativa do navegador | PDF gerado no servidor, previsto para o TCC II; na versão final, exportação em CSV e JSON |
| DEC-007 | Fuso horário de sessões e semanas | Guardar em UTC e exibir no fuso de São Paulo | Mantido; campos `TIMESTAMPTZ` no banco |

@@FONTE|Elaborado pelos autores (2026), com base em Valle, Vaz e Alves (2026c).

## A MATRIZ COMO CONTEXTO PARA INTELIGÊNCIA ARTIFICIAL

A aba IA–*Prompts* adapta seis usos orientados da IA generativa ao contexto do projeto: análise de impacto, revisão de consistência, geração de cenários de teste, apoio à documentação, mudanças no modelo de dados e orientações de uso responsável. A matriz oferece à IA um contexto **organizado e identificado**, o que reduz respostas genéricas e permite conferir cada afirmação pelo identificador citado. Três regras foram adotadas: a IA responde apenas com base nos registros fornecidos, citando os identificadores; toda resposta é sugestão e é conferida por uma pessoa antes de qualquer decisão; e apenas dados fictícios são usados, porque os dados reais seriam dados de saúde, sensíveis pela LGPD.

## LIMITAÇÕES

O relato tem limitações que devem ser explicitadas: trata-se de um único projeto pequeno, avaliado pelo próprio grupo, com viés de autorrelato; o esforço de construir e manter a matriz não foi medido; a situação de cada item é declarada pela equipe, e não extraída do código; a matriz foi construída antes do modelo de dados completo e, por isso, documenta 7 tabelas, enquanto o modelo final tem 17; e a qualidade das respostas da IA não foi avaliada de forma sistemática. Os trabalhos futuros incluem executar o *script* a cada alteração no repositório, extrair parte dos dados diretamente do esquema do banco e dos tipos do código, incluir as operações de exclusão exigidas pela LGPD e sincronizar a matriz com o modelo de 17 tabelas.
