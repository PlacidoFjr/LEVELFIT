import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { tacoFoods } from "./taco-foods.generated";
import { guideExercises, guideWorkoutExercises, guideWorkouts } from "./workout-guide.generated";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const exercises = [
  { id: "10000000-0000-4000-8000-000000000001", name: "Esteira plana", muscleGroup: "cardiorrespiratório", equipment: "esteira", instructions: "Caminhe com postura alta, passadas curtas e apoio completo do pé.", safetyNotes: "Evite corrida, inclinação alta e velocidade sem controle se houver dor no tornozelo." },
  { id: "10000000-0000-4000-8000-000000000002", name: "Bicicleta ergométrica", muscleGroup: "cardiorrespiratório", equipment: "bicicleta", instructions: "Ajuste o banco para o joelho ficar levemente flexionado e pedale em ritmo constante.", safetyNotes: "Evite carga alta, sprint e pedalar em pé se houver desconforto." },
  { id: "10000000-0000-4000-8000-000000000003", name: "Elíptico leve", muscleGroup: "cardiorrespiratório", equipment: "elíptico", instructions: "Mantenha movimento fluido, tronco alto e pressão uniforme nos pés.", safetyNotes: "Pare se o tornozelo incomodar; evite resistência alta no início." },
  { id: "10000000-0000-4000-8000-000000000004", name: "Agachamento livre", muscleGroup: "quadríceps e glúteos", equipment: "peso corporal", instructions: "Afaste os pés na largura do quadril, desça com controle e suba empurrando o chão.", safetyNotes: "Não force amplitude dolorosa. Mantenha joelhos alinhados aos pés." },
  { id: "10000000-0000-4000-8000-000000000005", name: "Agachamento no banco", muscleGroup: "quadríceps e glúteos", equipment: "banco", instructions: "Sente e levante do banco com controle, sem despencar na descida.", safetyNotes: "Use apoio se necessário e evite prender a respiração." },
  { id: "10000000-0000-4000-8000-000000000006", name: "Leg press", muscleGroup: "quadríceps e glúteos", equipment: "máquina", instructions: "Apoie as costas, pés na largura do quadril e empurre sem travar totalmente os joelhos.", safetyNotes: "Não tire o quadril do banco, não deixe os joelhos fecharem e use amplitude confortável." },
  { id: "10000000-0000-4000-8000-000000000007", name: "Cadeira extensora", muscleGroup: "quadríceps", equipment: "máquina", instructions: "Ajuste o encosto e estenda os joelhos com controle, voltando devagar.", safetyNotes: "Evite chutar a carga, levantar o quadril ou travar com força no final." },
  { id: "10000000-0000-4000-8000-000000000008", name: "Mesa ou cadeira flexora", muscleGroup: "posteriores de coxa", equipment: "máquina", instructions: "Flexione os joelhos até sentir posterior e retorne devagar sem soltar a pilha.", safetyNotes: "Evite arquear a lombar, jogar o corpo ou usar carga que encurte o movimento." },
  { id: "10000000-0000-4000-8000-000000000009", name: "Elevação pélvica", muscleGroup: "glúteos", equipment: "banco ou colchonete", instructions: "Suba o quadril contraindo glúteos, pause no topo e desça com controle.", safetyNotes: "Evite hiperestender a lombar. O movimento vem do quadril." },
  { id: "10000000-0000-4000-8000-000000000010", name: "Cadeira abdutora", muscleGroup: "glúteo médio", equipment: "máquina", instructions: "Abra as pernas com controle, faça uma pausa curta e volte devagar.", safetyNotes: "Evite impulso, amplitude dolorosa e deixar o peso bater." },
  { id: "10000000-0000-4000-8000-000000000011", name: "Cadeira adutora", muscleGroup: "adutores", equipment: "máquina", instructions: "Feche as pernas com controle e retorne sem bater os pesos.", safetyNotes: "Não force abertura além do conforto e evite prender a respiração." },
  { id: "10000000-0000-4000-8000-000000000012", name: "Afundo alternado", muscleGroup: "pernas e glúteos", equipment: "peso corporal", instructions: "Dê um passo à frente, desça pouco e retorne mantendo tronco alto.", safetyNotes: "Comece curto. Pare se houver dor no joelho ou instabilidade." },
  { id: "10000000-0000-4000-8000-000000000013", name: "Panturrilha em pé", muscleGroup: "panturrilhas", equipment: "peso corporal ou máquina", instructions: "Suba na ponta dos pés, pause e desça devagar até apoiar o calcanhar.", safetyNotes: "Controle o tornozelo e evite quicar." },
  { id: "10000000-0000-4000-8000-000000000014", name: "Prancha curta", muscleGroup: "core", equipment: "colchonete", instructions: "Apoie antebraços e joelhos ou pés, mantendo abdômen ativo.", safetyNotes: "Pare se sentir dor lombar. Qualidade vale mais que tempo." },
  { id: "10000000-0000-4000-8000-000000000015", name: "Abdominal simples", muscleGroup: "abdômen", equipment: "colchonete", instructions: "Deite, flexione os joelhos, suba pouco o tronco olhando para cima e desça devagar.", safetyNotes: "Não puxe o pescoço, não use impulso e interrompa se causar dor lombar." },
  { id: "10000000-0000-4000-8000-000000000016", name: "Dead bug", muscleGroup: "core", equipment: "colchonete", instructions: "Deite de barriga para cima e alterne braços e pernas mantendo lombar confortável.", safetyNotes: "Reduza amplitude se perder controle do tronco." },
  { id: "10000000-0000-4000-8000-000000000017", name: "Puxada frontal", muscleGroup: "costas e bíceps", equipment: "máquina", instructions: "Peito alto, puxe a barra até a parte alta do peito levando cotovelos para baixo.", safetyNotes: "Evite puxar atrás da nuca, jogar o tronco ou encolher os ombros." },
  { id: "10000000-0000-4000-8000-000000000018", name: "Supino máquina ou chest press", muscleGroup: "peito e tríceps", equipment: "máquina", instructions: "Ajuste os pegadores na linha do peito, empurre sem travar cotovelos e volte controlando.", safetyNotes: "Não deixe os ombros subirem, não tire as costas do banco e evite carga excessiva." },
  { id: "10000000-0000-4000-8000-000000000019", name: "Remada máquina", muscleGroup: "costas", equipment: "máquina", instructions: "Puxe levando cotovelos para trás e junte levemente as escápulas.", safetyNotes: "Evite arredondar as costas, puxar com o pescoço ou soltar a carga de uma vez." },
  { id: "10000000-0000-4000-8000-000000000020", name: "Remada baixa elástica", muscleGroup: "costas", equipment: "elástico", instructions: "Puxe o elástico na direção do umbigo com peito aberto e ombros longe das orelhas.", safetyNotes: "Use tensão leve e prenda o elástico com segurança." },
  { id: "10000000-0000-4000-8000-000000000021", name: "Desenvolvimento máquina", muscleGroup: "ombros e tríceps", equipment: "máquina", instructions: "Com as costas apoiadas, empurre acima da cabeça em amplitude confortável.", safetyNotes: "Evite arquear a lombar, travar cotovelos com força ou descer com dor." },
  { id: "10000000-0000-4000-8000-000000000022", name: "Elevação lateral", muscleGroup: "ombros", equipment: "halteres leves", instructions: "Levante os halteres até a linha dos ombros com cotovelos levemente flexionados.", safetyNotes: "Evite impulso, encolher ombros e escolher halter pesado cedo demais." },
  { id: "10000000-0000-4000-8000-000000000023", name: "Flexão inclinada", muscleGroup: "peito e tríceps", equipment: "banco ou parede", instructions: "Apoie as mãos em superfície elevada, flexione cotovelos e empurre de volta.", safetyNotes: "Mantenha tronco firme e escolha uma altura confortável." },
  { id: "10000000-0000-4000-8000-000000000024", name: "Rosca bíceps", muscleGroup: "bíceps", equipment: "halteres ou máquina", instructions: "Cotovelos perto do corpo, flexione sem balançar o tronco e desça devagar.", safetyNotes: "Evite jogar o corpo, afastar cotovelos ou perder controle na descida." },
  { id: "10000000-0000-4000-8000-000000000025", name: "Tríceps na polia", muscleGroup: "tríceps", equipment: "polia", instructions: "Cotovelos colados ao corpo, empurre barra ou corda para baixo e volte com controle.", safetyNotes: "Evite mover ombros, abrir cotovelos e usar carga que quebre a postura." },
  { id: "10000000-0000-4000-8000-000000000026", name: "Tríceps no banco adaptado", muscleGroup: "tríceps", equipment: "banco", instructions: "Apoie as mãos no banco, flexione pouco os cotovelos e retorne.", safetyNotes: "Evite descer demais se houver desconforto nos ombros." },
  { id: "10000000-0000-4000-8000-000000000027", name: "Mobilidade de coluna", muscleGroup: "mobilidade", equipment: "colchonete", instructions: "Alterne arredondar e estender suavemente a coluna, respirando com calma.", safetyNotes: "Movimento sem dor e sem pressa." },
  { id: "10000000-0000-4000-8000-000000000028", name: "Mobilidade de quadril", muscleGroup: "mobilidade", equipment: "colchonete", instructions: "Faça círculos e balanços curtos de quadril, procurando amplitude confortável.", safetyNotes: "Não force abertura máxima." },
  { id: "10000000-0000-4000-8000-000000000029", name: "Mobilidade de ombros", muscleGroup: "mobilidade", equipment: "bastão ou toalha", instructions: "Eleve e rode os ombros com amplitude tranquila, sem prender a respiração.", safetyNotes: "Evite dor aguda ou formigamento." },
  { id: "10000000-0000-4000-8000-000000000030", name: "Alongamento posterior leve", muscleGroup: "mobilidade", equipment: "colchonete", instructions: "Incline o tronco até sentir alongamento confortável atrás da coxa.", safetyNotes: "Sem insistir em dor. Respire e mantenha leve." },
  { id: "10000000-0000-4000-8000-000000000031", name: "Marcha estacionária", muscleGroup: "cardiorrespiratório", equipment: "peso corporal", instructions: "Marche no lugar elevando joelhos em altura confortável.", safetyNotes: "Reduza ritmo se a respiração ficar descontrolada." },
  { id: "10000000-0000-4000-8000-000000000032", name: "Step touch", muscleGroup: "cardiorrespiratório", equipment: "peso corporal", instructions: "Dê passos laterais alternados, mantendo braços soltos e ritmo constante.", safetyNotes: "Sem saltos. Use apoio próximo se precisar." },
  { id: "10000000-0000-4000-8000-000000000033", name: "Cardio final baixo impacto", muscleGroup: "cardiorrespiratório", equipment: "bike ou elíptico", instructions: "Mantenha ritmo leve a moderado que permita falar frases curtas.", safetyNotes: "Sem sprint, sem impacto e sem insistir se houver dor." },
  { id: "10000000-0000-4000-8000-000000000034", name: "Respiração guiada", muscleGroup: "recuperação", equipment: "nenhum", instructions: "Inspire pelo nariz, solte o ar devagar e relaxe ombros e mandíbula.", safetyNotes: "Se ficar desconfortável, respire naturalmente." },
  { id: "10000000-0000-4000-8000-000000000035", name: "Caminhada leve", muscleGroup: "cardiorrespiratório", equipment: "nenhum", instructions: "Caminhe em ritmo confortável, mantendo conversa possível.", safetyNotes: "Pausa também conta. Volte quando estiver confortável." },
  { id: "10000000-0000-4000-8000-000000000036", name: "Alongamento de peitoral", muscleGroup: "mobilidade", equipment: "parede", instructions: "Apoie o antebraço na parede e gire o tronco levemente para abrir o peito.", safetyNotes: "Não force ombro para trás." },
];

