# FUNDAMENTAÇÃO TEÓRICA

Este capítulo reúne os conceitos e as evidências que sustentam as decisões do projeto. Ele percorre três territórios: o da saúde (demências, cuidado e intervenções), o da tecnologia aplicada à saúde (biomarcadores digitais, acessibilidade, inteligência artificial e regulação) e o da engenharia de software (processos, requisitos, rastreabilidade, arquitetura, qualidade e segurança). Ao final, apresentam-se os fundamentos estatísticos do motor de métricas proposto no Capítulo 10.

## ENVELHECIMENTO POPULACIONAL E DEMÊNCIAS

### Panorama epidemiológico

O envelhecimento da população é um fenômeno global, mas no Brasil ocorre em velocidade superior à observada nos países que envelheceram primeiro. Em pouco mais de uma década, a participação das pessoas com 60 anos ou mais saltou de 10,8% para 15,6% da população (IBGE, 2023). A {{tab:epidemio}} reúne os principais indicadores utilizados ao longo deste trabalho.

@@TABELA|epidemio|Indicadores demográficos e epidemiológicos de referência

| Indicador | Valor | Fonte |
|---|---|---|
| População com 60 anos ou mais (Brasil, 2022) | 32,1 milhões (15,6%) | IBGE (2023) |
| Crescimento da população idosa entre 2010 e 2022 | 56,0% | IBGE (2023) |
| Prevalência estimada de demência (60 anos ou mais) | cerca de 8,5% | Brasil (2024a) |
| Casos de demência sem diagnóstico no Brasil | mais de 80% | Brasil (2024a); ABRAZ (2025) |
| Brasileiros com demência: estimativa atual e projeções | 1,8 milhão; 2,8 milhões (2030); 5,5 milhões (2050) | ABRAZ (2025) |
| Pessoas com demência no mundo | mais de 57 milhões | World Health Organization (2026a) |
| Novos casos por ano no mundo | quase 10 milhões | World Health Organization (2026a) |
| Participação da doença de Alzheimer nos casos | 60% a 70% | World Health Organization (2026a) |
| Fração de casos associada a fatores modificáveis | até 45% | Livingston *et al.* (2024) |

@@FONTE|Elaborada pelos autores (2026) com base nas fontes indicadas.

Dois números merecem destaque. O primeiro é o subdiagnóstico superior a 80%, que significa que a maior parte das pessoas com demência no país não recebe avaliação, orientação ou acompanhamento adequados. O segundo é a fração de casos associada a fatores modificáveis, que indica que há espaço real para prevenção e retardo da doença. Os dois números juntos delimitam o problema que o Cogni busca enfrentar: **há o que fazer, mas falta quem acompanhe**.

### Doença de Alzheimer, comprometimento cognitivo leve e domínios cognitivos

Demência é uma síndrome caracterizada pelo declínio de uma ou mais funções cognitivas, com intensidade suficiente para interferir na autonomia e nas atividades de vida diária. A doença de Alzheimer é a causa mais frequente, seguida pela demência vascular, pela demência com corpos de Lewy e pelas demências frontotemporais (WORLD HEALTH ORGANIZATION, 2026a). O comprometimento cognitivo leve (CCL) designa um estágio intermediário, em que há declínio mensurável sem perda significativa de autonomia. Ele é especialmente relevante porque é nele que as intervenções têm maior potencial de retardar a progressão.

O declínio cognitivo não é homogêneo. Ele afeta diferentes **domínios cognitivos** em ritmos distintos. O Cogni adota cinco domínios, coerentes com a prática da avaliação neuropsicológica e já presentes no protótipo e no modelo de dados:

a) **memória**: capacidade de codificar, armazenar e evocar informações, incluindo memória de trabalho, episódica e semântica;

b) **atenção**: capacidade de selecionar estímulos, manter o foco e responder com rapidez, frequentemente medida por tempo de reação;

c) **linguagem**: compreensão, nomeação, fluência e organização do discurso;

d) **função executiva**: planejamento, flexibilidade, controle inibitório e resolução de problemas;

