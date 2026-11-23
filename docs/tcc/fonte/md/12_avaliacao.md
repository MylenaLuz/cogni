# VERIFICAÇÃO, VALIDAÇÃO E AVALIAÇÃO

Verificação responde à pergunta "estamos construindo o produto corretamente?", e validação, à pergunta "estamos construindo o produto certo?" (SOMMERVILLE, 2019). Este capítulo apresenta a estratégia de testes, o mapeamento das características de qualidade, as verificações já realizadas, a análise de contraste da interface e, em detalhe, a avaliação do motor de métricas em coorte sintética, principal resultado quantitativo do trabalho.

## ESTRATÉGIA DE TESTES

A estratégia segue a ideia de pirâmide: muitos testes rápidos e isolados na base, menos testes integrados no meio e poucos testes de ponta a ponta no topo. O {{qua:testes}} detalha os níveis de teste e a situação de cada um na versão final.

@@QUADRO|testes|Níveis de teste e situação na versão final

| Nível | Ferramenta | O que verifica | Situação na versão final |
|---|---|---|---|
| Unitário (*front-end*) | Vitest | Funções puras | Implementado: embaralhamento uniforme e prévia da pontuação (6 testes) |
| Unitário (*back-end*) | pytest | Regras de negócio sem servidor | Implementado: pontuação a partir de eventos conhecidos, linha de base, CUSUM com séries sintéticas, textos não diagnósticos, política de senha |
| Integração | pytest + httpx + PostgreSQL | API e banco juntos | Implementado: cadastro atômico, isolamento entre cuidadores, renovação e revogação de *tokens*, recuperação de senha, exportação e exclusão da conta, versão do termo aceito e novo aceite (27 testes da API no total) |
| Contrato | Tipos do *front-end* alinhados ao esquema da API | Coerência entre *front-end* e API | Parcial: tipos escritos à mão em `src/api/tipos.ts`; geração automática a partir do OpenAPI fica para o TCC II |
| Ponta a ponta | Playwright | Fluxos completos no navegador | Executado com Playwright fora do CI: entrar, jogar, salvar sessão com observação, conferir e sair; cadastro com termo, exportação, novo aceite e exclusão da conta. Automação no CI fica para o TCC II |
| Acessibilidade | Cálculo de contraste; axe e Lighthouse | Critérios WCAG | Contraste verificado em toda a paleta; varredura automatizada fica para o TCC II |
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

Na versão final, foram realizadas as seguintes verificações:

a) **compilação TypeScript**: sem erros (RNF17 atendido);

b) **tamanho do pacote**: 373,1 KB de JavaScript, 105,4 KB compactado com gzip. Mesmo com as telas novas e o texto integral do termo de uso, o pacote compactado ficou 23% menor que na versão intermediária com a biblioteca do provedor BaaS (137,0 KB), atendendo ao RNF01;

c) **testes automatizados**: 27 testes da API, executados em SQLite e em PostgreSQL 16, e 6 testes do *front-end*, todos aprovados e executados a cada envio pelo GitHub Actions;

d) **migrações**: aplicação e reversão completas do esquema em PostgreSQL 16, também no CI;

e) **subida em ambiente limpo**: o sistema completo (banco, API e *front-end*) foi iniciado com Docker Compose a partir do repositório, seguindo apenas o guia de execução, com dados de demonstração;

f) **fluxos ponta a ponta**: entrar, abrir o perfil, jogar, salvar a sessão com observação, verificar a gravação no banco e sair; e criar conta abrindo o termo, exportar os dados, aceitar uma nova versão do termo e excluir a conta, conferindo que o login da conta excluída é recusado;

g) **matriz integrada**: 386 referências cruzadas verificadas, sem erros (Capítulo 6);

h) **auditoria de código**: os quinze achados da auditoria do protótipo inicial foram corrigidos (Capítulo 9);

i) **contraste da paleta**: todas as combinações de texto e fundo da versão final, apresentadas a seguir.

## ANÁLISE DE CONTRASTE

A razão de contraste foi calculada pela fórmula de luminância relativa das WCAG (W3C, 2023) para as combinações de texto e fundo usadas na interface. A primeira medição, feita sobre a paleta do protótipo, reprovou o texto claro (`#8A9E9E`, 2,52:1 sobre areia), o branco sobre o verde de destaque (`#52B788`, 2,47:1) e deixou o vermelho de erro (`#D96B6B`, 3,35:1) e o verde escuro (`#3D9A6E`, 3,47:1) aptos apenas para texto grande. Os *tokens* de cor foram ajustados, e a {{tab:contraste}} apresenta a paleta final.

@@TABELA|contraste|Razão de contraste das combinações de cor da versão final

| Texto | Fundo | Razão | Nível atingido |
|---|---|---|---|
| Texto principal `#1C3333` | Areia `#F7F2E9` | 11,99:1 | AAA |
| Texto secundário `#4F6363` | Areia `#F7F2E9` | 5,71:1 | AA |
| Texto secundário `#4F6363` | Superfície `#EDE8DF` | 5,22:1 | AA |
| Texto claro `#5F7272` | Branco `#FFFFFF` | 5,08:1 | AA |
| Texto claro `#5F7272` | Areia `#F7F2E9` | 4,55:1 | AA |
| Branco | Primária `#2C7A7A` | 5,03:1 | AA |
| Branco | Destaque escuro `#2B7A55` | 5,23:1 | AA |
| Erro `#B84444` | Branco `#FFFFFF` | 5,32:1 | AA |
| Erro `#B84444` | Areia `#F7F2E9` | 4,77:1 | AA |
| Primária `#2C7A7A` | Areia `#F7F2E9` | 4,51:1 | AA (no limite) |

@@FONTE|Elaborada pelos autores (2026).

Todas as combinações usadas para texto atingem o nível AA (RNF08). O verde claro `#52B788` continua na paleta apenas para preenchimentos, como barras e indicadores, que exigem 3:1 com o fundo. O nível AAA, buscado para o modo da pessoa idosa (RNF30), ainda não é atingido pelos textos secundários e fica como meta do TCC II.

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