const workouts = [
  { id: "20000000-0000-4000-8000-000000000001", title: "Inferiores A - base técnica", description: "Pernas em máquinas, core simples e baixo impacto para construir constância.", difficulty: "easy" as const, estimatedMinutes: 55, category: "strength" as const },
  { id: "20000000-0000-4000-8000-000000000002", title: "Superiores A - força guiada", description: "Costas, peito, ombros e tríceps com máquinas e execução controlada.", difficulty: "easy" as const, estimatedMinutes: 50, category: "strength" as const },
  { id: "20000000-0000-4000-8000-000000000003", title: "Inferiores B - posterior e glúteos", description: "Posterior, glúteos, adutora, abdutora e core com cardio seguro.", difficulty: "easy" as const, estimatedMinutes: 55, category: "strength" as const },
  { id: "20000000-0000-4000-8000-000000000004", title: "Superiores B - costas e braços", description: "Costas, peito, ombros, bíceps e tríceps sem treinar até a falha.", difficulty: "easy" as const, estimatedMinutes: 50, category: "strength" as const },
  { id: "20000000-0000-4000-8000-000000000005", title: "Corpo todo + cardio leve", description: "Circuito controlado em máquinas com cardio final de baixo impacto.", difficulty: "easy" as const, estimatedMinutes: 55, category: "full_body" as const },
  { id: "20000000-0000-4000-8000-000000000006", title: "Casa 20 - sem equipamento", description: "Treino curto para dias corridos, com foco em movimento seguro e constância.", difficulty: "easy" as const, estimatedMinutes: 20, category: "full_body" as const },
  { id: "20000000-0000-4000-8000-000000000007", title: "Glúteos e pernas - foco preferido", description: "Ênfase em glúteos, posteriores e quadríceps. Indicado para qualquer pessoa com esse objetivo.", difficulty: "medium" as const, estimatedMinutes: 45, category: "strength" as const },
  { id: "20000000-0000-4000-8000-000000000008", title: "Peito, costas e ombros - foco preferido", description: "Ênfase em membros superiores. Indicado para qualquer pessoa que queira força e postura.", difficulty: "medium" as const, estimatedMinutes: 45, category: "strength" as const },
  { id: "20000000-0000-4000-8000-000000000009", title: "Mobilidade para coluna e quadril", description: "Sessão leve para recuperar amplitude, aliviar rigidez e voltar sem cobrança.", difficulty: "easy" as const, estimatedMinutes: 18, category: "mobility" as const },
  { id: "20000000-0000-4000-8000-000000000010", title: "Cardio baixo impacto 25", description: "Condicionamento sem saltos, sem corrida e com intensidade conversável.", difficulty: "easy" as const, estimatedMinutes: 25, category: "cardio" as const },
  { id: "20000000-0000-4000-8000-000000000011", title: "Recuperação guiada 12", description: "Respiração, caminhada leve e alongamentos curtos para dias de baixa energia.", difficulty: "easy" as const, estimatedMinutes: 12, category: "recovery" as const },
];

