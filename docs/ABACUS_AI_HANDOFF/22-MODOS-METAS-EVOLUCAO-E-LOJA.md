# Modos, metas, evolução e loja protegida

Atualizado em 15/08/2026. Este relatório registra o bloco retomado após a troca de conta do Codex.

## Pedidos do proprietário

- administrador alterna entre Modo Administrador e Modo Aluno; treinador alterna entre Modo Treinador e Modo Atleta, inclusive no celular;
- durante desenvolvimento/testes, o administrador recebe todas as funções técnicas do treinador;
- corrigir a indisponibilidade da página de missões e conquistas;
- objetivo/meta pessoal não pode aparecer para equipe, administrador ou treinador;
- criar visão de evolução do atleta;
- remover da loja orientações internas e fornecedores, manter estes últimos em PDF protegido;
- cada card deve enquadrar somente seu produto e a escolha de cor deve alterar o visual;
- nenhum uso do logotipo oficial pode cortar a arte no desktop ou celular.

## Implementação

- `RoleModeSwitcher` fornece controles segmentados contextuais nos layouts de atleta e gestão.
- A função de compatibilidade `app_private.is_coach()` reconhece `admin` e `coach` ativos. Assim, as políticas/RPCs técnicas existentes continuam centralizadas e passam a autorizar o administrador sem conceder poder a membros comuns.
- `personal_goals` guarda uma meta por atleta. SELECT/INSERT/UPDATE/DELETE exigem `auth.uid() = user_id` e associação ativa. Nem administrador nem treinador podem consultar a meta alheia.
- A migração preservou os valores antigos de `profiles.objetivo`, depois esvaziou o campo e revogou sua leitura/edição pelo papel autenticado.
- Missões, resultados e atividades são carregados separadamente; uma fonte opcional indisponível gera aviso parcial em vez da tela de erro global.
- `/dashboard/evolucao` resume atividades, distância total, maior distância, melhor ritmo, volume dos últimos seis meses e evolução de peso/gordura/massa muscular.
- A loja não expõe regras internas, custos ou fornecedores. O PDF é gerado sob demanda apenas após autenticação e checagem de papel em `/api/admin/shop/suppliers`.

## OCR Tanita: custo e funcionamento

O OCR atual usa `pdfjs-dist` e `tesseract.js` no navegador. Não existe chamada paga por leitura a OpenAI, Google Vision ou outro serviço de IA. Portanto, o custo variável por foto/PDF é zero; o custo prático é processamento, memória e bateria do dispositivo do gestor. O OCR apenas preenche uma prévia: conferência humana continua obrigatória antes de salvar.

## Validação

- Supabase remoto: migration aplicada; 4/4 asserções de privacidade de metas e 16/16 de avaliações/papéis técnicos passaram.
- Qualidade local: lint e TypeScript aprovados; 13 arquivos com 70 testes unitários aprovados; build Next.js com 40 rotas concluído.
- Navegador: 28/28 cenários Playwright aprovados em Desktop Chrome e Pixel 7, incluindo acessibilidade séria/crítica, PWA, contato, rotas públicas e guardas anônimas.
- QA autenticado: modos, evolução, conquistas, loja, cores e PDF inspecionados em desktop/mobile sem overflow ou imagens quebradas.

## Onde os dados ficam

- **Supabase:** Auth, tabelas PostgreSQL, metas privadas, atividades, treinos, conquistas, avaliações e arquivos privados. Avatares ficam no bucket `avatars`, fotos do feed em `post-images` e originais de avaliação em `assessment-files`, sempre por path e URL assinada quando necessário.
- **Vercel:** hospeda e executa o Next.js, gera deployments e entrega assets públicos. Não é o repositório permanente das fotos privadas enviadas pelos usuários.
- **Hostinger:** mantém o domínio/DNS e a caixa de e-mail profissional. Não hospeda o banco nem as mídias do aplicativo atual.
- **Resend:** envia e-mails transacionais; não é banco de perfis, avaliações ou fotos.

O crescimento de fotos e originais Tanita consome armazenamento/egress do Supabase. Antes de escala real, acompanhar o painel de uso, definir retenção dos originais e escolher Supabase Pro ou backup externo criptografado.

## Estado e próximos passos

Migration remota aplicada: `20260815043638_admin_training_private_goals`. O PDF de fornecedores foi gerado em duas páginas e inspecionado localmente. No momento desta escrita, os gates finais, PR, merge e deploy ainda estão em execução; os identificadores serão acrescentados após a publicação.

Refinamento visual amplo com Abacus/Fable 5 continua uma fase posterior. Esse refinamento pode elevar composição, mockups e acabamento, mas deve preservar RLS, papéis, privacidade de metas/avaliações, acesso protegido aos fornecedores e integridade do logotipo oficial.
