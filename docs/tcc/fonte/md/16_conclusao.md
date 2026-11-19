# CONSIDERAÇÕES FINAIS

Este trabalho partiu de uma constatação: o conhecimento sobre como retardar o declínio cognitivo existe, mas a capacidade de aplicá-lo de forma contínua, personalizada e acompanhada no ambiente doméstico não existe. Os ensaios clínicos funcionam porque têm equipes. As famílias têm um cuidador sobrecarregado. O Cogni foi concebido para ocupar esse espaço, colocando o cuidador no centro e transformando as atividades da pessoa idosa em informação útil para quem cuida.

## RETOMADA DOS OBJETIVOS

O objetivo geral, desenvolver uma plataforma de apoio ao cuidador para estimulação cognitiva e acompanhamento longitudinal, fundamentada em evidências e em boas práticas de engenharia, foi atingido no escopo da primeira etapa. O {{qua:objetivos}} relaciona cada objetivo específico ao resultado obtido.

@@QUADRO|objetivos|Objetivos específicos e resultados

| Objetivo específico | Resultado | Capítulo |
|---|---|---|
| a) Revisar a literatura | Revisão de demências, cuidado, intervenções, biomarcadores, acessibilidade, IA, regulação e engenharia de software | 2 |
| b) Analisar soluções existentes | Comparação com soluções acadêmicas e comerciais; lacuna formulada | 3 |
| c) Especificar requisitos | 10 casos de uso, 46 RF e 24 RNF; revisão com 13 RF novos e 12 RNF revistos ou novos | 6 |
| d) Construir a matriz integrada | Matriz com 386 referências validadas automaticamente e 7 decisões resolvidas | 7 |
| e) Modelar o banco de dados | 17 tabelas, 15 tipos enumerados, 13 índices, 2 visões e segurança por vínculo | 9 |
| f) Projetar arquitetura portável | Arquitetura soberana com 11 ADRs e plano de continuidade | 8 |
| g) Implementar o protótipo | Telas, quatro jogos, autenticação real e auditoria técnica | 10 |
| h) Propor e avaliar o motor de métricas | Baseline pessoal e CUSUM avaliados em 3.600 pacientes sintéticos | 11 e 12 |
| i) Planejar verificação, campo e evolução | Estratégia de testes, protocolo de três estudos de campo e plano com 106 itens | 5, 12 e 15 |

@@FONTE|Elaborado pelos autores (2026).

## CONTRIBUIÇÕES

O trabalho oferece contribuições em quatro frentes.

Na **frente conceitual**, propõe a tese de que, em um software de cuidado cognitivo, a intervenção e a medição podem ser o mesmo ato, e que a comparação com o padrão da própria pessoa é mais sensível e mais honesta do que a comparação com normas populacionais.

Na **frente técnica**, mostra que a regra de tendência inicialmente adotada geraria alertas falsos com frequência incompatível com o uso real e que um detector robusto, simples e auditável reduz os falsos alarmes em uma a duas ordens de grandeza, com sensibilidade alta para declínios moderados quando há uso regular.

Na **frente de engenharia de software**, relata a construção de uma matriz de rastreabilidade automatizada em um projeto acadêmico real, com achados concretos sobre inconsistências entre documentos, e demonstra uma arquitetura que responde de forma objetiva à pergunta sobre continuidade diante do desaparecimento de fornecedores.

Na **frente ética e regulatória**, sistematiza os cuidados de privacidade, de linguagem e de enquadramento necessários a um software de apoio ao cuidado em saúde, tratando-os como requisitos verificáveis, e não como recomendações genéricas.

## LIMITAÇÕES

As limitações do trabalho foram registradas ao longo dos capítulos e são retomadas aqui. A pesquisa de campo ainda não foi realizada, e por isso a aceitação das funcionalidades pelos cuidadores não foi verificada empiricamente. O motor de métricas foi avaliado apenas em dados simulados, cujos parâmetros não foram estimados a partir de pessoas reais. A arquitetura proposta foi projetada e documentada, mas a migração completa ainda não foi concluída. A matriz integrada foi avaliada pela própria equipe. O sistema não foi validado clinicamente e não pode ser usado para fins diagnósticos.

## TRABALHOS FUTUROS

A segunda etapa do trabalho prevê:

a) concluir a migração para a arquitetura proposta e a correção de todos os defeitos de alta gravidade;

b) implementar o modo dedicado à pessoa idosa, com acessibilidade de nível AAA;

c) realizar a pesquisa de campo e o teste de usabilidade com cuidadores, mediante os trâmites éticos;

d) colocar o motor de métricas em produção e calibrar seus parâmetros com dados reais consentidos;

e) incluir os marcadores de fala e a reminiscência conversacional com processamento local;

f) fechar o ciclo de intervenção, com plano semanal, sessões de reforço e acompanhamento de fatores de risco;

g) gerar relatórios para profissionais em PDF e no padrão HL7 FHIR;

h) buscar parceria com grupo de pesquisa em envelhecimento para um estudo de validação.

O Cogni não pretende curar ou prevenir a doença de Alzheimer. Pretende algo mais modesto e, por isso mesmo, mais urgente: que nenhum cuidador precise acompanhar sozinho, e às cegas, a mudança de quem ama.
