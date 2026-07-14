# LevelFit - Especificacao de Telas UI/UX

Este documento detalha as principais telas do LevelFit para orientar design, prototipacao e desenvolvimento frontend.

## Principio de experiencia

A interface deve parecer um app real em uso desde o primeiro contato. O produto nao deve abrir em uma landing page, mas em uma experiencia funcional: apos login, o usuario chega diretamente ao dashboard diario.

## Arquitetura de navegacao

### Mobile

Bottom navigation com 5 destinos principais:

- Dashboard.
- Missoes.
- Treino.
- Progresso.
- Perfil.

Acoes secundarias ficam em:

- Sino de notificacoes no topo.
- Configuracoes dentro do perfil.
- Alimentacao e hidratacao acessiveis pelo dashboard e por atalhos.

### Desktop

Sidebar fixa com:

- Dashboard.
- Missoes.
- Treino.
- Alimentacao.
- Hidratacao.
- Progresso.
- Conquistas.
- Perfil.
- Configuracoes.

Topo compacto com:

- XP atual.
- Streak.
- Sino de notificacoes.
- Avatar.

## 1. Onboarding

Objetivo: configurar o primeiro plano sem friccao e comunicar a filosofia do produto.

Fluxo recomendado:

1. Boas-vindas: "Evolua um pouco todos os dias."
2. Objetivo principal:
   - Criar consistencia.
   - Ganhar condicionamento.
   - Melhorar alimentacao.
   - Beber mais agua.
   - Acompanhar progresso corporal.
3. Nivel atual:
   - Comecando agora.
   - Retomando.
   - Ja treino as vezes.
   - Treino com frequencia.
4. Ritmo desejado:
   - Leve.
   - Moderado.
   - Intenso, com seguranca.
5. Consentimento de dados sensiveis.
6. Criacao das primeiras missoes.

Componentes:

- Progress indicator.
- Cards de selecao.
- Botao primario fixo no rodape mobile.
- Microcopy acolhedora.

Estado visual:

- Fundo escuro premium.
- Cards com borda colorida ao selecionar.
- Mascote discreto apresentando o proximo passo.

## 2. Cadastro

Objetivo: criar conta com seguranca e pouca friccao.

Campos:

- Nome.
- E-mail.
- Senha.
- Aceite dos termos.
- Consentimento separado para dados sensiveis.

Validacoes:

- E-mail valido.
- Senha minima de 10 caracteres.
- Indicador de forca de senha.
- Consentimento obrigatorio antes de coletar dados de saude.

Elementos:

- Card central no desktop.
- Tela cheia no mobile.
- Feedback de erro abaixo do campo.
- Link para login.

## 3. Login

Objetivo: retorno rapido ao dashboard.

Campos:

- E-mail.
- Senha.

Acoes:

- Entrar.
- Esqueci minha senha.
- Criar conta.

Seguranca:

- Mensagens genericas para credenciais invalidas.
- Rate limit visual apos multiplas tentativas.
- Opcao futura de 2FA.

## 4. Dashboard diario

Objetivo: mostrar o que importa hoje.

Hierarquia:

1. Saudacao curta.
2. Nivel, XP e streak.
3. Missao principal do dia.
4. Cards de treino, agua e alimentacao.
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
- Coluna principal com missoes e treino.
- Coluna lateral com streak, agua, conquistas e resumo.

Estados:

- Loading com skeletons.
- Estado vazio apos onboarding incompleto.
- Estado de erro com acao "Tentar novamente".

## 5. Missoes do dia

Objetivo: organizar as tarefas saudaveis do dia.

Tipos:

- Treino.
- Agua.
- Alimentacao.
- Habito.
- Progresso.
- Retomada.

Cada missao deve mostrar:

- Icone.
- Titulo.
- Descricao curta.
- XP.
- Categoria.
- Status.
- CTA.

Regras de UX:

- Missoes concluidas vao para o fim ou ficam compactas.
- Missao perdida usa linguagem neutra.
- Missao de retomada aparece apos inatividade.

## 6. Treino do dia

Objetivo: permitir iniciar e concluir um treino de forma simples.

Conteudo:

- Nome do treino.
- Duracao estimada.
- Nivel.
- Grupos musculares.
- Lista de exercicios.
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
- Missao concluida.
- Feedback de esforco percebido.

## 7. Tela de exercicios

Objetivo: exibir instrucao suficiente sem excesso clinico.

Campos:

- Nome do exercicio.
- Grupo muscular.
- Equipamento.
- Instrucao curta.
- Cuidados.
- Series/repeticoes.
- Historico recente.

Futuro:

- Video curto.
- Animacao.
- Alternativas por equipamento.

## 8. Alimentacao

Objetivo MVP: checklist alimentar simples e seguro, sem dieta extrema.

Checklists:

- Comi uma refeicao com proteina.
- Inclui fruta ou vegetal.
- Evitei pular refeicoes importantes.
- Fiz uma escolha consciente.

Regras:

- Nao sugerir restricao radical.
- Nao usar linguagem de culpa.
- Macros e calorias podem entrar depois com disclaimers e controle do usuario.

Visual:

- Verde natural.
- Cards de checklist.
- Barra de completude.

## 9. Hidratacao

Objetivo: registrar agua rapidamente.

Componentes:

- Meta diaria.
- Total consumido.
- Botoes rapidos: +200ml, +300ml, +500ml.
- Historico do dia.
- Progresso circular ou barra.

Microinteracao:

- Preenchimento azul ciano.
- Pequena animacao de confirmacao.

## 10. Progresso corporal

Objetivo: acompanhar tendencia sem julgamento.

Abas:

- Medidas.
- Fotos.
- Historico.

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

- Mostrar tendencia, nao julgamento.
- Evitar frases sobre "corpo ideal".

## 11. Conquistas

Objetivo: dar recompensa visual por consistencia.

Categorias:

- Primeiros passos.
- Agua.
- Treino.
- Alimentacao.
- Streak.
- Retomada.
- Progresso.

Card de badge:

- Icone.
- Nome.
- Descricao curta.
- Data de desbloqueio.
- Raridade.

Estados:

- Bloqueado.
- Desbloqueado.
- Recem conquistado.

## 12. Perfil

Objetivo: centralizar identidade, nivel e preferencias.

Conteudo:

- Avatar.
- Nome.
- Nivel.
- XP total.
- Streak atual.
- Conquistas principais.
- Objetivo atual.
- Atalho para configuracoes.

## 13. Configuracoes

Secoes:

- Conta.
- Privacidade.
- Notificacoes.
- Seguranca.
- Dados.
- Aparencia futura.

Acoes criticas:

- Exportar dados.
- Excluir conta.
- Encerrar sessoes.

Regras:

- Confirmacao explicita para acoes destrutivas.
- Linguagem clara.
- Sem esconder opt-out.

## 14. Notificacoes

Objetivo: central interno de lembretes e eventos.

Tipos:

- Missao pendente.
- Treino do dia.
- Agua incompleta.
- Alimentacao incompleta.
- Streak em risco.
- Conquista desbloqueada.
- Resumo diario.
- Resumo semanal.

Card de notificacao:

- Icone.
- Titulo.
- Texto curto.
- Tempo relativo.
- Estado lida/nao lida.
- CTA contextual.

Privacidade:

- Nao mostrar peso, medidas ou fotos no preview.

## Componentes principais

### XPBar

Props sugeridas:

- `currentXp`
- `levelXp`
- `level`
- `label`

Comportamento:

- Animar progresso ao ganhar XP.
- Mostrar proximo nivel.

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

- Explicar o proximo passo.
- CTA unico.

Erro:

- Mensagem curta.
- Acao de retry.
- Nao expor detalhes tecnicos.

Sucesso:

- Toast curto.
- Feedback visual no proprio componente.

## Recomendacao de implementacao visual

- Usar Tailwind com tokens definidos em `tailwind.config.ts`.
- Criar componentes de UI atomicos primeiro.
- Montar dashboard com dados mockados.
- Validar responsividade em 375px, 768px, 1024px e 1440px.
- Testar contraste no tema escuro.
- Usar `prefers-reduced-motion` para animacoes.
- Usar Lucide Icons em todos os botoes de icone.
- Usar Framer Motion apenas em momentos de recompensa e transicao.
