# IMPLEMENTAÇÃO DO SISTEMA

Este capítulo descreve o Cogni na versão entregue ao fim do TCC I, já sobre a arquitetura final apresentada no Capítulo 7: *front-end* em React, API própria em Python com FastAPI, banco PostgreSQL e implantação com Docker Compose. O capítulo funciona como um **guia do sistema**: para cada tela, mostra o que é cada elemento, como o valor exibido é calculado, qual critério foi usado e em que se baseia. Quando um elemento resulta de uma decisão de projeto, e não de evidência publicada, isso é dito explicitamente.

Ao final, o capítulo registra o caminho percorrido até essa versão: os problemas encontrados na auditoria do protótipo inicial, as mudanças motivadas por testes e as diferenças entre a proposta do Capítulo 10 e o que foi efetivamente implementado.

Todas as capturas de tela usam a **conta de demonstração**, com três pessoas fictícias e sessões simuladas geradas pelo *script* de dados de exemplo (`seed`). Nenhum dado de pessoa real foi usado.

## VISÃO GERAL DA VERSÃO FINAL

O {{qua:numeros}} resume a versão final em números.

@@QUADRO|numeros|A versão final em números

| Item | Valor |
|---|---|
| *Front-end* | React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7; cerca de 5.300 linhas em 17 telas, 3 jogos em telas próprias e 9 componentes |
| API | FastAPI, SQLAlchemy 2, Alembic, Pydantic; cerca de 2.400 linhas em Python |
| Banco de dados | PostgreSQL 16, com esquema versionado por migrações |
| Testes automatizados | 35 testes da API (executados em SQLite e em PostgreSQL) e 6 testes do *front-end* |
| Integração contínua | GitHub Actions: verificação de tipos, testes e compilação do *front-end*; análise estática, migrações e testes da API com PostgreSQL |
| Pacote de produção | 395,9 KB de JavaScript (110,1 KB compactado com gzip) e 39,4 KB de CSS |
| Implantação | Docker Compose; em produção, Caddy com HTTPS automático, *scripts* de *backup* e restauração |

@@FONTE|Elaborado pelos autores (2026).

O código está organizado em duas partes no mesmo repositório:

```text
src/                        front-end
  api/                      cliente HTTP e tipos da API
  state/                    sessão do cuidador e dados do painel
  lib/                      gravação de eventos, prévia da pontuação,
                            embaralhamento
  components/               barra de navegação, cabeçalho e resultado
                            dos jogos, avatar, tratamento de erros
  screens/                  telas e jogos
backend/
  app/routers/              autenticação, pessoas e sessões, conta
  app/services/pontuacao.py pontuação v1 a partir dos eventos
  app/services/motor.py     linha de base pessoal e detecção de mudança
  app/seed.py               dados fictícios de demonstração
  alembic/                  migrações do banco
  tests/                    testes automatizados
```

### O caminho de uma sessão

O fluxo abaixo mostra o que acontece desde o toque na tela até a informação chegar ao cuidador. Ele é a base de quase todos os números das telas descritas a seguir.

a) **Durante o jogo**, o navegador grava cada evento bruto (estímulo exibido, toque, omissão, tentativa) com o instante em milissegundos, medido pelo relógio de alta resolução do navegador (`performance.now`), e não por contagem de segundos;

b) **ao salvar**, a sessão é enviada à API com todos os eventos, o nível, as observações do cuidador e o contexto (tamanho da tela, hora local);

c) **a API calcula a pontuação** com a fórmula `v1` a partir dos eventos e grava a sessão, os eventos e a versão da fórmula. O número mostrado no fim do jogo é uma prévia calculada no navegador com a mesma regra; o valor gravado é sempre o do servidor;

d) **o motor de métricas** analisa o histórico de cada jogo da pessoa, estima o padrão pessoal e verifica se houve mudança sustentada;

e) **o painel, o perfil, os relatórios e as análises** exibem o resultado, sempre em linguagem não diagnóstica.

## SISTEMA VISUAL E ACESSIBILIDADE

O visual foi pensado para ser **acolhedor sem ser infantilizado**. O {{qua:visual}} resume as decisões da versão final.

@@QUADRO|visual|Decisões do sistema visual

| Elemento | Decisão | Motivo |
|---|---|---|
| Cor primária | Azul-petróleo `#2C7A7A` | Calma e confiança sem aparência hospitalar |
| Fundo | Areia `#F7F2E9` | Menos brilho que o branco puro |
| Destaque | Verde `#52B788` para preenchimentos e `#2B7A55` para texto | O verde claro reprovava como cor de texto (Capítulo 11) |
| Erro | Vermelho `#B84444` | Legível como texto, sem tom agressivo |
| Texto secundário | `#4F6363` e `#5F7272` | Contraste mínimo de 4,5:1 em todos os fundos usados |
| Tipografia | Nunito, servida pelo próprio aplicativo | Legibilidade; nenhum pedido a serviços de terceiros |
| Tamanho mínimo de texto | 12 px; textos principais em 14 a 16 px | Público idoso e cuidadores com pouca familiaridade digital |
| Foco e movimento | Contorno de foco visível; animações desligadas quando o sistema pede movimento reduzido | WCAG 2.2, critérios 2.4.7 e 2.3.3 (W3C, 2023) |
| Feedback | Verde para acerto, tremor curto para erro, mensagens encorajadoras | Estímulo sem caráter punitivo |

@@FONTE|Elaborado pelos autores (2026), com base em W3C (2023).

Todas as combinações de texto e fundo da paleta final atingem o nível AA das WCAG 2.2 (W3C, 2023). Os valores medidos estão na análise de contraste do Capítulo 11. A barra de rolagem, antes oculta, voltou a ser exibida, e os botões e campos receberam rótulos para leitores de tela.

