# CONSIDERAÇÕES FINAIS

Este trabalho partiu de uma constatação: o conhecimento sobre como retardar o declínio cognitivo existe, mas a capacidade de aplicá-lo de forma contínua, personalizada e acompanhada no ambiente doméstico não existe. Os ensaios clínicos funcionam porque têm equipes. As famílias têm um cuidador sobrecarregado. O Cogni foi concebido para ocupar esse espaço, colocando o cuidador no centro e transformando as atividades da pessoa idosa em informação útil para quem cuida.

## RETOMADA DOS OBJETIVOS

O objetivo geral, desenvolver uma plataforma de apoio ao cuidador para estimulação cognitiva e acompanhamento longitudinal, fundamentada em evidências e em boas práticas de engenharia, foi atingido no escopo da primeira etapa. O {{qua:objetivos}} relaciona cada objetivo específico ao resultado obtido.

@@QUADRO|objetivos|Objetivos específicos e resultados

| Objetivo específico | Resultado | Capítulo |
|---|---|---|
| a) Revisar a literatura | Revisão de demências, cuidado, intervenções, biomarcadores, acessibilidade, IA, regulação e engenharia de software | 2 |
| b) Analisar soluções existentes | Comparação com soluções acadêmicas e comerciais; lacuna formulada | 3 |
| c) Especificar requisitos | 10 casos de uso, 46 RF e 24 RNF; revisão com 13 RF novos e 12 RNF revistos ou novos | 5 |
| d) Construir a matriz integrada | Matriz com 386 referências validadas automaticamente e 7 decisões resolvidas | 6 |
| e) Modelar o banco de dados | 17 tabelas, 15 tipos enumerados, 13 índices, 2 visões e segurança por vínculo | 8 |
| f) Projetar arquitetura portável | Arquitetura própria com 11 decisões registradas e plano de continuidade, implementada e em funcionamento | 7 |
| g) Implementar o sistema | Interface, quatro jogos com registro de eventos, API em FastAPI, PostgreSQL, autenticação, perfis e instituições, termo de uso e direitos do titular; 41 testes automatizados e integração contínua | 9 |
| h) Propor, implementar e avaliar o motor de métricas | Baseline pessoal e CUSUM implementados no sistema e avaliados em 3.600 pacientes sintéticos | 9, 10 e 11 |
| i) Planejar verificação, validação e evolução | Estratégia de testes, características de qualidade e plano com 106 itens | 11 e 14 |

@@FONTE|Elaborado pelos autores (2026).

## CONTRIBUIÇÕES

O trabalho oferece contribuições em quatro frentes.

Na **frente conceitual**, propõe a tese de que, em um software de cuidado cognitivo, a intervenção e a medição podem ser o mesmo ato, e que a comparação com o padrão da própria pessoa é mais sensível e mais honesta do que a comparação com normas populacionais.

Na **frente técnica**, mostra que a regra de tendência inicialmente adotada geraria alertas falsos com frequência incompatível com o uso real e que um detector robusto, simples e auditável reduz os falsos alarmes em uma a duas ordens de grandeza, com sensibilidade alta para declínios moderados quando há uso regular.

Na **frente de engenharia de software**, relata a construção de uma matriz de rastreabilidade automatizada em um projeto acadêmico real, com achados concretos sobre inconsistências entre documentos, e entrega um sistema funcionando sobre uma arquitetura que responde de forma objetiva à pergunta sobre continuidade diante do desaparecimento de fornecedores, com cada decisão de projeto e cada mudança motivada por testes registradas.

Na **frente ética e regulatória**, sistematiza os cuidados de privacidade, de linguagem e de enquadramento necessários a um software de apoio ao cuidado em saúde, tratando-os como requisitos verificáveis, e não como recomendações genéricas.

## LIMITAÇÕES

As limitações do trabalho foram registradas ao longo dos capítulos e são retomadas aqui. Não houve, nesta etapa, estudo sistemático com usuários, e por isso a aceitação das funcionalidades pelos cuidadores não foi verificada empiricamente. O motor de métricas foi avaliado apenas em dados simulados, cujos parâmetros não foram estimados a partir de pessoas reais, e as fórmulas de pontuação e os pesos dos domínios são decisões de projeto ainda não validadas. O controle de acesso está implementado na API, mas ainda não também no banco de dados, e o sistema ainda não foi implantado em servidor público. O termo de uso não passou por revisão jurídica. A matriz integrada foi avaliada pela própria equipe. O sistema não foi validado clinicamente e não pode ser usado para fins diagnósticos.

## TRABALHOS FUTUROS

A segunda etapa do trabalho prevê:

a) implantar o sistema em servidor público com cópias de segurança testadas, ativar o controle de acesso também no banco de dados e submeter o termo de uso a revisão jurídica;

b) implementar o modo dedicado à pessoa idosa, com acessibilidade de nível AAA;

c) realizar estudos de aceitação e de usabilidade com cuidadores e entrevistas com profissionais de saúde, mediante os trâmites éticos;

d) calibrar os parâmetros do motor de métricas e o período de aprendizado com dados reais consentidos, e implementar a dificuldade adaptativa;

e) incluir os marcadores de fala e a reminiscência conversacional com processamento local;

f) fechar o ciclo de intervenção, com plano semanal, sessões de reforço e acompanhamento de fatores de risco;

g) gerar relatórios para profissionais em PDF e no padrão HL7 FHIR;

h) buscar parceria com grupo de pesquisa em envelhecimento para um estudo de validação.

O Cogni não pretende curar ou prevenir a doença de Alzheimer. Pretende algo mais modesto e, por isso mesmo, mais urgente: que nenhum cuidador precise acompanhar sozinho, e às cegas, a mudança de quem ama.
