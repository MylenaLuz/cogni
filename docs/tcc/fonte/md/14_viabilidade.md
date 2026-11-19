# VIABILIDADE, SUSTENTABILIDADE E MODELO DE NEGÓCIO

Este capítulo analisa se o Cogni é viável técnica, econômica e organizacionalmente, discute a sustentabilidade do uso de inteligência artificial e apresenta possibilidades de modelo de negócio. As estimativas de custo são de ordem de grandeza, com valores de referência sujeitos a variação entre provedores e ao longo do tempo.

## VIABILIDADE TÉCNICA

A viabilidade técnica foi demonstrada em três níveis. O protótipo funcional implementa as telas, os jogos e a autenticação real. O modelo de dados foi executado e validado em PostgreSQL 16. O motor de métricas foi implementado e avaliado em simulação, com resultados quantitativos favoráveis. Todas as tecnologias da arquitetura proposta são de código aberto, maduras e amplamente documentadas. Os componentes de maior risco técnico (transcrição de fala e modelos de linguagem locais) foram isolados como opcionais, de modo que sua eventual inviabilidade não compromete o núcleo do sistema.

## VIABILIDADE ECONÔMICA

O {{qua:custos}} apresenta a estrutura de custos nas diferentes fases.

@@QUADRO|custos|Estrutura de custos por fase

| Item | Fase acadêmica (TCC) | Piloto (dezenas de famílias) | Operação inicial (centenas a milhares) |
|---|---|---|---|
| Licenças de *software* | Nenhum (código aberto) | Nenhum | Nenhum |
| Servidor | Máquina local da equipe | Uma VPS pequena | VPS maior ou duas VPS com réplica |
| Banco de dados | Contêiner local | Contêiner na VPS | Contêiner na VPS ou serviço gerenciado PostgreSQL padrão |
| Domínio e certificado HTTPS | Opcional | Domínio anual; certificado gratuito | Igual |
| E-mail transacional | Servidor de testes local | Plano gratuito de qualquer provedor SMTP | Plano pago por volume |
| Backup externo | Disco local | Armazenamento de baixo custo | Igual, com retenção maior |
| IA generativa | Modelo local ou nenhum | Modelo local ou nenhum | Opcional; custo por uso controlado por *cache* |

@@FONTE|Elaborado pelos autores (2026).

O custo operacional dominante é o servidor. Em escala de piloto, uma única VPS de entrada é suficiente para a API, o banco e o servidor web, porque o volume de dados por família é pequeno: uma sessão de jogo gera algumas dezenas de eventos, e duas sessões semanais por pessoa produzem volume modesto mesmo após anos. O componente que mais pesaria em hardware seria a execução de modelos de linguagem e de transcrição locais sem GPU, razão pela qual eles são opcionais e processados de forma assíncrona.

## SUSTENTABILIDADE DO USO DE INTELIGÊNCIA ARTIFICIAL

Uma pergunta recorrente é se o uso de IA "se sustenta" com o pagamento de planos de IA. Três esclarecimentos são necessários.

a) **Assinaturas de consumidor de assistentes de IA não servem como *backend* de aplicações.** Elas não oferecem acesso programático e seus termos de uso não preveem esse fim. Aplicações utilizam APIs cobradas por volume de *tokens* processados.

b) **No desenho do Cogni, o volume de IA é pequeno e controlável.** O modelo apenas redige resumos a partir de números já calculados. Um resumo pode ser gerado uma vez por dia e armazenado, em vez de a cada abertura de tela, o que limita o custo a uma chamada diária por pessoa acompanhada, e apenas quando o recurso estiver ativo.

c) **A dependência pode ser eliminada.** Com modelos abertos executados localmente, o custo passa de "por uso" para "por hardware", e com o `NullProvider` o sistema funciona sem IA.

A longo prazo, a tendência observada de queda do custo por *token* e de melhora dos modelos abertos favorece a estratégia de não se prender a um provedor. A sustentabilidade, portanto, não depende de um plano de IA específico, mas da arquitetura que trata a IA como componente substituível.

## MODELO DE NEGÓCIO

