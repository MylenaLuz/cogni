# VERIFICAÇÃO, VALIDAÇÃO E AVALIAÇÃO

Verificação responde à pergunta "estamos construindo o produto corretamente?", e validação, à pergunta "estamos construindo o produto certo?" (SOMMERVILLE, 2019). Este capítulo apresenta a estratégia de testes, o mapeamento das características de qualidade, as verificações já realizadas, a análise de contraste da interface e, em detalhe, a avaliação do motor de métricas em coorte sintética, principal resultado quantitativo do trabalho.

## ESTRATÉGIA DE TESTES

A estratégia segue a ideia de pirâmide: muitos testes rápidos e isolados na base, menos testes integrados no meio e poucos testes de ponta a ponta no topo. O {{qua:testes}} detalha os níveis previstos.

@@QUADRO|testes|Níveis de teste previstos

| Nível | Ferramenta | O que verifica | Exemplos |
|---|---|---|---|
| Unitário (*front-end*) | Vitest | Funções puras e componentes isolados | Embaralhamento uniforme; formatação de tempo; componentes de resultado |
| Unitário (*back-end*) | pytest | Regras de negócio sem servidor | Métricas a partir de eventos conhecidos; baseline; CUSUM com séries sintéticas; política de senha |
| Integração | pytest + httpx + PostgreSQL temporário | API e banco juntos | Cadastro transacional (falha forçada não deixa registro); cuidador A não acessa paciente de B; renovação e revogação de *tokens* |
| Contrato | Tipos gerados do OpenAPI | Coerência entre *front-end* e API | Alteração de esquema quebra a verificação de tipos do *front-end* |
| Ponta a ponta | Playwright | Fluxos completos no navegador | Cadastro, sessão de cada jogo, relatório |
| Acessibilidade | axe, Lighthouse | Critérios WCAG automatizáveis | Rótulos, contraste, foco, alvos de toque |
| Rastreabilidade | `gerar_matriz.py` | Coerência da matriz integrada | 386 referências sem erro |

@@FONTE|Elaborado pelos autores (2026).

Os módulos de pontuação e de detecção de mudança recebem atenção especial (RNF32): um erro neles se transforma em alerta incorreto para o cuidador, o que pode causar preocupação indevida ou falsa tranquilidade. A matriz integrada já havia indicado esses módulos como os de maior impacto (Capítulo 6).

## CARACTERÍSTICAS DE QUALIDADE

O {{qua:iso25010}} relaciona as características de qualidade da ISO/IEC 25010 (ISO; IEC, 2023) aos requisitos e às formas de verificação no Cogni.

@@QUADRO|iso25010|Características de qualidade, requisitos e verificação

| Característica | Requisitos relacionados | Verificação |
|---|---|---|
| Adequação funcional | RF01–RF59 | Testes por caso de uso; rastreabilidade na matriz |
| Eficiência de desempenho | RNF01–RNF03 | Tamanho do pacote na compilação; medição de quadros por segundo |
| Compatibilidade | Contrato OpenAPI; FHIR (RF58) | Testes de contrato; validador FHIR |
| Capacidade de interação | RNF04–RNF10, RNF30 | SUS em teste de usabilidade (TCC II); auditoria WCAG |
| Confiabilidade | RNF27 | Teste de restauração do backup; monitoramento de disponibilidade |
| Segurança | RNF29; RF53–RF55 | Testes de autorização; verificação OWASP ASVS |
| Manutenibilidade | RNF17; RNF32 | Análise estática; cobertura de testes; ADRs |
| Flexibilidade (portabilidade) | RNF25; RNF26 | Subida do sistema em máquina limpa com um comando |
| Proteção (*safety*) | RNF31; REG-012 | Revisão de linguagem; detector avaliado em coorte sintética |

@@FONTE|Elaborado pelos autores (2026), com base em ISO e IEC (2023).

## VERIFICAÇÕES REALIZADAS

Nesta etapa, foram realizadas as seguintes verificações sobre o protótipo e os artefatos:

a) **compilação TypeScript**: sem erros (RNF17 atendido);

