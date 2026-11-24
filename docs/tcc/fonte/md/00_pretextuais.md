# RESUMO {.unnumbered .pretextual}

O envelhecimento acelerado da população brasileira amplia a presença das demências no cotidiano das famílias. Estimativas do Ministério da Saúde indicam que cerca de 8,5% das pessoas com 60 anos ou mais convivem com algum tipo de demência e que mais de 80% dos casos permanecem sem diagnóstico. O cuidado recai, na maior parte das vezes, sobre um familiar que não dispõe de instrumentos para acompanhar a evolução cognitiva da pessoa cuidada nem para decidir quando procurar ajuda especializada. Este trabalho apresenta o Cogni, uma plataforma digital que coloca o cuidador no centro do cuidado e combina três frentes: jogos de estimulação cognitiva fundamentados em evidências, acompanhamento longitudinal do desempenho em relação ao padrão da própria pessoa e apoio à decisão do cuidador, em linguagem não diagnóstica. A pesquisa, de natureza aplicada e abordagem mista, seguiu um processo iterativo de engenharia de software que incluiu revisão da literatura recente, análise de mercado, especificação de requisitos em dez casos de uso, uma matriz integrada de processos, dados e inteligência artificial com 386 referências cruzadas validadas automaticamente e a modelagem do banco de dados. Durante o desenvolvimento, a dependência de um provedor de *backend* como serviço foi identificada como risco de continuidade, e o sistema foi reconstruído sobre uma arquitetura própria e portável: interface em React e TypeScript, API em Python com FastAPI, banco PostgreSQL e implantação com Docker. A versão entregue registra cada evento dos quatro jogos com resolução de milissegundos, calcula uma pontuação versionada no servidor, oferece perfis de responsável, cuidador e acompanhante, instituições com gestor e equipe, e atende à Lei Geral de Proteção de Dados com consentimento versionado, trilha de auditoria, exportação e exclusão dos dados. O motor de métricas combina linha de base pessoal robusta (mediana e desvio absoluto mediano) e soma cumulativa (CUSUM). Em uma coorte sintética de 400 pacientes simulados por cenário, a regra de tendência original gerou entre 12 e 17 falsos alarmes por paciente-ano, enquanto o detector manteve entre 0,13 e 0,85, com sensibilidade de 90% a 100% para declínios moderados a intensos quando havia duas ou mais sessões semanais. O sistema conta com 41 testes automatizados executados em integração contínua. Os resultados indicam que a combinação entre estimulação cognitiva, medição contínua e participação do cuidador é tecnicamente viável com tecnologias abertas e de baixo custo, e que sua adoção com pessoas reais depende de validação clínica e de estudos com cuidadores.

**Palavras-chave:** demência; cuidador; estimulação cognitiva; engenharia de software; saúde digital.

# ABSTRACT {.unnumbered .pretextual}

The rapid ageing of the Brazilian population is increasing the presence of dementia in family life. Ministry of Health estimates indicate that about 8.5% of people aged 60 or over live with some form of dementia and that more than 80% of cases remain undiagnosed. Care usually falls on a family member who has no tools to follow the cognitive trajectory of the person being cared for or to decide when to seek specialised help. This work presents Cogni, a digital platform that places the caregiver at the centre of care and combines three fronts: evidence-based cognitive stimulation games, longitudinal monitoring of performance relative to the person's own baseline, and decision support for the caregiver in non-diagnostic language. The research, applied in nature and mixed in approach, followed an iterative software engineering process that included a review of recent literature, market analysis, requirements specification in ten use cases, an integrated matrix of processes, data and artificial intelligence with 386 automatically validated cross-references, and database modelling. During development, dependence on a backend-as-a-service provider was identified as a continuity risk, and the system was rebuilt on its own portable architecture: a React and TypeScript interface, a Python API built with FastAPI, a PostgreSQL database and deployment with Docker. The delivered version records every event of the four games with millisecond resolution, computes a versioned score on the server, offers responsible, caregiver and viewer roles, institutions with a manager and staff, and complies with the Brazilian General Data Protection Law through versioned consent, an audit trail, and data export and deletion. The metrics engine combines a robust personal baseline (median and median absolute deviation) with a cumulative sum (CUSUM). In a synthetic cohort of 400 simulated patients per scenario, the original trend rule produced between 12 and 17 false alarms per patient-year, while the detector kept between 0.13 and 0.85, with 90% to 100% sensitivity for moderate to severe decline when there were two or more weekly sessions. The system has 41 automated tests run in continuous integration. The results indicate that combining cognitive stimulation, continuous measurement and caregiver participation is technically feasible with open, low-cost technologies, and that its adoption with real people depends on clinical validation and studies with caregivers.

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

TR – Tempo de reação

UC – Caso de uso (*use case*)

UML – *Unified Modeling Language*

VPS – *Virtual Private Server* (servidor virtual privado)

WCAG – *Web Content Accessibility Guidelines*
:::

# SUMÁRIO {.unnumbered .pretextual}

[[TOC]]