e) **habilidade visuoespacial**: percepção, orientação e manipulação de informações espaciais.

### Política pública: a Lei nº 14.878/2024

Em junho de 2024, o Brasil instituiu a Política Nacional de Cuidado Integral às Pessoas com Doença de Alzheimer e Outras Demências, por meio da Lei nº 14.878 (BRASIL, 2024b). A lei prevê a organização dos serviços, a capacitação de profissionais e a inclusão das notificações de casos nos sistemas de informação do Sistema Único de Saúde (SUS), observada a proteção de dados pessoais. Também prevê articulação multissetorial entre saúde, assistência social, direitos humanos, educação e inovação. Para este trabalho, a lei tem dois significados: reconhece formalmente o problema como prioridade nacional e cria um ambiente institucional no qual ferramentas de apoio ao cuidador e à identificação precoce ganham relevância.

## O CUIDADOR FAMILIAR

O cuidado de uma pessoa com demência é, no Brasil, predominantemente informal e familiar. O cuidador acumula tarefas de supervisão, higiene, alimentação, administração de medicamentos, organização de consultas e suporte emocional, frequentemente sem preparo e sem rede de apoio. A literatura descreve esse quadro com o conceito de **sobrecarga do cuidador** (*caregiver burden*), que abrange dimensões físicas, emocionais, sociais e financeiras. O instrumento mais utilizado para medi-la é a escala de Zarit (ZARIT; REEVER; BACH-PETERSON, 1980), validada para o português brasileiro por Scazufca (2002).

Duas características do cuidador são centrais para o desenho do Cogni. A primeira é que ele é o principal observador da evolução da pessoa cuidada, mas registra essas observações de forma informal e intermitente. A segunda é que a sobrecarga reduz a disponibilidade de tempo e energia para aprender ferramentas complexas. Uma solução que exija muito do cuidador fracassa pela mesma razão que motiva a sua existência. Por isso, os princípios de **mínimo esforço**, **informação acionável** e **linguagem acolhedora** atravessam todo o projeto.

## INTERVENÇÕES NÃO FARMACOLÓGICAS COM EVIDÊNCIA CIENTÍFICA

### Terapia de estimulação cognitiva

A terapia de estimulação cognitiva (*Cognitive Stimulation Therapy*, CST) consiste em sessões estruturadas de atividades que envolvem pensamento, memória e linguagem, geralmente em grupo e com caráter social. O ensaio clínico randomizado de Spector *et al.* (2003), com 201 pessoas com demência, mostrou benefícios em cognição e qualidade de vida. A revisão sistemática Cochrane mais recente concluiu que a estimulação cognitiva produz benefícios pequenos, porém consistentes, na cognição de pessoas com demência leve a moderada, com indícios de efeitos sobre comunicação e qualidade de vida (WOODS *et al.*, 2023).

### Terapia de reminiscência

A terapia de reminiscência utiliza memórias pessoais (fotografias, objetos, músicas e histórias) para estimular a evocação e a comunicação. A revisão Cochrane de Woods *et al.* (2018), com 22 estudos e 1.972 participantes, encontrou efeitos inconsistentes e geralmente pequenos, com benefícios mais amplos em instituições de longa permanência, incluindo qualidade de vida, cognição e comunicação, e sem evidência de efeitos nocivos para a pessoa com demência. Revisões recentes sobre formatos digitais de reminiscência apontam possível redução de sintomas comportamentais e psicológicos da demência, ainda com base em poucos estudos e amostras pequenas, e sugerem que a personalização com conteúdo autobiográfico real tende a produzir os efeitos mais favoráveis (DIGITAL..., 2025).

Essa evidência justifica a postura adotada desde a definição do tema: a memória afetiva é posicionada como estímulo complementar e como contexto para a interação, e não como tratamento.

### Treino cognitivo e o papel das sessões de reforço