b) **tamanho do pacote**: 519,8 KB de JavaScript, 137,0 KB compactado (RNF01 atendido apenas na medida compactada e com margem reduzida; ver Capítulo 9);

c) **matriz integrada**: 386 referências cruzadas verificadas, sem erros, e teste de falha bem-sucedido com referência inválida deliberada (Capítulo 6);

d) **modelo de dados**: *script* executado em PostgreSQL 16, com inserção de dados de teste e validação das restrições, dos gatilhos e das visões (Capítulo 8);

e) **auditoria de código**: quinze achados classificados por gravidade (Capítulo 9);

f) **contraste da paleta**: cálculo da razão de contraste de todas as combinações de cor do tema, apresentado a seguir.

## ANÁLISE DE CONTRASTE

A razão de contraste foi calculada pela fórmula de luminância relativa das WCAG (W3C, 2023) para as combinações de texto e fundo usadas na interface. A {{tab:contraste}} apresenta os resultados.

@@TABELA|contraste|Razão de contraste das combinações de cor da interface

| Texto | Fundo | Razão | Nível atingido |
|---|---|---|---|
| Texto principal `#1C3333` | Areia `#F7F2E9` | 11,99:1 | AAA |
| Texto secundário `#5C7070` | Branco `#FFFFFF` | 5,24:1 | AA |
| Texto secundário `#5C7070` | Areia `#F7F2E9` | 4,70:1 | AA |
| Branco | Primária `#2C7A7A` | 5,03:1 | AA |
| Primária `#2C7A7A` | Areia `#F7F2E9` | 4,51:1 | AA (no limite) |
| Destaque escuro `#3D9A6E` | Branco | 3,47:1 | Apenas texto grande |
| Erro `#D96B6B` | Branco | 3,35:1 | Apenas texto grande |
| Texto claro `#8A9E9E` | Branco | 2,81:1 | Reprovado |
| Texto claro `#8A9E9E` | Areia `#F7F2E9` | 2,52:1 | Reprovado |
| Branco | Destaque `#52B788` | 2,47:1 | Reprovado |

@@FONTE|Elaborada pelos autores (2026).

O texto principal tem contraste excelente. Porém, três combinações reprovam inclusive no nível AA, entre elas o texto branco sobre o verde de destaque, usado nos selos de "Novo" do catálogo de jogos, e o tom de texto claro, usado em legendas. Esses resultados contradizem o RNF08 e motivam o ajuste dos *tokens* de cor, especialmente para o modo da pessoa idosa, em que se busca o nível AAA (RNF30).

## AVALIAÇÃO DO MOTOR DE MÉTRICAS EM COORTE SINTÉTICA

### Objetivo

O objetivo foi comparar, em condições controladas, a regra de tendência atualmente implementada no banco de dados (variação semanal de 5%, função `fn_consolidar_indice`) com o detector proposto (baseline pessoal robusto e CUSUM), respondendo a três perguntas: (1) qual detector identifica declínios reais com mais frequência e rapidez? (2) qual produz menos falsos alarmes? (3) como a frequência de uso afeta o desempenho?

### Modelo gerador

Cada paciente sintético foi modelado com as características do {{qua:sim_params}}. A métrica simulada é o tempo de reação mediano por sessão no jogo de atenção, em milissegundos, em que valores maiores indicam piora.

@@QUADRO|sim_params|Parâmetros do modelo gerador da coorte sintética

| Componente | Modelo | Justificativa |
|---|---|---|
| Desempenho habitual | Normal com média de 900 ms e desvio de 150 ms entre pessoas, limitado a 550–1.500 ms | Diferenças individuais de velocidade |
| Variabilidade intraindividual | Desvio de 6% a 10% do desempenho habitual, sorteado por pessoa | Ruído natural de sessão para sessão |
| Efeito de aprendizado | 25% mais lento no início, com decaimento exponencial (constante de 3 sessões) | Melhora inicial ao aprender a tarefa |
| Efeito de horário | Normal com desvio de 0,3 vez a variabilidade individual | Flutuação ao longo do dia |
| Dias ruins | 5% das sessões com piora de 3 desvios | Cansaço, sono ruim ou distração |
| Declínio | Em metade dos pacientes, início sorteado entre as semanas 16 e 30, com piora linear de 0,05, 0,10 ou 0,20 desvio por semana | Declínio leve, moderado e intenso |
| Frequência de uso | 1, 2 ou 3 sessões por semana | Diferentes níveis de adesão |
| Duração | 52 semanas | Um ano de acompanhamento |

