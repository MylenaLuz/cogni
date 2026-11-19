# IMPLEMENTAÇÃO DO PROTÓTIPO

Este capítulo descreve o protótipo funcional do Cogni no estado em que se encontrava ao fechamento deste documento: organização do código, sistema visual, telas, jogos cognitivos e autenticação. Também apresenta os resultados da auditoria técnica realizada sobre o código, cujos achados alimentam o Capítulo 13.

## ORGANIZAÇÃO DO CÓDIGO

O protótipo é uma aplicação de página única (*single-page application*) em React 19 com TypeScript, empacotada com Vite e estilizada com Tailwind CSS. O código-fonte soma cerca de 3.300 linhas em TypeScript e TSX, distribuídas em 23 arquivos de telas e componentes:

```text
src/
  main.tsx              ponto de entrada
  App.tsx               controle de navegação entre telas
  supabase.ts           cliente do banco de dados (versão atual)
  data.ts               tipos do domínio e dados de demonstração
  index.css             tema (cores e fonte) e animações
  components/           NavBar, GameHeader, GameResult
  screens/              Login, Signup, ForgotPassword, ResetPassword,
                        Dashboard, Patients, PatientDetail, Games,
                        GameSession, Reports, AIInsights
  screens/games/        AttentionSpeed, MemoryPairs, Categories
```

A navegação é controlada por um estado no componente raiz, que guarda a tela atual e o paciente selecionado e repassa a cada tela uma função de navegação. Os tipos do domínio (`Patient`, `Session`, `CognitiveMetrics` e `AIInsight`), definidos em `data.ts`, serviram de base para o modelo de dados do Capítulo 9. A compilação TypeScript ocorre sem erros, em conformidade com o RNF17.

## SISTEMA VISUAL

O visual foi pensado para ser **acolhedor sem ser infantilizado**, com respeito ao público adulto e idoso. O {{qua:visual}} resume as decisões.

@@QUADRO|visual|Decisões do sistema visual

| Elemento | Decisão | Motivo |
|---|---|---|
| Cor primária | Azul-petróleo `#2C7A7A` | Transmite calma e confiança sem parecer hospitalar |
| Fundo | Areia `#F7F2E9` | Evita o excesso de branco puro e reduz o brilho |
| Destaque | Verde-menta `#52B788` | Progresso e acertos |
| Erro | Vermelho suave `#D96B6B` | Sinalização não punitiva |
| Tipografia | Nunito, sans-serif humanista | Legibilidade em telas pequenas |
| Forma | Cantos arredondados de 8 a 16 px, sombras suaves | Aparência amigável, sem ornamentos sem função |
| Feedback | Verde para acerto, vibração lateral suave para erro, mensagens encorajadoras | Estímulo sem caráter punitivo |

@@FONTE|Elaborado pelos autores (2026).

## TELAS DO CUIDADOR

A {{fig:telas_a}} apresenta as telas de acesso e o painel inicial. O cadastro é feito em três etapas: credenciais, perfil do cuidador (telefone, tipo de vínculo e instituição, quando houver) e, opcionalmente, os dados da pessoa idosa, que podem ser preenchidos depois. O painel reúne o número de pessoas acompanhadas, as sessões do dia, os alertas, a tendência de cada pessoa e as sessões recentes.

@@FIG|telas_a|Telas de acesso e painel do cuidador|img/telas_a.png|Elaborado pelos autores (2026), captura do protótipo com dados fictícios.|16

A {{fig:telas_b}} apresenta o perfil da pessoa acompanhada, com gráfico radar dos cinco domínios cognitivos, evolução de oito semanas, barras por domínio e observações; a tela de relatórios por pessoa e período; e a tela de *insights*, com cartões de alerta, melhora, recomendação e tendência e um assistente conversacional. Nesta etapa, os *insights* e as respostas do assistente são **pré-definidos**, como exploração de interface.

@@FIG|telas_b|Telas de acompanhamento: perfil, relatórios e insights|img/telas_b.png|Elaborado pelos autores (2026), captura do protótipo com dados fictícios.|16

## JOGOS COGNITIVOS

O catálogo implementado contém quatro jogos jogáveis, cada um com três níveis e registro de observações ao final da sessão. A {{fig:telas_c}} apresenta o catálogo e dois jogos, e o {{qua:jogos}} descreve sua mecânica.

@@FIG|telas_c|Catálogo e jogos cognitivos|img/telas_c.png|Elaborado pelos autores (2026), captura do protótipo.|16

@@QUADRO|jogos|Jogos cognitivos implementados