O estudo ACTIVE (*Advanced Cognitive Training for Independent and Vital Elderly*) randomizou mais de 2.800 idosos para treino de memória, de raciocínio ou de velocidade de processamento, além de um grupo controle. A análise de vinte anos de acompanhamento, baseada em registros de diagnóstico do Medicare para 2.021 participantes, mostrou que apenas o treino de velocidade de processamento **acompanhado de sessões de reforço** foi associado a menor incidência de demência diagnosticada: 40% no grupo treinado com reforços, contra 49% no grupo controle, o que corresponde a uma razão de risco de aproximadamente 0,75 (COE *et al.*, 2026). Sem os reforços, o efeito não foi observado. Os próprios autores apontam limitações, como o uso de registros administrativos e a ausência de um mecanismo explicativo, e há conflito de interesse declarado de uma das empresas envolvidas no software de treino.

O achado mais importante para o Cogni não é o tamanho do efeito, mas o padrão: **a intervenção funcionou quando foi sustentada ao longo do tempo**. Esse padrão é exatamente o que um software de acompanhamento contínuo pode oferecer.

### Intervenções multidomínio: FINGER e US POINTER

O estudo finlandês FINGER foi o primeiro grande ensaio randomizado a mostrar que uma intervenção multidomínio de dois anos (dieta, exercício, treino cognitivo e controle de fatores vasculares) melhora ou mantém o funcionamento cognitivo de idosos em risco (NGANDU *et al.*, 2015). O US POINTER, com 2.111 participantes nos Estados Unidos, comparou duas versões de intervenção multidomínio. A versão **estruturada**, com 38 encontros facilitados ao longo de dois anos, metas mensuráveis e acompanhamento, produziu melhora cognitiva superior à da versão **autoguiada**, com efeito consistente entre subgrupos de idade, sexo, etnia e genótipo APOE-ε4 (BAKER *et al.*, 2025).

O contraste entre os dois braços do POINTER é uma das justificativas mais fortes para o Cogni. A diferença entre eles não está no conteúdo, mas na **estrutura, no acompanhamento e na responsabilização**. Hoje essa estrutura depende de facilitadores humanos e não escala. O Cogni propõe que parte dela seja oferecida por software, com o cuidador no papel de facilitador apoiado pelo sistema.

### Fatores de risco modificáveis e a audição

A Comissão da *The Lancet* sobre prevenção, intervenção e cuidado em demência atualizou, em 2024, a lista de fatores de risco modificáveis para 14 itens, entre eles baixa escolaridade, perda auditiva, colesterol LDL elevado, depressão, traumatismo craniano, inatividade física, diabetes, tabagismo, hipertensão, obesidade, consumo excessivo de álcool, isolamento social, poluição do ar e perda visual não tratada. Em conjunto, esses fatores responderiam por até 45% dos casos (LIVINGSTON *et al.*, 2024). A estimativa é uma fração atribuível populacional e pressupõe causalidade e eliminação total dos fatores, de modo que deve ser lida como potencial, e não como promessa. Em julho de 2026, a Organização Mundial da Saúde publicou a segunda edição de suas diretrizes de redução de risco de declínio cognitivo e demência, que incorporam essa estimativa e recomendam, entre outras medidas, treino cognitivo, engajamento social, controle de hipertensão, diabetes e colesterol e a oferta de aparelhos auditivos a pessoas com perda auditiva (WORLD HEALTH ORGANIZATION, 2026b).

O ensaio ACHIEVE ilustra a complexidade desse campo. A intervenção auditiva não reduziu o declínio cognitivo de três anos na amostra total, mas, em uma análise de sensibilidade pré-especificada, desacelerou o declínio em 48% no subgrupo de maior risco (LIN *et al.*, 2023). Resultados como esse reforçam duas ideias que orientam o Cogni: intervenções precisam ser **direcionadas a quem mais se beneficia**, e só é possível saber quem se beneficia **medindo a resposta**.

O {{qua:evidencias}} sintetiza as evidências discutidas e a forma como cada uma se traduz em decisão de projeto.

@@QUADRO|evidencias|Síntese das evidências e sua tradução em decisões de projeto

