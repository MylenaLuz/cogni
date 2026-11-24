# REQUISITOS E MODELAGEM DO SISTEMA

Este capítulo apresenta os atores, os requisitos funcionais e não funcionais, os casos de uso, as regras de negócio e os diagramas comportamentais do Cogni. Também registra a revisão dos requisitos motivada pela evolução do projeto. A lista completa dos requisitos funcionais está no Apêndice A.

## ATORES E PARTES INTERESSADAS

O {{qua:atores}} descreve os atores do sistema. A distinção entre usuário e beneficiário é central: o cuidador opera o sistema e toma as decisões, e a pessoa idosa realiza as atividades e se beneficia delas.

@@QUADRO|atores|Atores e partes interessadas

| Ator | Papel | Necessidades principais |
|---|---|---|
| Cuidador principal | Usuário final; cadastra pessoas, conduz sessões, acompanha o painel | Informação acionável, pouco esforço, linguagem acolhedora |
| Familiar (cuidador secundário) | Acompanha a pessoa idosa, recebe alertas, contribui com memórias afetivas | Acesso controlado, visão resumida |
| Pessoa idosa | Beneficiária; realiza as atividades | Simplicidade, poucos elementos por tela, feedback não punitivo |
| Profissional de saúde | Recebe relatórios exportados pelo cuidador | Dados objetivos, período definido, ausência de conclusões diagnósticas |
| Sistema de autenticação e e-mail | Ator de sistema | Autenticar, recuperar senha, enviar convites |

@@FONTE|Elaborado pelos autores (2026).

## REQUISITOS FUNCIONAIS

Os requisitos funcionais foram elicitados a partir da especificação original do protótipo, da pesquisa bibliográfica e de mercado e das reuniões de orientação, e organizados em dez casos de uso descritivos (VALLE; VAZ; ALVES, 2026a). O {{qua:rf_resumo}} apresenta a distribuição dos 46 requisitos funcionais por caso de uso.

@@QUADRO|rf_resumo|Distribuição dos requisitos funcionais por caso de uso

| Caso de uso | Requisitos | Síntese |
|---|---|---|
| UC01 – Realizar login | RF01 a RF04 | Campos de e-mail e senha, validação, visibilidade da senha, recuperação |
| UC02 – Visualizar dashboard | RF05 a RF09 | Totais, cartão de alerta, lista de pacientes, sessões recentes, atalhos |
| UC03 – Buscar e listar pacientes | RF10 a RF12 | Busca em tempo real, indicador de tendência, barra de índice cognitivo |
| UC04 – Cadastrar novo paciente | RF13 | Formulário de cadastro |
| UC05 – Visualizar perfil do paciente | RF14 a RF20 | Radar de cinco domínios, evolução de oito semanas, barras por domínio, observações, histórico, atalho, alerta |
| UC06 – Selecionar jogo cognitivo | RF21 a RF24 | Catálogo, metadados dos jogos, paciente ativo, área para novos jogos |
| UC07 – Executar sessão de jogo | RF25 a RF32 | Nível recomendado, jogo, *feedback*, progresso, cronômetro, resultado, observações, salvamento |
| UC08 – Gerar relatório de desempenho | RF33 a RF39 | Período, resumo, gráficos, desempenho por domínio, histórico, exportação |
| UC09 – Consultar assistente de IA | RF40 a RF43 | Histórico, sugestões, resposta contextual, indicador de digitação |
| UC10 – Visualizar e filtrar *insights* | RF44 a RF46 | *Insights* categorizados, filtros, navegação ao perfil |

@@FONTE|Adaptado de Valle, Vaz e Alves (2026a).

### Exemplo de caso de uso descritivo

Os casos de uso seguem o modelo com nome, objetivo, partes interessadas, pré-condições, pós-condições, fluxo principal, fluxos alternativos e regras de negócio (COCKBURN, 2000). O {{qua:uc07}} apresenta o UC07, que concentra a maior parte das gravações de dados do sistema.

@@QUADRO|uc07|Caso de uso UC07 – Executar sessão de jogo cognitivo

