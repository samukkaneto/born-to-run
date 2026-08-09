# Operação do piloto e release

Atualizado em 09/08/2026 após o release do Bloco 5.

## Observabilidade entregue

- `/api/health` responde JSON sem cache e identifica a revisão publicada sem expor configuração ou dados pessoais;
- erros capturados pelos boundaries continuam sendo enviados ao Runtime Logs da Vercel;
- Vercel Web Analytics mede visitação agregada e anônima;
- Vercel Speed Insights mede Core Web Vitals de forma anônima;
- query strings, fragmentos e UUIDs são removidos no cliente antes do envio das métricas;
- nenhum evento customizado envia e-mail, nome, conteúdo social ou dados de treino;
- o Aviso de Privacidade foi atualizado para refletir esses processamentos.

Web Analytics foi habilitado remotamente em 09/08/2026 e Speed Insights já estava configurado. O primeiro deployment de produção após o merge começará a fornecer os dados; o painel ainda pode permanecer vazio até receber visitas reais.

## Segurança contínua

- `npm audit` retornou zero vulnerabilidades em 09/08/2026;
- o CI executa `npm audit --audit-level=high` antes dos gates de código;
- Dependabot foi configurado semanalmente para npm e GitHub Actions;
- `SECURITY.md` orienta relato privado por GitHub Security Advisory e proíbe exposição em issues;
- nenhum segredo, token ou dump de dados deve ser anexado a PR, issue, artefato público ou relatório da Abacus.

Atualizações automáticas não devem ser mescladas sem CI verde e revisão do changelog quando forem major versions.

## Backup e recuperação

O projeto Supabase está no plano Free. Nesse plano não há backup automático disponível para restauração. A própria Supabase recomenda exportações lógicas regulares com `supabase db dump` e cópia fora do ambiente principal.

Estado atual antes do piloto: um administrador ativo, nenhuma publicação, comentário, curtida, grupo, treino, comunicado ou objeto de Storage. Portanto não há conteúdo real de atletas a recuperar neste momento.

Antes de receber conteúdo real, escolher uma destas estratégias:

1. **Recomendada:** migrar para Supabase Pro, obter backups diários com retenção de sete dias e manter exportações externas adicionais;
2. permanecer temporariamente no Free e executar dump lógico criptografado após cada janela de teste, guardando-o em armazenamento privado fora do GitHub.

Comandos de referência, executados somente em máquina confiável e sem imprimir credenciais:

```powershell
supabase login
supabase link --project-ref nmcaejrmmfffzeclmuob
supabase db dump --linked --file born-to-run-schema.sql
supabase db dump --linked --data-only --use-copy --file born-to-run-data.sql
```

O arquivo de dados pode conter dados pessoais. Deve ser criptografado antes de sair da máquina, ter acesso mínimo e política de retenção. O dump do banco não inclui o conteúdo físico dos buckets; `avatars` e `post-images` exigem cópia separada pela Storage API. Testar restauração em projeto descartável antes de depender do procedimento.

Nenhuma credencial de banco está disponível neste workspace e nenhum dump pessoal foi criado ou versionado.

## Checklist do piloto real

### Antes de convidar atletas

- [ ] configurar domínio/remetente e SMTP próprio;
- [ ] aplicar os oito templates de Auth e conferir URLs de redirecionamento;
- [ ] se houver upgrade Pro, habilitar proteção contra senhas vazadas;
- [x] habilitar Web Analytics e Speed Insights no painel Vercel;
- [ ] definir identificação formal e e-mail de privacidade do controlador;
- [ ] decidir Pro ou rotina de backup criptografado;
- [ ] revisar visual e textos finais com Fable 5/proprietário.

### Matriz mínima com pessoas reais

- [ ] cadastro e confirmação de e-mail;
- [ ] estado pendente sem acesso ao feed;
- [ ] aprovação pelo treinador e entrada no dashboard;
- [ ] recuperação e troca de senha;
- [ ] edição de perfil e avatar;
- [ ] publicação com foto, métricas, like, comentário e exclusão;
- [ ] grupo, treino para equipe, grupo e atleta individual;
- [ ] suspensão e reativação mantendo histórico correto;
- [ ] instalação PWA em ao menos um Android e um iPhone;
- [ ] conferência de logs e métricas sem dados pessoais.

Registrar apenas IDs técnicos ou contas de teste nos relatórios; não copiar e-mails, fotos ou conteúdo dos atletas.

## Release e rollback

1. abrir PR da branch `codex/production-readiness`;
2. exigir CI completo verde;
3. testar o preview Git nas rotas públicas, `/api/health`, guarda de `/dashboard` e fluxos autenticados disponíveis;
4. revisar build e Runtime Logs;
5. mesclar em `main`;
6. aguardar deployment Git automático `READY/PROMOTED`;
7. conferir domínio canônico, health, redirects, manifest, service worker e primeiros logs;
8. se houver regressão, reverter para `dpl_A2GZxDdUvqphcLt8MYrCYvdq4Zuz` enquanto a correção é preparada.

Não promover manualmente um preview antigo depois que houver build Git da `main`, porque variáveis públicas são incorporadas no artefato durante o build.

## Registro do release de 09/08/2026

- PR #2 mesclado em `main` no commit `7f66eb82db99ddbbb2edc33b26c579225509a8e6`;
- CI do merge `31314115269`: aprovado;
- deployment `dpl_4SjYHKJriBnHY82Q8qYpzfjt7aYB`: `READY/PROMOTED`;
- domínio https://born-to-run-seven.vercel.app validado nas rotas públicas, Auth, PWA, health e guarda anônima;
- zero clusters de runtime e zero logs warning/error/fatal encontrados após os testes;
- rollback anterior conhecido: `dpl_A2GZxDdUvqphcLt8MYrCYvdq4Zuz`.

## Fontes oficiais

- https://supabase.com/docs/guides/platform/backups
- https://vercel.com/docs/analytics/privacy-policy
- https://vercel.com/docs/speed-insights/privacy-policy
- https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file
