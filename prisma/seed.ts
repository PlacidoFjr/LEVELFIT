import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const exercises = [
  { id: "10000000-0000-4000-8000-000000000001", name: "Agachamento livre", muscleGroup: "pernas", equipment: null, instructions: "Mantenha os pes apoiados e desca apenas ate onde houver controle.", safetyNotes: "Interrompa se houver dor aguda; reduza a amplitude quando necessario." },
  { id: "10000000-0000-4000-8000-000000000002", name: "Flexao inclinada", muscleGroup: "peito", equipment: "apoio estavel", instructions: "Apoie as maos, mantenha o tronco alinhado e controle a descida.", safetyNotes: "Use um apoio firme e ajuste a inclinacao ao seu nivel." },
  { id: "10000000-0000-4000-8000-000000000003", name: "Ponte de gluteos", muscleGroup: "gluteos", equipment: "colchonete", instructions: "Eleve o quadril sem arquear excessivamente a lombar.", safetyNotes: "Movimento controlado, sem impulso." },
  { id: "10000000-0000-4000-8000-000000000004", name: "Bird dog", muscleGroup: "core", equipment: "colchonete", instructions: "Estenda braco e perna opostos mantendo a coluna neutra.", safetyNotes: "Reduza a amplitude se perder estabilidade." },
  { id: "10000000-0000-4000-8000-000000000005", name: "Polichinelo sem salto", muscleGroup: "corpo inteiro", equipment: null, instructions: "Alterne os pes lateralmente enquanto eleva os bracos.", safetyNotes: "Opcao de baixo impacto; mantenha ritmo confortavel." },
  { id: "10000000-0000-4000-8000-000000000006", name: "Alongamento gato-vaca", muscleGroup: "mobilidade", equipment: "colchonete", instructions: "Alterne suavemente entre flexao e extensao da coluna.", safetyNotes: "Nao force o limite de movimento." },
];

const workouts = [
  { id: "20000000-0000-4000-8000-000000000001", title: "Base de corpo inteiro", description: "Treino introdutorio e adaptavel para construir consistencia.", difficulty: "easy" as const, estimatedMinutes: 20, category: "full_body" as const },
  { id: "20000000-0000-4000-8000-000000000002", title: "Energia sem impacto", description: "Circuito leve para movimentar o corpo sem saltos.", difficulty: "easy" as const, estimatedMinutes: 15, category: "cardio" as const },
  { id: "20000000-0000-4000-8000-000000000003", title: "Mobilidade restauradora", description: "Sessao curta para dias de recuperacao e retorno gradual.", difficulty: "easy" as const, estimatedMinutes: 10, category: "recovery" as const },
];

const workoutExercises = [
  { workoutId: workouts[0].id, exerciseId: exercises[0].id, sortOrder: 1, targetSets: 3, targetReps: 10 },
  { workoutId: workouts[0].id, exerciseId: exercises[1].id, sortOrder: 2, targetSets: 3, targetReps: 8 },
  { workoutId: workouts[0].id, exerciseId: exercises[2].id, sortOrder: 3, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[0].id, exerciseId: exercises[3].id, sortOrder: 4, targetSets: 2, targetReps: 8 },
  { workoutId: workouts[1].id, exerciseId: exercises[5].id, sortOrder: 1, targetSeconds: 60 },
  { workoutId: workouts[1].id, exerciseId: exercises[4].id, sortOrder: 2, targetSets: 4, targetSeconds: 45 },
  { workoutId: workouts[1].id, exerciseId: exercises[0].id, sortOrder: 3, targetSets: 3, targetReps: 10 },
  { workoutId: workouts[2].id, exerciseId: exercises[5].id, sortOrder: 1, targetSets: 3, targetSeconds: 60 },
  { workoutId: workouts[2].id, exerciseId: exercises[3].id, sortOrder: 2, targetSets: 2, targetReps: 6 },
];

