# Contexto completo para uma IA sem histórico

## Instrução de uso

Este documento foi escrito para uma instância isolada do Fable 5, executada dentro da plataforma Abacus AI, que não conhece nenhuma conversa anterior. Leia este arquivo antes de propor ou alterar qualquer tela. Em seguida leia `00`, `02`, `03`, `05`, `07` e `16` desta pasta.

## O que é a Born to Run

Born to Run — Treinamento e Saúde é uma equipe fechada de corrida de rua e caminhada de Descalvado/SP, fundada em 2015 e liderada pelo Prof. Robson Alves, Educador Físico, CREF 119911-G/SP e treinador nível 1 World Athletics. O produto não é um aplicativo público genérico de corrida. Ele atende atletas autorizados da equipe e combina:

- site institucional público para apresentar história, treinador, equipe, galeria e contato;
- comunidade privada com feed social de fotos e treinos, curtidas e comentários;
- comunicação entre equipe e alunos;
- prescrição de treinos privados pelo treinador para atletas ou grupos específicos;
- avaliações de bioimpedância privadas entre atleta e equipe técnica;
- missões, níveis de jornada, resultados e conquistas reais;
- operação administrativa de cadastros e conteúdo.

Garmin Connect, Strava e Sports Tracker foram citados como referências de experiência social, acompanhamento e motivação. Eles não são integrações obrigatórias desta fase. Uma importação oficial poderá ser estudada depois.

## Pessoas e papéis

- Samuel: proprietário do produto. No modo Administrador, aprova cadastros, gerencia papéis/conteúdo e possui ferramentas técnicas equivalentes às do treinador apenas para testar e auditar o sistema. No modo Aluno, deve ver exatamente a experiência de qualquer aluno, sem menus administrativos misturados.
- Robson Alves: treinador único. No modo Treinador, aprova cadastros, cria grupos, prescreve/remove treinos e registra avaliações. No modo Atleta, deve ver exatamente a experiência de qualquer atleta. Na operação real, é Robson quem prescreve; o poder técnico de Samuel serve para QA.
- Atleta/membro: entra apenas após confirmação de e-mail e aprovação. Publica no feed privado, recebe seus treinos, vê suas avaliações, registra provas e conquistas próprias.
- Visitante: vê somente o site institucional, contato e galeria pública. A loja não é pública.

Estados de acesso: `pending`, `active`, `suspended`, `rejected`. Papel e status são protegidos no banco, não apenas escondidos na interface.

## Privacidade e separações obrigatórias

1. Treinos são privados. Não existe treino aberto para toda a internet nem feed público de prescrição. O treinador escolhe grupos e/ou atletas.
2. Fotos pessoais de atletas pertencem ao feed privado e ao perfil. Elas não entram automaticamente no material de propaganda.
3. A galeria institucional pública só pode ser administrada por Samuel e Robson. Título, legenda e descrição acessível são opcionais; quando a descrição fica vazia, o servidor grava texto alternativo genérico não exibido. A confirmação de autorização de imagem continua obrigatória.
4. Avaliações de bioimpedância e arquivo Tanita original são dados sensíveis. Somente o atleta avaliado, treinador e administrador têm acesso.
5. Conquista significa premiação real em prova. Missão significa desafio do aplicativo. Nunca misturar os dois conceitos.
6. Premiação geral e premiação por categoria são registros diferentes e devem aparecer identificados.

## Estado técnico

Aplicação Next.js 16.3, React, TypeScript, Tailwind e Supabase, hospedada na Vercel. O domínio oficial é `equipeborntorun.com`. Auth, SMTP Resend, e-mail profissional, RLS, Storage e CI/CD já existem. O repositório oficial é `samukkaneto/born-to-run`.

A versão atual é uma PWA instalável pelo navegador. Ela pode aparecer como aplicativo no Android, funcionar em tela própria e ter ícone, mas não é um APK nativo. O aplicativo Android profissional será outra fase, após o piloto e a estabilização das regras de negócio. Não fingir que um APK já existe.

## Funcionalidades implementadas

- site institucional responsivo;
- cadastro, login, recuperação de senha, confirmação de e-mail e aprovação;
- modos Administrador/Aluno e Treinador/Atleta separados, sem menus cruzados;
- feed privado com fotos, métricas, curtidas, comentários e paginação;
- grupos e treinos privados;
- comunicados;
- perfil e fotos privadas;
- avaliação Tanita privada em três imagens, 25 campos, faixa traduzida, gráficos, segmentos e histórico em português;
- OCR posicional calibrado no Healthy Edge Lite, com revisão humana e original privado;
- galeria institucional gerenciável por administrador/treinador;
- 12 missões iniciais de distância e ritmo;
- nível de jornada por XP de missões e tempo de equipe;
- resultados de provas e conquistas gerais/por categoria, com destaques principais;
- catálogo profissional reservado a administrador e treinador, com mockups da marca e sem checkout;
- PWA, offline público seguro, ícone real da marca e headers de segurança;
- contato transacional via Resend.

