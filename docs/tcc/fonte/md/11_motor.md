# MOTOR DE MÉTRICAS E COMPONENTES INTELIGENTES

Este capítulo apresenta a proposta que diferencia o Cogni das soluções analisadas no Capítulo 3. A ideia central pode ser enunciada em uma frase: **a intervenção é a medição**. As atividades que estimulam a pessoa idosa são as mesmas que geram, sem que ela perceba, medidas comparadas ao seu próprio padrão. Essas medidas alimentam um ciclo fechado de acompanhamento e personalização, representado na {{fig:ciclo}}.

@@FIG|ciclo|Ciclo fechado de medição, comparação, personalização e intervenção|img/05_ciclo.png|Elaborado pelos autores (2026).|16

O ciclo responde à lacuna identificada na fundamentação. Os ensaios clínicos mostram que intervenções sustentadas e estruturadas funcionam (COE *et al.*, 2026; BAKER *et al.*, 2025), mas a estrutura depende de profissionais. A literatura sobre biomarcadores digitais mostra que o desempenho em tarefas carrega sinal cognitivo, mas falta acompanhamento longitudinal (HAYNES; BAUERMEISTER; BUNCE, 2017). O Cogni propõe unir as duas frentes no ambiente doméstico, com o cuidador como facilitador apoiado pelo sistema.

Os componentes deste capítulo são **determinísticos, testáveis e auditáveis**. Nenhum deles depende de modelo de linguagem. A IA generativa, quando presente, apenas redige textos a partir dos resultados já calculados.

## REGISTRO DE EVENTOS BRUTOS

O primeiro requisito do motor é não descartar informação. Cada jogo passa a registrar, por meio de um componente reutilizável de gravação de sessão, um evento para cada estímulo exibido, cada toque, cada acerto, cada erro e cada omissão:

```json
{ "t": 18342.6, "tipo": "toque", "alvo": 7, "posicao": [2, 1],
  "correto": true, "estimulo_em": 17611.2 }
```

O campo `t` é obtido por `performance.now()`, relógio monotônico do navegador com resolução inferior a um milissegundo, em substituição aos intervalos de um segundo usados no protótipo. O tempo de reação de cada resposta é a diferença entre o toque e o aparecimento do estímulo. A sessão registra também o contexto: horário, tipo de dispositivo e tamanho de tela, porque o horário do dia influencia o desempenho de pessoas idosas e o tamanho do alvo influencia o tempo de toque.

Cada jogo inclui ainda uma **rodada de prática** de dois a três estímulos, não considerada nas métricas, porque as primeiras interações medem sobretudo a compreensão da tarefa.

## PONTUAÇÃO PADRONIZADA E VERSIONADA

As métricas deixam de ser calculadas no navegador, com fórmulas arbitrárias, e passam a ser calculadas no servidor a partir dos eventos brutos, por um módulo versionado (`scoring v1`). O {{qua:metricas}} apresenta as métricas propostas por jogo.

@@QUADRO|metricas|Métricas propostas por jogo

| Jogo | Métricas brutas | Interpretação |
|---|---|---|
| Velocidade de Atenção | Tempo de reação mediano; desvio-padrão e coeficiente de variação do tempo de reação; omissões; erros de comissão | Velocidade de processamento e consistência (variabilidade intraindividual) |
| Associação de Pares | Tentativas por par; erros de perseveração (repetir a mesma carta errada); tempo até o primeiro acerto | Memória de trabalho e flexibilidade |
| Categorias | Acertos; intrusões (distratores tocados); tempo por item | Linguagem semântica e controle inibitório |
| Associação de Imagens | Precisão; tempo por associação | Memória visual e nomeação |

@@FONTE|Elaborado pelos autores (2026).

Cada sessão guarda a versão da fórmula utilizada. Se a fórmula mudar, um *script* recalcula todo o histórico a partir dos eventos, sem perda de dados, propriedade que o modelo de dados já previa ao separar eventos brutos e indicadores consolidados (Capítulo 8). O índice de 0 a 100 exibido ao cuidador é mantido apenas para comunicação e sempre acompanhado das métricas brutas. A {{fig:pipeline}} apresenta o fluxo completo dos dados.

@@FIG|pipeline|Fluxo de dados do registro de eventos ao painel do cuidador|img/06_pipeline.png|Elaborado pelos autores (2026).|16

## BASELINE PESSOAL

Para cada pessoa e cada métrica, o motor estima o **padrão pessoal** (*baseline*) em três passos:

a) **descarte do período de aprendizado**: as seis primeiras sessões válidas são excluídas, porque nelas o desempenho melhora rapidamente à medida que a pessoa aprende a tarefa, e incluí-las faria o padrão parecer pior do que é;

b) **estimação robusta**: nas doze sessões seguintes, calculam-se a mediana e o desvio absoluto mediano multiplicado por 1,4826 (LEYS *et al.*, 2013). A mediana não é afetada por um dia ruim isolado, ao contrário da média;