## GUIA DAS TELAS

### Acesso e cadastro

A {{fig:telas_acesso}} apresenta as telas de entrada e as três etapas do cadastro.

@@FIG|telas_acesso|Telas de acesso e cadastro|img/telas_acesso.png|Elaborado pelos autores (2026), captura do sistema com dados fictícios.|16

@@QUADRO|tela_acesso|Elementos das telas de acesso e cadastro

| Elemento | O que é e como funciona | Critério ou base |
|---|---|---|
| Entrar | E-mail e senha. Em caso de erro, a mensagem é sempre a mesma, sem revelar se o e-mail existe. Após 5 tentativas erradas em 15 minutos, o acesso é bloqueado temporariamente | OWASP ASVS (OWASP FOUNDATION, 2025) |
| Etapa 1: credenciais | Nome, e-mail, senha e confirmação. A senha precisa ter de 8 a 128 caracteres e não pode estar numa lista de senhas muito comuns. Não há exigência de maiúscula, número ou símbolo | NIST SP 800-63B-4: regras de composição levam a senhas previsíveis; comprimento e bloqueio de senhas comuns são mais eficazes (NATIONAL INSTITUTE OF STANDARDS AND TECHNOLOGY, 2025) |
| Aceite do termo | Caixa obrigatória com o resumo do tratamento dos dados e *link* para o termo de uso e política de privacidade completo, que abre em outra aba sem perder o que já foi preenchido. O aceite é gravado com data e versão do termo | LGPD, art. 11: dado de saúde exige consentimento específico e destacado (BRASIL, 2018); texto integral no Apêndice D |
| Etapa 2: perfil do cuidador | Telefone e tipo de vínculo: familiar, cuidador profissional ou instituição de repouso. Para instituição, pede-se também o nome do local, e o cadastro cria a instituição com o cuidador como gestor | Perfis e papéis descritos na seção "Perfis, papéis e instituições" |
| Etapa 3: pessoa acompanhada | Nome, data de nascimento, condição informada e familiaridade com tecnologia. A etapa é opcional e pode ser feita depois em "Nova pessoa" | Minimização de dados (LGPD, art. 6º, III): só o nome é obrigatório |
| Recuperar senha | O cuidador informa o e-mail e recebe um *link* válido por 30 minutos e de uso único. A resposta é sempre a mesma, exista ou não a conta | OWASP ASVS (OWASP FOUNDATION, 2025) |

@@FONTE|Elaborado pelos autores (2026).

O cadastro é **atômico**: a conta, o perfil do cuidador, a pessoa acompanhada (se informada), o vínculo entre eles e o registro de consentimento são gravados numa única transação. Se qualquer parte falhar, nada é gravado.

O envio do e-mail de recuperação usa um servidor SMTP configurado por variáveis de ambiente. Quando nenhum servidor está configurado, como no ambiente de desenvolvimento, o conteúdo do e-mail, com o *link*, é escrito no registro (*log*) da API. Por isso, nos testes locais, o e-mail não chega à caixa de entrada.

### Painel e pessoas

A {{fig:telas_painel}} apresenta o painel inicial, a lista de pessoas e o cadastro de nova pessoa.

@@FIG|telas_painel|Painel do cuidador, lista de pessoas e cadastro de nova pessoa|img/telas_painel.png|Elaborado pelos autores (2026), captura do sistema com dados fictícios.|16

@@QUADRO|tela_painel|Elementos do painel e da lista de pessoas

| Elemento | O que é e como é calculado | Critério ou base |
|---|---|---|
| Pessoas acompanhadas | Número de pessoas ativas vinculadas ao cuidador | Cada cuidador só vê as pessoas a que está vinculado |
| Sessões hoje | Sessões iniciadas no dia corrente, somando todas as pessoas | Indicador de adesão à rotina |
| Avisos | Número de pessoas com mudança sustentada abaixo do próprio padrão em algum jogo | Regra do motor de mudança (ver "Perfil da pessoa") |
| Cartão "Vale olhar" | Texto do aviso gerado pelo motor, com botão para o perfil | Linguagem não diagnóstica (Capítulo 10) |
| Selo de estado | "Dentro do padrão", "Acima do padrão", "Abaixo do padrão" ou "Formando o padrão" | Comparação com a própria pessoa, nunca com uma norma populacional |
| Índice | Média das pontuações das últimas 8 sessões, de qualquer jogo, de 0 a 100. Antes da primeira sessão aparece "—" | Decisão de projeto: número único para comunicação; o motor não usa o índice para gerar avisos |
| Sessões recentes | As últimas sessões de todas as pessoas, com jogo, data e pontuação | — |
| Nova pessoa | Mesmo formulário da etapa 3 do cadastro, com campo de observações sobre a pessoa | Minimização de dados: só o nome é obrigatório |

@@FONTE|Elaborado pelos autores (2026).

As cores dos números seguem três faixas: verde a partir de 65, azul-petróleo de 50 a 64 e vermelho abaixo de 50. As faixas são apenas visuais, uma decisão de projeto para facilitar a leitura rápida, e não têm significado clínico.

### Perfil da pessoa

O perfil é a tela mais densa do sistema. A {{fig:telas_perfil}} mostra o perfil de uma pessoa fictícia que está abaixo do próprio padrão no jogo de atenção.

@@FIG|telas_perfil|Perfil da pessoa acompanhada|img/telas_perfil.png|Elaborado pelos autores (2026), captura do sistema com dados fictícios.|15

@@QUADRO|tela_perfil|Elementos do perfil da pessoa

