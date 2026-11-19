# INTRODUÇÃO

O Brasil envelhece em ritmo acelerado. O Censo Demográfico de 2022 registrou 32.113.490 pessoas com 60 anos ou mais, o equivalente a 15,6% da população, com crescimento de 56,0% em relação a 2010, quando esse grupo representava 10,8% do total (IBGE, 2023). A transição demográfica traz consigo uma transição epidemiológica: as doenças crônicas e degenerativas, entre elas as demências, passam a ocupar espaço crescente na vida das famílias e na agenda de saúde pública.

As demências constituem hoje uma das principais causas de incapacidade e dependência entre pessoas idosas. A Organização Mundial da Saúde estima que mais de 57 milhões de pessoas vivem com demência no mundo, com quase 10 milhões de novos casos por ano, sendo a doença de Alzheimer responsável por 60% a 70% deles (WORLD HEALTH ORGANIZATION, 2026a). No Brasil, o Relatório Nacional sobre a Demência, elaborado pelo Ministério da Saúde em parceria com a Universidade Federal de São Paulo, estimou a prevalência em cerca de 8,5% entre pessoas com 60 anos ou mais e apontou que mais de 80% dos casos permanecem sem diagnóstico (BRASIL, 2024a). A Associação Brasileira de Alzheimer projeta que o número de brasileiros vivendo com demência passe de aproximadamente 1,8 milhão para 2,8 milhões em 2030 e 5,5 milhões em 2050 (ABRAZ, 2025).

Essa realidade atinge duas pessoas ao mesmo tempo. A pessoa idosa enfrenta a perda progressiva de memória, de orientação e de autonomia. O cuidador, quase sempre um familiar e frequentemente uma mulher, assume uma rotina de sobrecarga emocional, física e financeira, sem instrumentos para acompanhar de forma objetiva a evolução da pessoa cuidada (ZARIT; REEVER; BACH-PETERSON, 1980; SCAZUFCA, 2002). As decisões cotidianas sobre quais atividades propor, como perceber uma piora e quando procurar um profissional de saúde costumam ser tomadas com base em impressões dispersas e na memória do próprio cuidador.

Ao mesmo tempo, a literatura científica dos últimos anos reuniu evidências consistentes de que intervenções não farmacológicas podem retardar o declínio cognitivo ou reduzir o risco de demência. Revisões sistemáticas da Colaboração Cochrane mostram benefícios da terapia de estimulação cognitiva em demência leve a moderada (WOODS *et al.*, 2023) e efeitos pequenos, porém consistentes, da terapia de reminiscência (WOODS *et al.*, 2018). O acompanhamento de vinte anos do estudo ACTIVE associou o treino de velocidade de processamento com sessões de reforço a uma redução de cerca de 25% na incidência de demência diagnosticada (COE *et al.*, 2026). O ensaio US POINTER mostrou que uma intervenção multidomínio estruturada, com acompanhamento e cobrança, produziu ganhos cognitivos superiores aos de uma versão autoguiada (BAKER *et al.*, 2025). A Comissão da revista *The Lancet* estimou que até 45% dos casos de demência estão associados a 14 fatores de risco modificáveis (LIVINGSTON *et al.*, 2024), conclusão incorporada às diretrizes atualizadas da Organização Mundial da Saúde (WORLD HEALTH ORGANIZATION, 2026b).

O conhecimento sobre o que funciona, portanto, existe. O que falta é a capacidade de aplicar essas intervenções de forma contínua, personalizada e acompanhada, por anos, no ambiente doméstico. Nos ensaios clínicos, essa função é cumprida por equipes de profissionais. Na vida real, ela recai sobre o cuidador, que não dispõe de ferramentas adequadas. As soluções digitais existentes tendem a resolver uma única dor (jogos cognitivos, reminiscência, gestão de medicamentos) e raramente integram estimulação, medição e apoio à decisão em um mesmo ciclo (APLICATIVOS..., 2023; CRIPPA, 2023).

É nesse espaço que se insere o **Cogni**, plataforma digital de apoio ao cuidador para estimulação cognitiva e acompanhamento longitudinal de idosos com doenças neurodegenerativas, tendo a doença de Alzheimer como principal caso de uso. O Cogni parte de uma premissa simples: o cuidador é o usuário final do sistema e a pessoa idosa é a beneficiária. As atividades realizadas pela pessoa idosa geram dados que retornam ao cuidador na forma de um painel de acompanhamento, fechando um ciclo de **medir, comparar, personalizar e intervir**.

## PROBLEMA DE PESQUISA

Diante desse cenário, este trabalho busca responder à seguinte pergunta: **como projetar e construir uma plataforma digital que apoie o cuidador familiar no acompanhamento cognitivo de idosos com doenças neurodegenerativas, integrando estimulação cognitiva baseada em evidências, medição longitudinal do desempenho e apoio à decisão, de forma segura, acessível, sustentável e independente de fornecedores específicos?**

A pergunta se desdobra em questões mais específicas, que orientaram as decisões ao longo do projeto:

a) quais intervenções e indicadores têm sustentação científica suficiente para orientar o desenho das atividades e das métricas?

b) como organizar requisitos, processos, regras e dados de modo rastreável, em uma equipe pequena e com prazo curto?

c) que arquitetura permite que o software sobreviva ao desaparecimento de qualquer fornecedor de infraestrutura?

d) como transformar o desempenho em jogos em sinais úteis ao cuidador, sem produzir alarmes excessivos e sem assumir caráter diagnóstico?