c) **atualização lenta e controlada**: o padrão é reestimado periodicamente apenas com sessões que não estejam em período de alerta, para que um declínio real não seja incorporado ao "normal" da pessoa.

A cada nova sessão, calcula-se o escore z robusto em relação ao padrão (Capítulo 2). Para métricas em que valores maiores indicam piora, como o tempo de reação, o escore positivo indica piora. Para as demais, o sinal é invertido.

## DETECÇÃO DE MUDANÇA SUSTENTADA

O detector precisa distinguir **um dia ruim** de **uma tendência sustentada**. A regra atualmente implementada no banco (Capítulo 8) compara a média de uma semana com a da semana anterior e classifica como declínio qualquer piora de 5% ou mais. Como mostra o Capítulo 11, essa regra reage ao ruído natural do desempenho e dispara alertas com muita frequência.

O detector proposto aplica a soma cumulativa unilateral (PAGE, 1954) sobre os escores z robustos:

$$S_t = \max(0,\ S_{t-1} + \min(z_t, 4) - k), \qquad \text{alarme se } S_t > h$$

com três escolhas de projeto:

a) o escore de cada sessão é **limitado a 4**, para que um único valor extremo (uma sessão feita com sono, por exemplo) não dispare o alarme sozinho;

b) o parâmetro $k = 0{,}5$ define que desvios menores que meio desvio robusto não acumulam;

c) o limiar $h$ controla o compromisso entre sensibilidade e falsos alarmes. O valor padrão adotado, $h = 8$, foi escolhido a partir da curva de compromisso obtida na simulação (Capítulo 11). Após um alarme, a soma é reiniciada.

O detector é aplicado a cada métrica separadamente, e um alerta ao cuidador exige mudança sustentada em pelo menos uma métrica principal. Na segunda etapa, o contexto informado pelo cuidador (sono ruim, troca de medicação, doença aguda) será usado para anotar ou suprimir alertas com explicação óbvia.

## ALERTAS AO CUIDADOR E LINGUAGEM

O alerta é o ponto de contato mais sensível do sistema. Ele precisa ser **compreensível, acionável e não diagnóstico**. Cada alerta contém o que mudou, em relação a quê, há quanto tempo, com que confiança e o que o cuidador pode fazer. O {{qua:linguagem}} contrasta formulações adequadas e inadequadas.

@@QUADRO|linguagem|Linguagem adequada e inadequada nos alertas

| Inadequado (evitar) | Adequado (adotar) |
|---|---|
| "Declínio cognitivo detectado" | "O tempo de resposta da Maria no jogo de atenção está acima da faixa habitual dela há três semanas" |
| "Possível progressão do Alzheimer" | "Essa mudança é consistente, e não apenas um dia diferente" |
| "Avaliar ajuste medicamentoso" | "Se você também percebeu mudanças no dia a dia, pode ser um bom momento para conversar com o profissional de saúde que a acompanha" |
| "Risco de demência: alto" | "O Cogni acompanha mudanças em relação ao padrão da própria pessoa e não faz diagnóstico" |

@@FONTE|Elaborado pelos autores (2026).

A coluna da esquerda reproduz, em parte, os textos simulados do protótipo atual. A substituição é tratada como requisito (RNF31), pelos motivos regulatórios discutidos no Capítulo 2.

## DIFICULDADE ADAPTATIVA

A dificuldade de cada jogo deve manter a pessoa em uma zona de desafio adequada: difícil o bastante para estimular, fácil o bastante para não frustrar. A proposta usa um procedimento de escada do tipo "dois acertos para subir, um erro para descer", que converge para uma taxa de acerto de aproximadamente 70,7% (LEVITT, 1971), ajustando parâmetros contínuos como o intervalo entre estímulos, o número de pares e o número de distratores. Para a escolha do nível inicial e para estimar a dificuldade de cada item ao longo do tempo, propõe-se um modelo inspirado no sistema Elo (PELÁNEK, 2016). O procedimento resolve a regra REG-007 (nível recomendado a partir do histórico) e o item de dificuldade adaptativa previsto desde o início do projeto.

A dificuldade adaptativa tem uma consequência para a medição: se a dificuldade muda, a pontuação bruta deixa de ser comparável. Por isso, o motor registra o nível de cada sessão e compara métricas apenas entre sessões do mesmo nível, ou normaliza a métrica pelo nível.

## DOMÍNIOS COGNITIVOS DERIVADOS

O gráfico radar dos cinco domínios cognitivos, que no protótipo exibe valores fixos, passa a ser calculado. A tabela `jogo_dominio` do modelo de dados já associa cada jogo aos domínios que estimula, com pesos. O valor de cada domínio é a média ponderada dos escores normalizados das métricas dos jogos que o estimulam, considerando apenas sessões recentes. O mapeamento e seus pesos são documentados e versionados, para que qualquer profissional possa entender de onde vem cada número.

