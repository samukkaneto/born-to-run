-- Bloco C: variante anatômica do mapa segmentado (app + PDF)
-- Colunas de escolha explícita de sexo e biotipo para a ilustração da avaliação.
-- Não altera migrations históricas; valores NULL mantêm o comportamento atual.

alter table public.body_assessments
  add column if not exists sex text check (sex is null or sex in ('male', 'female')),
  add column if not exists biotype text check (biotype is null or biotype in ('lean', 'mid', 'large'));

comment on column public.body_assessments.sex is 'Sexo da ilustração anatômica do mapa segmentado; escolha explícita, nunca inferido por nome ou foto.';
comment on column public.body_assessments.biotype is 'Biotipo da ilustração (lean/mid/large). Quando NULL, o app escolhe "mid" e permite troca manual.';