@@FONTE|Elaborado pelos autores (2026).

Foram simulados nove cenários (três frequências × três intensidades de declínio), com 400 pacientes cada (200 estáveis e 200 com declínio), totalizando 3.600 pacientes e cerca de 374 mil sessões. Uma coorte adicional de 400 pacientes, com duas sessões semanais e declínio moderado, foi usada para traçar a curva de compromisso do CUSUM. A simulação usa semente fixa, o que torna os resultados reprodutíveis. O código completo está no Apêndice C.

### Métricas de avaliação

a) **sensibilidade**: proporção de pacientes com declínio para os quais houve alarme em até 20 semanas após o início;

b) **falsos alarmes por paciente-ano**: alarmes ocorridos sem declínio em curso (em pacientes estáveis, ou antes do início do declínio), divididos pelo tempo de observação sem declínio;

c) **precisão**: proporção de todos os alarmes que ocorreram dentro da janela de 20 semanas após o início de um declínio real;

d) **atraso mediano**: semanas entre o início do declínio e o primeiro alarme, entre os casos detectados.

### Resultados

A {{tab:sim_resultados}} apresenta os resultados dos nove cenários.

@@TABELA|sim_resultados|Desempenho da regra de 5% e do detector CUSUM nos nove cenários

| Sessões/semana | Piora (desvio/semana) | Regra de 5%: falsos alarmes por paciente-ano | Regra de 5%: precisão | CUSUM: sensibilidade | CUSUM: falsos alarmes por paciente-ano | CUSUM: precisão | CUSUM: atraso mediano (semanas) |
|---|---|---|---|---|---|---|---|
| 1 | 0,05 | 16,4 | 0,22 | 0,36 | 0,14 | 0,36 | 14,0 |
| 1 | 0,10 | 16,9 | 0,22 | 0,76 | 0,21 | 0,41 | 15,0 |
| 1 | 0,20 | 16,9 | 0,22 | 0,99 | 0,13 | 0,55 | 10,0 |
| 2 | 0,05 | 14,2 | 0,22 | 0,52 | 0,45 | 0,36 | 11,0 |
| 2 | 0,10 | 14,3 | 0,22 | 0,90 | 0,50 | 0,44 | 10,0 |
| 2 | 0,20 | 14,4 | 0,23 | 1,00 | 0,50 | 0,53 | 8,0 |
| 3 | 0,05 | 12,3 | 0,22 | 0,70 | 0,75 | 0,37 | 11,0 |
| 3 | 0,10 | 12,9 | 0,22 | 0,96 | 0,85 | 0,43 | 9,5 |
| 3 | 0,20 | 12,7 | 0,24 | 1,00 | 0,81 | 0,54 | 6,0 |

@@FONTE|Elaborada pelos autores (2026), a partir da simulação descrita no Apêndice C.

A regra de 5% atingiu sensibilidade de 100% em todos os cenários, com atraso de uma a duas semanas. Esse resultado, porém, é um **artefato**: a regra dispara entre 12 e 17 alarmes por paciente-ano, inclusive em pacientes estáveis, e sua precisão fica em torno de 0,22, valor próximo do que se obteria com alarmes ao acaso. Em termos práticos, um cuidador receberia em média **um alerta de declínio a cada três ou quatro semanas, mesmo que nada tivesse mudado**. Com essa frequência, os alertas perdem credibilidade e passam a ser ignorados, fenômeno conhecido como fadiga de alarmes.

