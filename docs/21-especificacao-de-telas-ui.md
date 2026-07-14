# LevelFit - Especificação de Telas UI/UX

Este documento detalha as principais telas do LevelFit para orientar design, prototipacao e desenvolvimento frontend.

## Principio de experiencia

A interface deve parecer um app real em uso desde o primeiro contato. O produto não deve abrir em uma landing page, mas em uma experiencia funcional: após login, o usuário chega diretamente ao dashboard diário.

## Arquitetura de navegacao

### Mobile

Bottom navigation com 5 destinos principais:

- Dashboard.
- Missões.
- Treino.
- Progresso.
- Perfil.

Ações secundarias ficam em:

- Sino de notificações no topo.
- Configurações dentro do perfil.
- Alimentação e hidratação acessiveis pelo dashboard e por atalhos.

### Desktop

Sidebar fixa com:

- Dashboard.
- Missões.
- Treino.
- Alimentação.
- Hidratação.
- Progresso.
- Conquistas.
- Perfil.
- Configurações.

Topo compacto com:

- XP atual.
- Streak.
- Sino de notificações.
- Avatar.

## 1. Onboarding

Objetivo: configurar o primeiro plano sem fricção e comunicar a filosofia do produto.

Fluxo recomendado:

1. Boas-vindas: "Evolua um pouco todos os dias."
2. Objetivo principal:
   - Criar consistência.
   - Ganhar condicionamento.
   - Melhorar alimentação.
   - Beber mais água.
   - Acompanhar progresso corporal.
3. Nível atual:
   - Começando agora.
   - Retomando.
   - Já treino as vezes.
   - Treino com frequencia.
4. Ritmo desejado:
   - Leve.
   - Moderado.
   - Intenso, com segurança.
5. Consentimento de dados sensíveis.
6. Criacao das primeiras missões.

Componentes:

- Progress indicator.
- Cards de selecao.
- Botao primario fixo no rodape mobile.
- Microcopy acolhedora.

Estado visual:

- Fundo escuro premium.
- Cards com borda colorida ao selecionar.
- Mascote discreto apresentando o próximo passo.

## 2. Cadastro

Objetivo: criar conta com segurança e pouca fricção.

Campos:

- Nome.
- E-mail.
- Senha.
- Aceite dos termos.
- Consentimento separado para dados sensíveis.

Validacoes:

- E-mail valido.
- Senha mínima de 10 caracteres.
- Indicador de força de senha.
- Consentimento obrigatório antes de coletar dados de saúde.

Elementos:

- Card central no desktop.
- Tela cheia no mobile.
- Feedback de erro abaixo do campo.
- Link para login.

## 3. Login

Objetivo: retorno rápido ao dashboard.

Campos:

- E-mail.
- Senha.

Ações:

- Entrar.
- Esqueci minha senha.
- Criar conta.

Segurança:

- Mensagens genericas para credenciais inválidas.
- Rate limit visual após múltiplas tentativas.
- Opção futura de 2FA.

## 4. Dashboard diário

Objetivo: mostrar o que importa hoje.

Hierarquia:

1. Saudacao curta.
2. Nível, XP e streak.
3. Missão principal do dia.
4. Cards de treino, água e alimentação.
5. Conquista ou insight recente.
6. Resumo da semana.

Componentes obrigatorios:

- XP bar.
- Streak counter.
- Daily missions.
- Workout card.
- Water tracker.
- Nutrition checklist.
- Achievement preview.
- Notification bell.

Layout mobile:

- Header compacto.
- XP bar no topo.
- Cards empilhados.
- Bottom navigation fixa.

Layout desktop:

- Grid de 12 colunas.
- Coluna principal com missões e treino.
- Coluna lateral com streak, água, conquistas e resumo.

Estados:

- Loading com skeletons.
- Estado vazio após onboarding incompleto.
- Estado de erro com ação "Tentar novamente".

## 5. Missões do dia

Objetivo: organizar as tarefas saudáveis do dia.

Tipos:

- Treino.
- Água.
- Alimentação.
- Habito.
- Progresso.
- Retomada.

Cada missão deve mostrar:

- Icone.
- Titulo.
- Descrição curta.
- XP.
- Categoria.
- Status.
- CTA.

Regras de UX:

- Missões concluídas vao para o fim ou ficam compactas.
- Missão perdida usa linguagem neutra.
- Missão de retomada aparece após inatividade.

## 6. Treino do dia

Objetivo: permitir iniciar e concluir um treino de forma simples.

Conteúdo:

- Nome do treino.
- Duracao estimada.
- Nível.
- Grupos musculares.
- Lista de exercícios.
- Botao "Iniciar treino".

Durante o treino:

- Exercicio atual.
- Series.
- Repeticoes.
- Carga opcional.
- Timer opcional.
- Botao de concluir serie.
- Botao de pausar.

Finalizacao:

- Resumo.
- XP ganho.
- Missão concluída.
- Feedback de esforco percebido.

## 7. Tela de exercícios