O valor do Cogni para o mercado não está apenas no aplicativo, mas em duas posições que ele pode ocupar: a de **porta de entrada para a avaliação precoce**, em um contexto em que exames de sangue e tratamentos para estágios iniciais estão se tornando disponíveis (Capítulo 2), e a de **base de trajetórias cognitivas longitudinais com intervenção registrada**, justamente o tipo de dado que a literatura aponta como escasso. O {{qua:canvas}} organiza a proposta segundo os blocos de um quadro de modelo de negócio.

@@QUADRO|canvas|Quadro de modelo de negócio do Cogni

| Bloco | Conteúdo |
|---|---|
| Segmentos de clientes | Famílias cuidadoras; instituições de longa permanência para idosos; operadoras de planos de saúde; centros de pesquisa clínica; gestores públicos de saúde |
| Proposta de valor | Estimulação cognitiva baseada em evidências, acompanhamento em relação ao padrão da própria pessoa, alertas confiáveis e relatórios para profissionais, com privacidade por arquitetura |
| Canais | Associações de Alzheimer e grupos de apoio; profissionais de saúde que recomendam o uso; parcerias institucionais |
| Relacionamento | Autoatendimento com orientação; conteúdo educativo ao cuidador; suporte por e-mail |
| Fontes de receita | Modelo gratuito para famílias com recursos essenciais e plano pago com relatórios avançados; licenças institucionais por residente acompanhado; contratos com operadoras; projetos de pesquisa |
| Recursos-chave | Motor de métricas, base de trajetórias consentidas, equipe técnica, conteúdo de atividades |
| Atividades-chave | Desenvolvimento, validação clínica, conformidade com LGPD, criação de conteúdo |
| Parcerias-chave | Universidades e grupos de pesquisa em envelhecimento; associações de pacientes e cuidadores; profissionais de saúde |
| Estrutura de custos | Equipe, infraestrutura, validação clínica, assessoria jurídica e regulatória |

@@FONTE|Elaborado pelos autores (2026).

Três observações qualificam esse modelo. Primeiro, para operadoras de planos de saúde, a pessoa idosa é a beneficiária de maior custo, e ferramentas que apoiem a prevenção e o acompanhamento têm proposta de valor clara. Segundo, a Lei nº 14.878/2024 cria um ambiente institucional favorável a soluções de apoio ao cuidado de pessoas com demência no SUS. Terceiro, qualquer uso de dados para pesquisa exige consentimento específico, anonimização e aprovação ética, e nunca pode ser condição para o uso do aplicativo.

## CAMINHO DE VALIDAÇÃO E REGULAÇÃO

A evolução do Cogni de projeto acadêmico para produto passa por etapas que não podem ser abreviadas:

a) **estudo de usabilidade e aceitação** com cuidadores (Capítulo 5);

b) **estudo observacional de viabilidade**, com aprovação ética, para calibrar os parâmetros do motor com dados reais e medir a adesão;

c) **estudo de validação** das métricas em comparação com instrumentos clínicos padronizados, em parceria com grupo de pesquisa;

d) **análise regulatória formal**: enquanto o Cogni se mantiver como ferramenta de apoio ao cuidado, sem finalidade diagnóstica ou terapêutica, o enquadramento como SaMD tende a não se aplicar. Qualquer evolução para alegações clínicas exigirá regularização junto à ANVISA (BRASIL, 2022a).

## RISCOS

O {{qua:riscos}} apresenta os principais riscos do projeto e as respectivas mitigações.

@@QUADRO|riscos|Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Pesquisa com seres humanos sem aprovação ética | Baixa | Alto | Dados sintéticos; protocolo submetido ao CEP antes da coleta |
| Enquadramento como dispositivo médico | Média | Alto | Linguagem não diagnóstica (RNF31); revisão com orientador e assessoria |
| Alegações exageradas na apresentação | Média | Alto | Declaração explícita de protótipo não validado clinicamente |
| Baixa adesão das famílias | Alta | Alto | Atividades curtas, lembretes, valor percebido pelo cuidador, memória afetiva |
| Falsos alarmes gerando ansiedade | Média | Alto | Detector avaliado; limiar conservador; linguagem acolhedora |
| Perda de dados | Baixa | Alto | Backup diário externo; restauração testada |
| Prazo insuficiente para a migração | Alta | Médio | Priorização no plano de execução; itens não concluídos como trabalho futuro |
| Qualidade insuficiente de modelos abertos em português | Média | Baixo | IA opcional; avaliação com perguntas reais antes de adotar |

@@FONTE|Elaborado pelos autores (2026).
