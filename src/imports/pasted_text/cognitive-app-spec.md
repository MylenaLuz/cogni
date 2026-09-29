PROJETO: Aplicativo de Estímulo Cognitivo e Assistência para Pessoas com Perda
Cognitiva (MVP acadêmico). Público-alvo: pessoas neurodivergentes ou em
condições que causam perda cognitiva — não restrito a idosos ou a uma condição
específica (ex: Alzheimer, outras doenças neurodegenerativas, ou outras causas
de perda cognitiva). O app deve funcionar bem tanto para um usuário mais jovem
quanto para um idoso.

Crie um protótipo navegável de alta fidelidade com DOIS FLUXOS separados por
perfil: "Modo Usuário" e "Modo Cuidador/Familiar", acessíveis a partir de uma
tela de seleção de perfil.

═══════════════════════════════════════
SISTEMA VISUAL
═══════════════════════════════════════
- Paleta: azul-petróleo/teal como cor primária (transmite calma e confiança,
  não clínico/frio), um tom areia/off-white quente como fundo neutro, e um
  verde-menta como cor de destaque (para ações positivas, progresso, sucesso
  em atividades). Evitar tons frios de hospital e evitar excesso de branco puro.
- Evitar qualquer estética "infantilizada" (nada de traços cartunescos
  exagerados) — o público inclui adultos de todas as idades, o tom visual deve
  ser respeitoso e sério, mesmo sendo acolhedor.
- Contraste alto obrigatório em todo o Modo Usuário (mínimo AA, preferir AAA
  onde possível).
- Tipografia: sans-serif humanista, bem legível em telas pequenas. Escala
  maior no Modo Usuário (corpo de texto mínimo 18-20px, títulos 28-32px,
  botões com texto mínimo 20px) vs. escala padrão no Modo Cuidador (corpo
  14-16px, títulos 20-24px).
- Cantos arredondados generosos (8-16px), sombras suaves, sem elementos
  decorativos desnecessários (nada de linhas de destaque sob títulos ou barras
  de cor sem função).
- Ícones grandes, de traço simples (line icons ou ícones preenchidos com boa
  massa visual), sempre acompanhados de texto — nunca só ícone no Modo Usuário.
- Área de toque mínima de 48x48px no Modo Usuário, botões ocupando boa parte
  da largura da tela, pouquíssimos elementos por tela (máximo 3-4 opções
  visíveis de uma vez).

═══════════════════════════════════════
TELA 0 — SELEÇÃO DE PERFIL
═══════════════════════════════════════
Dois cartões grandes e distintos visualmente: "Sou o usuário" (ícone de
pessoa/coração) e "Sou cuidador ou familiar" (ícone de mãos/cuidado). Sem
login complexo aqui — só a escolha do modo.

═══════════════════════════════════════
MODO USUÁRIO — TELAS
═══════════════════════════════════════

1) LOGIN SIMPLIFICADO
   - Teclado numérico grande para PIN de 4 dígitos
   - Foto do usuário centralizada acima do PIN (personalização, reduz ansiedade)
   - Sem opção de "esqueci a senha" visível aqui (fluxo de recuperação fica
     no lado do cuidador)

2) TELA INICIAL (HOME)
   - Saudação personalizada com nome e foto do usuário, horário do dia
   - Grade de no máximo 4 blocos grandes, cada um com ícone + rótulo curto:
     "Jogar", "Minhas Memórias", "Lugares", "Minha Rotina"
   - Indicador discreto de rotina do dia (ex: "Próximo: Remédio às 14h")

3) JOGOS DE MEMÓRIA (lista de atividades)
   - Cards grandes por tipo de jogo: "Associe as imagens", "Associe as palavras",
     "Reconheça o som"
   - Cada card mostra ícone temático, nome simples e nível atual (visual, tipo
     estrelas ou barra, não número técnico)

4) JOGO EM ANDAMENTO (ex: associação de imagens)
   - Layout de grade 2x2 ou 3x2 dependendo da dificuldade
   - Feedback visual e textual imediato de acerto/erro (verde suave + ícone de
     check; vermelho suave + ícone neutro, nunca punitivo)
   - Sem timer visível de contagem regressiva agressiva — se houver tempo,
     mostrar de forma sutil
   - Tela de resultado ao final: elogio simples, sem pontuação numérica fria
     ("Muito bem! Você lembrou de 4 de 5")

