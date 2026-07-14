# LevelFit - UI/UX e Design System Inicial

## Conceito visual

LevelFit deve parecer um cockpit diário de evolução fitness: escuro, premium, energético, visualmente recompensador e fácil de escanear.

A primeira tela após login e o dashboard real do app, não uma landing page. O usuário deve ver de imediato:

- Nível atual.
- XP do dia.
- Streak.
- Missões pendentes.
- Treino do dia.
- Água.
- Alimentação.
- Conquistas recentes.

## Moodboard textual

- Grafite profundo.
- Verde-limão controlado.
- Luz de neon dosada.
- Cards compactos.
- Dados vivos.
- Ícones claros.
- Badges colecionaveis.
- Barras de progresso brilhantes.
- Mascote adulto, esportivo e discreto.
- Movimento leve, sem excesso.

Referencias de sensação:

- Duolingo: loops de recompensa e missões.
- Strava: energia esportiva.
- Fitbit: dados e saúde cotidiana.
- Nike Training Club: visual fitness premium.
- Apps de streak: urgencia leve e progresso continuo.

## Direção de arte

Tema principal: dark premium com acentos vivos.

Evitar:

- Visual médico.
- Interfaces frias e hospitalares.
- Estética infantil.
- Landing page promocional.
- Excesso de gradientes.
- Elementos decorativos sem funcao.

## Paleta de cores

Base:

- `--background`: #080B0F
- `--surface`: #10161D
- `--surface-elevated`: #151D26
- `--border`: #26313C
- `--text-primary`: #F4F7FA
- `--text-secondary`: #AAB6C2
- `--text-muted`: #6F7C89

Marca:

- `--primary`: #B7FF2A
- `--primary-strong`: #8EEA00
- `--primary-soft`: #D9FF8A
- `--petrol`: #0F2E35

Categorias:

- Treino: #FF6B3D
- Água: #22D3EE
- Alimentação: #38D979
- Conquistas: #FACC15
- Alerta: #FB923C
- Erro: #F43F5E
- Sucesso: #22C55E

Modo claro futuro:

- Fundo: #F7F8F4
- Surface: #FFFFFF
- Texto: #111827

## Tipografia recomendada

Primária:

- Inter.

Alternativas:

- Geist Sans.
- Manrope.

Uso:

- H1 mobile: 28/34, peso 800.
- H1 desktop: 36/44, peso 800.
- H2: 24/32, peso 750.
- Card title: 16/22, peso 700.
- Body: 14/20 ou 16/24.
- Caption: 12/16.

Regras:

- Letter spacing 0.
- Não escalar fonte com viewport.
- Evitar texto longo dentro de botoes pequenos.

## Sistema de espacamento

Escala baseada em 4px:

- 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

Recomendação:

- Padding de tela mobile: 16px.
- Padding de tela desktop: 24px a 32px.
- Gap entre cards: 12px a 16px.
- Raio de cards: 8px.
- Raio de botoes: 8px.

## Grid e layout

Mobile:

- 1 coluna.
- Bottom navigation fixa.
- Dashboard vertical por prioridade.
- Cards com altura estável.

Desktop:

- Sidebar fixa de 248px.
- Topbar compacta.
- Conteúdo com grid 12 colunas.
- Dashboard com coluna principal e lateral de progresso.

Breakpoints Tailwind:

- `sm`: 640px.
- `md`: 768px.
- `lg`: 1024px.
- `xl`: 1280px.
- `2xl`: 1536px.

## Botoes

Primario:

- Fundo #B7FF2A.
- Texto #08100A.
- Peso 800.
- Altura 44px mobile, 40px desktop compacto.
- Hover #D9FF8A.
- Focus ring visível.

Secundário:

- Fundo #151D26.
- Borda #26313C.
- Texto #F4F7FA.

Destrutivo:

- Fundo transparente ou #2A1218.
- Texto #FB7185.
- Confirmação para ações críticas.

Icon buttons:

- Usar Lucide Icons.
- Tamanho 40x40.
- Tooltip no desktop.
- `aria-label` sempre.

## Cards

Cards devem ser polidos, densos e funcionais:

- Fundo #10161D ou #151D26.
- Borda 1px #26313C.
- Border radius 8px.
- Sombra sutil.
- Header curto.
- Icone de categoria.
- Progresso visível.

Não usar cards dentro de cards.

## Ícones

Biblioteca: Lucide Icons.

Estilo:

- Stroke 2px.
- Tamanho 18px a 22px.
- Categoria por cor.
- Icone + label apenas quando necessário.

Ícones sugeridos:

- Home, Dumbbell, Droplets, Apple, Trophy, User, Bell, Shield, Settings, Flame, Zap, CheckCircle, AlertTriangle.

## Badges

Tipos:

- Conquista.
- Nível.
- Streak.
- Missão especial.
- Retomada.

Visual:

- Base escura.
- Borda colorida.
- Icone central.
- Brilho sutil para conquistas raras.
- Texto curto.

## Barras de progresso

XP:

- Barra horizontal com preenchimento verde-limão.
- Marcador de nível.
- Animacao de preenchimento curta.

Água:

- Azul ciano.
- Pode usar contador em copos ou ml.

Treino:

- Coral/laranja.

Alimentação:

- Verde natural.

## Gráficos

Usar Recharts ou Tremor/Recharts.

Gráficos:

- Linha para medidas corporais.
- Barras para treino semanal.
- Anel para completude diária.
- Heatmap simples para consistência.

Privacidade:

- Não exibir fotos ou medidas em areas de notificação.
- Medidas devem ficar em telas protegidas.

## Avatar ou mascote

Direção recomendada:

- Mascote abstrato e esportivo, não infantil.
- Pode ser um "core" energético, um pequeno personagem futurista ou avatar do usuário com equipamento evolutivo.
- Evolui por nível, consistência e conquistas.
- Não deve zombar do usuário.

Estados:

- Pronto para o dia.
- Celebrando missão.
- Em modo retomada.
- Descansando.
- Nível acima.

## Microinterações

- XP sobe com contagem animada.
- Streak pulsa quando salvo.
- Missão concluída vira check com pequeno brilho.
- Água adicionada gera preenchimento liquido.
- Badge desbloqueado aparece em modal curto.
- Erros usam shake leve apenas em campos.

## Animações recomendadas

Usar Framer Motion:

- `opacity + y` para entrada de cards.
- `scale 0.98 -> 1` em conclusao.
- `layout` para reordenacao de missões.
- Duracao entre 150ms e 350ms.
- Respeitar `prefers-reduced-motion`.

## Estados visuais

Sucesso:

- Verde #22C55E.
- Mensagem curta.
- Check icon.

Alerta:

- Laranja #FB923C.
- Ação recomendada.

Erro:

- Vermelho #F43F5E.
- Linguagem clara.
- Sem culpa.

Missão concluída:

- Card reduz opacidade levemente.
- Check persistente.
- XP exibido.

Missão perdida:

- Texto acolhedor.
- Opção de retomada.
- Sem vermelho agressivo.

Streak salvo:

- Chama/energia com verde-limão e dourado.
- Feedback: "Streak salvo. Hoje contou."

## Telas principais

Onboarding:

- 3 a 5 passos.
- Explica filosofia, objetivo, nível e preferências.
- Consentimento para dados sensíveis.

Cadastro/Login:

- Simples, seguro, com validação clara.
- Mostrar benefícios da conta sem parecer campanha.

Dashboard diário:

- Primeira tela após login.
- XP bar, streak, missões, treino, água, alimentação.

Missões:

- Lista com prioridade, XP e status.
- Filtros por tipo.

Treino:

- Card do treino do dia.
- Lista de exercícios.
- Marcar series, repeticoes, carga, duracao.

Alimentação:

- Checklist simples no MVP.
- Metas futuras de macros/calorias com cuidado.

Hidratação:

- Copos ou ml.
- Meta diária.
- Histórico simples.

Progresso corporal:

- Medidas.
- Fotos protegidas.
- Tendências, não julgamento.

Conquistas:

- Galeria de badges.
- Conquistas bloqueadas com dica saudável.

Perfil:

- Dados basicos.
- Nível, badges, preferências.

Configurações:

- Conta.
- Privacidade.
- Notificações.
- Exportar/excluir dados.

Notificações:

- Centro interno.
- Filtros por não lidas, conquistas, lembretes.

## Acessibilidade visual

- Contraste AA no mínimo.
- Foco visível em todos os controles.
- Componentes navegaveis por teclado.
- `aria-label` em botoes de icone.
- Não depender apenas de cor.
- Estados de erro com texto.
- Suporte a reducao de movimento.
- Tamanhos de toque de no mínimo 44x44 no mobile.

## Design tokens Tailwind

```ts
export const levelFitTokens = {
  colors: {
    background: "#080B0F",
    surface: "#10161D",
    elevated: "#151D26",
    border: "#26313C",
    text: "#F4F7FA",
    muted: "#AAB6C2",
    primary: "#B7FF2A",
    primaryStrong: "#8EEA00",
    petrol: "#0F2E35",
    workout: "#FF6B3D",
    water: "#22D3EE",
    nutrition: "#38D979",
    achievement: "#FACC15",
    danger: "#F43F5E"
  },
  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px"
  },
  spacing: {
    screenMobile: "16px",
    screenDesktop: "32px"
  }
}
```

## Recomendações para Next.js e Tailwind

- App Router.
- Server Components para layouts e dados iniciais.
- Client Components para interacao, animacao e forms.
- shadcn/ui para Dialog, Tabs, Switch, Toast, Dropdown, Form.
- Zod para validação.
- React Hook Form para formularios.
- TanStack Query para API real no futuro.
- Zustand apenas se o estado global crescer.
- Recharts para gráficos.
- Framer Motion com `prefers-reduced-motion`.

## Estrutura frontend sugerida

```txt
src/
  app/
    (auth)/
      login/
      register/
      forgot-password/
    (app)/
      dashboard/
      missions/
      workout/
      nutrition/
      hydration/
      progress/
      achievements/
      profile/
      settings/
  components/
    layout/
    dashboard/
    gamification/
    workout/
    nutrition/
    hydration/
    progress/
    notifications/
    settings/
    ui/
  data/
    mocks/
  lib/
    api/
    auth/
    formatters/
    validations/
  styles/
```

## Rotas sugeridas

- `/login`
- `/register`
- `/onboarding`
- `/dashboard`
- `/missions`
- `/workout`
- `/workout/session/:id`
- `/nutrition`
- `/hydration`
- `/progress`
- `/achievements`
- `/profile`
- `/settings`
- `/settings/security`
- `/settings/notifications`