| Elemento | O que é e como é calculado | Critério ou base |
|---|---|---|
| Aviso no topo | Texto gerado quando há mudança sustentada abaixo do padrão em algum jogo. Diz o que mudou, em qual jogo, que a mudança é consistente e sugere conversar com o profissional de saúde | Linguagem não diagnóstica; RNF31 |
| "Em relação ao próprio padrão" | Estado geral da pessoa. Basta um jogo abaixo do padrão para o estado geral ser "Abaixo do padrão"; senão, basta um acima para "Acima do padrão"; se todos os jogos ainda estão em formação, "Formando o padrão"; nos demais casos, "Dentro do padrão" | Decisão de projeto: prioriza o sinal de piora, que é o que pede atenção do cuidador |
| Índice dos jogos | Igual ao do painel: média das últimas 8 sessões | Decisão de projeto |
| "Ainda formando o padrão" | Aparece para cada jogo com menos de 19 sessões, com o número de sessões que faltam | 6 sessões de aprendizado descartadas e 12 para estimar o padrão (Capítulo 10) |
| Perfil por domínio (radar) | Cinco domínios: memória, atenção, linguagem, função executiva e habilidade visuoespacial. Cada valor é a média ponderada da média das últimas 10 pontuações de cada jogo que estimula aquele domínio | Pesos definidos pelos autores (ver {{qua:jogos_medicao}}); não há validação clínica dos pesos |
| Evolução — 8 semanas | Média semanal das pontuações. S8 é a semana atual, iniciada na segunda-feira; S1 é a semana de sete semanas atrás. Semanas sem sessão repetem o valor da semana anterior, para a linha não cair a zero | Decisão de projeto; ver limitações |
| Domínios (barras) | Os mesmos valores do radar, em barras. Domínio sem nenhum jogo jogado aparece como "sem dados" | Evita confundir ausência de dado com desempenho zero |
| Sobre a pessoa | Observações gerais do cadastro (preferências, rotina) | Informado pelo cuidador |
| Sessões | As 15 sessões mais recentes, com jogo, data, duração, nível, pontuação e as observações que o cuidador escreveu ao fim da sessão | — |

@@FONTE|Elaborado pelos autores (2026).

**Como o sistema decide que houve mudança.** Para cada jogo, o motor escolhe uma métrica principal: no jogo de atenção, o tempo de reação mediano da sessão; nos demais, a pontuação. As 6 primeiras sessões são descartadas, porque nelas o desempenho melhora rapidamente à medida que a pessoa aprende a tarefa. As 12 seguintes formam o padrão pessoal, resumido pela mediana e pelo desvio absoluto mediano (MAD) multiplicado por 1,4826, medidas que não são distorcidas por um dia atípico (LEYS *et al.*, 2013). Cada sessão posterior é convertida em um escore z robusto, limitado a ±4, e acumulada por uma soma cumulativa (CUSUM) bilateral, com folga $k = 0{,}5$ e limiar $h = 8$ (PAGE, 1954; MONTGOMERY, 2013). Uma soma acompanha a piora e outra a melhora. Quando uma delas passa do limiar, o jogo entra em "abaixo" ou "acima do padrão", estado que permanece enquanto o alarme tiver ocorrido nas 6 últimas sessões. Um único dia ruim não basta para disparar um aviso: é preciso que o desvio se repita.

### Relatórios

A {{fig:telas_relatorios}} apresenta a tela de relatórios.

@@FIG|telas_relatorios|Relatórios por pessoa e por período|img/telas_relatorios.png|Elaborado pelos autores (2026), captura do sistema com dados fictícios.|11

@@QUADRO|tela_relatorios|Elementos da tela de relatórios

| Elemento | O que é e como é calculado | Critério ou base |
|---|---|---|
| Seleção de pessoa e período | Semana, mês ou 3 meses: últimos 7, 30 ou 90 dias contados a partir de hoje | — |
| Índice dos jogos | Mesmo índice do perfil, com o estado em relação ao padrão | Decisão de projeto |
| Sessões no período | Quantidade de sessões no período escolhido | Adesão |
| Duração média | Média da duração das sessões do período, em minutos | — |
| Evolução do índice | Média semanal das 8 últimas semanas, como no perfil | — |
| Sessões por semana | Barras com o número de sessões de cada uma das 8 últimas semanas | O motor precisa de uso regular; o sistema recomenda duas ou mais sessões por semana |
| Por domínio | Os cinco domínios, como no perfil | Pesos definidos pelos autores |
| Lista de sessões | Sessões do período com jogo, data, duração, nível, pontuação e observações | — |
| Exportar CSV | Arquivo com todas as sessões da pessoa: data, jogo, nível, duração, pontuação e observações | Portabilidade (LGPD, art. 18, V); abre em planilhas |

@@FONTE|Elaborado pelos autores (2026).

Além do CSV por pessoa, o cuidador pode exportar todos os dados da conta em formato JSON, incluindo os eventos brutos de cada sessão, e pode excluir a conta. Na exclusão, as pessoas que não têm outro cuidador vinculado são excluídas junto.

### Análises

A {{fig:telas_analises}} apresenta a tela de análises.

@@FIG|telas_analises|Tela de análises|img/telas_analises.png|Elaborado pelos autores (2026), captura do sistema com dados fictícios.|15

@@QUADRO|tela_analises|Tipos de cartão da tela de análises e regra que gera cada um

| Cartão | Quando aparece | Texto exibido (exemplo) |
|---|---|---|
| Vale olhar | Um jogo está abaixo do próprio padrão (alarme de piora do CUSUM nas 6 últimas sessões) | "Nas últimas sessões, o tempo de resposta de Antônio em Velocidade de Atenção ficou acima da faixa habitual de forma consistente, e não apenas em um dia..." |
| Melhora | Um jogo está acima do próprio padrão | "José vem tendo um desempenho melhor que o habitual em Velocidade de Atenção. Continue a rotina." |
| Sugestão | A pessoa fez menos de duas sessões na semana atual | "Maria ainda não fez sessões nesta semana. Duas ou mais sessões por semana ajudam o Cogni a perceber mudanças com mais segurança." |
| Padrão em formação | Um jogo tem menos de 19 sessões | "O Cogni ainda está aprendendo o padrão de ... Faltam N sessões para comparar com segurança." |