5) MINHAS MEMÓRIAS (memória afetiva)
   - Galeria em cards grandes de fotos cadastradas pelo cuidador, cada uma com
     legenda curta (nome da pessoa, relação, ex: "Sua irmã, Ana")
   - Toque na foto abre visualização ampliada com a história/legenda completa
   - Sem opção de editar/excluir aqui (isso é exclusivo do cuidador)

6) LUGARES (reconhecimento de lugares)
   - Mesma lógica de card grande com foto do lugar + nome + breve descrição
     cadastrada pelo cuidador (ex: "Sua casa antiga, na Rua X")

7) MINHA ROTINA
   - Lista vertical simples do dia, ordenada por horário, com ícone por tipo
     de compromisso (remédio, refeição, visita, atividade)
   - Item atual/próximo destacado visualmente

8) MENSAGENS AFETIVAS
   - Lista de mensagens recebidas dos familiares, estilo "cartão", com nome
     de quem enviou, texto grande e data por extenso (não abreviada)

═══════════════════════════════════════
MODO CUIDADOR/FAMILIAR — TELAS
═══════════════════════════════════════

1) LOGIN / CADASTRO
   - Formulário padrão (e-mail + senha), com opção "esqueci minha senha"
   - Se novo cuidador: fluxo de vínculo a um perfil de usuário existente OU
     criação de um novo perfil de usuário

2) DASHBOARD PRINCIPAL
   - Cabeçalho com nome e foto do usuário vinculado (suporte a múltiplos
     usuários vinculados, com seletor no topo)
   - Cards de resumo: "Atividades esta semana", "Nível atual de dificuldade",
     "Última interação"
   - Gráfico simples de desempenho ao longo do tempo (linha ou barras)
   - Atalhos rápidos: "Cadastrar memória", "Editar rotina", "Enviar mensagem"

3) GESTÃO DE MEMÓRIA AFETIVA
   - Lista/grade de fotos cadastradas com opções de editar e excluir
   - Formulário de cadastro: upload de foto, nome da pessoa/lugar, tipo
     (pessoa ou lugar), relação/descrição em texto livre, campo opcional de
     "contexto" (uma frase que ajude o usuário a lembrar)

4) GESTÃO DE ROTINA
   - Lista editável de compromissos/lembretes do usuário, com horário, tipo
     (remédio, refeição, atividade, visita) e recorrência (diário, dias
     específicos)
   - Botão de adicionar novo item com formulário simples

5) ACOMPANHAMENTO DE DESEMPENHO
   - Tabela/lista de sessões de jogos: data, tipo de jogo, nível, resultado
   - Seletor de período (semana, mês)
   - Opção de ajustar manualmente o nível de dificuldade padrão

6) MENSAGENS AFETIVAS (envio)
   - Campo de texto simples para escrever e enviar mensagem ao usuário
   - Histórico de mensagens já enviadas

7) CONFIGURAÇÕES DO PERFIL DO USUÁRIO
   - Dados básicos (nome, foto, PIN de acesso)
   - Gerenciar outros cuidadores vinculados a esse mesmo perfil de usuário

═══════════════════════════════════════
COMPONENTES REUTILIZÁVEIS A CRIAR
═══════════════════════════════════════
- Botão primário grande (Modo Usuário) e botão primário padrão (Modo Cuidador)
- Card de memória afetiva (foto + legenda)
- Card de atividade/jogo (ícone + título + indicador de nível)
- Item de rotina (ícone + horário + descrição + estado: pendente/concluído)
- Componente de feedback de acerto/erro
- Barra de navegação inferior do Modo Cuidador (Dashboard, Memórias, Rotina,
  Desempenho, Mensagens)
- Estado vazio ilustrado para quando ainda não há memórias/rotina cadastradas
  (ex: "Nenhuma memória cadastrada ainda — peça ao seu cuidador para adicionar")

═══════════════════════════════════════
FORA DE ESCOPO (não incluir)
═══════════════════════════════════════
- Comandos ou navegação por voz
- Notificações push reais (só mockar visualmente)
- Múltiplos idiomas
- Autenticação de produção (OAuth, 2FA)