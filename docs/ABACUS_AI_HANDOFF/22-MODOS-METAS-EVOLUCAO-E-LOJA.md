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
- Publicação: PR `#28` mesclada em `7c5561b28051f6aad873f2ba56e77649ae052165`; CI da `main` `31871069506` aprovado; produção Vercel `dpl_FqV47iK47bRQ1vLkk3AofS2A3vbA` em estado `READY`.

## Onde os dados ficam

- **Supabase:** Auth, tabelas PostgreSQL, metas privadas, atividades, treinos, conquistas, avaliações e arquivos privados. Avatares ficam no bucket `avatars`, fotos do feed em `post-images` e originais de avaliação em `assessment-files`, sempre por path e URL assinada quando necessário.
- **Vercel:** hospeda e executa o Next.js, gera deployments e entrega assets públicos. Não é o repositório permanente das fotos privadas enviadas pelos usuários.
- **Hostinger:** mantém o domínio/DNS e a caixa de e-mail profissional. Não hospeda o banco nem as mídias do aplicativo atual.
- **Resend:** envia e-mails transacionais; não é banco de perfis, avaliações ou fotos.

O crescimento de fotos e originais Tanita consome armazenamento/egress do Supabase. Antes de escala real, acompanhar o painel de uso, definir retenção dos originais e escolher Supabase Pro ou backup externo criptografado.

## Conexões operacionais verificadas

- GitHub CLI autenticada e com leitura/escrita em `samukkaneto/born-to-run`.
- Vercel CLI autenticada no projeto `born-to-run`; aliases `equipeborntorun.com` e `www.equipeborntorun.com` ativos.
- Supabase conectado ao projeto `nmcaejrmmfffzeclmuob`; migration, testes e advisors executados remotamente.
- Hostinger MCP disponível para o domínio/DNS; Resend configurada no ambiente local e na Vercel sem versionar a chave.
- O Firewall do Windows já contém duas regras de entrada `Codex`, habilitadas para TCP/UDP e perfis Privado/Público; nenhuma regra duplicada foi criada.

## Estado e próximos passos

Migration remota aplicada: `20260815043638_admin_training_private_goals`. O PDF de fornecedores foi gerado em duas páginas e inspecionado localmente. A entrega está publicada no domínio oficial; health respondeu `200` na revisão `7c5561b`, as áreas privadas redirecionaram visitantes ao login e o PDF protegido respondeu `401` sem sessão.

Refinamento visual amplo com Abacus/Fable 5 continua uma fase posterior. Esse refinamento pode elevar composição, mockups e acabamento, mas deve preservar RLS, papéis, privacidade de metas/avaliações, acesso protegido aos fornecedores e integridade do logotipo oficial.