## BIOMARCADORES DE FALA

Na segunda etapa, propõe-se a inclusão da fala como fonte de medição, por ser a linha de biomarcadores digitais com maior volume de evidência (FRASER; MELTZER; RUDZICZ, 2016; KÖNIG *et al.*, 2026). O fluxo previsto é:

a) **captura** no navegador, com consentimento específico para gravação de voz e indicador visual claro de gravação;

b) **transcrição local** no servidor da aplicação, com um modelo aberto de reconhecimento de fala (RADFORD *et al.*, 2023), sem envio do áudio a serviços externos;

c) **extração de marcadores**, conforme o {{qua:fala}};

d) **integração ao motor**, com baseline pessoal e detecção de mudança, como nas métricas dos jogos;

e) **retenção mínima**: o áudio bruto é apagado após a extração.

@@QUADRO|fala|Marcadores de fala propostos

| Marcador | Descrição | Fundamento |
|---|---|---|
| Taxa e duração de pausas | Frequência e duração média das pausas silenciosas | Dificuldade de evocação e planejamento do discurso |
| Velocidade de fala | Palavras ou sílabas por minuto | Velocidade de processamento |
| Diversidade lexical (MATTR) | Variedade de palavras em janelas móveis, robusta ao tamanho do texto | Empobrecimento lexical |
| Proporção de palavras vagas | Uso de termos como "coisa" e "aquilo" no lugar de substantivos específicos | Dificuldade de nomeação |
| Repetições | Repetição de palavras e de ideias | Memória de trabalho |
| Densidade de ideias (aproximada) | Proposições por número de palavras | Riqueza semântica do discurso |

@@FONTE|Elaborado pelos autores (2026), com base em Fraser, Meltzer e Rudzicz (2016).

## REMINISCÊNCIA CONVERSACIONAL

A fonte de fala mais natural para a pessoa idosa não é um teste, e sim uma conversa sobre a própria vida. Propõe-se uma **sessão de reminiscência conversacional**: o sistema exibe uma fotografia cadastrada pela família e conduz, por voz, uma conversa com perguntas abertas e acolhedoras ("Quem está nessa foto com você?", "Onde vocês estavam?"). A conversa cumpre três funções ao mesmo tempo: é estímulo de reminiscência, com o benefício de personalização indicado pela literatura (WOODS *et al.*, 2018; DIGITAL..., 2025); gera amostras de fala para os marcadores; e fortalece o vínculo com a memória familiar.

Os limites de comportamento (*guardrails*) são definidos como requisitos: a conversa nunca corrige a pessoa de forma brusca nem cobra acertos; nunca menciona diagnóstico ou doença; encerra-se com gentileza diante de sinais de angústia; e usa apenas memórias revisadas pelo cuidador. O modelo de linguagem, se usado, roda localmente por meio da interface descrita no Capítulo 7, e a sessão continua possível sem ele, com perguntas pré-definidas.

## CICLO FECHADO DE INTERVENÇÃO

O último componente fecha o ciclo: transformar o que foi medido em **plano de atividades**. A proposta combina três elementos fundamentados no Capítulo 2:

a) **treino de velocidade com sessões de reforço**, inspirado no achado do estudo ACTIVE de que o efeito dependeu dos reforços (COE *et al.*, 2026);

b) **plano semanal estruturado com metas e acompanhamento**, inspirado na superioridade do braço estruturado do US POINTER (BAKER *et al.*, 2025), com o cuidador no papel de facilitador e o sistema gerando lembretes e registros;

c) **check-ins simples sobre fatores de risco modificáveis** (atividade física, sono, contato social, audição avaliada e pressão arterial acompanhada), baseados na Comissão da *The Lancet* e nas diretrizes da OMS (LIVINGSTON *et al.*, 2024; WORLD HEALTH ORGANIZATION, 2026b), sempre como lembretes gentis e sem caráter clínico.

Ao longo do tempo, o sistema compara a trajetória antes e depois de mudanças no plano, permitindo ao cuidador observar a resposta individual à intervenção, ideia sugerida pelos resultados heterogêneos do ACHIEVE (LIN *et al.*, 2023).

## LIMITES DA PROPOSTA

A proposta deve ser lida com três ressalvas. Primeiro, os marcadores e o detector não foram validados clinicamente, e sua validade nesta etapa se limita ao comportamento em dados simulados. Segundo, alterações no desempenho podem ter causas não cognitivas (visão, motricidade, humor, sono, familiaridade com o dispositivo), e o sistema não tem como separá-las completamente, o que reforça a linguagem não diagnóstica. Terceiro, a medição contínua só tem valor se houver uso regular, e a adesão é, ela própria, um desafio que o sistema precisa enfrentar.