| Evidência | Achado principal | Implicação para o Cogni |
|---|---|---|
| Estimulação cognitiva (WOODS *et al.*, 2023) | Benefício pequeno e consistente em demência leve a moderada | Jogos estruturados por domínio cognitivo, com sessões regulares |
| Reminiscência (WOODS *et al.*, 2018) | Efeitos pequenos e heterogêneos; maior benefício com personalização | Memória afetiva com conteúdo cadastrado pela família |
| ACTIVE, 20 anos (COE *et al.*, 2026) | Treino de velocidade com reforços associado a 25% menos demência | Treino de velocidade e agenda de sessões de reforço |
| US POINTER (BAKER *et al.*, 2025) | Estruturado superou autoguiado | Plano estruturado, metas e acompanhamento pelo cuidador |
| Lancet Commission (LIVINGSTON *et al.*, 2024) | Até 45% dos casos ligados a 14 fatores modificáveis | Check-ins simples sobre fatores de risco, sem caráter clínico |
| ACHIEVE (LIN *et al.*, 2023) | Benefício concentrado no subgrupo de maior risco | Medir a resposta individual em vez de presumir o efeito |

@@FONTE|Elaborado pelos autores (2026).

## DETECÇÃO PRECOCE E BIOMARCADORES

### Biomarcadores sanguíneos e o novo gargalo

O diagnóstico biológico da doença de Alzheimer dependia, até recentemente, de exames caros e pouco acessíveis, como a tomografia por emissão de pósitrons e a análise do líquido cefalorraquidiano. Em maio de 2025, a *Food and Drug Administration* (FDA) autorizou o primeiro exame de sangue para auxiliar o diagnóstico da doença, baseado na razão entre as proteínas pTau217 e β-amiloide 1-42, indicado para adultos com 55 anos ou mais com sintomas cognitivos e como complemento à avaliação clínica (FOOD AND DRUG ADMINISTRATION, 2025). Em agosto de 2026, a agência autorizou um segundo exame, baseado em pTau217, voltado também à atenção primária (PHARMAPHORUM, 2026).

Com exames de sangue disponíveis e medicamentos que atuam nos estágios iniciais da doença, o gargalo se desloca: a pergunta deixa de ser "como diagnosticar" e passa a ser **"quem deve ser avaliado, e quando"**. Ferramentas que acompanham o desempenho cognitivo ao longo do tempo e sinalizam mudanças consistentes podem contribuir para que a pessoa chegue mais cedo a uma avaliação profissional, sem que elas próprias assumam papel diagnóstico.

### Biomarcadores digitais de cognição

Biomarcadores digitais são medidas objetivas coletadas por dispositivos digitais que refletem estados ou processos fisiológicos e comportamentais. Em cognição, as linhas mais estudadas são:

a) **fala e linguagem**: características como pausas, velocidade de fala, diversidade lexical e uso de palavras vagas distinguem pessoas com doença de Alzheimer de controles em tarefas de descrição de imagens (FRASER; MELTZER; RUDZICZ, 2016). Estudos recentes com coortes europeias relatam que biomarcadores de fala detectam estágios iniciais de comprometimento cognitivo de forma remota e se relacionam com biomarcadores da doença (KÖNIG *et al.*, 2026);

b) **navegação espacial**: no jogo Sea Hero Quest, o desempenho em navegação distinguiu portadores do alelo APOE-ε4, de maior risco genético, de não portadores, mesmo sem queixas de memória (COUGHLAN *et al.*, 2019);

c) **interação com dispositivos**: padrões de digitação, de marcha medida por sensores e de uso do telefone vêm sendo investigados como sinais passivos, ainda com evidência preliminar.

A literatura também aponta limitações importantes. A maior parte dos estudos é transversal, com amostras pequenas e poucos resultados sobre diagnóstico e prognóstico. Há carência de validação longitudinal, ou seja, de estudos que acompanhem a mesma pessoa ao longo do tempo. O caso do dispositivo de estimulação sensorial de 40 Hz da empresa Cognito Therapeutics, que não atingiu o desfecho primário em seu ensaio de fase 3 divulgado em novembro de 2026, apesar de sinais favoráveis em um subgrupo de doença leve (COGNITO THERAPEUTICS, 2026), ilustra que tecnologias promissoras precisam de validação rigorosa antes de qualquer alegação de eficácia.