const workoutExercises = [
  { workoutId: workouts[0].id, exerciseId: exercises[1].id, sortOrder: 1, targetSeconds: 600 },
  { workoutId: workouts[0].id, exerciseId: exercises[5].id, sortOrder: 2, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[0].id, exerciseId: exercises[6].id, sortOrder: 3, targetSets: 3, targetReps: 15 },
  { workoutId: workouts[0].id, exerciseId: exercises[7].id, sortOrder: 4, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[0].id, exerciseId: exercises[9].id, sortOrder: 5, targetSets: 3, targetReps: 15 },
  { workoutId: workouts[0].id, exerciseId: exercises[10].id, sortOrder: 6, targetSets: 2, targetReps: 15 },
  { workoutId: workouts[0].id, exerciseId: exercises[14].id, sortOrder: 7, targetSets: 3, targetReps: 15 },
  { workoutId: workouts[1].id, exerciseId: exercises[2].id, sortOrder: 1, targetSeconds: 480 },
  { workoutId: workouts[1].id, exerciseId: exercises[16].id, sortOrder: 2, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[1].id, exerciseId: exercises[17].id, sortOrder: 3, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[1].id, exerciseId: exercises[18].id, sortOrder: 4, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[1].id, exerciseId: exercises[20].id, sortOrder: 5, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[1].id, exerciseId: exercises[24].id, sortOrder: 6, targetSets: 3, targetReps: 15 },
  { workoutId: workouts[1].id, exerciseId: exercises[21].id, sortOrder: 7, targetSets: 2, targetReps: 15 },
  { workoutId: workouts[2].id, exerciseId: exercises[1].id, sortOrder: 1, targetSeconds: 600 },
  { workoutId: workouts[2].id, exerciseId: exercises[5].id, sortOrder: 2, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[2].id, exerciseId: exercises[7].id, sortOrder: 3, targetSets: 3, targetReps: 15 },
  { workoutId: workouts[2].id, exerciseId: exercises[8].id, sortOrder: 4, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[2].id, exerciseId: exercises[9].id, sortOrder: 5, targetSets: 3, targetReps: 15 },
  { workoutId: workouts[2].id, exerciseId: exercises[10].id, sortOrder: 6, targetSets: 3, targetReps: 15 },
  { workoutId: workouts[2].id, exerciseId: exercises[14].id, sortOrder: 7, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[3].id, exerciseId: exercises[0].id, sortOrder: 1, targetSeconds: 480 },
  { workoutId: workouts[3].id, exerciseId: exercises[18].id, sortOrder: 2, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[3].id, exerciseId: exercises[16].id, sortOrder: 3, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[3].id, exerciseId: exercises[17].id, sortOrder: 4, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[3].id, exerciseId: exercises[20].id, sortOrder: 5, targetSets: 2, targetReps: 12 },
  { workoutId: workouts[3].id, exerciseId: exercises[23].id, sortOrder: 6, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[3].id, exerciseId: exercises[24].id, sortOrder: 7, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[4].id, exerciseId: exercises[1].id, sortOrder: 1, targetSeconds: 480 },
  { workoutId: workouts[4].id, exerciseId: exercises[5].id, sortOrder: 2, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[4].id, exerciseId: exercises[16].id, sortOrder: 3, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[4].id, exerciseId: exercises[17].id, sortOrder: 4, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[4].id, exerciseId: exercises[7].id, sortOrder: 5, targetSets: 2, targetReps: 15 },
  { workoutId: workouts[4].id, exerciseId: exercises[21].id, sortOrder: 6, targetSets: 2, targetReps: 15 },
  { workoutId: workouts[4].id, exerciseId: exercises[14].id, sortOrder: 7, targetSets: 3, targetReps: 15 },
  { workoutId: workouts[4].id, exerciseId: exercises[32].id, sortOrder: 8, targetSeconds: 900 },
  { workoutId: workouts[5].id, exerciseId: exercises[26].id, sortOrder: 1, targetSeconds: 180 },
  { workoutId: workouts[5].id, exerciseId: exercises[4].id, sortOrder: 2, targetSets: 3, targetReps: 10 },
  { workoutId: workouts[5].id, exerciseId: exercises[22].id, sortOrder: 3, targetSets: 3, targetReps: 8 },
  { workoutId: workouts[5].id, exerciseId: exercises[19].id, sortOrder: 4, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[5].id, exerciseId: exercises[15].id, sortOrder: 5, targetSets: 2, targetReps: 8 },
  { workoutId: workouts[5].id, exerciseId: exercises[31].id, sortOrder: 6, targetSeconds: 240 },
  { workoutId: workouts[6].id, exerciseId: exercises[2].id, sortOrder: 1, targetSeconds: 360 },
  { workoutId: workouts[6].id, exerciseId: exercises[8].id, sortOrder: 2, targetSets: 4, targetReps: 12 },
  { workoutId: workouts[6].id, exerciseId: exercises[5].id, sortOrder: 3, targetSets: 3, targetReps: 10 },
  { workoutId: workouts[6].id, exerciseId: exercises[7].id, sortOrder: 4, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[6].id, exerciseId: exercises[9].id, sortOrder: 5, targetSets: 3, targetReps: 15 },
  { workoutId: workouts[6].id, exerciseId: exercises[12].id, sortOrder: 6, targetSets: 3, targetReps: 15 },
  { workoutId: workouts[6].id, exerciseId: exercises[29].id, sortOrder: 7, targetSeconds: 240 },
  { workoutId: workouts[7].id, exerciseId: exercises[0].id, sortOrder: 1, targetSeconds: 300 },
  { workoutId: workouts[7].id, exerciseId: exercises[17].id, sortOrder: 2, targetSets: 4, targetReps: 10 },
  { workoutId: workouts[7].id, exerciseId: exercises[18].id, sortOrder: 3, targetSets: 4, targetReps: 10 },
  { workoutId: workouts[7].id, exerciseId: exercises[16].id, sortOrder: 4, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[7].id, exerciseId: exercises[20].id, sortOrder: 5, targetSets: 3, targetReps: 12 },
  { workoutId: workouts[7].id, exerciseId: exercises[21].id, sortOrder: 6, targetSets: 3, targetReps: 15 },
  { workoutId: workouts[7].id, exerciseId: exercises[35].id, sortOrder: 7, targetSeconds: 180 },
  { workoutId: workouts[8].id, exerciseId: exercises[26].id, sortOrder: 1, targetSeconds: 240 },
  { workoutId: workouts[8].id, exerciseId: exercises[27].id, sortOrder: 2, targetSeconds: 240 },
  { workoutId: workouts[8].id, exerciseId: exercises[28].id, sortOrder: 3, targetSeconds: 180 },
  { workoutId: workouts[8].id, exerciseId: exercises[29].id, sortOrder: 4, targetSeconds: 240 },
  { workoutId: workouts[8].id, exerciseId: exercises[33].id, sortOrder: 5, targetSeconds: 180 },
  { workoutId: workouts[9].id, exerciseId: exercises[30].id, sortOrder: 1, targetSeconds: 300 },
  { workoutId: workouts[9].id, exerciseId: exercises[31].id, sortOrder: 2, targetSeconds: 300 },
  { workoutId: workouts[9].id, exerciseId: exercises[1].id, sortOrder: 3, targetSeconds: 600 },
  { workoutId: workouts[9].id, exerciseId: exercises[32].id, sortOrder: 4, targetSeconds: 300 },
  { workoutId: workouts[10].id, exerciseId: exercises[33].id, sortOrder: 1, targetSeconds: 180 },
  { workoutId: workouts[10].id, exerciseId: exercises[34].id, sortOrder: 2, targetSeconds: 360 },
  { workoutId: workouts[10].id, exerciseId: exercises[26].id, sortOrder: 3, targetSeconds: 180 },
  { workoutId: workouts[10].id, exerciseId: exercises[29].id, sortOrder: 4, targetSeconds: 180 },
];

