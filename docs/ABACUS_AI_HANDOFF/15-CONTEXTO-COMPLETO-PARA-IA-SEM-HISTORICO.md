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

- Samuel: proprietário do produto e administrador. Aprova cadastros junto com Robson, gerencia papéis, conteúdo institucional, comunicados e pode revisar avaliações.
- Robson Alves: treinador único. E-mail pré-autorizado no Supabase, informado ao proprietário fora de segredos. Aprova cadastros, cria grupos, prescreve e remove treinos e registra avaliações. Somente o treinador publica treinos.
- Atleta/membro: entra apenas após confirmação de e-mail e aprovação. Publica no feed privado, recebe seus treinos, vê suas avaliações, registra provas e conquistas próprias.
- Visitante: vê somente o site institucional, contato e galeria pública. A loja não é pública.

Estados de acesso: `pending`, `active`, `suspended`, `rejected`. Papel e status são protegidos no banco, não apenas escondidos na interface.

## Privacidade e separações obrigatórias

1. Treinos são privados. Não existe treino aberto para toda a internet nem feed público de prescrição. O treinador escolhe grupos e/ou atletas.
2. Fotos pessoais de atletas pertencem ao feed privado e ao perfil. Elas não entram automaticamente no material de propaganda.
3. A galeria institucional pública só pode ser administrada por Samuel e Robson. Título e legenda são opcionais; descrição acessível e confirmação de autorização de imagem são obrigatórias.
4. Avaliações de bioimpedância e arquivo Tanita original são dados sensíveis. Somente o atleta avaliado, treinador e administrador têm acesso.
5. Conquista significa premiação real em prova. Missão significa desafio do aplicativo. Nunca misturar os dois conceitos.
6. Premiação geral e premiação por categoria são registros diferentes e devem aparecer identificados.

## Estado técnico

Aplicação Next.js 16.3, React, TypeScript, Tailwind e Supabase, hospedada na Vercel. O domínio oficial é `equipeborntorun.com`. Auth, SMTP Resend, e-mail profissional, RLS, Storage e CI/CD já existem. O repositório oficial é `samukkaneto/born-to-run`.

A versão atual é uma PWA instalável pelo navegador. Ela pode aparecer como aplicativo no Android, funcionar em tela própria e ter ícone, mas não é um APK nativo. O aplicativo Android profissional será outra fase, após o piloto e a estabilização das regras de negócio. Não fingir que um APK já existe.

## Funcionalidades implementadas

- site institucional responsivo;
- cadastro, login, recuperação de senha, confirmação de e-mail e aprovação;
- administrador e treinador separados;
- feed privado com fotos, métricas, curtidas, comentários e paginação;
- grupos e treinos privados;
- comunicados;
- perfil e fotos privadas;
- avaliações básicas e histórico em português;
- upload privado do PDF/JPEG/PNG Tanita como fonte conferível;
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

## Avaliações Tanita — visão final desejada

O equipamento Tanita gera PDF ou imagem visualmente fraca, com termos em inglês. O sistema deve:

1. receber PDF/JPEG/PNG em alta resolução somente pela equipe técnica;
2. armazenar o original de forma privada;
3. extrair campos por OCR/parser com revisão humana obrigatória;
4. apresentar tudo em português;
5. criar relatório premium com gráficos consistentes e foto de perfil do atleta;
6. comparar avaliações ao longo do tempo sem emitir diagnóstico médico automático;
7. permitir impressão/PDF bonito.

A fundação e o formulário manual já existem. A extração automática não deve ser inventada sem um arquivo real de exemplo; é necessário calibrar o parser e testar valores contra o original.

## Loja

A rota `/loja` funciona somente como portão de acesso: visitante vai para login, atleta ativo volta ao dashboard e apenas administrador/treinador chegam a `/admin/loja`. O catálogo inclui roupas, shorts, top, moletom, garrafa, boné, viseira, mochila, toalha, caneca e copo. Os preços sugeridos são calculados como custo brasileiro pesquisado × 2, conforme decisão do proprietário. Para vender de verdade ainda serão necessários fornecedor contratado, variantes, estoque, checkout, pagamento, frete, trocas, pedidos, nota fiscal e termos comerciais. A interface nunca deve exibir recados de desenvolvimento ao usuário.

## Mandato visual para Fable 5

O proprietário dá carta branca para reformular toda estética. Ele deseja preto/carbono dominante, branco/off-white, logotipo valorizado, composição esportiva editorial, ícones premium, motion controlado e aparência de aplicativo nativo profissional. Não entregar uma troca cosmética superficial. Reavaliar home, navegação, feed, perfil, avaliações, missões, conquistas, painel técnico, galeria e loja como um sistema visual coerente.

Liberdade visual não permite mudar fatos, inventar atletas/premiações, remover acessibilidade ou enfraquecer segurança e privacidade.

## Próximas fases, em ordem racional

1. publicar e validar o ciclo descrito no documento `20`;
2. piloto com as contas de administrador e treinador já ativas e novos atletas reais;
3. validar uma avaliação Tanita real; só depois projetar extração assistida com revisão humana;
4. redesign completo pelo Fable 5 preservando contratos e o significado das cores de treino;
5. transformar gestão de textos/fotos institucionais em CMS mais amplo para dar autonomia ao proprietário;
6. aplicativo Android nativo e distribuição;
7. loja transacional;
8. avaliar APIs oficiais Garmin/Strava com consentimento e conformidade.

## Atualização indispensável de 11/08/2026

Robson já é `coach/active`; não orientar novo cadastro técnico. Administrador e treinador também possuem perfil de atleta, avatar e podem receber avaliação. Os treinos usam: azul-claro descanso, amarelo contínuo, roxo intervalado rápido, verde leve/moderado, mostarda potência aeróbia e vermelho competição. O diferencial institucional é o atendimento presencial e individual, não “planilhas”. Ler `20-PERFIS-TANITA-CORES-DE-TREINO-E-LOJA.md` antes de modificar essas áreas.
