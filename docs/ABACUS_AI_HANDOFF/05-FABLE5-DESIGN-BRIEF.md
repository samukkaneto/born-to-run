# Fable 5 — direção visual e limites técnicos

## Relação Abacus AI × Fable 5

Abacus AI é a plataforma onde o proprietário executará o trabalho. Fable 5 é o modelo escolhido dentro da plataforma, possivelmente em um supercomputador isolado e sem histórico. Por isso, esse modelo deve receber também o arquivo `15-CONTEXTO-COMPLETO-PARA-IA-SEM-HISTORICO.md`.

## Liberdade visual — carta branca real

A Fable 5 pode e deve redesenhar grid, tipografia, densidade, navegação, componentes, ícones, motion e responsividade. O proprietário considera a especialidade visual do modelo superior e exige uma evolução perceptível, forte e premium. As seis pranchas em `design-refs/` são referência de qualidade, não especificação pixel a pixel.

Direção desejada:

- editorial esportivo premium;
- fotografia autêntica da equipe;
- mobile-first;
- preto/carbono dominante, branco/off-white e cores do logotipo como identidade reconhecível;
- controles acessíveis e foco visível;
- sem visual genérico de SaaS, neon ou glassmorphism excessivo.
- aparência de aplicativo esportivo profissional, comparável em maturidade a produtos nativos conhecidos, sem copiar telas.
- logotipo valorizado e grande quando a composição comportar; não reduzi-lo a elemento decorativo tímido.
- ícones de níveis, missões e conquistas com personalidade própria, leitura em tamanho pequeno e evolução visual entre níveis.

## Contratos que o design não pode remover

- cadastro pendente e aprovação;
- estados ativo, suspenso e rejeitado;
- feed com fotos, métricas, curtidas e comentários;
- audiência de treinos para equipe, grupos e atletas;
- grupos e comunicados;
- painel do treinador;
- loading, vazio, erro e sucesso;
- Storage privado e URLs assinadas;
- controles administrativos por Server Actions/RPCs.
- separação entre galeria institucional pública e fotos pessoais do feed;
- avaliações Tanita e arquivos-fonte privados;
- semântica distinta entre missão, nível de jornada, resultado e conquista real;
- catálogo da loja reservado ao administrador e treinador, com apresentação profissional e sem recados internos na interface; checkout permanece fase futura.

## Liberdade que não é autorização para quebrar o produto

O redesign pode substituir integralmente a aparência, mas deve preservar formulários, nomes de campos, estados, rotas ou adaptar o código com testes equivalentes. Não tornar treino privado público, não abrir dados de saúde, não permitir que atletas publiquem na galeria institucional e não chamar a PWA atual de APK nativo.

## Referências visuais

1. `design-refs/01-brand-home-design-system.png`
2. `design-refs/02-authentication-flow.png`
3. `design-refs/03-athlete-dashboard-feed-navigation.png`
4. `design-refs/04-workouts-announcements-profile.png`
5. `design-refs/05-public-pages-responsive-menu.png`
6. `design-refs/06-admin-coach-panel.png`

Se a Abacus receber apenas documentos e não o repositório, enviar também essas seis imagens.

O briefing completo permanece em `README-FABLE5.md`.