const missions = [
  { id: "30000000-0000-4000-8000-000000000001", key: "move-today", title: "Mexa o corpo", description: "Conclua um treino compatível com sua energia de hoje.", type: "workout" as const, xpReward: 30 },
  { id: "30000000-0000-4000-8000-000000000002", key: "water-goal", title: "Hidratação em dia", description: "Avance até sua meta pessoal de água.", type: "water" as const, xpReward: 20 },
  { id: "30000000-0000-4000-8000-000000000003", key: "balanced-choice", title: "Escolha que nutre", description: "Registre uma refeição com proteína e vegetal ou fruta.", type: "nutrition" as const, xpReward: 20 },
  { id: "30000000-0000-4000-8000-000000000004", key: "pause-and-breathe", title: "Pausa consciente", description: "Reserve dois minutos para respirar e perceber como você está.", type: "habit" as const, xpReward: 10 },
  { id: "30000000-0000-4000-8000-000000000005", key: "gentle-return", title: "Volte no seu ritmo", description: "Retome com uma ação pequena; constância não exige perfeição.", type: "recovery" as const, xpReward: 15 },
  { id: "30000000-0000-4000-8000-000000000006", key: "mobility-five", title: "Mobilidade de 5 minutos", description: "Solte ombros, coluna ou quadril em ritmo confortável.", type: "workout" as const, xpReward: 15 },
  { id: "30000000-0000-4000-8000-000000000007", key: "walk-light", title: "Caminhada leve", description: "Faça uma caminhada curta ou alguns minutos de movimento sem pressa.", type: "workout" as const, xpReward: 20 },
  { id: "30000000-0000-4000-8000-000000000008", key: "strength-block", title: "Bloco de força", description: "Complete um bloco de treino com técnica controlada.", type: "workout" as const, xpReward: 30 },
  { id: "30000000-0000-4000-8000-000000000009", key: "stretch-night", title: "Alongamento leve", description: "Finalize o dia com alongamento simples e respiração tranquila.", type: "recovery" as const, xpReward: 15 },
  { id: "30000000-0000-4000-8000-000000000010", key: "water-first-cup", title: "Primeiro copo", description: "Registre um copo de água para iniciar o ritmo.", type: "water" as const, xpReward: 10 },
  { id: "30000000-0000-4000-8000-000000000011", key: "water-halfway", title: "Metade da garrafa", description: "Avance uma parte da meta de água sem pressa.", type: "water" as const, xpReward: 15 },
  { id: "30000000-0000-4000-8000-000000000012", key: "water-evening", title: "Água no fim do dia", description: "Cheque sua hidratação antes de encerrar o dia.", type: "water" as const, xpReward: 15 },
  { id: "30000000-0000-4000-8000-000000000013", key: "protein-check", title: "Fonte de proteína", description: "Marque uma refeição com uma fonte de proteína.", type: "nutrition" as const, xpReward: 15 },
  { id: "30000000-0000-4000-8000-000000000014", key: "color-plate", title: "Prato com cor", description: "Inclua fruta, vegetal ou legume em uma refeição.", type: "nutrition" as const, xpReward: 15 },
  { id: "30000000-0000-4000-8000-000000000015", key: "no-skip-meal", title: "Sem pular refeição", description: "Registre que você não pulou uma refeição importante.", type: "nutrition" as const, xpReward: 15 },
  { id: "30000000-0000-4000-8000-000000000016", key: "mindful-meal", title: "Comer com atenção", description: "Faça uma refeição com menos distração e mais presença.", type: "nutrition" as const, xpReward: 15 },
  { id: "30000000-0000-4000-8000-000000000017", key: "plan-next-meal", title: "Próxima refeição pensada", description: "Deixe uma ideia simples para a próxima refeição.", type: "nutrition" as const, xpReward: 10 },
  { id: "30000000-0000-4000-8000-000000000018", key: "screen-break", title: "Pausa de tela", description: "Afaste os olhos da tela por alguns minutos.", type: "habit" as const, xpReward: 10 },
  { id: "30000000-0000-4000-8000-000000000019", key: "posture-check", title: "Cheque a postura", description: "Ajuste cadeira, ombros e respiração por um momento.", type: "habit" as const, xpReward: 10 },
  { id: "30000000-0000-4000-8000-000000000020", key: "sleep-prep", title: "Preparar descanso", description: "Escolha uma pequena ação para dormir melhor hoje.", type: "habit" as const, xpReward: 10 },
  { id: "30000000-0000-4000-8000-000000000021", key: "mood-check", title: "Como você está?", description: "Faça um check rápido de energia, humor ou disposição.", type: "progress" as const, xpReward: 10 },
  { id: "30000000-0000-4000-8000-000000000022", key: "body-checkin", title: "Check-in corporal", description: "Registre uma medida ou nota privada se fizer sentido.", type: "progress" as const, xpReward: 15 },
  { id: "30000000-0000-4000-8000-000000000023", key: "progress-note", title: "Nota de progresso", description: "Escreva uma observação curta sobre seu dia.", type: "progress" as const, xpReward: 10 },
  { id: "30000000-0000-4000-8000-000000000024", key: "recovery-breath", title: "Respirar e soltar", description: "Faça uma pausa curta de respiração para recuperar.", type: "recovery" as const, xpReward: 10 },
  { id: "30000000-0000-4000-8000-000000000025", key: "gentle-stretch", title: "Soltar o corpo", description: "Alongue sem forçar amplitude e pare se houver dor.", type: "recovery" as const, xpReward: 10 },
  { id: "30000000-0000-4000-8000-000000000026", key: "return-small", title: "Recomeço pequeno", description: "Se o dia saiu do plano, faça uma ação pequena agora.", type: "recovery" as const, xpReward: 10 },
  { id: "30000000-0000-4000-8000-000000000027", key: "stairs-or-steps", title: "Mais passos", description: "Some alguns passos extras no seu ritmo.", type: "workout" as const, xpReward: 15 },
  { id: "30000000-0000-4000-8000-000000000028", key: "warmup-only", title: "Aquecimento conta", description: "Faça um aquecimento leve se um treino completo não couber.", type: "workout" as const, xpReward: 15 },
  { id: "30000000-0000-4000-8000-000000000029", key: "refill-bottle", title: "Garrafa cheia", description: "Reabasteça sua garrafa para facilitar a próxima dose.", type: "water" as const, xpReward: 10 },
  { id: "30000000-0000-4000-8000-000000000030", key: "fruit-snack", title: "Lanche simples", description: "Escolha um lanche que te sustente sem exagero.", type: "nutrition" as const, xpReward: 10 },
];

