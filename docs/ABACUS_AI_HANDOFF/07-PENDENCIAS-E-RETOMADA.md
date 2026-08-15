# Pendências e ponto de retomada

## Retomada mais recente — modos realmente separados e Tanita calibrada

Não misturar menus de gestão com menus esportivos. Samuel alterna entre **Administrador** e **Aluno**; Robson alterna entre **Treinador** e **Atleta**. A mesma conta autenticada mantém o papel técnico, mas `/admin/*` e `/dashboard/*` são contextos independentes e `RoleModeSwitcher` é a única passagem entre eles.

O erro de enquadramento Android da nova avaliação foi corrigido e medido em 390 × 844. O OCR agora está calibrado pelas posições fixas do Healthy Edge Lite; a amostra real recupera 14 indicadores gerais preenchidos e 10/10 segmentos. Próxima ação exata: repetir o fluxo autenticado no Android do proprietário, comparar os 24 valores com as três telas e salvar uma avaliação piloto. Loja continua fora deste bloco. Consulte `24-MODOS-SEPARADOS-MOBILE-E-OCR-TANITA-CALIBRADO.md`.

Este bloco está publicado pela PR `#32`, merge `fa7ac1b`, CI da `main` `31887206903` e deployment Vercel `dpl_CJLzvTXyAS9fffKpPuNXuWSZr3Au` `READY`. O domínio oficial confirmou home e health `200`, revisão `fa7ac1b` e proteção anônima de `/admin/avaliacoes` com `307` para login.

## Retomada mais recente — prescrição e Tanita em três fotos

O bloco funcional de 15/08/2026 está implementado no código e no Supabase. Não voltar a filtrar destinatários por `role = member`: Samuel e Robson são perfis técnicos e atletas ao mesmo tempo. O modo atleta usa `get_my_assigned_workouts()` para não mostrar prescrições alheias.

Próxima ação exata: publicar um mesociclo piloto para Samuel, um treino para Robson e uma avaliação real com Foto 1, Foto 2 e Foto 3; conferir as telas autenticadas em desktop/Android. Depois disso, abrir outro bloco exclusivo para os mockups da loja. Consulte `23-PRESCRICAO-PRIVADA-MESOCICLO-E-TANITA-3-FOTOS.md`.

## Retomada atual — 15/08/2026

O bloco solicitado pelo proprietário está implementado e validado localmente e no Supabase: modos de atuação, administrador com funções técnicas, metas privadas, tolerância a falhas em conquistas, evolução do atleta, enquadramento integral dos logos e revisão da loja com PDF protegido. Não repetir as regras antigas que impediam o administrador de acessar treinos durante desenvolvimento. Consulte `22-MODOS-METAS-EVOLUCAO-E-LOJA.md`.

O bloco foi publicado pela PR `#28`, merge `7c5561b28051f6aad873f2ba56e77649ae052165`, CI da `main` `31871069506` e deployment Vercel `dpl_FqV47iK47bRQ1vLkk3AofS2A3vbA`. O domínio oficial foi validado na mesma revisão. Próxima ação: iniciar um novo bloco de produto a partir das pendências abaixo; o refinamento amplo com Abacus/Fable 5 permanece posterior e não deve alterar os contratos de segurança já entregues.

Atualizar este arquivo após cada bloco.

## Estado do ciclo técnico — atualização 11/08/2026

O bloco OCR/importação está funcionalmente concluído: OCR Tanita assistido, PDF premium, importação da planilha real com prévia editável, publicação atômica privada, logo ampliado e pós-graduações destacadas. O Supabase remoto já contém a 17ª migration. Consulte `21-OCR-PDF-E-IMPORTACAO-DE-TREINOS.md`.

O treinador já concluiu o cadastro e aparece como `coach/active`; não repetir o antigo fluxo de convite. O bloco atual corrigiu Perfil/Avaliações, permitiu avatar e avaliação para todos os papéis ativos, adicionou as seis categorias cromáticas dos treinos, atualizou currículo/posicionamento institucional e revisou a loja/fornecedores. PR #25, CIs e produção foram concluídos. Consulte `20-PERFIS-TANITA-CORES-DE-TREINO-E-LOJA.md`.

O Bloco 10 está implementado e publicado. O bloco seguinte retirou a loja da área pública, criou catálogo profissional reservado a administrador/treinador, atualizou cores e preços pesquisados e restaurou o logotipo oficial puro no login. A PR #23 foi mesclada, o CI do merge passou e a produção foi validada no domínio oficial.

## Concluído neste ciclo

