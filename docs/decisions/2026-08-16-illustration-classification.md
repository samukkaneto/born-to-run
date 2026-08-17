# Regra de classificação da ilustração corporal

A tela não deve usar o IMC isoladamente nem assumir sexo por nome, foto ou aparência. O sexo é informado pelo próprio membro na ficha física privada. Quando o perfil informa sexo, a ilustração prioriza os dados da Tanita: percentual de gordura corporal e `physique_rating`; o IMC é fallback quando a leitura de gordura não está disponível. Sem sexo informado, a interface não escolhe uma silhueta masculina ou feminina e orienta o membro a completar o perfil.

A Tanita descreve o percentual de gordura como proporção da gordura em relação ao peso total e informa que suas faixas saudáveis são comparadas automaticamente pelo monitor, com referência a DEXA e pesquisas correlatas: https://www.tanita.asia/?_page=understanding&_lang=en&_para%5B0%5D=1.

A Tanita também documenta o `Physique Rating` como uma classificação de nove tipos baseada nos níveis de músculo e gordura; as classes incluem obesidade oculta, obeso, constituição sólida, pouco exercício, padrão, musculoso padrão, magro, magro e musculoso e muito musculoso: https://tanita.eu/understanding-your-measurements/physique-rating.

O CDC define o IMC como medida de peso relativo à altura e recomenda considerá-lo junto com outros fatores; ele não distingue gordura, músculo e osso: https://www.cdc.gov/bmi/about/index.html. Harvard T.H. Chan School of Public Health também destaca que atletas treinados podem ter IMC alto por maior massa muscular e pouca gordura, reforçando o uso do IMC como triagem e não diagnóstico: https://nutritionsource.hsph.harvard.edu/healthy-weight/measuring-fat/.

A aplicação deve apresentar o resultado como acompanhamento de composição corporal, não como diagnóstico médico.