const achievements = [
  { id: "40000000-0000-4000-8000-000000000001", key: "first-mission", name: "Primeiro passo", description: "Concluiu a primeira missão.", category: "first_steps" as const, rarity: "common" as const, xpReward: 10 },
  { id: "40000000-0000-4000-8000-000000000002", key: "first-workout", name: "Corpo em movimento", description: "Concluiu o primeiro treino.", category: "workout" as const, rarity: "common" as const, xpReward: 15 },
  { id: "40000000-0000-4000-8000-000000000003", key: "water-week", name: "Fluxo constante", description: "Cumpriu a meta de água em sete dias.", category: "water" as const, rarity: "uncommon" as const, xpReward: 40 },
  { id: "40000000-0000-4000-8000-000000000004", key: "streak-seven", name: "Uma semana presente", description: "Manteve sete dias de constância.", category: "streak" as const, rarity: "uncommon" as const, xpReward: 50 },
  { id: "40000000-0000-4000-8000-000000000005", key: "return-kindly", name: "Recomeço conta", description: "Retomou sua jornada sem buscar compensação.", category: "recovery" as const, rarity: "rare" as const, xpReward: 60 },
  { id: "40000000-0000-4000-8000-000000000006", key: "mission-5", name: "Cinco sinais", description: "Concluiu cinco missões no seu ritmo.", category: "first_steps" as const, rarity: "common" as const, xpReward: 15 },
  { id: "40000000-0000-4000-8000-000000000007", key: "mission-20", name: "Rotina ganhando forma", description: "Concluiu vinte missões sem precisar de perfeição.", category: "first_steps" as const, rarity: "uncommon" as const, xpReward: 35 },
  { id: "40000000-0000-4000-8000-000000000008", key: "mission-50", name: "Constância visível", description: "Concluiu cinquenta missões pequenas.", category: "first_steps" as const, rarity: "rare" as const, xpReward: 80 },
  { id: "40000000-0000-4000-8000-000000000009", key: "workout-3", name: "Três treinos salvos", description: "Completou três sessões de treino.", category: "workout" as const, rarity: "common" as const, xpReward: 20 },
  { id: "40000000-0000-4000-8000-000000000010", key: "workout-10", name: "Dez sessões", description: "Registrou dez treinos respeitando seu corpo.", category: "workout" as const, rarity: "uncommon" as const, xpReward: 50 },
  { id: "40000000-0000-4000-8000-000000000011", key: "workout-25", name: "Base forte", description: "Chegou a vinte e cinco treinos concluídos.", category: "workout" as const, rarity: "rare" as const, xpReward: 90 },
  { id: "40000000-0000-4000-8000-000000000012", key: "workout-50", name: "Força paciente", description: "Completou cinquenta treinos sem pressa tóxica.", category: "workout" as const, rarity: "epic" as const, xpReward: 140 },
  { id: "40000000-0000-4000-8000-000000000013", key: "water-first", name: "Primeira hidratação", description: "Registrou a primeira meta de água.", category: "water" as const, rarity: "common" as const, xpReward: 10 },
  { id: "40000000-0000-4000-8000-000000000014", key: "water-3", name: "Três dias de água", description: "Completou três metas de hidratação.", category: "water" as const, rarity: "common" as const, xpReward: 20 },
  { id: "40000000-0000-4000-8000-000000000015", key: "water-21", name: "Ritmo fluido", description: "Completou vinte e uma metas de hidratação.", category: "water" as const, rarity: "rare" as const, xpReward: 80 },
  { id: "40000000-0000-4000-8000-000000000016", key: "nutrition-first", name: "Primeiro prato", description: "Registrou a primeira refeição ou checklist alimentar.", category: "nutrition" as const, rarity: "common" as const, xpReward: 10 },
  { id: "40000000-0000-4000-8000-000000000017", key: "nutrition-3", name: "Prato com intenção", description: "Completou três checklists alimentares.", category: "nutrition" as const, rarity: "common" as const, xpReward: 20 },
  { id: "40000000-0000-4000-8000-000000000018", key: "nutrition-21", name: "Energia sustentada", description: "Completou vinte e um registros alimentares.", category: "nutrition" as const, rarity: "rare" as const, xpReward: 80 },
  { id: "40000000-0000-4000-8000-000000000019", key: "streak-three", name: "Três dias presentes", description: "Somou três dias ativos.", category: "streak" as const, rarity: "common" as const, xpReward: 20 },
  { id: "40000000-0000-4000-8000-000000000020", key: "streak-fourteen", name: "Duas semanas reais", description: "Manteve quatorze dias ativos, com leveza.", category: "streak" as const, rarity: "rare" as const, xpReward: 90 },
  { id: "40000000-0000-4000-8000-000000000021", key: "streak-thirty", name: "Mês em movimento", description: "Chegou a trinta dias ativos.", category: "streak" as const, rarity: "epic" as const, xpReward: 150 },
  { id: "40000000-0000-4000-8000-000000000022", key: "level-2", name: "Subiu de nível", description: "Alcançou o nível 2.", category: "progress" as const, rarity: "common" as const, xpReward: 15 },
  { id: "40000000-0000-4000-8000-000000000023", key: "level-5", name: "Pulse evoluindo", description: "Alcançou o nível 5.", category: "progress" as const, rarity: "uncommon" as const, xpReward: 50 },
  { id: "40000000-0000-4000-8000-000000000024", key: "level-10", name: "Identidade forte", description: "Alcançou o nível 10.", category: "progress" as const, rarity: "epic" as const, xpReward: 120 },
  { id: "40000000-0000-4000-8000-000000000025", key: "gentle-day", name: "Dia leve também conta", description: "Concluiu uma missão de recuperação.", category: "recovery" as const, rarity: "common" as const, xpReward: 15 },
  { id: "40000000-0000-4000-8000-000000000026", key: "recovery-7", name: "Recuperação inteligente", description: "Fez sete ações de recuperação.", category: "recovery" as const, rarity: "uncommon" as const, xpReward: 50 },
  { id: "40000000-0000-4000-8000-000000000027", key: "progress-first-checkin", name: "Registro privado", description: "Fez o primeiro check-in corporal ou nota de progresso.", category: "progress" as const, rarity: "common" as const, xpReward: 15 },
  { id: "40000000-0000-4000-8000-000000000028", key: "balanced-week", name: "Semana equilibrada", description: "Somou treino, água e alimentação na mesma semana.", category: "progress" as const, rarity: "rare" as const, xpReward: 100 },
  { id: "40000000-0000-4000-8000-000000000029", key: "no-extremes", name: "Sem extremos", description: "Construiu progresso sem punição, compensação ou exagero.", category: "recovery" as const, rarity: "epic" as const, xpReward: 120 },
  { id: "40000000-0000-4000-8000-000000000030", key: "all-day-flow", name: "Dia em fluxo", description: "Concluiu várias ações pequenas no mesmo dia.", category: "first_steps" as const, rarity: "rare" as const, xpReward: 80 },
];