- Bloco 0: pacote canônico de relatórios criado e publicado na branch.
- Bloco 1: vazamento de metadados de perfil e integridade de referências de mídia resolvidos no código e no Supabase remoto.
- Bloco 2: callback, regras locais de senha, oito templates e runbook SMTP preparados; ativação remota bloqueada de forma explícita pelo plano Free e pela ausência de domínio/credenciais.
- Bloco 3: PWA instalável, offline público seguro, headers, noindex privado, privacidade, termos e aceite versionado entregues.
- Bloco 4: health check, observabilidade anônima, audit no CI, Dependabot, política de segurança, estratégia de backup e checklist do piloto entregues.
- Bloco 5: auditoria pesada sem P0/P1, PR #2 mesclado, CI do merge verde e deployment de produção `READY/PROMOTED` validado.
- Bloco 8 concluído e publicado: dado institucional corrigido, formulário transacional Resend entregue de verdade, Hostinger MCP autorizado e produção validada sem erros.

## Próxima ação exata

Executar o piloto assistido com as duas contas técnicas já ativas: adicionar fotos reais de perfil, importar um ciclo XLSX para uma conta real, registrar uma avaliação Tanita conferindo o OCR e validar a experiência/PDF do destinatário.

O administrador foi localizado e está `active` com e-mail confirmado. O proprietário recebeu o identificador exato fora do repositório. Se não lembrar a senha, deve usar `https://equipeborntorun.com/recuperar-senha` com esse e-mail.

## Fila planejada

1. executar o piloto com usuários reais;
2. depois do piloto, escolher Supabase Pro ou rotina externa de backup criptografado;
3. completar a identificação formal do controlador quando houver os dados jurídicos;
4. solicitar à Fable 5 a aprovação/refinação visual final sem alterar os contratos técnicos.
5. planejar o aplicativo Android nativo e APK como fase separada somente após estabilizar o piloto web/PWA.
6. após o piloto, evoluir as avaliações com gráficos por período;
7. validar a calibração posicional em novas amostras do mesmo Healthy Edge Lite, mantendo correção humana obrigatória;
8. ampliar o editor institucional além da galeria;
9. validar o catálogo reservado com Robson antes de contratar fornecedores ou implementar checkout;
10. seguir `17-ROADMAP-PRODUTO-E-APP-NATIVO.md` para APK e integrações.

## Dependências do proprietário

- criação das contas reais para o piloto;
- criação e confirmação das contas reais dos atletas do piloto; nenhuma senha deve ser criada por terceiros;
- decisão posterior sobre lojas Android/iOS;
- aprovação visual final da Fable 5.
- identificação formal do controlador; o canal piloto é `contato@equipeborntorun.com`;
- decisão entre Supabase Pro ou rotina externa de backup criptografado.

Essas dependências não impedem o Codex de adiantar código, documentação, testes e auditorias independentes delas.

## Limpeza operacional remanescente

- Os dois Personal Access Tokens temporários criados no Supabase foram revogados e o painel confirmou `No access tokens found`.
- A chave redundante `Supabase Auth Born to Run v2` foi removida da Resend em 09/08/2026. A credencial SMTP ativa, restrita ao domínio `equipeborntorun.com`, foi preservada.
- A exclusão do token temporário `Codex Born to Run DNS` foi confirmada anteriormente no modal da Hostinger. Três novas tentativas de abrir/reler `hpanel.hostinger.com/api` ficaram presas no carregamento e interromperam a conexão do painel. A confirmação visual da tabela continua pendente, sem impacto funcional no aplicativo.
- Se a Hostinger voltar a carregar normalmente, a única ação remanescente é verificar que não existe uma linha chamada `Codex Born to Run DNS`. Não criar novo token só para realizar essa conferência.

## Retomada do bloco visual e de e-mail — 11/08/2026

Estado de código concluído e publicado em produção:

1. no Supabase hospedado, salvar o conteúdo de `supabase/templates/recovery.html` em **Authentication → Email Templates → Reset Password** e disparar uma recuperação real;
2. criar ou acessar uma Conta Google usando `contato@equipeborntorun.com` e carregar `public/brand/email-avatar-512.png` como foto do perfil;
3. confirmar o avatar no Gmail mobile e dentro de um e-mail aberto no desktop. Não prometer exibição universal;
4. manter BIMI como etapa separada. Antes de trocar DMARC de `p=none`, auditar alinhamento de SPF/DKIM de Hostinger e Resend, política de subdomínios, recebimento de relatórios e possibilidade de CMC/VMC.

Bloqueio operacional atual do item 3: o conector Supabase não expõe configuração de Auth, a CLI não possui token de Management API e o controle do Codex não está conectado ao Chrome comum, embora o proprietário esteja logado nele. Não criar outro Personal Access Token apenas para este ajuste; preferir reconectar o navegador ou executar o salvamento manual assistido.