Objetivo: exibir instrucao suficiente sem excesso clínico.

Campos:

- Nome do exercicio.
- Grupo muscular.
- Equipamento.
- Instrucao curta.
- Cuidados.
- Series/repeticoes.
- Histórico recente.

Futuro:

- Video curto.
- Animacao.
- Alternativas por equipamento.

## 8. Alimentação

Objetivo MVP: checklist alimentar simples e seguro, sem dieta extrema.

Checklists:

- Comi uma refeição com proteína.
- Inclui fruta ou vegetal.
- Evitei pular refeições importantes.
- Fiz uma escolha consciente.

Regras:

- Não sugerir restricao radical.
- Não usar linguagem de culpa.
- Macros e calorias podem entrar depois com disclaimers e controle do usuário.

Visual:

- Verde natural.
- Cards de checklist.
- Barra de completude.

## 9. Hidratação

Objetivo: registrar água rapidamente.

Componentes:

- Meta diária.
- Total consumido.
- Botoes rapidos: +200ml, +300ml, +500ml.
- Histórico do dia.
- Progresso circular ou barra.

Microinteracao:

- Preenchimento azul ciano.
- Pequena animacao de confirmação.

## 10. Progresso corporal

Objetivo: acompanhar tendência sem julgamento.

Abas:

- Medidas.
- Fotos.
- Histórico.

Medidas:

- Peso opcional.
- Cintura.
- Quadril.
- Peito.
- Braco.
- Coxa.

Fotos:

- Upload protegido.
- Aviso de privacidade.
- Visualizacao discreta.
- URL assinada.

UX:

- Mostrar tendência, não julgamento.
- Evitar frases sobre "corpo ideal".

## 11. Conquistas

Objetivo: dar recompensa visual por consistência.

Categorias:

- Primeiros passos.
- Água.
- Treino.
- Alimentação.
- Streak.
- Retomada.
- Progresso.

Card de badge:

- Icone.
- Nome.
- Descrição curta.
- Data de desbloqueio.
- Raridade.

Estados:

- Bloqueado.
- Desbloqueado.
- Recem conquistado.

## 12. Perfil

Objetivo: centralizar identidade, nível e preferências.

Conteúdo:

- Avatar.
- Nome.
- Nível.
- XP total.
- Streak atual.
- Conquistas principais.
- Objetivo atual.
- Atalho para configurações.

## 13. Configurações

Secoes:

- Conta.
- Privacidade.
- Notificações.
- Segurança.
- Dados.
- Aparência futura.

Ações críticas:

- Exportar dados.
- Excluir conta.
- Encerrar sessoes.

Regras:

- Confirmação explicita para ações destrutivas.
- Linguagem clara.
- Sem esconder opt-out.

## 14. Notificações

Objetivo: central interno de lembretes e eventos.

Tipos:

- Missão pendente.
- Treino do dia.
- Água incompleta.
- Alimentação incompleta.
- Streak em risco.
- Conquista desbloqueada.
- Resumo diário.
- Resumo semanal.

Card de notificação:

- Icone.
- Titulo.
- Texto curto.
- Tempo relativo.
- Estado lida/não lida.
- CTA contextual.

Privacidade:

- Não mostrar peso, medidas ou fotos no preview.

## Componentes principais

### XPBar

Props sugeridas:

- `currentXp`
- `levelXp`
- `level`
- `label`

Comportamento:

- Animar progresso ao ganhar XP.
- Mostrar próximo nível.

### StreakCounter

Props:

- `days`
- `status`
- `shieldAvailable`

Estados:

- ativo.
- em risco.
- salvo.
- retomada.

### DailyMissionCard

Props:

- `title`
- `description`
- `xp`
- `type`
- `status`
- `actionLabel`

### WorkoutCard

Props:

- `title`
- `duration`
- `difficulty`
- `exercisesCount`
- `status`

### WaterTracker

Props:

- `goalMl`
- `currentMl`
- `quickAdds`

### NutritionChecklist

Props:

- `items`
- `completedCount`

### AchievementBadge

Props:

- `name`
- `icon`
- `rarity`
- `unlockedAt`
- `locked`

## Estados globais

Loading:

- Skeletons proporcionais ao card real.
- Evitar spinners em tela inteira quando houver estrutura previsivel.

Vazio:

- Explicar o próximo passo.
- CTA unico.

Erro:

- Mensagem curta.
- Ação de retry.
- Não expor detalhes técnicos.

Sucesso:

- Toast curto.
- Feedback visual no proprio componente.

## Recomendação de implementação visual

- Usar Tailwind com tokens definidos em `tailwind.config.ts`.
- Criar componentes de UI atomicos primeiro.
- Montar dashboard com dados mockados.
- Validar responsividade em 375px, 768px, 1024px e 1440px.
- Testar contraste no tema escuro.
- Usar `prefers-reduced-motion` para animações.
- Usar Lucide Icons em todos os botoes de icone.
- Usar Framer Motion apenas em momentos de recompensa e transicao.