@@FONTE|Elaborado pelos autores (2026).

A tela também explica, em linguagem simples, como o Cogni analisa os dados ("Como o Cogni analisa") e oferece **perguntas rápidas** ("Quem precisa de atenção?", "Quem melhorou?", "Quem ainda está formando o padrão?", "Quantas sessões hoje?"). As respostas são montadas a partir dos mesmos dados do painel, sem texto pré-escrito e sem modelo de linguagem. Na versão inicial do protótipo, essa área era um assistente de conversa com respostas fixas. Ele foi substituído porque simulava uma inteligência que o sistema não tinha.

Todos os textos seguem a regra de linguagem do Capítulo 10: descrevem mudança em relação ao padrão da própria pessoa e nunca usam termos como "declínio", "diagnóstico" ou "risco".

### Perfis, papéis e instituições

Um cuidador quase nunca cuida sozinho. A filha que organiza a rotina, a cuidadora contratada que faz as atividades durante a semana e o neto que só quer acompanhar o progresso precisam de acessos diferentes à mesma pessoa. Numa casa de repouso, a situação se repete em escala: um gestor organiza a equipe e cada profissional cuida de algumas pessoas. A versão final trata os dois casos com **papéis**.

O papel não pertence ao usuário, e sim ao **vínculo entre o usuário e cada pessoa acompanhada**. A mesma cuidadora pode ser cuidadora de uma pessoa e acompanhante de outra. O {{qua:permissoes}} apresenta o que cada papel pode fazer.

@@QUADRO|permissoes|Papéis e permissões sobre uma pessoa acompanhada

| Papel | Ver perfil, relatórios e análises | Jogar e registrar observações | Editar e arquivar o cadastro | Convidar, mudar papéis e remover cuidadores |
|---|---|---|---|---|
| Responsável | Sim | Sim | Sim | Sim |
| Cuidador | Sim | Sim | Não | Não |
| Acompanhante | Sim | Não | Não | Não |
| Gestor da instituição | Sim, para todas as pessoas da instituição | Sim | Sim | Sim, inclusive atribuir profissionais da equipe |

@@FONTE|Elaborado pelos autores (2026).

A {{fig:telas_papeis}} mostra como os papéis aparecem para uma cuidadora profissional fictícia que acompanha três pessoas com papéis diferentes.

@@FIG|telas_papeis|Papéis no acompanhamento|img/telas_papeis.png|Elaborado pelos autores (2026), captura do sistema com dados fictícios.|15

a) **na lista de pessoas** ({{fig:telas_papeis}}, parte a), cada pessoa mostra o papel do usuário e, quando for o caso, a instituição;

b) **no perfil de quem só acompanha** ({{fig:telas_papeis}}, parte b), os botões de iniciar sessão e de editar não aparecem. Se o acompanhante tentar abrir um jogo para essa pessoa, o sistema pede outra pessoa; e, se tentar pela API, recebe a resposta 403;

c) **no quadro "Quem acompanha"** ({{fig:telas_papeis}}, parte c), todos veem quem mais acompanha a pessoa e com que papel. O responsável muda papéis, remove cuidadores e gera **códigos de convite**. Qualquer cuidador pode deixar de acompanhar.

**Convites por código.** O responsável escolhe o papel e gera um código de oito caracteres, como `7DBA-EB5J`, válido por 7 dias e para um único uso. O convidado cria a própria conta e digita o código em "Minha conta". O código evita depender do envio de e-mail, pode ser passado por mensagem ou pessoalmente, e usa só letras e números que não se confundem ao ler em voz alta (sem 0, O, 1, I e L). No banco, fica apenas o resumo criptográfico do código, como acontece com as senhas.

**Instituições.** A {{fig:telas_instituicao}} mostra a tela de gestão de uma instituição fictícia.

@@FIG|telas_instituicao|Gestão da instituição e uso do código de convite|img/telas_instituicao.png|Elaborado pelos autores (2026), captura do sistema com dados fictícios.|15

Quem se cadastra como instituição, ou cria uma instituição em "Minha conta", torna-se o **gestor**. O gestor convida a equipe por código ({{fig:telas_instituicao}}, parte a), cadastra as pessoas, que passam a pertencer à instituição, e decide quais profissionais acompanham cada pessoa e com que papel ({{fig:telas_instituicao}}, parte b). Cada **profissional** vê no painel apenas as pessoas a que foi atribuído. Quando sai ou é removido da equipe, perde o acesso a todas as pessoas da instituição.

Quatro regras protegem a continuidade do cuidado e foram cobertas por testes automatizados:

a) **toda pessoa tem pelo menos um responsável**: o último responsável não pode sair nem perder o papel sem antes indicar outro;

b) **toda instituição tem pelo menos um gestor**;

c) **ao excluir a conta**, se outro cuidador acompanha uma pessoa de quem a conta era a única responsável, o cuidador mais antigo assume a responsabilidade; se a conta era a única gestora, o profissional mais antigo assume a gestão;

d) **sem acesso, a resposta é sempre "não encontrada" (404)**, para não revelar a existência de pessoas de outras famílias ou instituições; com acesso, mas papel insuficiente, a resposta é "não permitido" (403).

A conta de demonstração foi ampliada para mostrar os perfis. Todas as contas abaixo usam a mesma senha e só têm dados fictícios:

a) **demo@cogni.app**: Beatriz, filha, responsável por Maria, José e Antônio;

b) **carla@cogni.app**: Carla, cuidadora profissional; é cuidadora do Antônio, acompanhante da Maria e profissional da instituição, atribuída à Helena;

c) **gestor@cogni.app**: Lúcia, gestora do Residencial Bem Viver, com Helena e Rubens.

### Edição e arquivamento dos cadastros

O responsável, ou o gestor, edita o cadastro da pessoa pelo botão "Editar" do perfil, no mesmo formulário usado no cadastro, e pode **arquivá-la**. A pessoa arquivada sai das listas de todos, mas o histórico continua guardado. O cuidador edita os próprios dados (nome e telefone) em "Minha conta". Com isso, as entidades principais do sistema (cuidador, pessoa acompanhada, sessão, vínculo e instituição) têm cadastro completo: criar, consultar, editar e excluir ou arquivar.

## JOGOS COGNITIVOS

O catálogo tem quatro jogos, cada um com três níveis. Os jogos seguem os princípios da terapia de estimulação cognitiva: atividades estruturadas, variadas, que envolvem memória, linguagem e atenção, em clima positivo e sem caráter de prova (SPECTOR *et al.*, 2003; WOODS *et al.*, 2023). As figuras {{fig:telas_jogos1}}, {{fig:telas_jogos2}} e {{fig:telas_jogos3}} apresentam o catálogo, cada jogo e a tela de resultado.

@@FIG|telas_jogos1|Catálogo de jogos e Velocidade de Atenção|img/telas_jogos1.png|Elaborado pelos autores (2026), captura do sistema.|15

@@FIG|telas_jogos2|Associação de Pares e Categorias|img/telas_jogos2.png|Elaborado pelos autores (2026), captura do sistema.|16

@@FIG|telas_jogos3|Associação de Imagens e resultado da sessão|img/telas_jogos3.png|Elaborado pelos autores (2026), captura do sistema.|15

O {{qua:jogos}} descreve a mecânica e os níveis de cada jogo, e o {{qua:jogos_medicao}}, o que é gravado e como a pontuação é calculada.

@@QUADRO|jogos|Jogos cognitivos: mecânica e níveis

| Jogo | Mecânica | Níveis |
|---|---|---|
| Velocidade de Atenção | Uma estrela aparece numa casa da grade e deve ser tocada o mais rápido possível. A cada acerto ela muda de lugar e o ritmo aumenta. Se não for tocada a tempo, muda de lugar sozinha | 1: grade 3×3, 30 s; 2: 3×3, 25 s; 3: 4×4, 20 s. A estrela fica no lugar por 2,8 s, 2,2 s ou 1,6 s no início, tempo que diminui a cada acerto até o mínimo de 0,6 s |
| Associação de Pares | Jogo da memória: as cartas começam viradas para baixo e vira-se duas por vez. Se forem iguais, ficam abertas; se forem diferentes, voltam a virar. O objetivo é lembrar a posição de cada figura | 4, 5 ou 6 pares (8, 10 ou 12 cartas) |
| Categorias | A categoria aparece no topo; a pessoa toca em todas as palavras que pertencem a ela, evitando as que não pertencem. Termina quando todas as certas são tocadas ou o tempo acaba | Sempre 5 palavras certas. 1: frutas, 30 s, 3 distratores; 2: animais, 25 s, 4 distratores; 3: objetos de cozinha, 20 s, 5 distratores |
| Associação de Imagens | A pessoa toca numa imagem e depois na palavra que a nomeia, até ligar todas | 2, 4 ou 6 pares, sorteados de um banco de 8 |

@@FONTE|Elaborado pelos autores (2026).

@@QUADRO|jogos_medicao|Jogos cognitivos: eventos gravados, pontuação e domínios

| Jogo | Eventos gravados e métricas | Pontuação v1 (0 a 100) | Domínios e pesos |
|---|---|---|---|
| Velocidade de Atenção | Estímulo, toque certo com tempo de reação, toque errado e omissão. Métricas: acertos, erros, omissões, tempo de reação mediano e seu coeficiente de variação | 100 × (0,7 × precisão + 0,3 × velocidade). Precisão = acertos ÷ (acertos + erros + omissões). Velocidade vai de 1, para 400 ms ou menos, a 0, para 1.900 ms ou mais | Atenção 1,0; função executiva 0,4 |
| Associação de Pares | Cada carta virada e cada tentativa (par de cartas), certa ou errada. Métricas: tentativas por par, perseverações (repetir o mesmo par errado) e tempo até o primeiro acerto | 100 × pares encontrados ÷ tentativas | Memória 1,0; visuoespacial 0,6 |
| Categorias | Cada toque, certo ou intrusão. Métricas: acertos, intrusões e tempo por item | 100 × (acertos − 0,5 × intrusões) ÷ total de palavras certas, limitado a 0 | Linguagem 1,0; função executiva 0,6 |
| Associação de Imagens | Cada tentativa, com o tempo entre escolher a imagem e escolher a palavra. Métricas: acertos, erros e tempo mediano | 100 × acertos ÷ tentativas | Memória 1,0; visuoespacial 0,6; linguagem 0,4 |

@@FONTE|Elaborado pelos autores (2026).

Três observações complementam os quadros:

a) **as fórmulas de pontuação e os pesos dos domínios são decisões de projeto**. Elas foram escolhidas para serem simples, explicáveis e estáveis, mas não foram validadas contra testes neuropsicológicos. Por isso cada sessão grava a versão da fórmula (`v1`) e todos os eventos brutos: se a fórmula mudar, o histórico inteiro pode ser recalculado sem perda;

