# METODOLOGIA

Este capítulo descreve a classificação da pesquisa, as etapas percorridas, o processo de desenvolvimento adotado, os procedimentos de revisão da literatura, as ferramentas utilizadas e os cuidados éticos. A pesquisa de campo, por sua extensão, é detalhada no Capítulo 5.

## CLASSIFICAÇÃO DA PESQUISA

Segundo os critérios de Gil (2017), a pesquisa classifica-se como:

a) **aplicada** quanto à natureza, pois visa gerar conhecimento para a solução de um problema concreto, o apoio ao cuidador de idosos com doenças neurodegenerativas;

b) **exploratória e descritiva** quanto aos objetivos. É exploratória porque investiga um campo em que as soluções existentes são fragmentadas e as evidências sobre biomarcadores digitais ainda estão em formação. É descritiva porque registra de forma sistemática os requisitos, a arquitetura, o modelo de dados e o comportamento do sistema;

c) **mista** quanto à abordagem, combinando análise qualitativa (revisão da literatura, especificação de requisitos, relato de experiência sobre a matriz integrada e análise das decisões de projeto) e análise quantitativa (avaliação do motor de métricas em coorte sintética e métricas da matriz integrada);

d) quanto aos procedimentos, combina **pesquisa bibliográfica**, **pesquisa documental** (normas, legislação e documentação técnica), **desenvolvimento tecnológico**, **estudo de simulação** e **pesquisa de campo**, esta última em nível de protocolo nesta etapa.

O desenvolvimento tecnológico segue a lógica da **pesquisa em ciência do design** (*design science research*), em que o conhecimento é produzido pela construção e avaliação de um artefato que resolve um problema relevante. Hevner *et al.* (2004) propõem diretrizes para esse tipo de pesquisa: o artefato deve ser viável, o problema deve ser relevante, a avaliação deve ser rigorosa, as contribuições devem ser verificáveis e o processo deve ser comunicado a públicos técnicos e não técnicos. Neste trabalho, os artefatos são o protótipo do Cogni, a matriz integrada automatizada, o modelo de dados, a arquitetura proposta e o motor de métricas.

## ETAPAS DA PESQUISA

A pesquisa foi conduzida em etapas alinhadas ao cronograma da disciplina de TCC I, como mostra o {{qua:etapas}}.

@@QUADRO|etapas|Etapas da pesquisa e produtos gerados

| Etapa | Período (2026) | Atividades | Produtos |
|---|---|---|---|
| 1. Definição do tema | ago. | Orientação, delimitação do problema, objetivos e justificativa | Documento de tema |
| 2. Pesquisa bibliográfica e de mercado | ago.–set. | Levantamento acadêmico e comercial, análise de lacunas | Documento de pesquisa bibliográfica e de mercado |
| 3. Requisitos | set. | Elicitação, especificação e organização em casos de uso | 10 casos de uso, 46 RF e 24 RNF |
| 4. Definição de tecnologias | set. | Avaliação de alternativas de pilha tecnológica | Documento de definição de tecnologias |
| 5. Prototipação | set. | Protótipo navegável de alta fidelidade | Protótipo em React com dados simulados |
| 6. Modelagem UML | set.–out. | Casos de uso, atividades, sequência e processos | Diagramas na ferramenta Miro |
| 7. Modelagem de dados | out. | Modelos conceitual, lógico e físico | DER, dicionário de dados e *script* SQL |
| 8. Matriz integrada | out.–nov. | Matriz de processos, dados e IA, com automação em Python | Planilha validada, JSON e *script* |
| 9. Autenticação e cadastros | out.–nov. | Login, cadastro em etapas e recuperação de senha | Integração com o banco de dados |
| 10. Revisão arquitetural | nov. | Auditoria do código, análise de dependência de fornecedor, proposta de arquitetura | ADR, plano de execução, simulação |
| 11. Documento final do TCC I | nov. | Consolidação e redação | Este documento |

@@FONTE|Elaborado pelos autores (2026).

## PROCESSO DE DESENVOLVIMENTO

O desenvolvimento seguiu um processo **iterativo e incremental**, com ciclos semanais coincidentes com as aulas da disciplina. Cada ciclo partia de um objetivo (por exemplo, "login, cadastro e recuperação de senha"), produzia um incremento verificável e terminava com revisão pela equipe e pelo orientador. Essa escolha segue a recomendação de adequar o processo ao contexto da equipe (FUGGETTA, 2000) e privilegia entregas frequentes sobre documentação extensa feita antecipadamente (PRESSMAN; MAXIM, 2021).

Três práticas complementares foram adotadas:

a) **controle de versão** com Git e GitHub, com mensagens de *commit* descritivas e histórico preservado;

b) **plano de execução versionado**, um documento no próprio repositório que organiza o trabalho restante em fases e itens identificados, cada um com contexto, arquivos envolvidos, dependências e critério objetivo de conclusão. Ao concluir um item, o identificador é marcado no mesmo *commit* da alteração, o que mantém o plano sincronizado com o código;