const missions = [
  { id: "30000000-0000-4000-8000-000000000001", key: "move-today", title: "Mexa o corpo", description: "Conclua um treino compativel com sua energia de hoje.", type: "workout" as const, xpReward: 30 },
  { id: "30000000-0000-4000-8000-000000000002", key: "water-goal", title: "Hidratacao em dia", description: "Avance ate sua meta pessoal de agua.", type: "water" as const, xpReward: 20 },
  { id: "30000000-0000-4000-8000-000000000003", key: "balanced-choice", title: "Escolha que nutre", description: "Registre uma refeicao com proteina e vegetal ou fruta.", type: "nutrition" as const, xpReward: 20 },
  { id: "30000000-0000-4000-8000-000000000004", key: "pause-and-breathe", title: "Pausa consciente", description: "Reserve dois minutos para respirar e perceber como voce esta.", type: "habit" as const, xpReward: 10 },
  { id: "30000000-0000-4000-8000-000000000005", key: "gentle-return", title: "Volte no seu ritmo", description: "Retome com uma acao pequena; consistencia nao exige perfeicao.", type: "recovery" as const, xpReward: 15 },
];

const achievements = [
  { id: "40000000-0000-4000-8000-000000000001", key: "first-mission", name: "Primeiro passo", description: "Concluiu a primeira missao.", category: "first_steps" as const, rarity: "common" as const, xpReward: 10 },
  { id: "40000000-0000-4000-8000-000000000002", key: "first-workout", name: "Corpo em movimento", description: "Concluiu o primeiro treino.", category: "workout" as const, rarity: "common" as const, xpReward: 15 },
  { id: "40000000-0000-4000-8000-000000000003", key: "water-week", name: "Fluxo constante", description: "Cumpriu a meta de agua em sete dias.", category: "water" as const, rarity: "uncommon" as const, xpReward: 40 },
  { id: "40000000-0000-4000-8000-000000000004", key: "streak-seven", name: "Uma semana presente", description: "Manteve sete dias de consistencia.", category: "streak" as const, rarity: "uncommon" as const, xpReward: 50 },
  { id: "40000000-0000-4000-8000-000000000005", key: "return-kindly", name: "Recomeco conta", description: "Retomou sua jornada sem buscar compensacao.", category: "recovery" as const, rarity: "rare" as const, xpReward: 60 },
];

async function main() {
  for (const exercise of exercises) {
    await prisma.exercise.upsert({ where: { id: exercise.id }, create: exercise, update: exercise });
  }
  for (const workout of workouts) {
    await prisma.workout.upsert({ where: { id: workout.id }, create: { ...workout, isPublic: true }, update: { ...workout, isPublic: true, deletedAt: null } });
  }
  await prisma.workoutExercise.deleteMany({ where: { workoutId: { in: workouts.map((item) => item.id) } } });
  await prisma.workoutExercise.createMany({ data: workoutExercises });

  for (const meal of [
    { id: "50000000-0000-4000-8000-000000000001", name: "Cafe da manha", sortOrder: 1 },
    { id: "50000000-0000-4000-8000-000000000002", name: "Almoco", sortOrder: 2 },
    { id: "50000000-0000-4000-8000-000000000003", name: "Lanche", sortOrder: 3 },
    { id: "50000000-0000-4000-8000-000000000004", name: "Jantar", sortOrder: 4 },
  ]) await prisma.meal.upsert({ where: { id: meal.id }, create: meal, update: meal });

  for (const mission of missions) {
    await prisma.dailyMission.upsert({ where: { key: mission.key }, create: mission, update: { ...mission, isActive: true, deletedAt: null } });
  }
  for (const achievement of achievements) {
    await prisma.achievement.upsert({ where: { key: achievement.key }, create: achievement, update: { ...achievement, isActive: true, deletedAt: null } });
  }

  const templates = [
    { key: "verify_email", channel: "email" as const, subject: "Confirme sua conta LevelFit", title: "Seu primeiro passo", body: "Use o link seguro e temporario para confirmar seu e-mail." },
    { key: "password_reset", channel: "email" as const, subject: "Redefinicao de acesso LevelFit", title: "Redefina sua senha", body: "Use o link temporario. Se nao foi voce, ignore esta mensagem." },
    { key: "streak_at_risk", channel: "in_app" as const, subject: null, title: "Ainda da tempo", body: "Uma acao pequena hoje ja conta. Escolha algo que caiba na sua energia." },
    { key: "weekly_summary", channel: "email" as const, subject: "Seu resumo semanal LevelFit", title: "Veja o que voce construiu", body: "Confira sua consistencia sem comparacoes ou cobrancas." },
  ];
  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { key_channel_version: { key: template.key, channel: template.channel, version: 1 } },
      create: { ...template, version: 1 },
      update: { ...template, isActive: true, deletedAt: null },
    });
  }
}

main()
  .then(() => console.log("LevelFit seed concluido."))
  .finally(async () => prisma.$disconnect());