b) **a posição das cartas, das palavras e das imagens é sorteada** pelo algoritmo de Fisher–Yates, que dá a mesma probabilidade a todas as ordens possíveis (KNUTH, 1997). A versão inicial usava uma ordenação com comparador aleatório, que favorece algumas posições;

c) **o nível deve ser mantido entre as sessões** para que a comparação faça sentido. A tela de níveis avisa isso ao cuidador. O motor ainda não separa as sessões por nível (ver limitações).

**Tela de resultado.** Ao fim de cada jogo aparecem a pontuação, a duração, os erros e as estatísticas do jogo, além de um campo de **observações da sessão**. O cuidador pode registrar ali o que percebeu ("pareceu cansado", "dormiu mal", "pediu para repetir"). As observações são gravadas junto com a sessão e aparecem no perfil, nos relatórios e no arquivo CSV. O botão "Descartar e sair" encerra sem gravar.

**Sem pessoa escolhida.** Se um jogo for aberto sem uma pessoa selecionada, o sistema pede para escolher a pessoa antes de começar, porque cada sessão só tem valor dentro do histórico de alguém.

## AUTENTICAÇÃO, AUTORIZAÇÃO E PRIVACIDADE

O {{qua:seguranca}} resume como a versão final trata identidade, acesso e dados pessoais.

@@QUADRO|seguranca|Autenticação, autorização e privacidade na versão final

| Aspecto | Implementação | Base |
|---|---|---|
| Armazenamento da senha | Hash com Argon2id; a senha nunca é gravada | RFC 9106 (BIRYUKOV *et al.*, 2021) |
| Sessão | *Token* de acesso JWT de 15 minutos, mantido só na memória do navegador; *token* de renovação de 7 dias, opaco, em *cookie* `httpOnly` e `SameSite=Strict`, trocado a cada uso | RFC 7519 (JONES; BRADLEY; SAKIMURA, 2015); OWASP ASVS |
| Recarregar a página | A sessão é restaurada pelo *cookie* de renovação; as telas internas exigem usuário autenticado | — |
| Autorização | Toda leitura ou escrita sobre uma pessoa verifica o papel do cuidador sobre ela ({{qua:permissoes}}). Para quem não tem acesso, a API responde como se a pessoa não existisse (404); para quem tem acesso, mas papel insuficiente, responde 403 | Evita revelar a existência de registros de terceiros; menor privilégio (OWASP ASVS) |
| Auditoria | Cada leitura, alteração, inserção, arquivamento e exportação de dados de uma pessoa gera um registro com usuário, pessoa, ação e horário | LGPD, art. 37 (BRASIL, 2018) |
| Consentimento | Aceite gravado com finalidade, versão do termo e data; novo aceite obrigatório quando o termo muda de versão | LGPD, art. 8º e art. 11 |
| Direitos do titular | Tela "Minha conta": exportação completa em JSON e exclusão da conta com confirmação; CSV por pessoa nos relatórios | LGPD, art. 18 |
| Terceiros | Nenhuma fonte, imagem ou biblioteca carregada de outros domínios; fotos substituídas por iniciais | Privacidade por padrão (LGPD, art. 46) |
| Cabeçalhos em produção | HTTPS obrigatório, HSTS e política de segurança de conteúdo (CSP) no Caddy | OWASP ASVS |

@@FONTE|Elaborado pelos autores (2026).

### Termo de uso e política de privacidade

O termo de uso e a política de privacidade foram reunidos num único documento, exibido na íntegra no Apêndice D. A {{fig:telas_termo}} mostra como ele aparece no sistema, junto com a tela "Minha conta" e o pedido de novo aceite.

@@FIG|telas_termo|Termo de uso, Minha conta e pedido de novo aceite|img/telas_termo.png|Elaborado pelos autores (2026), captura do sistema com dados fictícios.|15

O documento foi escrito **a partir do comportamento real do sistema**, e não de um modelo genérico. Cada promessa feita ao cuidador corresponde a algo implementado e verificado, como mostra o {{qua:termo}}. A regra seguida foi simples: se o sistema não faz, o termo não promete. Onde algo ainda depende da implantação, como a designação do encarregado, o termo diz isso abertamente.

@@QUADRO|termo|Cláusulas do termo e implementação correspondente

| Cláusula do termo | Implementação no sistema | Verificação |
|---|---|---|
| O Cogni não faz diagnóstico (seção 2) | Textos gerados pelo motor em linguagem não diagnóstica | Teste automatizado procura termos diagnósticos nos textos |
| Dados tratados (seção 4) | Exatamente os campos do modelo de dados: cuidador, pessoa, sessões, eventos, vínculos e papéis, instituição, convites, registros de acesso e de aceite | Conferência com o esquema do banco (Capítulo 8) |
| Os dados de uma pessoa são vistos só por quem a acompanha, conforme o papel (seções 3 e 7) | Autorização por papel em todas as rotas; profissional de instituição só vê as pessoas atribuídas | Testes automatizados de cada papel; teste no navegador com as três contas de demonstração |
| Não usamos os dados para outras finalidades nem os enviamos a terceiros pelo navegador (seções 5 e 7) | Nenhuma ferramenta de análise, anúncio, fonte ou imagem de outros domínios | Inspeção das requisições do navegador; CSP no servidor |
| Medidas de segurança (seção 8) | Argon2id, HTTPS, sessão de 15 minutos, *cookie* protegido, bloqueio de tentativas, autorização por vínculo, registro de acessos | Testes automatizados de senha, bloqueio, *tokens* e isolamento entre cuidadores |
| Exclusão imediata e cópias de segurança de até 7 dias (seção 9) | Exclusão em cascata no banco; *script* de *backup* mantém as 7 cópias mais recentes | Teste automatizado de exclusão; leitura do *script* de *backup* |
| Registros de acesso mantidos sem identificação após a exclusão (seção 9) | Chaves estrangeiras do registro de acesso com `ON DELETE SET NULL` | Esquema do banco |
| Exportar e excluir em "Minha conta" (seção 10) | Tela "Minha conta" com exportação JSON e exclusão confirmada pela palavra EXCLUIR | Teste no navegador: exportação, exclusão e recusa do login da conta excluída |
| Um único *cookie*, essencial (seção 11) | *Cookie* de renovação `httpOnly`; a pessoa ativa fica apenas no armazenamento local do navegador | Inspeção do navegador |
| Novo aceite quando o termo mudar (seção 14) | A API informa a versão aceita; se for diferente da atual, o sistema exibe o termo resumido e só continua após o novo aceite, que fica registrado | Teste automatizado do novo aceite; teste no navegador com versão antiga |

