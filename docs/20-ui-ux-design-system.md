# LevelFit - UI/UX e Design System Inicial

## Conceito visual

LevelFit deve parecer um cockpit diario de evolucao fitness: escuro, premium, energetico, visualmente recompensador e facil de escanear.

A primeira tela apos login e o dashboard real do app, nao uma landing page. O usuario deve ver de imediato:

- Nivel atual.
- XP do dia.
- Streak.
- Missoes pendentes.
- Treino do dia.
- Agua.
- Alimentacao.
- Conquistas recentes.

## Moodboard textual

- Grafite profundo.
- Verde-limao controlado.
- Luz de neon dosada.
- Cards compactos.
- Dados vivos.
- Icones claros.
- Badges colecionaveis.
- Barras de progresso brilhantes.
- Mascote adulto, esportivo e discreto.
- Movimento leve, sem excesso.

Referencias de sensacao:

- Duolingo: loops de recompensa e missoes.
- Strava: energia esportiva.
- Fitbit: dados e saude cotidiana.
- Nike Training Club: visual fitness premium.
- Apps de streak: urgencia leve e progresso continuo.

## Direcao de arte

Tema principal: dark premium com acentos vivos.

Evitar:

- Visual medico.
- Interfaces frias e hospitalares.
- Estetica infantil.
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
- Agua: #22D3EE
- Alimentacao: #38D979
- Conquistas: #FACC15
- Alerta: #FB923C
- Erro: #F43F5E
- Sucesso: #22C55E

Modo claro futuro:

- Fundo: #F7F8F4
- Surface: #FFFFFF
- Texto: #111827

## Tipografia recomendada

Primaria:

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
- Nao escalar fonte com viewport.
- Evitar texto longo dentro de botoes pequenos.

## Sistema de espacamento

Escala baseada em 4px:

- 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

Recomendacao:

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
- Cards com altura estavel.

Desktop:

- Sidebar fixa de 248px.
- Topbar compacta.
- Conteudo com grid 12 colunas.
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
- Focus ring visivel.

Secundario:

- Fundo #151D26.
- Borda #26313C.
- Texto #F4F7FA.

Destrutivo:

- Fundo transparente ou #2A1218.
- Texto #FB7185.
- Confirmacao para acoes criticas.

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
- Progresso visivel.

Nao usar cards dentro de cards.

## Icones

Biblioteca: Lucide Icons.

Estilo:

- Stroke 2px.
- Tamanho 18px a 22px.
- Categoria por cor.
- Icone + label apenas quando necessario.

Icones sugeridos:

- Home, Dumbbell, Droplets, Apple, Trophy, User, Bell, Shield, Settings, Flame, Zap, CheckCircle, AlertTriangle.

## Badges

Tipos:

- Conquista.
- Nivel.
- Streak.
- Missao especial.
- Retomada.

Visual:

- Base escura.
- Borda colorida.
- Icone central.
- Brilho sutil para conquistas raras.
- Texto curto.

## Barras de progresso

XP:

- Barra horizontal com preenchimento verde-limao.
- Marcador de nivel.
- Animacao de preenchimento curta.

Agua:

- Azul ciano.
- Pode usar contador em copos ou ml.

Treino:

- Coral/laranja.

Alimentacao:

- Verde natural.

## Graficos

Usar Recharts ou Tremor/Recharts.

Graficos:

- Linha para medidas corporais.
- Barras para treino semanal.
- Anel para completude diaria.
- Heatmap simples para consistencia.

Privacidade:

- Nao exibir fotos ou medidas em areas de notificacao.
- Medidas devem ficar em telas protegidas.

## Avatar ou mascote

Direcao recomendada:

- Mascote abstrato e esportivo, nao infantil.
- Pode ser um "core" energetico, um pequeno personagem futurista ou avatar do usuario com equipamento evolutivo.
- Evolui por nivel, consistencia e conquistas.
- Nao deve zombar do usuario.

Estados:

- Pronto para o dia.
- Celebrando missao.
- Em modo retomada.
- Descansando.
- Nivel acima.

## Microinteracoes

- XP sobe com contagem animada.
- Streak pulsa quando salvo.
- Missao concluida vira check com pequeno brilho.
- Agua adicionada gera preenchimento liquido.
- Badge desbloqueado aparece em modal curto.
- Erros usam shake leve apenas em campos.

## Animacoes recomendadas

Usar Framer Motion:

- `opacity + y` para entrada de cards.
- `scale 0.98 -> 1` em conclusao.
- `layout` para reordenacao de missoes.
- Duracao entre 150ms e 350ms.
- Respeitar `prefers-reduced-motion`.

## Estados visuais

Sucesso:

- Verde #22C55E.
- Mensagem curta.
- Check icon.

Alerta:

- Laranja #FB923C.
- Acao recomendada.

Erro:

- Vermelho #F43F5E.
- Linguagem clara.
- Sem culpa.

Missao concluida:

- Card reduz opacidade levemente.
- Check persistente.
- XP exibido.

Missao perdida:

- Texto acolhedor.
- Opcao de retomada.
- Sem vermelho agressivo.

Streak salvo:

- Chama/energia com verde-limao e dourado.
- Feedback: "Streak salvo. Hoje contou."

## Telas principais

Onboarding:

- 3 a 5 passos.
- Explica filosofia, objetivo, nivel e preferencias.
- Consentimento para dados sensiveis.

Cadastro/Login:

- Simples, seguro, com validacao clara.
- Mostrar beneficios da conta sem parecer campanha.

Dashboard diario:

- Primeira tela apos login.
- XP bar, streak, missoes, treino, agua, alimentacao.

Missoes:

- Lista com prioridade, XP e status.
- Filtros por tipo.

Treino:

- Card do treino do dia.
- Lista de exercicios.
- Marcar series, repeticoes, carga, duracao.

Alimentacao:

- Checklist simples no MVP.
- Metas futuras de macros/calorias com cuidado.

Hidratacao:

- Copos ou ml.
- Meta diaria.
- Historico simples.

Progresso corporal:

- Medidas.
- Fotos protegidas.
- Tendencias, nao julgamento.

Conquistas:

- Galeria de badges.
- Conquistas bloqueadas com dica saudavel.

Perfil:

- Dados basicos.
- Nivel, badges, preferencias.

Configuracoes:

- Conta.
- Privacidade.
- Notificacoes.
- Exportar/excluir dados.

Notificacoes:

- Centro interno.
- Filtros por nao lidas, conquistas, lembretes.

## Acessibilidade visual

- Contraste AA no minimo.
- Foco visivel em todos os controles.
- Componentes navegaveis por teclado.
- `aria-label` em botoes de icone.
- Nao depender apenas de cor.
- Estados de erro com texto.
- Suporte a reducao de movimento.
- Tamanhos de toque de no minimo 44x44 no mobile.

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

## Recomendacoes para Next.js e Tailwind

- App Router.
- Server Components para layouts e dados iniciais.
- Client Components para interacao, animacao e forms.
- shadcn/ui para Dialog, Tabs, Switch, Toast, Dropdown, Form.
- Zod para validacao.
- React Hook Form para formularios.
- TanStack Query para API real no futuro.
- Zustand apenas se o estado global crescer.
- Recharts para graficos.
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