O detector CUSUM reduziu os falsos alarmes em uma a duas ordens de grandeza, para valores entre 0,13 e 0,85 por paciente-ano, isto é, de um alarme falso a cada um ano e dois meses a um a cada quase oito anos, conforme a frequência de uso. A sensibilidade dependeu da intensidade do declínio e da frequência de uso: com duas ou mais sessões semanais, o detector identificou entre 90% e 100% dos declínios moderados e intensos, com atraso mediano de 6 a 10 semanas. Declínios leves (0,05 desvio por semana) foram detectados em 36% a 70% dos casos dentro da janela de 20 semanas.

A frequência de uso mostrou um compromisso claro: mais sessões aumentam a sensibilidade e reduzem o atraso, mas também aumentam os falsos alarmes por paciente-ano, porque há mais oportunidades de acúmulo de ruído com o mesmo limiar. Isso indica que o limiar $h$ deve ser ajustado à frequência de uso de cada pessoa, e não fixado globalmente.

A {{fig:compromisso}} apresenta a curva de compromisso do CUSUM ao variar o limiar $h$, no cenário de duas sessões semanais e declínio moderado, com a regra de 5% como referência.

@@FIG|compromisso|Compromisso entre sensibilidade e falsos alarmes do CUSUM, com a regra de 5% como referência|img/fig_compromisso.png|Elaborada pelos autores (2026), a partir da simulação descrita no Apêndice C.|14

Ao longo de toda a curva, o CUSUM domina a regra de 5%: para qualquer nível de sensibilidade, produz menos falsos alarmes. Com $h = 8$, valor adotado como padrão, obtiveram-se 94% de sensibilidade e 0,52 falso alarme por paciente-ano. Com $h = 15$, os falsos alarmes caem para 0,15 por paciente-ano, com sensibilidade de 79%. A escolha do limiar é, portanto, uma decisão de projeto que deve envolver profissionais de saúde e os próprios cuidadores, e que pode ser oferecida como configuração com valores padrão conservadores.

A {{fig:trajetoria}} ilustra o comportamento dos dois detectores em um paciente simulado com declínio moderado iniciado na semana 24.

@@FIG|trajetoria|Trajetória simulada de um paciente com declínio iniciado na semana 24|img/fig_trajetoria.png|Elaborada pelos autores (2026), a partir da simulação descrita no Apêndice C.|16

A figura mostra o efeito de aprendizado nas primeiras sessões, os dias ruins isolados, a faixa pessoal estimada (mediana ± 2 MAD) e os alarmes. A regra de 5% dispara repetidamente desde a semana 5, muito antes de qualquer declínio, reagindo a cada oscilação. O CUSUM permanece em silêncio diante dos dias ruins isolados e dispara apenas quando o acúmulo de sessões acima da faixa se torna consistente.

### Discussão

Três conclusões decorrem da simulação. A primeira é que a regra de tendência atualmente implementada no banco **não deve ser usada para gerar alertas**: ela é adequada apenas como descrição visual de oscilação semanal, se tanto. A segunda é que comparar a pessoa com o próprio padrão, com estatística robusta e acúmulo de evidência, é viável e reduz drasticamente os falsos alarmes com sensibilidade alta para mudanças moderadas. A terceira é que a **frequência de uso é uma variável clínica do sistema**: com uma sessão semanal, declínios leves dificilmente são detectados dentro de cinco meses. Isso justifica que o Cogni recomende ao cuidador uma frequência mínima de duas sessões semanais, recomendação que coincide com a frequência associada a melhores resultados na estimulação cognitiva (WOODS *et al.*, 2023).

### Limitações da avaliação

A validade dos resultados depende do realismo do modelo gerador. O declínio foi modelado como linear, enquanto declínios reais podem ser irregulares ou em degraus. O ruído foi modelado como independente entre sessões, sem correlação temporal nem sazonalidade. A métrica simulada é única, enquanto o motor proposto combina várias. Os parâmetros (variabilidade de 6% a 10%, 5% de dias ruins) são plausíveis, mas não foram estimados a partir de dados reais de pessoas idosas. Por essas razões, os resultados demonstram o **comportamento relativo** dos detectores e a viabilidade da abordagem, e não o desempenho esperado em uso real. A calibração dos parâmetros com dados reais, mediante aprovação ética, é um dos objetivos da segunda etapa.
