# PLANEJAMENTO E ROTEIRO DE EVOLUÇÃO

Este capítulo apresenta o cronograma cumprido na primeira etapa, os marcos de evolução e o plano de execução que organiza o trabalho restante.

## CRONOGRAMA DO TCC I

O {{qua:cronograma}} apresenta o cronograma da disciplina e a situação de cada etapa no fechamento deste documento.

@@QUADRO|cronograma|Cronograma da disciplina de TCC I

| Semana | Datas (2026) | Etapa | Situação |
|---|---|---|---|
| 1 | 04–05/ago. | Orientação das equipes | Concluída |
| 2 | 11–12/ago. | Entrega do cronograma | Concluída |
| 3 | 18–19/ago. | Tema, integrantes, objetivo e justificativa | Concluída |
| 4 | 25–26/ago. | Pesquisa bibliográfica e de mercado | Concluída |
| 5 | 01–02/set. | Lista de requisitos funcionais | Concluída |
| 6 | 09/set. | Definição das tecnologias | Concluída |
| 7 | 15–16/set. | Protótipo de telas e navegabilidade | Concluída |
| 8 | 22–23/set. | Defesa do projeto | Concluída |
| 9 | 29–30/set. | Implementação das telas | Concluída |
| 10 | 06–07/out. | Implementação do banco | Concluída |
| 11 | 14/out. | Telas e banco | Concluída |
| 12 | 20–21/out. | Login, cadastro e recuperação de senha | Concluída |
| 13 | 27–28/out. | Apresentação: fluxo de processos e login | Concluída |
| 14 | 03–04/nov. | Correções e cadastros básicos | Concluída |
| 15 | 10–11/nov. | Cadastros básicos (continuação) | Concluída |
| 16 | 17–18/nov. | Preparação do documento do TCC I | Concluída |
| 17 | 24–25/nov. | Defesa do projeto | Em andamento |
| 18 | 01–02/dez. | Correções e entrega do documento e do código | A realizar |
| 19 | 08–09/dez. | Reapresentação, se necessária | A realizar |

@@FONTE|Elaborado pelos autores (2026), com base no cronograma da disciplina.

## MARCOS DE EVOLUÇÃO

O trabalho foi organizado em cinco marcos, apresentados no {{qua:marcos}} com a situação de cada um na entrega deste documento. Os dois marcos do TCC I foram cumpridos, e parte dos marcos seguintes foi antecipada.

@@QUADRO|marcos|Marcos de evolução do projeto

| Marco | Prazo | Objetivo | Situação |
|---|---|---|---|
| M1 – Defesa do TCC I | 24–25/nov./2026 | Correções dos defeitos de alta gravidade; sessões gravadas de fato; arquitetura e evidências apresentadas | Concluído: todos os defeitos da auditoria corrigidos e sessões gravadas de fato (Capítulo 9) |
| M2 – Entrega do TCC I | 01–02/dez./2026 | *Backend* próprio com autenticação; interface sem dependência de BaaS; jogos gravando eventos; integração contínua | Concluído e antecipado para a defesa: API própria, interface sem BaaS, eventos nos jogos e integração contínua |
| M3 – Base sólida | Início do TCC II | Modo da pessoa idosa, acessibilidade, LGPD completa, implantação em VPS com backup testado | Parcial: acessibilidade AA, termo de uso, exportação, exclusão e auditoria concluídos; faltam o modo da pessoa idosa e a implantação em servidor |
| M4 – Inteligência | Meio do TCC II | Baseline pessoal, detecção de mudança e dificuldade adaptativa em produção; estudos de usabilidade e aceitação com cuidadores | Parcial: linha de base pessoal e detecção de mudança implementadas; faltam a dificuldade adaptativa e os estudos com cuidadores |
| M5 – Diferencial | Fim do TCC II | Fala, reminiscência conversacional, ciclo fechado de intervenção, relatórios em PDF e FHIR | A realizar |

@@FONTE|Elaborado pelos autores (2026).

## PLANO DE EXECUÇÃO

O trabalho foi detalhado em um plano de execução versionado no repositório, com 106 itens distribuídos em 18 fases, dos quais 47 estavam concluídos na entrega deste documento. Cada item tem identificador fixo, contexto, arquivos envolvidos, dependências e critério objetivo de conclusão. O {{qua:fases}} resume as fases. O plano completo é um documento vivo, mantido no repositório do projeto.

@@QUADRO|fases|Fases do plano de execução

| Fase | Tema | Marco | Itens concluídos |
|---|---|---|---|
| F0 | Correções imediatas dos defeitos da auditoria | M1 | 9 de 10 |
| F1 | Fundação do repositório: organização, análise estática, testes, integração contínua e ADRs | M1–M2 | 2 de 8 |
| F2 | *Backend* FastAPI, PostgreSQL e Docker | M2 | 5 de 6 |
| F3 | Autenticação própria | M2 | 6 de 7 |
| F4 | *Front-end* conectado à API própria | M2 | 6 de 8 |
| F5 | Modelo de dados do domínio e cadastros | M2 | 4 de 4 |
| F6 | Medição nos jogos: eventos e pontuação versionada | M2 | 3 de 5 |
| F7 | Modo da pessoa idosa e acessibilidade | M3 | 2 de 6 |
| F8 | Segurança e LGPD | M3 | 5 de 7 |
| F9 | Motor de métricas | M4 | 3 de 5 |
| F10 | Coorte sintética e avaliação | M4 | 2 de 4 |
| F11 | Voz e marcadores de fala | M5 | 0 de 6 |
| F12 | Reminiscência conversacional | M5 | 0 de 6 |
| F13 | Ciclo fechado de intervenção | M5 | 0 de 5 |
| F14 | Relatórios e interoperabilidade | M5 | 0 de 3 |
| F15 | Experiência e apresentação | M5 | 0 de 4 |
| F16 | Implantação, backup e operação | M3 | 0 de 6 |
| F17 | Preparação das bancas | M1 e M5 | 0 de 6 |

@@FONTE|Elaborado pelos autores (2026).

O plano adota regras de trabalho explícitas: um item por vez; respeito às dependências; marcação do item como concluído no mesmo *commit* da alteração; registro de cada conclusão em um histórico de progresso; e registro de decisões arquiteturais como ADR. Dois princípios transversais também estão no plano: nenhum dado real de paciente antes da aprovação ética, e linguagem não diagnóstica em toda a interface. Parte da fase F10 foi antecipada neste trabalho, com a simulação apresentada no Capítulo 11.