### Variabilidade intraindividual como sinal precoce

Um achado recorrente na literatura do envelhecimento cognitivo é que **a inconsistência do desempenho de uma pessoa** pode ser mais informativa do que o seu desempenho médio. Hultsch *et al.* (2000) mostraram que a variabilidade da latência de resposta era maior em pessoas com demência leve do que em adultos saudáveis e predizia o estado neurológico independentemente do nível médio de desempenho. A revisão sistemática de Haynes, Bauermeister e Bunce (2017) concluiu que a variabilidade intraindividual do tempo de reação está associada a declínio cognitivo subsequente e à conversão para CCL ou demência, com efeito modesto e com caráter de complemento à avaliação clínica, e não de instrumento diagnóstico isolado.

Esse conceito tem duas consequências diretas para o Cogni. A primeira é que os jogos devem registrar **cada resposta com seu tempo**, e não apenas a pontuação final. A segunda é que a análise deve comparar a pessoa **com ela mesma**, porque a variabilidade só tem significado em relação ao padrão individual.

## ACESSIBILIDADE E USABILIDADE PARA PESSOAS IDOSAS

O envelhecimento traz alterações visuais, auditivas, motoras e cognitivas que afetam a interação com interfaces digitais: menor sensibilidade a contraste, dificuldade com alvos de toque pequenos, menor tolerância a sobrecarga de informação e maior impacto de erros. As Diretrizes de Acessibilidade para Conteúdo Web, na versão 2.2, organizam os requisitos de acessibilidade em quatro princípios (perceptível, operável, compreensível e robusto) e três níveis de conformidade (A, AA e AAA). Entre os critérios mais relevantes para este público estão o contraste mínimo de 4,5:1 para texto (nível AA) e de 7:1 (nível AAA), o tamanho mínimo de alvo de toque e a previsibilidade da navegação (W3C, 2023).

Na dimensão da usabilidade, Nielsen (1993) define cinco atributos: facilidade de aprendizado, eficiência, facilidade de memorização, baixa taxa de erros e satisfação. Para medir a usabilidade percebida, a *System Usability Scale* (SUS) é um questionário de dez itens amplamente utilizado (BROOKE, 1996), e sua interpretação por faixas de pontuação foi proposta por Bangor, Kortum e Miller (2009). Recomendações nacionais sobre interfaces de celular para idosos reforçam pontos aplicáveis ao projeto, como ícones e botões grandes, espaçamento generoso, alto contraste e navegação simplificada (RECOMENDAÇÕES..., [20--]).

O Cogni atende dois públicos com necessidades distintas. O cuidador precisa de densidade de informação e eficiência. A pessoa idosa precisa de simplicidade extrema, poucos elementos por tela e nenhuma possibilidade de "se perder". Essa diferença motiva a proposta de dois modos de interface, discutida nos Capítulos 9 e 12.

## INTELIGÊNCIA ARTIFICIAL EM SAÚDE

Os modelos de linguagem de grande escala (*Large Language Models*, LLM) e os modelos multimodais ampliaram as possibilidades de interação em linguagem natural, de geração de resumos e de conversação. Em saúde, esses modelos trazem riscos específicos. A orientação da Organização Mundial da Saúde sobre ética e governança de grandes modelos multimodais aponta a produção de afirmações falsas, imprecisas, enviesadas ou incompletas, o **viés de automação** (a tendência de profissionais e pacientes confiarem excessivamente em respostas automatizadas), vulnerabilidades de segurança e riscos à privacidade, e recomenda auditoria, avaliação de impacto e envolvimento de partes interessadas (WORLD HEALTH ORGANIZATION, 2024).

No campo da engenharia de software, revisões recentes mostram que modelos de linguagem auxiliam em tarefas como geração de código, testes e documentação, mas erram com aparência de certeza e dependem fortemente do contexto fornecido (FAN *et al.*, 2023; HOU *et al.*, 2024).

Três princípios decorrem dessa literatura e orientam o uso de IA no Cogni:

a) **a IA não decide**: cálculos, alertas e recomendações são produzidos por regras determinísticas e auditáveis, e o modelo de linguagem apenas redige ou conversa sobre resultados já calculados;

b) **minimização de dados**: quando houver uso de modelo externo, apenas números agregados são enviados, nunca nome, fotografia, diagnóstico ou texto livre;

c) **substituibilidade**: o sistema funciona sem IA, e o provedor de IA pode ser trocado, incluindo modelos abertos executados localmente.

## ASPECTOS ÉTICOS, LEGAIS E REGULATÓRIOS

### Lei Geral de Proteção de Dados

A Lei nº 13.709/2018 classifica o dado referente à saúde como **dado pessoal sensível** (art. 5º, II), cujo tratamento exige hipótese legal específica, como o consentimento específico e destacado para finalidades determinadas (art. 11). A transferência internacional de dados pessoais só é permitida nas hipóteses do art. 33. O controlador deve manter registro das operações de tratamento (art. 37) e adotar medidas de segurança técnicas e administrativas aptas a proteger os dados (art. 46), observando princípios como finalidade, necessidade (minimização), transparência e segurança (art. 6º). Os direitos do titular incluem acesso, correção, portabilidade e eliminação (art. 18) (BRASIL, 2018).

Para um software como o Cogni, essas obrigações se traduzem em requisitos concretos: consentimento registrado e versionado, minimização dos campos coletados, controle de acesso por vínculo, trilha de auditoria, exportação e exclusão de dados a pedido do titular e cautela com qualquer serviço que envie dados para fora do país.

### Software como dispositivo médico

A Agência Nacional de Vigilância Sanitária regula o software como dispositivo médico (*Software as a Medical Device*, SaMD) por meio da RDC nº 657/2022, complementar à RDC nº 751/2022, que trata de todos os dispositivos médicos (BRASIL, 2022a; BRASIL, 2022b). É considerado SaMD o software que atende à definição de dispositivo médico, destinado a uma ou mais indicações médicas, e que realiza essas finalidades sem fazer parte de um hardware de dispositivo médico. A norma está em revisão para incorporar critérios específicos para soluções baseadas em inteligência artificial.

A finalidade declarada é o fator determinante do enquadramento. Um software que **diagnostica**, **prevê doença** ou **indica tratamento** tende a ser enquadrado como dispositivo médico. Um software que **apoia o cuidador**, **registra atividades** e **acompanha o desempenho em relação ao padrão da própria pessoa**, sem indicação diagnóstica ou terapêutica, situa-se em posição bem mais segura. Por essa razão, a linguagem da interface do Cogni é tratada como requisito, e não como detalhe de texto. A análise apresentada neste trabalho é técnica e não substitui parecer jurídico ou regulatório especializado.

### Ética em pesquisa com seres humanos

A pesquisa com seres humanos no Brasil é regida pela Resolução CNS nº 466/2012 e, nas ciências humanas e sociais, pela Resolução CNS nº 510/2016 (BRASIL, 2012; BRASIL, 2016). A Resolução nº 510/2016 dispensa de registro e avaliação pelo sistema CEP/CONEP as pesquisas de opinião pública com participantes não identificados (art. 1º, parágrafo único), entendidas como consulta pontual em que o participante expressa preferência ou avaliação, sem possibilidade de identificação (art. 2º, XIV). A orientação da CONEP é de interpretação restritiva: a dispensa vale apenas quando todos os procedimentos do protocolo se enquadram na hipótese. Coletas que envolvam pessoas identificáveis, dados de saúde, gravação de voz ou testes de usabilidade com idosos exigem submissão ao Comitê de Ética em Pesquisa. Essa distinção orienta o planejamento dos estudos com usuários previstos para a segunda etapa do trabalho.

## FUNDAMENTOS DE ENGENHARIA DE SOFTWARE

### Processos de software