## Lógica de motivação

O nível de jornada é inclusivo. Ele não pode depender apenas de velocidade, pois pessoas mais velhas, iniciantes e caminhantes também precisam progredir. Missões, constância e tempo de equipe geram XP. Nenhum nível pode se chamar “sedentário”.

Desempenho esportivo excepcional é uma dimensão separada. Um atleta de 5 km em 17 minutos é muito bom, mas não deve receber automaticamente o maior símbolo possível. Os últimos patamares precisam continuar aspiracionais e respeitar a distância entre atleta regional forte e elite nacional/internacional. Marcas de elite devem futuramente exigir validação de resultado oficial.

Uma atividade de 42,195 km cumpre automaticamente as missões inferiores de 1, 3, 5, 10, 15, 21,1 e 30 km. Missões de ritmo exigem simultaneamente distância e pace.

## Avaliações Tanita — estado atual e direção

O equipamento Tanita gera PDF ou imagem visualmente fraca, com termos em inglês. O sistema deve:

1. receber PDF/JPEG/PNG em alta resolução somente pela equipe técnica;
2. armazenar o original de forma privada;
3. extrair campos por OCR/parser com revisão humana obrigatória;
4. apresentar tudo em português;
5. criar relatório premium com gráficos consistentes e foto de perfil do atleta;
6. comparar avaliações ao longo do tempo sem emitir diagnóstico médico automático;
7. permitir impressão/PDF bonito.

O fluxo atual já exige as três imagens reais na ordem Resumo/Faixas/Segmentos. O parser foi calibrado pelas posições fixas do Healthy Edge Lite: a amostra privada recuperou os 14 indicadores gerais preenchidos e 10/10 segmentos; frequência cardíaca vazia permaneceu vazia. Continuar exigindo conferência humana e nunca emitir diagnóstico automático. Ler `24-MODOS-SEPARADOS-MOBILE-E-OCR-TANITA-CALIBRADO.md` antes de alterar o OCR ou o modal.

## Loja

A rota `/loja` funciona somente como portão de acesso: visitante vai para login, atleta ativo volta ao dashboard e apenas administrador/treinador chegam a `/admin/loja`. O catálogo inclui roupas, shorts, top, moletom, garrafa, boné, viseira, mochila, toalha, caneca e copo. Os preços sugeridos são calculados como custo brasileiro pesquisado × 2, conforme decisão do proprietário. Para vender de verdade ainda serão necessários fornecedor contratado, variantes, estoque, checkout, pagamento, frete, trocas, pedidos, nota fiscal e termos comerciais. A interface nunca deve exibir recados de desenvolvimento ao usuário.

## Mandato visual para Fable 5

O proprietário dá carta branca para reformular toda estética. Ele deseja preto/carbono dominante, branco/off-white, logotipo valorizado, composição esportiva editorial, ícones premium, motion controlado e aparência de aplicativo nativo profissional. Não entregar uma troca cosmética superficial. Reavaliar home, navegação, feed, perfil, avaliações, missões, conquistas, painel técnico, galeria e loja como um sistema visual coerente.

Liberdade visual não permite mudar fatos, inventar atletas/premiações, remover acessibilidade ou enfraquecer segurança e privacidade.

## Próximas fases, em ordem racional

1. validar no Android real a avaliação Tanita calibrada descrita no documento `24`;
2. piloto com as contas de administrador e treinador já ativas e novos atletas reais;
3. validar o OCR em novas amostras do mesmo padrão e acrescentar importador CSV somente se o software Tanita realmente exportar um arquivo utilizável;
4. redesign completo pelo Fable 5 preservando contratos e o significado das cores de treino;
5. transformar gestão de textos/fotos institucionais em CMS mais amplo para dar autonomia ao proprietário;
6. aplicativo Android nativo e distribuição;
7. loja transacional;
8. avaliar APIs oficiais Garmin/Strava com consentimento e conformidade.

## Atualização indispensável de 11/08/2026

Robson já é `coach/active`; não orientar novo cadastro técnico. Administrador e treinador também possuem perfil de atleta, avatar e podem receber avaliação. Os treinos usam: azul-claro descanso, amarelo contínuo, roxo intervalado rápido, verde leve/moderado, mostarda potência aeróbia e vermelho competição. O diferencial institucional é o atendimento presencial e individual, não “planilhas”. Ler `20-PERFIS-TANITA-CORES-DE-TREINO-E-LOJA.md` antes de modificar essas áreas.

## Atualização indispensável de 15/08/2026

Não confundir poder técnico com identidade esportiva. Samuel e Robson não usam menus híbridos: `/admin/*` é gestão, `/dashboard/*` é aluno/atleta e o seletor de modo é a única ponte. O modal Tanita móvel usa `100dvh` e rolagem interna. O OCR é calibrado para as três telas 16:9 do Healthy Edge Lite; qualquer redesign do Fable 5 deve preservar os campos, a ordem Foto 1/2/3, a revisão humana e a privacidade.
