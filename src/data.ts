export const mockCaregiver = {
  name: "Dr. Carlos Mendes",
  specialty: "Neuropsicologia",
  email: "cuidador@cogni.app",
  password: "cogni123",
  photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&auto=format",
};

export interface CognitiveMetrics {
  memory: number;
  attention: number;
  language: number;
  executive: number;
  visuospatial: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  photo: string;
  lastSession: string;
  sessionCount: number;
  metrics: CognitiveMetrics;
  history: { week: string; avg: number }[];
  trend: "up" | "down" | "stable";
  alert?: string;
  notes?: string;
}

export interface Session {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  game: string;
  duration: number;
  score: number;
  level: number;
}

export interface AIInsight {
  id: string;
  patientId: string | "all";
  patientName: string;
  type: "improvement" | "alert" | "recommendation" | "trend";
  title: string;
  message: string;
  date: string;
}

export const mockPatients: Patient[] = [
  {
    id: "p1",
    name: "Maria Silva",
    age: 78,
    diagnosis: "Alzheimer leve",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&auto=format",
    lastSession: "Hoje, 10h30",
    sessionCount: 24,
    metrics: { memory: 45, attention: 60, language: 55, executive: 40, visuospatial: 50 },
    history: [
      { week: "S1", avg: 42 }, { week: "S2", avg: 44 }, { week: "S3", avg: 43 },
      { week: "S4", avg: 46 }, { week: "S5", avg: 45 }, { week: "S6", avg: 48 },
      { week: "S7", avg: 47 }, { week: "S8", avg: 50 },
    ],
    trend: "stable",
    notes: "Maior engajamento com jogos visuais. Manhãs são o melhor horário.",
  },
  {
    id: "p2",
    name: "José Pereira",
    age: 65,
    diagnosis: "Comprometimento cognitivo leve",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format",
    lastSession: "Ontem, 14h00",
    sessionCount: 17,
    metrics: { memory: 70, attention: 72, language: 75, executive: 68, visuospatial: 65 },
    history: [
      { week: "S1", avg: 63 }, { week: "S2", avg: 65 }, { week: "S3", avg: 66 },
      { week: "S4", avg: 67 }, { week: "S5", avg: 68 }, { week: "S6", avg: 70 },
      { week: "S7", avg: 71 }, { week: "S8", avg: 70 },
    ],
    trend: "up",
    notes: "Excelente adesão. Melhora consistente em linguagem e atenção.",
  },
  {
    id: "p3",
    name: "Ana Costa",
    age: 72,
    diagnosis: "Demência vascular",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&auto=format",
    lastSession: "Há 6 dias",
    sessionCount: 11,
    metrics: { memory: 35, attention: 45, language: 40, executive: 30, visuospatial: 38 },
    history: [
      { week: "S1", avg: 46 }, { week: "S2", avg: 44 }, { week: "S3", avg: 43 },
      { week: "S4", avg: 42 }, { week: "S5", avg: 40 }, { week: "S6", avg: 40 },
      { week: "S7", avg: 38 }, { week: "S8", avg: 37 },
    ],
    trend: "down",
    alert: "Declínio de 20% nos últimos 30 dias. Revisão recomendada.",
  },
];

export const mockSessions: Session[] = [
  { id: "s1", patientId: "p1", patientName: "Maria Silva", date: "02/09 10:30", game: "Associação de Imagens", duration: 18, score: 80, level: 2 },
  { id: "s2", patientId: "p2", patientName: "José Pereira", date: "01/09 14:00", game: "Sequência de Palavras", duration: 22, score: 90, level: 3 },
  { id: "s3", patientId: "p3", patientName: "Ana Costa", date: "27/08 09:15", game: "Associação de Imagens", duration: 15, score: 55, level: 1 },
  { id: "s4", patientId: "p1", patientName: "Maria Silva", date: "30/08 10:00", game: "Reconheça o Som", duration: 20, score: 75, level: 2 },
  { id: "s5", patientId: "p2", patientName: "José Pereira", date: "29/08 15:30", game: "Labirinto Cognitivo", duration: 25, score: 88, level: 3 },
  { id: "s6", patientId: "p1", patientName: "Maria Silva", date: "28/08 11:00", game: "Sequência de Palavras", duration: 16, score: 70, level: 1 },
  { id: "s7", patientId: "p3", patientName: "Ana Costa", date: "26/08 10:30", game: "Associação de Imagens", duration: 12, score: 60, level: 1 },
  { id: "s8", patientId: "p2", patientName: "José Pereira", date: "25/08 14:00", game: "Associação de Imagens", duration: 20, score: 85, level: 2 },
];