| Elemento | Descrição |
|---|---|
| Objetivo | Conduzir uma sessão de jogo cognitivo com a pessoa idosa, registrando desempenho, tempo e observações |
| Partes interessadas | Cuidador; pessoa idosa (participante) |
| Pré-condições | Um jogo e um paciente ativo foram selecionados (UC06) |
| Pós-condições | A sessão é registrada no perfil do paciente, com pontuação, duração e observações |
| Fluxo principal | 1. O cuidador seleciona o nível, a partir de recomendação baseada no perfil (RF25). 2. O sistema apresenta o jogo (RF26). 3. O sistema exibe cronômetro (RF29) e barra de progresso (RF28). 4. A cada interação, o sistema fornece *feedback* visual imediato (RF27). 5. Ao concluir, o sistema exibe pontuação, duração e erros (RF30). 6. O cuidador registra observações (RF31). 7. O sistema salva a sessão (RF32) |
| Fluxo alternativo | FA01 – Sessão interrompida: os dados parciais não são salvos |
| Regras de negócio | RN01 – O nível recomendado é calculado a partir do histórico. RN02 – Toda sessão concluída deve ser salva no perfil |

@@FONTE|Valle, Vaz e Alves (2026a).

## REQUISITOS NÃO FUNCIONAIS

Os 24 requisitos não funcionais foram organizados em seis grupos, conforme o {{qua:rnf}}.

@@QUADRO|rnf|Requisitos não funcionais originais

| Grupo | Requisitos |
|---|---|
| Desempenho | RNF01 – *Build* de produção abaixo de 300 KB. RNF02 – Resposta de interface abaixo de 16 ms (60 quadros por segundo). RNF03 – Transições entre 150 e 500 ms |
| Usabilidade | RNF04 – Navegação por barra inferior com cinco abas. RNF05 – No máximo três níveis de profundidade. RNF06 – Estados de carregamento e *feedback*. RNF07 – Estados vazios ilustrados |
| Acessibilidade | RNF08 – Contraste mínimo AA (4,5:1). RNF09 – Áreas de toque de no mínimo 36 × 36 px. RNF10 – Texto alternativo em imagens |
| Visual e design | RNF11 – Paleta teal, areia e verde-menta. RNF12 – Tipografia Nunito. RNF13 – Bordas de 8 a 16 px. RNF14 – Ícones em SVG embutido, sem biblioteca. RNF15 – Gráficos em SVG nativo |
| Técnicos | RNF16 – React 19, Vite 8, TypeScript 5.7, Tailwind CSS 4. RNF17 – TypeScript sem erros. RNF18 – Estado local, sem gerenciador global. RNF19 – Compatibilidade com o Figma Make. RNF20 – Barra de rolagem oculta. RNF21 – Largura máxima de 672 px |
| Segurança (protótipo) | RNF22 – Credenciais de teste visíveis. RNF23 – Sem persistência real. RNF24 – Sem autenticação de produção |

@@FONTE|Valle, Vaz e Alves (2026a).

## REGRAS DE NEGÓCIO

As regras de negócio dos casos de uso foram consolidadas na matriz integrada (Capítulo 6) e acrescidas de regras de segurança e de proteção de dados. O {{qua:regras}} apresenta as treze regras e a situação de cada uma na última revisão.

@@QUADRO|regras|Regras de negócio consolidadas

| ID | Regra | Situação |
|---|---|---|
| REG-001 | O acesso exige e-mail e senha válidos | Validada |
| REG-002 | Cada cuidador visualiza e altera apenas os pacientes sob sua responsabilidade | Validada |
| REG-003 | A tendência é classificada em melhora, estável ou declínio | A validar |
| REG-004 | Índice cognitivo e pontuações por domínio em escala de 0 a 100 | A validar |
| REG-005 | O alerta de declínio é priorizado visualmente | Validada |
| REG-006 | A seleção de jogo está sempre associada a um paciente ativo | Validada |
| REG-007 | O nível recomendado é calculado a partir do histórico | A validar |
| REG-008 | Somente sessões concluídas são salvas | Validada |
| REG-009 | A pontuação varia de 0 a 100 e considera acertos, erros e tentativas, com *feedback* não punitivo | A validar |
| REG-010 | O relatório considera apenas dados do período selecionado | Validada |
| REG-011 | Cada *insight* pertence a exatamente uma categoria | Validada |
| REG-012 | *Insights* e respostas do assistente apoiam a decisão, mas não diagnosticam nem prescrevem | A validar |
| REG-013 | Dados de saúde são sensíveis: minimização, consentimento, acesso restrito e exclusão a pedido | A validar |