e) que cuidados de privacidade, acessibilidade e regulação são necessários em um software que trata dados de saúde de pessoas vulneráveis?

## OBJETIVOS

### Objetivo geral

Desenvolver o Cogni, uma plataforma digital de apoio ao cuidador para estimulação cognitiva e acompanhamento longitudinal de idosos com doenças neurodegenerativas, fundamentada em evidências científicas e em boas práticas de engenharia de software, privacidade e acessibilidade.

### Objetivos específicos

a) revisar a literatura científica sobre demências, cuidado familiar, intervenções não farmacológicas, biomarcadores digitais, acessibilidade e aspectos regulatórios de software em saúde;

b) analisar as soluções acadêmicas e comerciais existentes, nacionais e internacionais, identificando lacunas;

c) elicitar e especificar os requisitos funcionais e não funcionais do sistema, organizados em casos de uso descritivos;

d) construir uma matriz integrada de processos, dados e inteligência artificial que assegure a rastreabilidade entre funcionalidades, processos, atividades, regras e dados, com validação automatizada;

e) modelar o banco de dados relacional do sistema, contemplando integridade, auditoria e conformidade com a Lei Geral de Proteção de Dados;

f) projetar uma arquitetura portável, sem dependência de serviços proprietários, e registrar as decisões arquiteturais com suas alternativas;

g) implementar um protótipo funcional da interface do cuidador, dos jogos cognitivos e da autenticação;

h) propor e avaliar, em coorte sintética, um motor de métricas baseado em baseline pessoal e detecção de mudança;

i) planejar a verificação, a validação com usuários e a evolução do sistema na segunda etapa do trabalho.

## JUSTIFICATIVA

A relevância do trabalho se apoia em quatro dimensões.

Na **dimensão social**, o crescimento projetado das demências no Brasil e a elevada taxa de subdiagnóstico indicam que ferramentas acessíveis, de baixo custo e utilizáveis fora do circuito clínico formal podem cumprir um papel relevante. O cuidador familiar, que sustenta a maior parte do cuidado, é um público pouco atendido pelas soluções existentes.

Na **dimensão científica**, o trabalho aproxima três campos que costumam caminhar separados: a evidência clínica sobre intervenções não farmacológicas, a pesquisa emergente sobre biomarcadores digitais de cognição e a engenharia de software aplicada à saúde. A proposta de comparar cada pessoa com o seu próprio padrão, e não com normas populacionais, está alinhada à literatura sobre variabilidade intraindividual como marcador precoce de declínio (HULTSCH *et al.*, 2000; HAYNES; BAUERMEISTER; BUNCE, 2017).

Na **dimensão tecnológica**, o trabalho demonstra que é possível construir uma solução de saúde digital com tecnologias abertas, portáveis e de baixo custo, com rastreabilidade de requisitos automatizada, arquitetura documentada por decisões explícitas e um caminho claro de evolução.

Na **dimensão econômica**, o envelhecimento populacional movimenta a chamada economia da longevidade (SEBRAE, 2023), e a combinação proposta não possui concorrente direto e maduro no mercado brasileiro, como discutido no Capítulo 3.

## DELIMITAÇÃO DO ESCOPO

O Cogni é uma ferramenta de **apoio ao cuidado**. Ele não diagnostica doenças, não indica tratamentos e não substitui a avaliação de profissionais de saúde. Essa delimitação não é apenas uma cautela retórica: ela orienta a linguagem da interface, o desenho dos alertas, a escolha das métricas e a análise regulatória apresentada no Capítulo 2.

O trabalho está dividido em duas etapas, conforme a estrutura das disciplinas de Trabalho de Conclusão de Curso. A primeira etapa (TCC I), objeto principal deste documento, abrange a fundamentação, a especificação de requisitos, a matriz integrada, a modelagem de dados, o protótipo funcional, a proposta arquitetural e a avaliação do motor de métricas em dados simulados. A segunda etapa (TCC II) prevê a migração completa para a arquitetura proposta, o modo dedicado à pessoa idosa, a análise de fala, a reminiscência conversacional e a validação com usuários, conforme o planejamento apresentado no Capítulo 14.

Nenhum dado de pessoa real foi utilizado nas avaliações deste trabalho. Todas as análises quantitativas foram feitas com dados sintéticos. Os estudos com cuidadores e profissionais de saúde estão previstos para a segunda etapa, condicionados aos trâmites éticos aplicáveis.

## ESTRUTURA DO TRABALHO

Além desta introdução, o trabalho está organizado da seguinte forma. O Capítulo 2 apresenta a fundamentação teórica nas áreas de saúde, tecnologia e engenharia de software. O Capítulo 3 discute trabalhos relacionados e o mercado. O Capítulo 4 descreve a metodologia. O Capítulo 5 apresenta os requisitos e a modelagem comportamental do sistema. O Capítulo 6 trata da matriz integrada de processos, dados e inteligência artificial. O Capítulo 7 descreve a arquitetura, e o Capítulo 8, o modelo de dados. O Capítulo 9 apresenta a implementação do protótipo. O Capítulo 10 propõe o motor de métricas e os componentes inteligentes. O Capítulo 11 trata da verificação, da validação e dos resultados da avaliação em coorte sintética. O Capítulo 12 consolida os desafios encontrados e as soluções adotadas. O Capítulo 13 analisa a viabilidade e a sustentabilidade da proposta. O Capítulo 14 apresenta o planejamento e o roteiro de evolução, e o Capítulo 15 traz as considerações finais.