@@FONTE|Elaborado pelos autores (2026), com base em Brasil (2018).

Três decisões merecem destaque. Primeiro, o texto do termo fica num **único arquivo do código-fonte** (`src/legal/termo.json`), do qual são gerados a tela do sistema e o Apêndice D; um teste automatizado garante que a versão do termo é a mesma no *front-end* e na API. Assim, o documento do TCC, o sistema e o registro de consentimento não podem divergir. Segundo, o termo começa por um **resumo em quatro frases**, porque o cuidador lê o termo no celular e, muitas vezes, com pressa. Terceiro, o termo trata do **cadastro de outra pessoa**: o cuidador declara ser responsável legal pela pessoa acompanhada ou ter a autorização dela, ou de quem a represente legalmente, situação comum quando a pessoa tem uma doença neurodegenerativa.

## QUALIDADE: TESTES E INTEGRAÇÃO CONTÍNUA

Os testes da API cobrem as regras mais sensíveis: política de senha, cadastro atômico, aceite obrigatório do termo, limite de tentativas de login, renovação e revogação de *tokens*, isolamento entre cuidadores, cálculo das métricas a partir de eventos conhecidos, e o comportamento do motor com séries sintéticas de estabilidade, piora e melhora. Os testes do *front-end* verificam a uniformidade do embaralhamento e se a prévia da pontuação no navegador segue a mesma regra do servidor.

A cada envio ao repositório, o GitHub Actions executa, em máquinas limpas: verificação de tipos, testes e compilação do *front-end*; análise estática e formatação do código Python; aplicação e reversão das migrações; e os testes da API sobre PostgreSQL real. Além disso, o fluxo completo foi verificado no navegador com Playwright: entrar, abrir o perfil, jogar, salvar a sessão com observação, conferir a gravação e sair.

## DA AUDITORIA À VERSÃO FINAL

### Correção dos achados da auditoria

Antes da migração de arquitetura, o protótipo inicial passou por uma auditoria técnica, arquivo por arquivo. O {{qua:auditoria}} apresenta os achados e como cada um foi resolvido na versão final.

@@QUADRO|auditoria|Achados da auditoria do protótipo inicial e solução na versão final

| Gravidade | Achado no protótipo inicial | Solução na versão final |
|---|---|---|
| Alta | "Salvar sessão" apenas mudava a tela; nada era gravado | A sessão é enviada à API com os eventos e só é dada como salva após a confirmação do servidor |
| Alta | O nível da Associação de Imagens não mudava o jogo | Níveis com 2, 4 e 6 pares, sorteados de um banco de 8 |
| Alta | Recarregar a página encerrava o acesso; telas internas sem verificação | Renovação por *cookie* e rotas protegidas |
| Alta | Cadastro não atômico | Cadastro numa única transação no servidor |
| Alta | O jogo de atenção não gravava tempo de reação nem erros | Gravação de estímulo, toque, erro e omissão com tempo em milissegundos |
| Média | Pontuações com fórmulas arbitrárias e incomparáveis | Pontuação `v1` no servidor, versionada e recalculável |
| Média | Tempo medido em intervalos de 1 segundo | Relógio de alta resolução do navegador |
| Média | Embaralhamento enviesado | Fisher–Yates |
| Média | Textos com linguagem clínica ("declínio detectado", "ajuste medicamentoso") | Textos gerados pelo motor em linguagem não diagnóstica |
| Média | Textos de 10 e 12 px e poucos atributos de acessibilidade | Mínimo de 12 px, textos principais de 14 a 16 px, rótulos e foco visível |
| Média | Barra de rolagem oculta | Barra de rolagem visível |
| Média | Fonte carregada de serviço externo | Fonte servida pelo próprio aplicativo |
| Baixa | Sem botão de sair | Botão "Sair" no painel e em "Minha conta" |
| Baixa | Dois arquivos de bloqueio de dependências | Apenas o do pnpm |
| Baixa | Sem testes nem integração contínua | 41 testes automatizados e CI |

@@FONTE|Elaborado pelos autores (2026).

### Mudanças motivadas por testes

Os testes de uso e os testes automatizados revelaram problemas que não apareciam na leitura do código. O {{qua:mudancas}} registra os principais e a decisão tomada em cada caso.

@@QUADRO|mudancas|Problemas revelados por testes e decisões tomadas