@@FONTE|Valle, Vaz e Alves (2026c).

## MODELAGEM COMPORTAMENTAL

A modelagem comportamental foi realizada na ferramenta Miro, escolhida por ser gratuita, colaborativa em tempo real e de baixa curva de aprendizado, ainda que não valide formalmente a sintaxe UML (VALLE; VAZ; ALVES, 2026b). A {{fig:uc}} apresenta o diagrama de casos de uso do núcleo do sistema, com foco no ciclo de estimulação e acompanhamento.

@@FIG|uc|Diagrama de casos de uso do núcleo do sistema|img/uc_miro.png|Elaborado pelos autores (2026) na ferramenta Miro.|15

O caso de uso de realização da atividade **inclui** obrigatoriamente o registro do resultado (acertos, erros e tempo de resposta), porque o painel do cuidador depende dessas informações. O alerta de mudança de padrão é uma **extensão** condicional, disparada apenas quando o desempenho se desvia de forma significativa. Essa relação de extensão é, como se verá no Capítulo 10, o ponto em que o motor de métricas proposto atua.

As figuras a seguir detalham o fluxo. A {{fig:atividades}} apresenta o diagrama de atividades, a {{fig:sequencia}} apresenta o diagrama de sequência e a {{fig:raias}} reorganiza o fluxo em raias, evidenciando o responsável por cada etapa.

@@FIG|atividades|Diagrama de atividades do cadastro de memória afetiva e da realização da atividade cognitiva|img/atividades.png|Elaborado pelos autores (2026) na ferramenta Miro.|12

@@FIG|sequencia|Diagrama de sequência entre cuidador, sistema e pessoa idosa|img/sequencia.png|Elaborado pelos autores (2026) na ferramenta Miro.|15

@@FIG|raias|Diagrama de processos em raias (cuidador, sistema e pessoa idosa)|img/raias.png|Elaborado pelos autores (2026) na ferramenta Miro.|15

## REVISÃO DOS REQUISITOS

A evolução do projeto tornou parte dos requisitos originais obsoleta e revelou conflitos entre requisitos e boas práticas. Três situações foram identificadas.

**Requisitos superados pela implementação.** Os RNF22, RNF23 e RNF24 descreviam um protótipo sem persistência e sem autenticação de produção. Com a integração ao banco de dados e a autenticação real, esses requisitos foram superados deliberadamente, como já registrado no documento de modelagem de dados (VALLE; VAZ; ALVES, 2026d).

**Requisitos em conflito com acessibilidade.** O RNF09 define alvos de toque de 36 × 36 px, enquanto a especificação original do protótipo previa 48 × 48 px no modo do usuário idoso. O RNF20 determina barra de rolagem oculta, o que prejudica pessoas com menor destreza motora. Ambos foram revistos.

**Requisitos que restringem a evolução.** O RNF14 e o RNF15 proíbem bibliotecas de ícones e de gráficos. A restrição reduziu o tamanho do pacote, mas produziu código duplicado e gráficos sem representação de incerteza, necessária para mostrar a faixa pessoal de cada paciente. Os dois requisitos foram flexibilizados, mantendo o RNF01 (tamanho do pacote) como limite verificável.

Além disso, o desenvolvimento do motor de métricas, da nova arquitetura e da análise de conformidade gerou novos requisitos. O {{qua:rf_novos}} apresenta os requisitos funcionais acrescentados e o {{qua:rnf_revistos}}, os requisitos não funcionais revistos ou acrescentados.

@@QUADRO|rf_novos|Requisitos funcionais acrescentados