Um processo de software é o conjunto de atividades que leva à produção de um sistema: especificação, projeto e implementação, validação e evolução (SOMMERVILLE, 2019). A norma ISO/IEC/IEEE 12207 organiza os processos do ciclo de vida do software em grupos de acordo, organizacionais, de gestão técnica e técnicos (ISO; IEC; IEEE, 2017). Fuggetta (2000) observa que a qualidade do produto está ligada à qualidade do processo, mas que processos precisam ser adequados ao contexto da equipe. Em equipes pequenas e com prazos curtos, como em um trabalho de conclusão de curso, processos iterativos e incrementais, com entregas frequentes e documentação enxuta, tendem a ser mais adequados (PRESSMAN; MAXIM, 2021).

Além do processo de software, o trabalho lida com **processos de negócio**, entendidos como o encadeamento de atividades que o sistema apoia, com responsáveis, regras e resultados (DUMAS *et al.*, 2018). Ligar cada atividade de negócio aos dados que ela manipula une a visão do processo à visão dos dados, ideia central da matriz integrada descrita no Capítulo 6.

### Requisitos e casos de uso

Requisitos expressam o que o sistema deve fazer (funcionais) e com quais qualidades e restrições (não funcionais). Wiegers e Beatty (2013) destacam que requisitos claros, verificáveis e rastreáveis são a base para controlar o escopo e o impacto de mudanças. Casos de uso descrevem a interação entre atores e sistema para atingir um objetivo, com pré-condições, pós-condições, fluxo principal, fluxos alternativos e regras de negócio (COCKBURN, 2000). A Linguagem de Modelagem Unificada (UML) oferece notações complementares, como diagramas de casos de uso, de atividades e de sequência.

### Rastreabilidade e documentação útil

Rastreabilidade de requisitos é a capacidade de seguir um requisito para trás, até sua origem, e para frente, até sua implementação e seus testes (GOTEL; FINKELSTEIN, 1994). Ramesh e Jarke (2001) propuseram modelos de referência para a rastreabilidade e mostraram que seu valor está na análise de impacto e no apoio à decisão. O principal obstáculo é o custo de manutenção: matrizes mantidas à mão envelhecem rapidamente e acabam abandonadas (CLELAND-HUANG *et al.*, 2014).

A documentação útil não é a mais volumosa, mas a que está atualizada, é fácil de consultar e responde às perguntas reais da equipe (RÜPING, 2003). Estudos com desenvolvedores mostram que a documentação é valorizada quando é mantida próxima do código e focada no que o código não revela, como intenções, decisões e restrições (FORWARD; LETHBRIDGE, 2002). Aghajani *et al.* (2019) catalogaram problemas de documentação, como desatualização, incompletude e inconsistência entre artefatos, que se mostraram presentes também neste projeto.

### Arquitetura de software

Arquitetura de software é o conjunto de estruturas necessárias para raciocinar sobre o sistema, compostas por elementos, relações entre eles e propriedades de ambos (BASS; CLEMENTS; KAZMAN, 2021). Três práticas foram adotadas neste trabalho:

a) o **modelo C4**, que descreve a arquitetura em níveis de abstração (contexto, contêineres, componentes e código), com diagramas simples e legíveis por públicos diferentes (BROWN, 2018);

b) os **registros de decisão de arquitetura** (*Architecture Decision Records*, ADR), documentos curtos que registram o contexto, a decisão, as alternativas e as consequências de cada escolha relevante (NYGARD, 2011);

c) o **monólito modular** como ponto de partida: Fowler (2015) argumenta que sistemas novos se beneficiam de começar como monólito bem modularizado, deixando a divisão em serviços para quando os limites do domínio estiverem claros. Newman (2021) reforça que microsserviços trazem custos operacionais que raramente se justificam em equipes pequenas.

### Qualidade de software

A norma ISO/IEC 25010 define um modelo de qualidade de produto com características como adequação funcional, eficiência de desempenho, compatibilidade, capacidade de interação (que inclui usabilidade e acessibilidade), confiabilidade, segurança, manutenibilidade, flexibilidade (que inclui portabilidade) e proteção (*safety*) (ISO; IEC, 2023). Essas características orientaram a definição dos requisitos não funcionais e das métricas de qualidade apresentadas no Capítulo 11. Em um software de saúde, segurança da informação, confiabilidade e portabilidade têm peso especial, porque falhas nessas dimensões afetam pessoas vulneráveis e a continuidade do cuidado.

