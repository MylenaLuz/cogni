# DESAFIOS ENCONTRADOS E SOLUÇÕES ADOTADAS

Um trabalho de engenharia não se mede apenas pelo que funcionou, mas também pela forma como os problemas foram percebidos e enfrentados. Este capítulo consolida os principais desafios do projeto, suas causas e as soluções adotadas ou propostas, e encerra com as lições aprendidas.

## SÍNTESE DOS DESAFIOS

O {{qua:desafios}} apresenta os desafios em ordem aproximada de impacto.

@@QUADRO|desafios|Desafios encontrados, causas e soluções

| # | Desafio | Causa | Solução |
|---|---|---|---|
| 1 | Continuidade: "se o serviço sumir, o software some junto?" | Código acoplado à API de um provedor BaaS | Arquitetura soberana: API própria, PostgreSQL e contêineres portáveis (Capítulo 7) |
| 2 | Regra de tendência gera alertas a cada três ou quatro semanas | Comparação semanal com limiar fixo de 5%, sensível ao ruído | Baseline pessoal robusto e CUSUM, avaliados em coorte sintética (Capítulos 10 e 11) |
| 3 | Pontuações arbitrárias e incomparáveis | Cada jogo com fórmula própria, calculada na interface | Eventos brutos e pontuação padronizada e versionada no servidor (Capítulo 10) |
| 4 | Principal sinal cognitivo não era coletado | Jogos registravam apenas o resultado final | Registro de cada evento com tempo em milissegundos (RF47) |
| 5 | Documentos contraditórios | Artefatos produzidos em disciplinas e momentos diferentes | Matriz integrada automatizada e reconciliação explícita (Capítulos 5 e 6) |
| 6 | Interface à frente das regras e dos dados | Prototipação rápida antes da modelagem | Regras pendentes tratadas como condição para implementar o banco |
| 7 | Defeitos que comprometeriam a demonstração | Protótipo gerado rapidamente e integrado aos poucos | Auditoria técnica e correção dos quinze achados antes de novas funcionalidades (Capítulo 9) |
| 8 | Linguagem com aparência diagnóstica | Textos simulados escritos sem critério regulatório | Linguagem não diagnóstica como requisito (RNF31) e guia de formulações (Capítulo 10) |
| 9 | Lacunas de LGPD (exclusão, consentimento, multicuidador) | Proteção de dados tratada como tema posterior | Consentimento versionado, exportação, exclusão, auditoria e vínculos N:N (RF53–RF56) |
| 10 | Acessibilidade aquém do público idoso | Interface única para cuidador e idoso; texto pequeno; contraste insuficiente | Modo dedicado à pessoa idosa, revisão de cores e de alvos de toque (RF51, RNF09, RNF30) |
| 11 | Impossibilidade de usar dados reais | Exigências éticas para pesquisa com seres humanos | Dados sintéticos para avaliação; estudos com usuários planejados para a etapa seguinte, após trâmite ético (Capítulo 11) |
| 12 | Sustentabilidade da IA | Custo recorrente, privacidade e dependência de fornecedor | IA opcional atrás de interface, modelo aberto local e funcionamento sem IA (Capítulo 7) |
| 13 | Equipe pequena e prazo curto | Contexto acadêmico | Plano de execução versionado, ADRs e automação da documentação |

@@FONTE|Elaborado pelos autores (2026).

## DISCUSSÃO DOS DESAFIOS PRINCIPAIS

### Da conveniência à continuidade

O uso de um BaaS foi uma decisão racional no momento em que foi tomada: permitiu implementar autenticação e persistência em poucas semanas. O problema surgiu quando a equipe passou a olhar para o sistema com os olhos de quem precisa mantê-lo por anos. Um software de acompanhamento cognitivo acumula valor justamente ao longo do tempo. Um histórico interrompido por uma troca forçada de fornecedor perde a característica mais importante do produto. A solução não foi abandonar serviços de terceiros, mas **escolher dependências substituíveis**: código aberto, protocolos padronizados (SQL, SMTP, HTTP) e empacotamento em contêineres.

### Do alerta frequente ao alerta confiável

A regra de 5% parecia razoável quando escrita: uma piora de 5% em uma semana soa significativa. A simulação mostrou o contrário. Com a variabilidade natural do desempenho de uma pessoa, oscilações dessa magnitude ocorrem o tempo todo. O desafio, aqui, foi menos técnico do que conceitual: entender que **um alerta frequente é um alerta inútil**, e que o critério de qualidade de um detector inclui o custo de cada falso alarme para quem o recebe. A comparação quantitativa em coorte sintética transformou uma discussão de opinião ("qual janela e qual limiar?") em uma decisão baseada em evidência.

### Da documentação dispersa à documentação viva

O projeto produziu documentos de qualidade em várias disciplinas, mas cada um envelheceu em ritmo diferente. Foram encontradas divergências no catálogo de jogos (apenas um jogo em comum entre documentação e protótipo), nos nomes das tabelas (o código grava em `cuidadores` e `idosos`, enquanto o modelo define `cuidador` e `paciente`), no número de tabelas (7 na matriz e 17 no modelo final), entre os dois catálogos de casos de uso e até na grafia do nome de um dos autores entre documentos. A resposta foi dupla: automatizar o que podia ser automatizado (a matriz) e manter os demais artefatos no repositório, junto ao código, com um plano de execução que exige marcar cada item concluído no mesmo *commit* da alteração.

### Do protótipo convincente ao protótipo verdadeiro

A auditoria do código revelou defeitos que uma demonstração rápida não mostraria, como o botão de salvar sessão que não salva e o nível de dificuldade que não altera o jogo. Um protótipo que parece funcionar, mas não registra dados, é perigoso em uma defesa: a primeira pergunta sobre "onde esse dado foi parar" o desmonta. A lição foi tratar a verificação como atividade contínua e priorizar a correção desses defeitos antes de qualquer nova funcionalidade. Todos os achados foram corrigidos na versão final, e os testes de uso seguintes ainda revelaram problemas novos, como observações gravadas que nenhuma tela exibia e falsos avisos em jogos de pontuação discreta (Capítulo 9).

### Da interface ao requisito regulatório

Os textos simulados de *insights* incluíam frases como "declínio cognitivo detectado" e "avaliar possível ajuste medicamentoso". Escritos para tornar a demonstração convincente, esses textos atribuíam ao sistema uma finalidade diagnóstica e terapêutica que ele não tem e que poderia enquadrá-lo como dispositivo médico (Capítulo 2). A solução foi elevar a linguagem à condição de requisito verificável (RNF31) e documentar formulações adequadas e inadequadas.

## LIÇÕES APRENDIDAS

a) **Prototipar cedo é bom, mas a prototipação precisa de um ponto de parada**, a partir do qual regras e dados passam a comandar a interface, e não o contrário.

b) **Toda regra numérica precisa ser testada contra o ruído real ou simulado** antes de virar alerta para alguém.

c) **A pergunta "e se o fornecedor sumir?" deve ser feita na primeira semana**, e não na véspera da defesa.

d) **A documentação útil é a que se mantém sozinha**: o que pode ser gerado deve ser gerado, e o que não pode deve morar junto ao código.

e) **Em saúde, as palavras são parte do produto**: a linguagem determina o enquadramento regulatório e a forma como o cuidador reage ao que vê.

f) **Honestidade técnica é um ativo**: registrar o que ainda não foi feito, como os estudos com usuários e a validação clínica, fortalece o trabalho em vez de enfraquecê-lo.