| Como apareceu | Problema | Decisão |
|---|---|---|
| Teste de uso pela equipe | As observações escritas ao fim da sessão eram gravadas, mas não apareciam em nenhuma tela | Observações exibidas em cada sessão do perfil e dos relatórios e incluídas no CSV. O quadro de observações do cadastro passou a se chamar "Sobre a pessoa", para não ser confundido com elas |
| Captura de telas para este documento | Um domínio sem nenhum jogo jogado aparecia com valor 0, como se a pessoa tivesse ido muito mal | O domínio passou a aparecer como "sem dados" |
| Simulação com os dados de demonstração | Uma pessoa estável recebia aviso de piora em Associação de Imagens. A pontuação desse jogo assume poucos valores (100, 80, 67...), e a variação da linha de base saía perto de zero; poucas notas um pouco menores pareciam um desvio enorme | Piso de 10 pontos na variação (MAD) das métricas de pontuação. Em 300 pessoas simuladas estáveis, os falsos avisos caíram de 8,1% para 2,1% em Imagens, de 5,3% para 1,0% em Categorias e de 1,2% para 0,3% em Pares, sem perder nenhuma detecção de piora ou melhora em Atenção. Um teste automático protege a regra |
| Mesma simulação | No jogo de atenção, 14% das pessoas estáveis ganharam aviso de "melhora". A causa é o aprendizado que continua depois das 6 sessões descartadas | Mantido e registrado como limitação; o aviso de melhora tem baixo risco para o cuidador. A calibração do período de aprendizado fica para o TCC II |
| Dados de demonstração | Só dois jogos tinham sessões simuladas, e o domínio de linguagem ficava vazio | A demonstração passou a gerar sessões dos quatro jogos e algumas observações fictícias |
| Teste de uso | "Familiaridade com tecnologia" gravava valores diferentes no cadastro e em "Nova pessoa" | Mesmas opções nas duas telas |
| Subida do sistema em ambiente limpo | O navegador bloqueava o login quando o *front-end* rodava numa porta diferente da liberada na API | A porta padrão é a mesma em todos os documentos e a regra está explicada no guia de execução |
| Leitura das telas com dados reais | Rótulos que pressupunham gênero ("padrão dela") ou clínica ("Pacientes", "IA") e textos como "0 sessão(ões)" | Textos neutros: "próprio padrão", "Pessoas", "Análises", "ainda não fez sessões nesta semana" |
| Implementação dos perfis | O termo de uso dizia que os dados não eram compartilhados; com os convites, passam a ser vistos pelos cuidadores convidados e pela equipe da instituição | Nova versão do termo (2026-11.2), que descreve quem vê o quê. Quem aceitou a versão anterior recebe o pedido de novo aceite antes de continuar, como previsto na seção 14 do termo |

@@FONTE|Elaborado pelos autores (2026).

### Diferenças entre a proposta e o implementado

O Capítulo 10 apresenta o motor de métricas completo, incluindo partes previstas para o TCC II. O {{qua:proposta}} mostra, item a item, o que já está implementado na versão final e onde a implementação difere da proposta.

@@QUADRO|proposta|Proposta do motor de métricas e situação na versão final

| Componente proposto | Situação na versão final |
|---|---|
| Registro de eventos brutos | Implementado nos quatro jogos |
| Pontuação padronizada e versionada | Implementada (`v1`), calculada no servidor |
| Linha de base pessoal (descarte de 6, padrão com 12, mediana e MAD) | Implementada, com o piso de variação descrito acima |
| Detecção de mudança por CUSUM | Implementada em versão **bilateral**: além da piora, a melhora também é acompanhada, para que o cuidador receba notícias boas e não só avisos |
| Comparar apenas sessões do mesmo nível | Não implementado: o motor compara todas as sessões de um jogo. O cuidador é orientado a manter o nível |
| Domínios derivados de métricas normalizadas | Simplificado: os domínios usam a média das pontuações recentes de cada jogo, com pesos fixos |
| Uso do contexto informado pelo cuidador para anotar avisos | Parcial: as observações são gravadas e exibidas, mas o motor ainda não as utiliza |
| Rodada de prática não pontuada | O servidor já ignora eventos marcados como prática, mas os jogos ainda não oferecem a rodada |
| Dificuldade adaptativa | Não implementada; o nível é escolhido pelo cuidador |
| Biomarcadores de fala, reminiscência com IA, plano de atividades | Não implementados; previstos para o TCC II (Capítulo 14) |

@@FONTE|Elaborado pelos autores (2026).

## LIMITAÇÕES DA VERSÃO ATUAL

A versão final deve ser lida com as seguintes limitações:

a) **nenhum número tem validação clínica**. Pontuações, pesos dos domínios e limiares do motor foram escolhidos pelos autores e avaliados apenas em dados simulados (Capítulo 11). Por isso todo texto é não diagnóstico;

b) **o termo de uso e privacidade ainda não passou por revisão jurídica, e o encarregado pelo tratamento de dados ainda não foi designado**. As duas providências são obrigatórias antes de qualquer uso com pessoas reais. Além disso, a correção de dados já cadastrados ainda não tem tela própria: a API permite editar os dados da pessoa acompanhada, mas o pedido de correção, previsto no termo, é feito pelo canal do encarregado;

c) **os convites não são enviados por e-mail**: o código é passado pelo próprio cuidador, por mensagem ou pessoalmente. E o tipo de vínculo escolhido no cadastro (familiar ou profissional) não muda permissões por si só; o que define o acesso é o papel em cada pessoa e na instituição;

d) **o gráfico de evolução repete o último valor nas semanas sem sessão**, o que pode dar impressão de continuidade que não existe;

e) **"Sessões hoje" e a semana do gráfico usam o fuso horário do servidor**. Sessões feitas tarde da noite podem ser contadas no dia seguinte;

f) **o e-mail de recuperação depende de um servidor SMTP configurado** na implantação;

g) **o efeito de aprendizado no jogo de atenção vai além das 6 sessões descartadas**, o que gera avisos de melhora indevidos em parte das pessoas estáveis simuladas;

h) **o controle de acesso está só na API**: as políticas de segurança em nível de linha do PostgreSQL, previstas como segunda barreira (Capítulo 8), ainda não foram implementadas.

Essas limitações estão registradas no plano de execução e alimentam o roteiro do Capítulo 14.