### Integração e entrega contínuas

A entrega contínua é a prática de manter o software sempre em estado implantável, com cada alteração passando automaticamente por compilação, testes e verificações (HUMBLE; FARLEY, 2010). Além de reduzir riscos, a automação tem um efeito sobre a documentação: artefatos gerados e validados automaticamente a cada alteração, como a matriz integrada deste projeto, deixam de envelhecer.

### Segurança de aplicações e autenticação

O padrão de verificação de segurança de aplicações da OWASP (*Application Security Verification Standard*) organiza requisitos de segurança verificáveis para autenticação, gestão de sessão, controle de acesso, validação de entradas, criptografia e registro de eventos (OWASP FOUNDATION, 2025). As diretrizes de identidade digital do NIST, na revisão 4, recomendam senhas longas, triagem contra listas de senhas comprometidas e **proibição de regras de composição** obrigatórias (como exigir letras maiúsculas e números) e de troca periódica sem indício de comprometimento (NATIONAL INSTITUTE OF STANDARDS AND TECHNOLOGY, 2025). Para armazenamento de senhas, o algoritmo Argon2, vencedor da *Password Hashing Competition* e padronizado na RFC 9106, é a recomendação atual, sendo a variante Argon2id a indicada para uso geral (BIRYUKOV *et al.*, 2021). *Tokens* de acesso podem ser representados como *JSON Web Tokens*, definidos na RFC 7519 (JONES; BRADLEY; SAKIMURA, 2015).

## FUNDAMENTOS ESTATÍSTICOS PARA DETECÇÃO DE MUDANÇA

O motor de métricas proposto no Capítulo 10 se apoia em quatro conceitos estatísticos.

**Estatística robusta.** A média e o desvio-padrão são sensíveis a valores extremos, como uma sessão realizada em um dia de cansaço. A mediana e o desvio absoluto mediano (*Median Absolute Deviation*, MAD) são alternativas robustas. Leys *et al.* (2013) recomendam o MAD multiplicado pela constante 1,4826, que o torna comparável ao desvio-padrão em distribuições normais, como medida de dispersão para detecção de valores atípicos. Com esses dois valores calcula-se o **escore z robusto** de uma observação $x$:

$$z = \frac{x - \text{mediana}}{1{,}4826 \times \text{MAD}}$$

**Soma cumulativa (CUSUM).** Proposto por Page (1954) no contexto do controle estatístico de processos, o CUSUM acumula pequenos desvios persistentes em relação a um valor de referência e sinaliza quando a soma ultrapassa um limiar. Na forma unilateral, para detectar aumento:

$$S_t = \max(0,\ S_{t-1} + z_t - k), \qquad \text{alarme se } S_t > h$$

O parâmetro $k$ define a magnitude mínima de mudança de interesse, e $h$ controla o compromisso entre sensibilidade e falsos alarmes (MONTGOMERY, 2013). A propriedade central do CUSUM é distinguir **um desvio isolado**, que não acumula, de **uma tendência sustentada**, que acumula semana após semana.

**Procedimentos adaptativos de dificuldade.** Métodos de escada (*staircase*), como os procedimentos transformados de subida e descida de Levitt (1971), ajustam a dificuldade de uma tarefa conforme as respostas para manter a taxa de acerto em um nível-alvo. Sistemas de classificação inspirados no método Elo, originalmente criado para o xadrez, têm sido aplicados em sistemas educacionais adaptativos para estimar simultaneamente a habilidade do usuário e a dificuldade dos itens (PELÁNEK, 2016).

**Avaliação de detectores.** Um detector de mudança é avaliado por sua **sensibilidade** (proporção de mudanças reais detectadas), pela **taxa de falsos alarmes** (alarmes sem mudança real por unidade de tempo), pela **precisão** (proporção de alarmes que correspondem a mudanças reais) e pelo **atraso de detecção** (tempo entre o início da mudança e o alarme). Essas métricas são utilizadas na avaliação em coorte sintética apresentada no Capítulo 11.
