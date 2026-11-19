# RESUMO {.unnumbered .pretextual}

O envelhecimento acelerado da população brasileira amplia a presença das demências no cotidiano das famílias. Estimativas do Ministério da Saúde indicam que cerca de 8,5% das pessoas com 60 anos ou mais convivem com algum tipo de demência e que mais de 80% dos casos permanecem sem diagnóstico. O cuidado recai, na maior parte das vezes, sobre um familiar que não dispõe de instrumentos para acompanhar a evolução cognitiva da pessoa cuidada nem para decidir quando procurar ajuda especializada. Este trabalho apresenta o Cogni, uma plataforma digital que coloca o cuidador no centro do cuidado e combina três frentes: atividades de estimulação cognitiva fundamentadas em evidências, acompanhamento longitudinal do desempenho em relação ao padrão da própria pessoa e apoio à decisão do cuidador. A pesquisa, de natureza aplicada e abordagem mista, seguiu um processo iterativo de engenharia de software que incluiu revisão da literatura científica recente, análise de mercado, especificação de 46 requisitos funcionais e 24 requisitos não funcionais em dez casos de uso, construção de uma matriz integrada de processos, dados e inteligência artificial com validação automatizada de 386 referências cruzadas, modelagem de um banco de dados relacional com 17 tabelas e implementação de um protótipo funcional em React e TypeScript com autenticação real. Durante o desenvolvimento, a dependência de um provedor de backend como serviço foi identificada como risco de continuidade e motivou a proposta de uma arquitetura soberana, composta por API em Python com FastAPI, banco PostgreSQL e implantação em contêineres portáveis. Também foi proposto um motor de métricas que substitui a regra de tendência baseada em variação semanal de 5% por um detector de mudança que combina baseline pessoal robusto (mediana e desvio absoluto mediano) e soma cumulativa (CUSUM). Em uma coorte sintética de 400 pacientes simulados por cenário, a regra original gerou entre 12 e 17 falsos alarmes por paciente-ano, enquanto o detector proposto manteve entre 0,13 e 0,85 falso alarme por paciente-ano, com sensibilidade de 90% a 100% para declínios moderados a intensos quando havia duas ou mais sessões semanais. Os resultados indicam que a combinação entre estimulação cognitiva, medição contínua e participação do cuidador é tecnicamente viável com tecnologias abertas e de baixo custo, desde que acompanhada de cuidados explícitos com privacidade, linguagem não diagnóstica e validação clínica futura.

**Palavras-chave:** demência; cuidador; estimulação cognitiva; engenharia de software; saúde digital.

# ABSTRACT {.unnumbered .pretextual}

The rapid ageing of the Brazilian population is increasing the presence of dementia in family life. Ministry of Health estimates indicate that about 8.5% of people aged 60 or over live with some form of dementia and that more than 80% of cases remain undiagnosed. Care usually falls on a family member who has no tools to follow the cognitive trajectory of the person being cared for or to decide when to seek specialised help. This work presents Cogni, a digital platform that places the caregiver at the centre of care and combines three fronts: evidence-based cognitive stimulation activities, longitudinal monitoring of performance relative to the person's own baseline, and decision support for the caregiver. The research, applied in nature and mixed in approach, followed an iterative software engineering process that included a review of recent scientific literature, market analysis, the specification of 46 functional and 24 non-functional requirements in ten use cases, the construction of an integrated matrix of processes, data and artificial intelligence with automated validation of 386 cross-references, the modelling of a relational database with 17 tables, and the implementation of a functional prototype in React and TypeScript with real authentication. During development, dependence on a backend-as-a-service provider was identified as a continuity risk and led to the proposal of a sovereign architecture composed of a Python API built with FastAPI, a PostgreSQL database and deployment in portable containers. A metrics engine was also proposed, replacing the trend rule based on a 5% weekly variation with a change detector that combines a robust personal baseline (median and median absolute deviation) with a cumulative sum (CUSUM). In a synthetic cohort of 400 simulated patients per scenario, the original rule produced between 12 and 17 false alarms per patient-year, while the proposed detector kept between 0.13 and 0.85 false alarms per patient-year, with 90% to 100% sensitivity for moderate to severe decline when there were two or more weekly sessions. The results indicate that combining cognitive stimulation, continuous measurement and caregiver participation is technically feasible with open, low-cost technologies, provided that it is accompanied by explicit care for privacy, non-diagnostic language and future clinical validation.

**Keywords:** dementia; caregiver; cognitive stimulation; software engineering; digital health.

# LISTA DE FIGURAS {.unnumbered .pretextual}

[[LOF]]

# LISTA DE QUADROS {.unnumbered .pretextual}

[[LOQ]]

# LISTA DE TABELAS {.unnumbered .pretextual}

[[LOT]]

# LISTA DE ABREVIATURAS E SIGLAS {.unnumbered .pretextual}

::: {custom-style="Siglas"}
ABNT – Associação Brasileira de Normas Técnicas

ABRAZ – Associação Brasileira de Alzheimer

ADR – *Architecture Decision Record* (registro de decisão de arquitetura)

ANVISA – Agência Nacional de Vigilância Sanitária

API – *Application Programming Interface* (interface de programação de aplicações)

BaaS – *Backend as a Service* (backend como serviço)

C4 – *Context, Containers, Components and Code*

CCL – Comprometimento cognitivo leve

CEP – Comitê de Ética em Pesquisa

CI/CD – *Continuous Integration / Continuous Delivery* (integração e entrega contínuas)

CNS – Conselho Nacional de Saúde

CONEP – Comissão Nacional de Ética em Pesquisa

CST – *Cognitive Stimulation Therapy* (terapia de estimulação cognitiva)

CUSUM – *Cumulative Sum* (soma cumulativa)

CV – Coeficiente de variação

DER – Diagrama entidade-relacionamento

FDA – *Food and Drug Administration*

FHIR – *Fast Healthcare Interoperability Resources*

HTTPS – *Hypertext Transfer Protocol Secure*

IA – Inteligência artificial

IBGE – Instituto Brasileiro de Geografia e Estatística

IIV – *Intraindividual Variability* (variabilidade intraindividual)

JSON – *JavaScript Object Notation*

JWT – *JSON Web Token*

LGPD – Lei Geral de Proteção de Dados Pessoais

LLM – *Large Language Model* (modelo de linguagem de grande escala)

MAD – *Median Absolute Deviation* (desvio absoluto mediano)

ORM – *Object-Relational Mapping* (mapeamento objeto-relacional)

PWA – *Progressive Web App*

RDC – Resolução da Diretoria Colegiada

RF – Requisito funcional

RLS – *Row Level Security* (segurança em nível de linha)

RNDS – Rede Nacional de Dados em Saúde

RNF – Requisito não funcional

SaMD – *Software as a Medical Device* (software como dispositivo médico)

SQL – *Structured Query Language*

SUS – Sistema Único de Saúde (ou *System Usability Scale*, conforme o contexto)

TCLE – Termo de Consentimento Livre e Esclarecido

TR – Tempo de reação

UC – Caso de uso (*use case*)

UML – *Unified Modeling Language*

VPS – *Virtual Private Server* (servidor virtual privado)

WCAG – *Web Content Accessibility Guidelines*
:::

# SUMÁRIO {.unnumbered .pretextual}

[[TOC]]