const seededExercises = [...exercises, ...guideExercises];
const seededWorkouts = [...workouts, ...guideWorkouts];
const seededWorkoutExercises = [...workoutExercises, ...guideWorkoutExercises];

async function main() {
  for (const exercise of seededExercises) {
    await prisma.exercise.upsert({ where: { id: exercise.id }, create: exercise, update: { ...exercise, deletedAt: null } });
  }
  for (const workout of seededWorkouts) {
    await prisma.workout.upsert({ where: { id: workout.id }, create: { ...workout, isPublic: true }, update: { ...workout, isPublic: true, deletedAt: null } });
  }
  await prisma.workoutExercise.deleteMany({ where: { workoutId: { in: seededWorkouts.map((item) => item.id) } } });
  await prisma.workoutExercise.createMany({ data: seededWorkoutExercises });

  for (const meal of [
    { id: "50000000-0000-4000-8000-000000000001", name: "Café da manhã", sortOrder: 1 },
    { id: "50000000-0000-4000-8000-000000000002", name: "Almoço", sortOrder: 2 },
    { id: "50000000-0000-4000-8000-000000000003", name: "Lanche", sortOrder: 3 },
    { id: "50000000-0000-4000-8000-000000000004", name: "Jantar", sortOrder: 4 },
  ]) await prisma.meal.upsert({ where: { id: meal.id }, create: meal, update: meal });

  for (const food of tacoFoods) {
    await prisma.food.upsert({
      where: { tacoCode: food.tacoCode },
      create: food,
      update: { ...food, deletedAt: null },
    });
  }

  for (const mission of missions) {
    await prisma.dailyMission.upsert({ where: { key: mission.key }, create: mission, update: { ...mission, isActive: true, deletedAt: null } });
  }
  for (const achievement of achievements) {
    await prisma.achievement.upsert({ where: { key: achievement.key }, create: achievement, update: { ...achievement, isActive: true, deletedAt: null } });
  }

  const templates = [
    { key: "verify_email", channel: "email" as const, subject: "Confirme sua conta LevelFit", title: "Seu primeiro passo", body: "Use o link seguro e temporário para confirmar seu e-mail." },
    { key: "password_reset", channel: "email" as const, subject: "Redefinição de acesso LevelFit", title: "Redefina sua senha", body: "Use o link temporário. Se não foi você, ignore esta mensagem." },
    { key: "streak_at_risk", channel: "in_app" as const, subject: null, title: "Ainda dá tempo", body: "Uma ação pequena hoje já conta. Escolha algo que caiba na sua energia." },
    { key: "weekly_summary", channel: "email" as const, subject: "Seu resumo semanal LevelFit", title: "Veja o que você construiu", body: "Confira sua constância sem comparações ou cobranças." },
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
  .then(() => console.log("LevelFit seed concluído."))
  .finally(async () => prisma.$disconnect());