| Jogo | Domínio principal | Mecânica | Níveis | Pontuação implementada |
|---|---|---|---|---|
| Velocidade de Atenção | Atenção e tempo de reação | Uma estrela aparece em uma grade e deve ser tocada; a cada acerto muda de lugar e o ritmo aumenta | Grade 3×3 em 30 s; 3×3 em 25 s; 4×4 em 20 s | Acertos divididos por um total esperado arbitrário, limitado a 100 |
| Associação de Pares | Memória de trabalho | Jogo da memória: virar duas cartas por vez e encontrar os pares | 4, 5 ou 6 pares | Pares em relação às tentativas |
| Categorias | Linguagem semântica | Tocar em todas as palavras de uma categoria, evitando distratores, antes do fim do tempo | Frutas em 30 s; animais em 25 s; objetos de cozinha em 20 s | Acertos menos metade dos erros, sobre o total correto |
| Associação de Imagens | Memória visual | Associar cada imagem à palavra correspondente | Três níveis (descritos como 2, 4 e 6 pares) | Pares sobre pares mais erros |

@@FONTE|Elaborado pelos autores (2026).

A pontuação vai de 0 a 100 e usa mensagens encorajadoras ("Excelente!", "Muito bem!", "Continue tentando!"). A última coluna do quadro evidencia um problema que a matriz integrada já havia apontado (DEC-002): **cada jogo usa uma fórmula própria e arbitrária**, e as pontuações não são comparáveis entre jogos nem ao longo do tempo. Esse problema é tratado no Capítulo 11.

## AUTENTICAÇÃO E PERSISTÊNCIA

Na segunda versão da arquitetura, o protótipo passou a usar autenticação real e persistência no banco de dados do provedor BaaS:

a) **login** com e-mail e senha, com mensagem genérica em caso de falha ("E-mail ou senha incorretos"), que não revela se o e-mail existe;

b) **cadastro em três etapas**, com critérios de senha exibidos em tempo real e confirmação de senha;

c) **recuperação de senha** por e-mail, com retorno à aplicação por um *link* que abre a tela de redefinição;

d) gravação dos dados do cuidador e, opcionalmente, da pessoa idosa no banco de dados.

## AUDITORIA TÉCNICA DO CÓDIGO

Antes de planejar a migração, o código do protótipo foi submetido a uma auditoria técnica completa, arquivo por arquivo. O {{qua:auditoria}} apresenta os achados, classificados por gravidade.

@@QUADRO|auditoria|Achados da auditoria técnica do protótipo

| Gravidade | Achado | Local | Consequência |
|---|---|---|---|
| Alta | O botão "Salvar sessão" apenas altera o estado visual e navega; nenhum dado é gravado | `GameSession.tsx` e os três jogos | A sessão "salva" não aparece no histórico |
| Alta | O nível escolhido na Associação de Imagens não altera o jogo: são sempre os mesmos quatro pares | `GameSession.tsx` | A tela promete 2, 4 ou 6 pares |
| Alta | Recarregar a página encerra o acesso, e as telas internas não verificam se há usuário autenticado | `App.tsx` | Sessão perdida; ausência de guarda de rota |
| Alta | O cadastro não é atômico: se a gravação do perfil falhar, a conta fica criada sem perfil | `Signup.tsx` | Usuário não consegue se cadastrar de novo |
| Alta | O jogo de atenção não registra o tempo de cada toque nem os toques errados | `AttentionSpeed.tsx` | O principal sinal cognitivo não é coletado |
| Média | Pontuações com fórmulas arbitrárias e incomparáveis entre jogos | Quatro jogos | Índices sem significado longitudinal |
| Média | Tempo medido por intervalos de 1 segundo | Jogos | Imprecisão incompatível com tempo de reação |
| Média | Embaralhamento por ordenação com comparador aleatório, que não é uniforme | Três jogos | Viés nas posições dos estímulos |
| Média | Texto dos *insights* simulados com linguagem clínica ("declínio cognitivo detectado", "possível ajuste medicamentoso") | `data.ts` | Risco de enquadramento como dispositivo médico |
| Média | 81 ocorrências de texto em 10 e 12 px e apenas 5 atributos de acessibilidade no código | Telas | Conflito com o público idoso |
| Média | Barra de rolagem oculta globalmente | `index.css` | Dificulta a navegação com pouca destreza |
| Média | Fonte carregada de serviço externo a cada acesso | `index.css` | Envio do IP do usuário a terceiros; não funciona *offline* |
| Baixa | Ausência de botão de encerrar sessão | Telas | Necessário para troca de usuário |
| Baixa | Dois arquivos de bloqueio de dependências divergentes | Raiz do repositório | Instalações não reprodutíveis |
| Baixa | Ausência de testes automatizados, análise estática e integração contínua | Repositório | Regressões não detectadas |

@@FONTE|Elaborado pelos autores (2026).

Um dado quantitativo complementa a auditoria. O RNF01 estabelecia pacote de produção abaixo de 300 KB, com cerca de 74 KB de JavaScript compactado na versão com dados simulados. Após a integração com a biblioteca cliente do BaaS, a compilação de produção passou a gerar um arquivo JavaScript de 519,8 KB (137,0 KB compactado com gzip), quase o dobro do tamanho compactado original. A remoção dessa biblioteca, prevista na arquitetura proposta, contribui também para o cumprimento do RNF01.

Os achados de gravidade alta foram priorizados no plano de execução como a primeira fase de trabalho, a ser concluída antes de qualquer demonstração pública do sistema.