export const mockInsights: AIInsight[] = [
  {
    id: "i1",
    patientId: "p3",
    patientName: "Ana Costa",
    type: "alert",
    title: "Declínio cognitivo detectado",
    message: "Ana não realiza sessões há 6 dias e os indicadores de memória caíram 20% nas últimas 4 semanas. Recomenda-se agendar sessão urgente e avaliar possível ajuste medicamentoso com a equipe médica.",
    date: "02/09/2026",
  },
  {
    id: "i2",
    patientId: "p2",
    patientName: "José Pereira",
    type: "improvement",
    title: "Melhora consistente detectada",
    message: "José apresentou evolução de 11% em linguagem e 8% em atenção ao longo de 8 semanas. O padrão indica resposta positiva à rotina atual de estimulação. Sugere-se manter a frequência e considerar avançar para o nível 4 nos próximos jogos.",
    date: "02/09/2026",
  },
  {
    id: "i3",
    patientId: "p1",
    patientName: "Maria Silva",
    type: "recommendation",
    title: "Recomendação de atividade",
    message: "O perfil cognitivo de Maria indica que habilidades visuoespaciais são o ponto mais vulnerável. Recomenda-se incluir ao menos 2 sessões semanais do jogo 'Labirinto Cognitivo' no nível 1 para estimulação direcionada.",
    date: "01/09/2026",
  },
  {
    id: "i4",
    patientId: "all",
    patientName: "Todos os pacientes",
    type: "trend",
    title: "Padrão geral da semana",
    message: "Esta semana foram realizadas 8 sessões com 3 pacientes. A média geral de desempenho foi de 75%. O melhor desempenho foi de José Pereira (90% em Sequência de Palavras). Há 1 paciente em situação de atenção que necessita de acompanhamento imediato.",
    date: "02/09/2026",
  },
  {
    id: "i5",
    patientId: "p1",
    patientName: "Maria Silva",
    type: "trend",
    title: "Estabilidade com leve melhora",
    message: "Maria mantém pontuação média estável entre 42-50% nas últimas 8 semanas, com leve tendência de alta. A função executiva permanece como área crítica (40%). Sessões matinais apresentam desempenho 15% superior às vespertinas.",
    date: "31/08/2026",
  },
  {
    id: "i6",
    patientId: "p3",
    patientName: "Ana Costa",
    type: "recommendation",
    title: "Adaptação de dificuldade sugerida",
    message: "Com base no desempenho de Ana nas últimas sessões (média de 57%), recomenda-se manter todos os jogos no nível 1 e aumentar o intervalo de tempo para respostas, reduzindo a pressão e melhorando o engajamento.",
    date: "30/08/2026",
  },
];

export const aiQuickReplies: { question: string; answer: string }[] = [
  {
    question: "Como está a Maria esta semana?",
    answer: "Maria realizou 2 sessões esta semana com média de 77,5%. Seu melhor desempenho foi em Atenção (60%). Recomendo focar em atividades visuoespaciais nas próximas sessões.",
  },
  {
    question: "Quais jogos recomendar para Ana?",
    answer: "Para Ana, com diagnóstico de demência vascular, recomendo jogos de Associação de Imagens e Reconhecimento de Sons no nível 1. Evite atividades com alto componente de função executiva no momento.",
  },
  {
    question: "Há algum alerta de saúde?",
    answer: "Sim. Ana Costa não realiza sessões há 6 dias e apresenta declínio de 20% nos indicadores. Aconselho contato imediato com a família e revisão do plano terapêutico com a equipe médica responsável.",
  },
  {
    question: "Qual o progresso de José?",
    answer: "José está evoluindo muito bem! Aumento de 11% na pontuação média em 8 semanas. Ele já pode avançar para o nível 4 nos próximos jogos. Continue com a frequência atual de 3 sessões por semana.",
  },
  {
    question: "Quantas sessões esta semana?",
    answer: "Foram realizadas 8 sessões esta semana no total: 3 com Maria Silva, 3 com José Pereira e 2 com Ana Costa. A meta recomendada é de 3 sessões semanais por paciente.",
  },
];