c) **documentação próxima do código**: decisões de arquitetura, matriz integrada e plano ficam no repositório e evoluem junto com o software (RÜPING, 2003; FORWARD; LETHBRIDGE, 2002).

## PROCEDIMENTOS DE REVISÃO DA LITERATURA

A revisão da literatura teve caráter narrativo, com busca orientada por perguntas. Foram consultadas as bases PubMed, Cochrane Library, SciELO, IEEE Xplore, ACM Digital Library e Google Acadêmico, além de documentos oficiais de organismos de saúde (Organização Mundial da Saúde, Ministério da Saúde, IBGE e FDA), legislação brasileira e normas técnicas.

Os critérios de seleção priorizaram:

a) revisões sistemáticas e metanálises, em especial as da Colaboração Cochrane;

b) ensaios clínicos randomizados de grande porte e seus acompanhamentos de longo prazo;

c) diretrizes e relatórios de organismos oficiais;

d) trabalhos clássicos de engenharia de software, banco de dados e estatística;

e) publicações de 2015 a 2026 para os temas em rápida evolução (biomarcadores digitais, inteligência artificial e regulação).

Notícias e comunicados de empresas foram usados apenas para registrar eventos recentes (como autorizações regulatórias e resultados divulgados em congressos), sempre identificados como tal. Os números citados foram conferidos, sempre que possível, na fonte primária. Quando as fontes divergiam, como no percentual de idosos do Censo de 2022, adotou-se o valor da publicação oficial e registrou-se a divergência.

## AVALIAÇÃO POR SIMULAÇÃO

Como não é ético nem viável, nesta etapa, coletar dados longitudinais de pessoas com demência, o motor de métricas foi avaliado em uma **coorte sintética**: pacientes simulados com parâmetros conhecidos, alguns estáveis e outros com declínio de início e intensidade conhecidos. Essa abordagem permite medir sensibilidade, falsos alarmes, precisão e atraso de detecção com exatidão, porque a "verdade" é conhecida por construção. O desenho da simulação, seus parâmetros e seus resultados estão no Capítulo 12, e o código-fonte completo, no Apêndice F. A limitação dessa abordagem, discutida no mesmo capítulo, é que a validade dos resultados depende do realismo do modelo gerador.

## FERRAMENTAS UTILIZADAS

O {{qua:ferramentas}} apresenta as ferramentas utilizadas e sua finalidade.

@@QUADRO|ferramentas|Ferramentas utilizadas no trabalho

| Categoria | Ferramenta | Finalidade |
|---|---|---|
| Modelagem | Miro | Diagramas UML colaborativos (casos de uso, atividades, sequência e processos) |
| Prototipação | Figma Make | Geração inicial do protótipo navegável de alta fidelidade |
| Front-end | React 19, TypeScript 5, Vite 8, Tailwind CSS 4 | Implementação da interface |
| Backend atual | Supabase (PostgreSQL, Auth) | Autenticação e persistência na versão atual do protótipo |
| Backend proposto | Python 3.12, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL 16 | Arquitetura soberana proposta (Capítulo 8) |
| Infraestrutura | Docker, Docker Compose, Caddy | Empacotamento e implantação portável |
| Automação | Python, openpyxl | Geração e validação da matriz integrada |
| Análise | Python, NumPy, Matplotlib | Simulação da coorte sintética e gráficos |
| Versionamento | Git, GitHub | Controle de versão e colaboração |
| Diagramas técnicos | Mermaid | Diagramas de arquitetura versionáveis em texto |
| Apoio por IA | Assistentes de IA generativa | Apoio à revisão de código, pesquisa bibliográfica e revisão textual, sempre com conferência humana |

@@FONTE|Elaborado pelos autores (2026).

## USO DE INTELIGÊNCIA ARTIFICIAL GENERATIVA NO PROCESSO

Por transparência, registra-se que ferramentas de IA generativa foram usadas como apoio em tarefas de engenharia e de pesquisa: revisão do código do protótipo, sugestão de estrutura para documentos, busca e conferência de referências e revisão textual. Três regras foram observadas, as mesmas definidas na aba de *prompts* da matriz integrada (Capítulo 7): a IA responde apenas com base nos registros fornecidos; toda resposta é tratada como sugestão e conferida por uma pessoa antes de qualquer decisão; e nenhum dado real de pessoa foi fornecido a essas ferramentas. A responsabilidade pelo conteúdo, pelas decisões e pelas referências é integralmente dos autores.

## ASPECTOS ÉTICOS

Nenhum dado de pessoa real foi coletado ou utilizado nas análises deste documento. As telas do protótipo utilizam pessoas fictícias. A avaliação quantitativa utiliza dados sintéticos. As etapas que envolverão participantes humanos (questionário com cuidadores, entrevistas com profissionais e teste de usabilidade) estão descritas em nível de protocolo no Capítulo 5, com a indicação do enquadramento ético de cada uma segundo as Resoluções CNS nº 466/2012 e nº 510/2016 (BRASIL, 2012; BRASIL, 2016). A coleta só ocorrerá após a confirmação do enquadramento pelo Comitê de Ética em Pesquisa da instituição e, quando exigido, após aprovação do protocolo.