| ID | Requisito | Origem |
|---|---|---|
| RF47 | Registrar cada evento das sessões (estímulo, toque, acerto, erro e omissão) com carimbo de tempo em milissegundos | Variabilidade intraindividual (Capítulo 2) |
| RF48 | Calcular métricas padronizadas por jogo a partir dos eventos, com versão da fórmula registrada | DEC-002 |
| RF49 | Estimar o padrão pessoal (baseline) de cada métrica e detectar mudança sustentada | DEC-001; Capítulo 10 |
| RF50 | Ajustar a dificuldade dos jogos de forma adaptativa | README, item 6; REG-007 |
| RF51 | Oferecer modo dedicado à pessoa idosa, em tela cheia, com saída protegida | Especificação original do protótipo |
| RF52 | Cadastrar memórias afetivas (fotos, pessoas, lugares e histórias) | Casos de uso do diagrama UML |
| RF53 | Registrar o consentimento do titular, com versão e data do termo | LGPD, art. 11 |
| RF54 | Exportar todos os dados do titular e excluir a conta a pedido | LGPD, art. 18 |
| RF55 | Registrar trilha de auditoria de acessos a dados de pacientes | LGPD, art. 37 |
| RF56 | Permitir mais de um cuidador por pessoa idosa, com papéis | DEC-004 |
| RF57 | Gerar relatório em PDF para profissional de saúde | DEC-006; RF39 |
| RF58 | Exportar métricas no padrão HL7 FHIR | Interoperabilidade (RNDS) |
| RF59 | Encerrar a sessão do usuário (*logout*) | Auditoria de código |

@@FONTE|Elaborado pelos autores (2026).

@@QUADRO|rnf_revistos|Requisitos não funcionais revistos ou acrescentados

| ID | Requisito | Situação |
|---|---|---|
| RNF09 | Alvos de toque de no mínimo 48 × 48 px no modo da pessoa idosa e 44 × 44 px no modo do cuidador | Revisto |
| RNF14 / RNF15 | Bibliotecas de ícones e gráficos permitidas, desde que o RNF01 seja respeitado | Revisto |
| RNF20 | Barra de rolagem visível | Revisto |
| RNF22–24 | Credenciais de teste ocultas; persistência e autenticação reais | Superados |
| RNF25 | Portabilidade: o sistema completo deve subir com um único comando em qualquer servidor com Docker | Novo |
| RNF26 | Nenhum serviço proprietário obrigatório para o funcionamento do sistema | Novo |
| RNF27 | Backup diário fora do servidor e restauração testada | Novo |
| RNF28 | Nenhuma requisição a domínios externos na interface (inclusive fontes) | Novo |
| RNF29 | Senhas com mínimo de 8 caracteres, sem regras de composição e com bloqueio de senhas comuns; *hash* Argon2id | Novo |
| RNF30 | Contraste AAA no modo da pessoa idosa | Novo |
| RNF31 | Linguagem não diagnóstica em toda a interface | Novo |
| RNF32 | Cobertura de testes automatizados nos módulos de pontuação e de detecção de mudança | Novo |

@@FONTE|Elaborado pelos autores (2026).

## RECONCILIAÇÃO DOS CATÁLOGOS DE CASOS DE USO

O projeto produziu dois catálogos de casos de uso em disciplinas diferentes. O diagrama UML da disciplina de Processos de Software modela o núcleo do ciclo de cuidado, com quatro casos de uso (cadastrar memória afetiva, realizar atividade, registrar resultado e emitir alerta de mudança) e três atores (cuidador, pessoa idosa e familiar). Os casos de uso descritivos modelam as telas do protótipo, com dez casos de uso centrados no cuidador.

Em vez de escolher um dos catálogos, a equipe os tratou como **visões complementares**: o primeiro descreve o ciclo de valor, e o segundo descreve a operação da interface. A reconciliação consistiu em acrescentar ao catálogo descritivo os casos de uso que só existiam no diagrama UML (memória afetiva e alerta de mudança de padrão, este último formalizado pelo RF49) e o ator familiar, formalizado pelo RF56.
