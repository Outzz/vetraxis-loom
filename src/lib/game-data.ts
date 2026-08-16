// Anomalia Cósmica RPG — Dados extraídos do Livro de Regras Ed. 1.1

export type CosmicElement =
  | "prisma"
  | "chama"
  | "nebulosa"
  | "luz"
  | "raiz"
  | "eter"
  | "sombra";

export type Relic =
  | "prisma_harmonia"
  | "lamina_paixao"
  | "calice_astros"
  | "lanterna_solar"
  | "coroa_vitalidade"
  | "escudo_celestial"
  | "manto_sombras";

export const ELEMENTS: Record<
  CosmicElement,
  { name: string; epithet: string; color: string; passive: string; description: string }
> = {
  prisma: {
    name: "Prisma",
    epithet: "A Verdade Fragmentada",
    color: "#a78bfa",
    passive: "Todo ataque prismático ignora parte da defesa inimiga (-2 CA).",
    description:
      "Manifestação da luz refratada em mil verdades. Portadores do Prisma perfuram ilusões e defesas.",
  },
  chama: {
    name: "Chama",
    epithet: "A Raiva Viva",
    color: "#f97316",
    passive: "Cada ferimento sofrido aumenta o próximo dano causado em +1d4.",
    description:
      "Fogo que não consome — reforja. A dor alimenta o poder do Portador da Chama.",
  },
  nebulosa: {
    name: "Nebulosa",
    epithet: "O Sopro do Vazio",
    color: "#38bdf8",
    passive: "Ignora terreno difícil e pode se mover pelo vazio 1x por rodada.",
    description:
      "Poeira estelar viva. O Portador da Nebulosa desliza entre planos e ventos cósmicos.",
  },
  luz: {
    name: "Luz",
    epithet: "O Fardo do Sol",
    color: "#fbbf24",
    passive: "Aliados adjacentes ganham +1 em testes de Sanidade.",
    description:
      "A luz não é apenas iluminação — é responsabilidade. Portadores da Luz sustentam os outros.",
  },
  raiz: {
    name: "Raiz",
    epithet: "A Vida Antiga",
    color: "#84cc16",
    passive: "Regenera 1 PV ao final de cada rodada em terreno natural.",
    description:
      "A memória do planeta corre em suas veias. Portadores da Raiz curam e resistem.",
  },
  eter: {
    name: "Éter",
    epithet: "O Elo dos Mortos",
    color: "#e0e7ff",
    passive:
      "Sempre que alguém morre em cena, o Éter detecta presença espiritual automaticamente.",
    description:
      "A ponte entre o que foi e o que ainda ecoa. Portadores do Éter conversam com o que não deveria falar.",
  },
  sombra: {
    name: "Sombra",
    epithet: "O Reflexo do Medo",
    color: "#6b7280",
    passive: "Enquanto oculto, o Portador regenera 1d4 PV por turno.",
    description:
      "Nem ausência nem presença — a Sombra é escolha. Portadores caçam do que não pode ser visto.",
  },
};

export const RELICS: Record<
  Relic,
  { name: string; god: string; element: CosmicElement; effect: string; cost: string }
> = {
  prisma_harmonia: {
    name: "Prisma de Harmonia",
    god: "Deus do Caos",
    element: "prisma",
    effect:
      "Refrata próximo ataque recebido em múltiplos raios prismáticos, causando 2d8 aos inimigos ao redor.",
    cost: "2 PA · 1 uso por descanso longo",
  },
  lamina_paixao: {
    name: "Lâmina da Paixão",
    god: "Deusa da Chama",
    element: "chama",
    effect: "Adiciona 1d12 de dano flamejante e ignora resistência a fogo.",
    cost: "1 PA por ataque · limite 3 usos por combate",
  },
  calice_astros: {
    name: "Cálice dos Astros",
    god: "Deus da Nebulosa",
    element: "nebulosa",
    effect:
      "Bebe uma névoa cósmica: recupera 2d6 PV e revela criaturas invisíveis a 20m.",
    cost: "2 PA · 1 uso por cena",
  },
  lanterna_solar: {
    name: "Lanterna Solar",
    god: "Deusa da Luz",
    element: "luz",
    effect:
      "Emite pulso solar (raio 6m): -10 PS a criaturas anômalas e +5 PS a aliados.",
    cost: "3 PA · 1 uso por descanso curto",
  },
  coroa_vitalidade: {
    name: "Coroa da Vitalidade",
    god: "Deus da Raiz",
    element: "raiz",
    effect:
      "Enraiza o Portador: imunidade a Empurrão e regeneração de 1d6 PV por rodada por 3 rodadas.",
    cost: "2 PA · 1 uso por descanso longo",
  },
  escudo_celestial: {
    name: "Escudo Celestial",
    god: "Deus do Éter",
    element: "eter",
    effect:
      "Cria barreira etérea que absorve 20 pontos de dano ao grupo até quebrar.",
    cost: "3 PA · 1 uso por descanso longo",
  },
  manto_sombras: {
    name: "Manto das Sombras",
    god: "Deusa da Sombra",
    element: "sombra",
    effect:
      "Torna o Portador invisível por 1d4 rodadas ou até atacar. Primeiro ataque causa +2d6.",
    cost: "2 PA · 1 uso por cena",
  },
};

// Cap. 4.0 — Criação de Personagem: cinco atributos, começando em 1
export type AttributeKey = "str" | "dex" | "int" | "cha" | "res";

export const ATTRIBUTES: Record<
  AttributeKey,
  { name: string; short: string; description: string; zero: string }
> = {
  str: {
    name: "Força",
    short: "FOR",
    description: "Luta, Atletismo, dano físico corpo a corpo.",
    zero: "Não pode carregar itens pesados; -2 em ataques físicos.",
  },
  dex: {
    name: "Destreza",
    short: "DES",
    description: "Furtividade, Mira, Iniciativa, Defesa base.",
    zero: "Sempre age por último; sem bônus de Defesa.",
  },
  int: {
    name: "Intelecto",
    short: "INT",
    description: "Ocultismo, Ritualismo, Sanidade base, controle de poderes.",
    zero: "Falha crítica em poderes gera Corrupção dobrada.",
  },
  cha: {
    name: "Carisma",
    short: "CAR",
    description: "Persuasão, liderança, influência sobre Relíquias.",
    zero: "Relíquias ignoram os desejos do portador com mais frequência.",
  },
  res: {
    name: "Resiliência",
    short: "RES",
    description: "Resistência a Corrupção, PV base, testes de condição.",
    zero: "Qualquer Corrupção recebida nunca é reduzida à metade.",
  },
};

// Criação (Cap. 4.0): todos começam em 1, 4 pontos para distribuir, máximo inicial 3.
// Reduzir um atributo a 0 concede +1 ponto extra.
export const ATTR_START = 1;
export const ATTR_POINTS = 4;
export const ATTR_MAX_START = 3;
export const ATTR_MAX_LEVEL = 4; // sobe para 5 no Despertar (nível 10) no elemento

// Classes e Trilhas (Cap. 4.2 — Ed. 1.2)
export type CharacterClass = "confrontador" | "condutor" | "operador" | "sobrevivente";

export type Assimilation = 10 | 20 | 35 | 50 | 70;

export interface TrackAbility {
  at: Assimilation;
  name: string;
  text: string;
}

export interface Track {
  key: string;
  name: string;
  tagline: string;
  abilities: TrackAbility[];
}

export interface ClassData {
  name: string;
  tagline: string;
  keyAttrs: AttributeKey[];
  resources: string[];
  awakening: { name: string; text: string };
  tracks: Track[];
}

// Classe e Trilha só são escolhidas quando o Portador atinge 5% de Corrupção.
export const CLASS_CHOICE_CORRUPTION = 5;
// Habilidades de trilha desbloqueiam nestes marcos de Assimilação (= Corrupção %).
export const TRACK_MILESTONES: Assimilation[] = [10, 20, 35, 50, 70];

export const CLASSES: Record<CharacterClass, ClassData> = {
  confrontador: {
    name: "Confrontador",
    tagline:
      "Combatentes preparados para enfrentar Anomalias diretamente, suportando danos que destruiriam pessoas comuns.",
    keyAttrs: ["str", "res"],
    resources: [
      "Vitalidade elevada: +4 PV máximos.",
      "Proficiências: armas leves, médias e pesadas; proteções leves, médias e pesadas.",
      "Perícias recomendadas: Luta, Mira, Atletismo e Resistência.",
      "Linha de Frente: 1x por rodada, após acertar um ataque, +1d6 de dano extra ou deslocar-se 3 m sem provocar reações.",
    ],
    awakening: {
      name: "Titã da Ruptura",
      text: "1x por missão, Ação Menor, 5 PA, +6% Corrupção. 3 turnos: +2 Defesa; Resistência 10 física; Resistência 5 anômala; +2d10 em todos os ataques; imune a empurrões, quedas e Atordoado. Com 50%+ Corrupção também recupera 1d8 PV por turno. Ao terminar, perde 1d6 PS.",
    },
    tracks: [
      {
        key: "agente_contencao",
        name: "Agente de Contenção",
        tagline: "Especialista em enfraquecer, interromper e aprisionar manifestações anômalas.",
        abilities: [
          { at: 10, name: "Postura de Combate", text: "Ação Menor: Assalto (+1 nos ataques e +1d6 no primeiro acerto/rodada contra Anomalias) ou Guarda (+2 Defesa e em Resistência contra condições de Anomalias)." },
          { at: 20, name: "Supressão Anômala", text: "Ao acertar uma Anomalia: 1 PA, +2% Corrupção. Resiliência CD 15 ou o alvo perde reações, -2 para ativar poderes e poderes custam +1 PA até o fim do próximo turno." },
          { at: 35, name: "Resistência Brutal", text: "Resistência 3 contra dano elemental, espiritual e anômalo (5 aos 70%). Ao passar em teste contra condição de Anomalia, desloca-se 3 m como reação." },
          { at: 50, name: "Última Linha", text: "Reação, 2 PA, +4% Corrupção: quando criatura em 9 m ativar poder grau 4-5, ataque. Acerto cancela o poder; erro reduz o efeito à metade. 1x por cena." },
          { at: 70, name: "Muralha Viva", text: "Ação Principal, 3 PA, +6% Corrupção. 3 turnos em 6 m: aliados com Resistência 5 anômala e +2 Resistência; inimigos não teleportam nem atravessam matéria; portais grau ≤3 fechados. 1x por cena." },
        ],
      },
      {
        key: "portador",
        name: "Portador",
        tagline: "Permite que a Anomalia altere sua carne, transformando o corpo em arma viva.",
        abilities: [
          { at: 10, name: "Corpo Profanado", text: "Arma natural 1d8 (Força ou Resiliência), conta como arma leve. 1x por rodada, 1 PA e +1% Corrupção para +1d6 elemental." },
          { at: 20, name: "Regeneração Instável", text: "Ação Menor, 1 PA, +2% Corrupção: por 3 turnos, com metade ou menos dos PV recupera 1d4 PV por turno. 1x por cena." },
          { at: 35, name: "Carne Anômala", text: "+2 Defesa; Resistência 3 física; +2 contra Sangrando, Queimando, Congelado e veneno. Com 50%+ Corrupção, resistência 5 e -2 social." },
          { at: 50, name: "Forma Aberrante", text: "Ação Principal, 2 PA, +4% Corrupção. 3 turnos: +3 m deslocamento; alcance +2 m; ataques naturais +2d8; +2 Atletismo e Resistência. Ao terminar, perde 1d4 PS." },
          { at: 70, name: "Avatar da Ruptura", text: "Ação Principal, 3 PA, +6% Corrupção, 1x por missão. 3 turnos: não cai abaixo de 1 PV; +3d10 nos ataques naturais; crítico 19-20; imune a Sangrando/Atordoado/Enraizado. Ao final, Resiliência CD 20 ou 2d6 PS e Fragmentado." },
        ],
      },
      {
        key: "vanguarda",
        name: "Vanguarda",
        tagline: "Ocupa espaço, protege aliados e impede que a formação seja destruída.",
        abilities: [
          { at: 10, name: "Escudo Vivo", text: "Reação: quando aliado adjacente sofrer dano, divida-o — metade para você, metade para ele. Condições afetam só o alvo original." },
          { at: 20, name: "Formação Tática", text: "Aliados em até 6 m recebem +1 na Defesa enquanto puderem vê-lo ou ouvi-lo." },
          { at: 35, name: "Parede Inabalável", text: "Não pode ser empurrado, derrubado ou movido contra sua vontade. +2 para escapar de agarrões, prisões, raízes e distorções gravitacionais." },
          { at: 50, name: "Interceptar", text: "1x por rodada, reação: quando aliado em 6 m for alvo de ataque, troque de posição e torne-se o alvo com Resistência 3 contra o dano." },
          { at: 70, name: "Bastião da Realidade", text: "Ação Principal, 3 PA, +6% Corrupção. 3 turnos em 6 m: Resistência 5 física; +2 contra efeitos de movimento; cobertura parcial contra ataques externos. 1x por cena." },
        ],
      },
      {
        key: "cacador",
        name: "Caçador",
        tagline: "Persegue criaturas específicas e encerra o confronto antes que se adaptem.",
        abilities: [
          { at: 10, name: "Instinto Predador", text: "Ação Menor: marque uma presa até o fim da cena. +2 para rastreá-la/percebê-la/resistir a ilusões dela; primeiro acerto por rodada +1d6; sabe a direção em 100 m." },
          { at: 20, name: "Golpe Cirúrgico", text: "1x por rodada ao acertar a presa: Perfurar defesa (ignora 3 de Resistência), Ferida aberta (Resiliência CD 15 ou Sangrando) ou Romper movimento (-3 m)." },
          { at: 35, name: "Rastreador Elemental", text: "Ação Principal: analise criatura em 18 m — elemento, uma resistência/imunidade, condição física e defesa mais fraca. +1 nos ataques do grupo contra ela." },
          { at: 50, name: "Execução", text: "Contra presa com metade ou menos dos PV, 2 PA: +3d8 de dano. Se reduzir a 0 PV, recupera 1 PA e marca nova presa. 1x por rodada." },
          { at: 70, name: "Predador Supremo", text: "1x por cena: presa suprema — detecta em 1 km; ignora invisibilidade e duplicatas; crítico 19-20; +2d8 em todos os ataques; ela não pode surpreendê-lo." },
        ],
      },
      {
        key: "arsenalista",
        name: "Arsenalista",
        tagline: "Armas, modificações de campo, poder de fogo e destruição controlada.",
        abilities: [
          { at: 10, name: "Arma Predileta", text: "Escolha uma categoria de arma: +1 nos ataques; saca/recarrega como Ação Livre 1x por rodada; ignora a primeira penalidade de peso, recuo ou uso consecutivo." },
          { at: 20, name: "Modificação de Campo", text: "Em descanso curto: Penetrante (ignora 3 Resistência), Estabilizada (+2 no primeiro ataque), Ampliada (+5 m) ou Conversor elemental (+1d6 elemental, +1% Corrupção na cena)." },
          { at: 35, name: "Rajada Calculada", text: "1x por rodada, 1 PA: segundo ataque com a arma predileta a -2. Com arma pesada, não pode se deslocar no turno." },
          { at: 50, name: "Zona de Morte", text: "Ação Principal, 2 PA: cone 6 m, linha 12 m ou área 3 m. Um ataque contra todos na área; atingidos sofrem dano normal +2d8. Exclui criaturas igual ao Intelecto. 1x por cena." },
          { at: 70, name: "Arsenal Absoluto", text: "Ação Menor, 3 PA, 1x por cena. 3 turnos: ataques ignoram 5 de Resistência; margem de crítico +1; trocar armas não exige ação; ataque adicional como Ação Menor; sem munição gasta. Arma anômala: +6% Corrupção." },
        ],
      },
    ],
  },
  condutor: {
    name: "Condutor",
    tagline: "Portadores especializados em canalizar, moldar e controlar os sete Elementos Cósmicos.",
    keyAttrs: ["int", "cha"],
    resources: [
      "Pontos de Anomalia: +2 no PA máximo.",
      "Sintonia elemental: escolha um elemento e aprenda dois poderes de grau 1 associados.",
      "Proficiências: armas leves, armas simples e proteções leves.",
      "Canalização Afinada: 1x por cena, repita um teste falho para ativar um poder (mantém o segundo).",
    ],
    awakening: {
      name: "Avatar da Convergência",
      text: "1x por missão: canalize dois elementos por 3 turnos. Usa poderes dos dois, ignora incompatibilidades, +2 nos testes de poder e 1x por turno combina dois poderes numa Ação Principal. Ativar custa +5% Corrupção; ao final perde 1d6 PS.",
    },
    tracks: [
      {
        key: "exorcista",
        name: "Exorcista",
        tagline: "Combate possessões, entidades espirituais e influências fixadas em pessoas ou lugares.",
        abilities: [
          { at: 10, name: "Selo de Rejeição", text: "Ação Principal: selo em criatura, objeto ou ponto adjacente. Entidades hostis fazem Resiliência CD 15 ou têm a tentativa cancelada, sofrem 1d6 de Luz/Éter e ficam visíveis. Anômala grau 1." },
          { at: 20, name: "Expulsar Influência", text: "Intelecto + Ritualismo CD 15: remove Assombrado, Iludido ou Confuso; suspende Dominado/Possuído; entidade alojada sofre 2d6 espiritual. Anômala grau 2." },
          { at: 35, name: "Círculo de Purificação", text: "Círculo de 4 m por 3 turnos: aliados +2 em Sanidade e Resistência, reduzem 1% da Corrupção recebida e resistem a possessão (Resiliência CD 18). Anômala grau 3." },
          { at: 50, name: "Banimento", text: "Intelecto + Ritualismo vs. Resiliência em 12 m: entidade invocada banida 1d4 turnos; nativa sofre 4d10 espiritual e Atordoada. 1x por cena. Anômala grau 4." },
          { at: 70, name: "Voz da Realidade", text: "1x por missão, área 9 m: encerra Possuído/Dominado/Assombrado/Confuso/Iludido; invocadas sofrem 5d12; portais grau ≤4 fechados. Perde 1d6 PS. Anômala grau 5." },
        ],
      },
      {
        key: "possuido",
        name: "Possuído",
        tagline: "Divide o corpo com uma consciência anômala e transforma a convivência em poder.",
        abilities: [
          { at: 10, name: "Hóspede Interior", text: "Escolha Garra (+1d6 corpo a corpo 1x/rodada), Olho (+2 percepção, vê invisíveis a 3 m) ou Voz (+2 Persuasão e comandar entidades menores)." },
          { at: 20, name: "Tomar o Corpo", text: "Reação, 1 PA, +2% Corrupção: repita um teste falho ou force o agressor a repetir o ataque com +2. Falhando por 5+, o Hóspede controla seu deslocamento." },
          { at: 35, name: "Manifestação Parcial", text: "Ação Menor, 2 PA, +3% Corrupção. 3 turnos: +2 Defesa; +3 m deslocamento; arma natural 2d8; visão no escuro e percepção espiritual. Sanidade CD 15 ou 1d4 PS." },
          { at: 50, name: "Dupla Consciência", text: "Imune a Confuso e Iludido. Sob controle mental ainda age. 1x por cena: 2 PA, +4% Corrupção e 1d6 PS para um turno completo mesmo dominado." },
          { at: 70, name: "Libertação do Hóspede", text: "1x por missão: liberte a entidade por 3 turnos (Defesa 15, PV = metade dos seus, ataque 3d10 elemental). Se cair, você sofre 2d10 e 1d6 PS. Anômala grau 5." },
        ],
      },
      {
        key: "oraculo_prismatico",
        name: "Oráculo Prismático",
        tagline: "Enxerga futuros incompletos e escolhe qual deles terá permissão para existir.",
        abilities: [
          { at: 10, name: "Visão Fragmentada", text: "Reação: some ou subtraia 1d4 do teste de uma criatura em 9 m, após a rolagem. 1x por rodada. Anômala grau 1." },
          { at: 20, name: "Destino Instável", text: "Force uma criatura em 12 m a repetir uma rolagem de d20; o segundo resultado vale. 1x por cena. Anômala grau 2." },
          { at: 35, name: "Reflexo Temporal", text: "Reação ao ser atacado: teleporte-se 3 m. Fora do alcance, o ataque erra; caso contrário -2 ao agressor. Se errar, o reflexo causa 2d6 de Prisma. Anômala grau 3." },
          { at: 50, name: "Futuro Quebrado", text: "2 turnos: role dois d20 no início do turno e substitua qualquer teste de d20 visível por um valor anotado. 1x por cena. Anômala grau 4." },
          { at: 70, name: "Olhos da Convergência", text: "3 turnos: vê através de paredes em 18 m; percebe invisíveis e distorções; aliados em 9 m +2 Defesa e testes; 1x por rodada obriga uma repetição. Perde 1d6 PS. Anômala grau 5." },
        ],
      },
      {
        key: "luminario",
        name: "Luminário",
        tagline: "Usa a Luz para curar ferimentos, purificar Corrupção e preservar a vida.",
        abilities: [
          { at: 10, name: "Luz Restauradora", text: "Ação Principal: cure criatura em 6 m em 1d8 + Intelecto PV. 1x por rodada por criatura. Anômala grau 1." },
          { at: 20, name: "Escudo Solar", text: "Reação: +3 na Defesa de criatura em 9 m contra um ataque; se acertar, Resistência 1d8 contra o dano. Anômala grau 2." },
          { at: 35, name: "Purificação", text: "Toque: remove condição leve/moderada, encerra Sangrando, Queimando, Iludido ou Assombrado e reduz 1d4% de Corrupção (1x por sessão por criatura). Anômala grau 3." },
          { at: 50, name: "Aurora Viva", text: "Aura de 6 m por 3 turnos: aliados recuperam 1d6 PV e +2 Resistência por turno; criaturas de Sombra sofrem 1d6 de Luz. 1x por cena. Anômala grau 4." },
          { at: 70, name: "Sol Interior", text: "1x por missão, 3 turnos: aliados em 12 m com Resistência 5 a qualquer dano, imunes a Aterrorizado e, ao chegarem a 0 PV, ficam com 1 PV e recuperam 2d8. Perde 1d6 PS. Anômala grau 5." },
        ],
      },
      {
        key: "astralista",
        name: "Astralista",
        tagline: "Dobra espaço, distância e gravidade, tratando o campo como estrutura maleável.",
        abilities: [
          { at: 10, name: "Passo Astral", text: "Ação Menor: teleporte-se até 6 m para espaço visível. Não atravessa barreiras de contenção. Anômala grau 1." },
          { at: 20, name: "Gravidade Local", text: "Zona de 3 m em até 12 m por 2 turnos. Resiliência CD 15: falha Enraizada; sucesso Deslocada com metade do deslocamento. Anômala grau 2." },
          { at: 35, name: "Dobra Espacial", text: "Reação: teleporte um aliado atacado até 3 m. Fora do alcance o ataque erra; caso contrário +2 Defesa. Anômala grau 3." },
          { at: 50, name: "Prisão Dimensional", text: "Resiliência CD 18 ou a criatura é removida da cena por 1d4 turnos. Repete o teste ao fim de cada turno. 1x por cena. Anômala grau 4." },
          { at: 70, name: "Horizonte de Eventos", text: "1x por missão: esfera de 6 m por 3 turnos — 3d8 por turno, puxa 3 m, metade do deslocamento, Resiliência CD 20 para sair. Anômala grau 5." },
        ],
      },
    ],
  },
  operador: {
    name: "Operador",
    tagline: "Especialistas em tecnologia, investigação, preparação, informação e controle tático.",
    keyAttrs: ["int", "dex"],
    resources: [
      "Conhecimento técnico: +2 em Intelecto para analisar, fabricar, reparar ou operar tecnologia.",
      "Inventário ampliado: mantém um dispositivo tecnológico ativo além do limite normal.",
      "Proficiências: armas leves, armas de fogo médias e proteções leves.",
      "Improvisação: 1x por cena, crie uma ferramenta comum temporária com uma Ação Principal.",
    ],
    awakening: {
      name: "Singularidade Tática",
      text: "1x por missão, 3 turnos: ação adicional por rodada (deslocar, analisar, operar dispositivos, auxiliar, usar itens, marcar alvos); alcance dos dispositivos dobrado; recupera um uso de habilidade de 50% ou inferior; aliados em 9 m +2 Iniciativa. Ativar causa +4% Corrupção.",
    },
    tracks: [
      {
        key: "agente_secreto",
        name: "Agente Secreto",
        tagline: "Infiltração, identidades falsas, extrações e neutralizações silenciosas.",
        abilities: [
          { at: 10, name: "Identidade Fantasma", text: "+2 em Furtividade e Persuasão para infiltração e disfarce. 1x por cena, estabeleça uma cobertura plausível." },
          { at: 20, name: "Neutralização Silenciosa", text: "1x por rodada contra alvo desprevenido/flanqueado: +2d6. Se humano e não-letal, Resiliência CD 15 ou inconsciente 1d4 turnos." },
          { at: 35, name: "Rede Clandestina", text: "1x por missão: Acesso (credencial/rota), Contato (informação/distração) ou Reserva (equipamento escondido)." },
          { at: 50, name: "Plano de Extração", text: "Reação: você e aliados em 9 m deslocam-se 6 m sem provocar reações e ganham +2 Defesa até seu próximo turno. 1x por cena." },
          { at: 70, name: "Operação Impossível", text: "1x por missão, 3 turnos: Ação Menor adicional; ignora escuridão/fumaça/cobertura; +3d8 contra desprevenidos; atravessa fechaduras e sensores comuns." },
        ],
      },
      {
        key: "cientista_anomalo",
        name: "Cientista Anômalo",
        tagline: "Estuda a biologia, física e energia das Anomalias para produzir ferramentas contra elas.",
        abilities: [
          { at: 10, name: "Análise de Amostra", text: "Ação Principal, Intelecto CD 12: descubra 1 informação (elemento, resistência, vulnerabilidade, condição ou natureza). Superando por 5+, descubra 2." },
          { at: 20, name: "Composto Instável", text: "Após descanso prepare doses = Intelecto: Coagulante (2d6 PV, remove Sangrando), Estimulante (+3 m e +2 físico por 2 turnos) ou Solvente (2d6 químico)." },
          { at: 35, name: "Adaptação Biocósmica", text: "Ação Completa com amostra: conceda até o fim da cena Resistência 5 a um elemento, respiração hostil, ver invisíveis, ignorar terreno difícil ou +2 contra uma condição." },
          { at: 50, name: "Reação em Cadeia", text: "Reação, 2 PA, +4% Corrupção: Intelecto + Ocultismo CD 15 + grau. Sucesso reduz o efeito à metade e causa 2d8 ao originador ou devolve 1 PA a um aliado. 1x por cena." },
          { at: 70, name: "Teoria Unificada", text: "1x por missão, Intelecto CD 20: por 3 turnos invalide uma resistência, -3 na CD das habilidades da criatura, impeça uma habilidade ou interrompa regeneração. +3% Corrupção." },
        ],
      },
      {
        key: "engenheiro_dimensional",
        name: "Engenheiro Dimensional",
        tagline: "Constrói dispositivos que utilizam as próprias falhas da realidade.",
        abilities: [
          { at: 10, name: "Dispositivo Improvisado", text: "Ação Principal: Emissor de pulso (1d8 em 3 m), Barreira portátil (+2 Defesa por 2 turnos) ou Gancho vetraxiano (move 3 m). Grátis 1x por cena; extras são anômala grau 1." },
          { at: 20, name: "Torre de Contenção", text: "Instale torre (Defesa 12, PV = 10 + Intelecto). Ação Menor: ataque 1d8 em 12 m, -2 no próximo poder do alvo, ou revela invisíveis em 3 m. Anômala grau 2." },
          { at: 35, name: "Campo Magnético", text: "Área de 6 m por 3 turnos: ataques físicos à distância -2; armas metálicas não são arremessadas; dispositivos +2 Defesa. Anômala grau 3." },
          { at: 50, name: "Drone Orbital", text: "1x por cena, 3 turnos: Disparo (2d8 em 18 m), Escudo (Resistência 5 a um aliado) ou Varredura (revela invisíveis e armadilhas em 6 m). Anômala grau 4." },
          { at: 70, name: "Núcleo Experimental", text: "1x por missão, 3 turnos: dispositivos dobram alcance, +2 em testes e Defesa e ativam uma vez a mais por rodada. Ao terminar, Resiliência CD 20 ou explodem (3d8). Anômala grau 5." },
        ],
      },
      {
        key: "observador",
        name: "Observador",
        tagline: "Transforma informação em vantagem — nada no campo permanece oculto.",
        abilities: [
          { at: 10, name: "Scanner Cósmico", text: "Ação Menor: escaneie criatura em 18 m — PV aproximados, elemento, condições, Corrupção e efeitos sustentados. +2 no próximo teste contra ela." },
          { at: 20, name: "Marcar Alvo", text: "Ação Menor, 3 turnos: aliados +1 nos ataques, ignoram cobertura parcial e sabem a direção em 30 m. Apenas uma marca ativa." },
          { at: 35, name: "Compartilhar Dados", text: "Reação, 1 PA, 1x por rodada: +1d6 no teste de um aliado em 9 m ou +2 na Defesa contra um ataque." },
          { at: 50, name: "Visão Total", text: "1x por cena, 2 PA, 3 turnos: vê através de paredes; detecta invisíveis, portais e campos; não pode ser surpreendido; +2 Iniciativa e percepção aos aliados." },
          { at: 70, name: "Consciência Expandida", text: "1x por missão, 3 PA, +6% Corrupção: aliados em 12 m compartilham visão e audição, não são flanqueados e ganham +2 contra ilusões por 3 turnos. Depois perde 1d6 PS." },
        ],
      },
      {
        key: "sabotador",
        name: "Sabotador",
        tagline: "Armadilhas, explosivos, colapsos e destruição de dispositivos.",
        abilities: [
          { at: 10, name: "Carga Instável", text: "Coloque ou arremesse carga a 6 m; detone como reação: 2d6 em área de 3 m (Destreza CD 15 reduz à metade). Uma carga grátis por cena." },
          { at: 20, name: "Mina Prismática", text: "Mina oculta (Intelecto CD 15): 3d8 de Prisma em 3 m + efeito 1d4 (Deslocado, Atordoado, Iludido ou Enraizado). +2% Corrupção ao construir." },
          { at: 35, name: "Sobrecarga", text: "Reação, 2 PA, +3% Corrupção: Intelecto + Ocultismo CD 15 desativa dispositivos por 1 turno causando 2d8 ao usuário; itens anômalos sofrem -2 e +1% Corrupção." },
          { at: 50, name: "Implosão", text: "Área de 4 m em até 12 m: 4d10 e puxa 3 m. Resiliência CD 18 reduz à metade. Estruturas sofrem dano dobrado. 1x por cena. Anômala grau 4." },
          { at: 70, name: "Colapso Controlado", text: "1x por missão, Ação Completa: área de 9 m colapsa ao fim da próxima rodada — 5d12, destrói coberturas, fecha portais grau ≤4. Perde 1d6 PS. Anômala grau 5." },
        ],
      },
    ],
  },
  sobrevivente: {
    name: "Sobrevivente",
    tagline: "Pessoas comuns que enfrentam o impossível com conhecimento, sorte, coragem e determinação.",
    keyAttrs: ["res", "int"],
    resources: [
      "Humanidade preservada: não começa com poderes elementais; habilidades normalmente não geram Corrupção.",
      "Sanidade elevada: +2 PS máximos.",
      "Proficiências: armas simples e proteções leves.",
      "Teimosia Humana: 1x por cena, repita qualquer teste fracassado (mantém o segundo resultado).",
    ],
    awakening: {
      name: "Última Centelha",
      text: "Reação, 1x por missão: ao ser reduzido a 0 PV ou 0 PS, permaneça consciente por 3 turnos com 1 PV e 1 PS. Não fica Atordoado, inconsciente, Dominado ou Possuído; aliados em 9 m ganham +2 Defesa e testes e recuperam 1d6 PV.",
    },
    tracks: [
      {
        key: "testemunha",
        name: "Testemunha",
        tagline: "Sobreviveu ao contato com uma Anomalia e aprendeu a reconhecer os padrões do horror.",
        abilities: [
          { at: 10, name: "Eu Vi", text: "Após observar uma Anomalia pela primeira vez na cena: +2 no próximo teste de Sanidade contra ela, para identificá-la e para resistir à habilidade observada." },
          { at: 20, name: "Não Era Imaginação", text: "Reação: aliado em 9 m que falhar em teste de Sanidade ou contra ilusão repete com +2. 1x por cena por aliado." },
          { at: 35, name: "Memória do Horror", text: "Ao sobreviver a uma habilidade, registre o padrão: Resistência 3 contra ela ou +2 para resistir até o próximo descanso longo. Padrões = Intelecto." },
          { at: 50, name: "Prova Irrefutável", text: "Ação Principal: por 3 turnos a Anomalia perde invisibilidade e ilusões e aliados ganham +2 contra ela. Sem prova física, Intelecto CD 15. 1x por cena." },
          { at: 70, name: "A Verdade Permanece", text: "Memória imune a alterações. Imune a Iludido; +5 contra dominação ou possessão. 1x por cena, cancele Confuso/Dominado/Possuído em si e permita novo teste a aliados em 6 m." },
        ],
      },
      {
        key: "marcado",
        name: "Marcado",
        tagline: "Carrega uma cicatriz cósmica que reage às Anomalias, mesmo sem ser um Portador completo.",
        abilities: [
          { at: 10, name: "Cicatriz Anômala", text: "Escolha um elemento: sente manifestações dele em 12 m, +2 para resistir a ele e reconhece automaticamente seus rastros." },
          { at: 20, name: "Eco da Marca", text: "1x por rodada, quando o elemento escolhido for usado em 12 m, armazene um Eco: gaste para +1d6 em um teste, dano, cura ou redução de dano." },
          { at: 35, name: "A Marca Responde", text: "Reação, 1 PS, +1% Corrupção: 1d6 elemental em 12 m, teleporte 3 m, recupere 1d6 PV, +2 Defesa contra um ataque ou mova um aliado 3 m." },
          { at: 50, name: "Destino Vinculado", text: "Reação, +3% Corrupção: ao chegar a 0 PV ou sofrer Colapso Mental, fique com 1 PV ou 1 PS e desloque-se 3 m. 1x por cena." },
          { at: 70, name: "Escolhido pela Ruptura", text: "1x por missão: use um poder de grau 4 do seu elemento mesmo sem conhecê-lo (Resiliência + Ocultismo). Depois: +8% Corrupção e perde 1d6 PS." },
        ],
      },
      {
        key: "socorrista",
        name: "Socorrista",
        tagline: "Mantém os outros vivos através de conhecimento médico, rapidez e sangue-frio.",
        abilities: [
          { at: 10, name: "Primeiros Socorros", text: "Ação Principal com kit médico, Intelecto CD 10: recupera 1d8 + Intelecto PV e remove Sangrando. 1x por cena por criatura." },
          { at: 20, name: "Estimulante", text: "Ação Menor: por 2 turnos +3 m de deslocamento e +2 em ataques físicos e Resistência. Ao terminar perde 1d4 PV. Uma criatura por cena." },
          { at: 35, name: "Reviver", text: "Ação Principal em criatura com 0 PV, Intelecto CD 15: recupera 1d6 PV e sai do Estado de Ruptura. Falha apenas estabiliza." },
          { at: 50, name: "Cirurgia de Campo", text: "10 minutos em local seguro, Intelecto CD 18: 4d8 PV, remove condição física moderada ou grave. 1x por descanso longo." },
          { at: 70, name: "Milagre Humano", text: "1x por missão, Intelecto CD 20: reanime criatura morta há no máximo 1 rodada com 1 PV e 1 PS e uma Cicatriz Narrativa. Você perde 2d6 PV e 1d6 PS." },
        ],
      },
      {
        key: "explorador",
        name: "Explorador",
        tagline: "Deslocamento, ambientes hostis, expedições e preparação de acampamentos.",
        abilities: [
          { at: 10, name: "Instinto Natural", text: "+2 em Iniciativa e para perceber armadilhas, clima, terrenos instáveis e perigos ambientais. Testa para evitar o primeiro perigo de terreno da cena." },
          { at: 20, name: "Escalada", text: "Escala, nada e atravessa terreno difícil com deslocamento normal. Carregando aliado, perde apenas 3 m de deslocamento." },
          { at: 35, name: "Resistência Ambiental", text: "Resistência 5 contra calor, frio, pressão, queda, atmosfera tóxica e gravidade anômala. +2 contra venenos, Congelado, Queimando e Deslocado." },
          { at: 50, name: "Acampamento Seguro", text: "Em 10 minutos prepare descanso protegido: +1d6 PV e +1 PS por personagem no descanso curto; sem surpresa inimiga. 1x por descanso longo." },
          { at: 70, name: "Mestre da Sobrevivência", text: "Aliados em 6 m ignoram terreno difícil, +2 contra perigos ambientais e Resistência 3 contra dano de ambiente. 1x por cena, Intelecto ou Resiliência CD 18 converte falhas coletivas em sucesso." },
        ],
      },
      {
        key: "pesquisador",
        name: "Pesquisador",
        tagline: "Conhecimento histórico, científico e arcano para derrotar o impossível.",
        abilities: [
          { at: 10, name: "Memória Fotográfica", text: "Recorda textos, símbolos, mapas e conversas. 1x por cena: +2 em teste de Intelecto, repita uma pista ou reconstrua um documento observado." },
          { at: 20, name: "Conhecimento Arcano", text: "+2 em Ocultismo e Ritualismo para identificar poderes, elementos, Relíquias, portais e contenção — inclusive o risco de Corrupção aparente." },
          { at: 35, name: "Leitura Instantânea", text: "Ação Principal, Intelecto CD 15: faça 2 perguntas (função, ativação, perigo, criador, desativação, fraqueza). Falha: 1 pergunta e -1 PS se anômalo." },
          { at: 50, name: "Revelação", text: "Por 3 turnos aliados ganham +2 nos ataques contra a criatura analisada e ignoram 3 de Resistência; ela não repete disfarces ou padrões. 1x por cena." },
          { at: 70, name: "Biblioteca Viva", text: "1x por missão: declare estudo prévio e receba informação verdadeira e relevante. Na cena, aliados em 6 m recebem +2 em Intelecto." },
        ],
      },
    ],
  },
};

export function trackById(cls: CharacterClass, trackKey: string): Track | undefined {
  return CLASSES[cls].tracks.find((t) => t.key === trackKey);
}

/** Habilidades de trilha já desbloqueadas pela Assimilação (Corrupção %) atual. */
export function unlockedAbilities(track: Track, corruption: number): TrackAbility[] {
  return track.abilities.filter((a) => corruption >= a.at);
}

// 4.5 Multiclasse
export const MULTICLASS_RULE =
  "Requisitos: nível ≥ 5 e Corrupção ≥ 40%. Custo: perda parcial de Sanidade/PV máximos; ganha habilidades de ambas as classes. Irreversível.";


// No Anomalia Cósmica o valor do atributo JÁ é o bônus somado nos testes.
export function attrModifier(score: number): number {
  return score;
}

/* ---------- Bônus automáticos de Classe (Cap. 4.2) ---------- */

export interface ClassBonuses {
  hp: number;
  sanity: number;
  pa: number;
  defense: number;
  proficiencies: string[];
  recommendedSkills: string[];
  features: { name: string; text: string }[];
}

export const CLASS_BONUSES: Record<CharacterClass, ClassBonuses> = {
  confrontador: {
    hp: 4,
    sanity: 0,
    pa: 0,
    defense: 0,
    proficiencies: [
      "Armas leves, médias e pesadas",
      "Proteções leves, médias e pesadas",
    ],
    recommendedSkills: ["luta", "mira", "atletismo", "vontade"],
    features: [
      {
        name: "Linha de Frente",
        text: "1x por rodada, após acertar um ataque: +1d6 de dano extra ou deslocar-se 3 m sem provocar reações.",
      },
    ],
  },
  condutor: {
    hp: 0,
    sanity: 0,
    pa: 2,
    defense: 0,
    proficiencies: ["Armas leves e simples", "Proteções leves"],
    recommendedSkills: ["ocultismo", "ritualismo", "persuasao"],
    features: [
      {
        name: "Sintonia Elemental",
        text: "Escolha um elemento e aprenda dois poderes de grau 1 associados a ele.",
      },
      {
        name: "Canalização Afinada",
        text: "1x por cena, repita um teste falho para ativar um poder (mantém o segundo resultado).",
      },
    ],
  },
  operador: {
    hp: 0,
    sanity: 0,
    pa: 0,
    defense: 0,
    proficiencies: ["Armas leves e de fogo médias", "Proteções leves"],
    recommendedSkills: ["ocultismo", "furtividade", "mira"],
    features: [
      {
        name: "Conhecimento Técnico",
        text: "+2 em Intelecto para analisar, fabricar, reparar ou operar tecnologia.",
      },
      {
        name: "Inventário Ampliado",
        text: "Mantém um dispositivo tecnológico ativo além do limite normal.",
      },
      {
        name: "Improvisação",
        text: "1x por cena, crie uma ferramenta comum temporária com uma Ação Principal.",
      },
    ],
  },
  sobrevivente: {
    hp: 0,
    sanity: 2,
    pa: 0,
    defense: 0,
    proficiencies: ["Armas simples", "Proteções leves"],
    recommendedSkills: ["vontade", "atletismo", "persuasao"],
    features: [
      {
        name: "Humanidade Preservada",
        text: "Não começa com poderes elementais; suas habilidades normalmente não geram Corrupção.",
      },
      {
        name: "Teimosia Humana",
        text: "1x por cena, repita qualquer teste fracassado (mantém o segundo resultado).",
      },
    ],
  },
};

const NO_BONUS: ClassBonuses = {
  hp: 0,
  sanity: 0,
  pa: 0,
  defense: 0,
  proficiencies: [],
  recommendedSkills: [],
  features: [],
};

export function classBonuses(cls?: CharacterClass | null): ClassBonuses {
  return cls ? CLASS_BONUSES[cls] : NO_BONUS;
}

// Fórmulas oficiais (Cap. 1.6 e 4.1) — já somando os bônus de classe.
export function maxHP(res: number, cls?: CharacterClass | null): number {
  return 10 + res * 2 + classBonuses(cls).hp;
}

export function maxSanity(int: number, cls?: CharacterClass | null): number {
  return 10 + int * 2 + classBonuses(cls).sanity;
}

export function maxPA(int: number, cls?: CharacterClass | null): number {
  return 10 + int * 2 + classBonuses(cls).pa;
}

// Defesa (Cap. 1.5): 10 + Destreza + bônus de armadura + bônus de classe
export function defenseValue(dex: number, armor = 0, cls?: CharacterClass | null): number {
  return 10 + dex + armor + classBonuses(cls).defense;
}

/** Todos os recursos derivados de uma ficha, já com a classe aplicada. */
export function derivedStats(input: {
  res: number;
  int: number;
  dex: number;
  cls?: CharacterClass | null;
  armor?: number;
}) {
  return {
    hp: maxHP(input.res, input.cls),
    sanity: maxSanity(input.int, input.cls),
    pa: maxPA(input.int, input.cls),
    defense: defenseValue(input.dex, input.armor ?? 0, input.cls),
  };
}


export function initiative(dex: number): string {
  return `1d20${dex >= 0 ? "+" : ""}${dex}`;
}

// XP: 500 XP = 1 nível (Cap. 4.3)
export const XP_PER_LEVEL = 500;

// Faixas de corrupção — Cap. 3.4 (Ed. 1.2): 0% a 99%; 100% = Fragmento
export const CORRUPTION_TIERS = [
  { max: 9, name: "Humano", effects: "Nenhum efeito mecânico.", color: "#94a3b8" },
  { max: 19, name: "Eco Sutil", effects: "Olhos brilham; sonhos vívidos.", color: "#84cc16" },
  {
    max: 29,
    name: "Conexão Fraca",
    effects: "Voz distorce; +1 em poderes, -1 em testes sociais.",
    color: "#a3e635",
  },
  {
    max: 39,
    name: "Instabilidade",
    effects: "Percebe presenças; -1 em testes de Sanidade.",
    color: "#facc15",
  },
  {
    max: 49,
    name: "Reação Elemental",
    effects: "Exala propriedades elementais (odor, calor, frio).",
    color: "#fbbf24",
  },
  {
    max: 59,
    name: "Mente Fendida",
    effects: "Risco de Alucinação; testes de PS diários CD 15.",
    color: "#fb923c",
  },
  {
    max: 69,
    name: "Sincronia Parcial",
    effects: "Canaliza poderes de nível superior, mas ganha Corrupção adicional.",
    color: "#f97316",
  },
  {
    max: 79,
    name: "Corpo Mutante",
    effects: "Mutações visíveis; perda de vantagens sociais.",
    color: "#ef4444",
  },
  {
    max: 89,
    name: "Fusão Instável",
    effects: "Descanso penalizado; testes de Sanidade ou perde PV.",
    color: "#dc2626",
  },
  {
    max: 99,
    name: "Hospedeiro",
    effects: "Personalidade partilhada; o Narrador controla o personagem por períodos.",
    color: "#c026d3",
  },
  {
    max: 100,
    name: "Fragmento",
    effects: "Torna-se entidade. Fim do personagem jogável.",
    color: "#a855f7",
  },
] as const;

export function corruptionTier(value: number) {
  return CORRUPTION_TIERS.find((t) => value <= t.max) ?? CORRUPTION_TIERS[0];
}

// Cap. 4.1 — Tabela de Assimilação, grau de poder, custo de PA e Corrupção
export const PA_TABLE = [
  { assimilation: 10, grade: 1, pa: 1, corruption: "+1%" },
  { assimilation: 20, grade: 2, pa: 1, corruption: "+2%" },
  { assimilation: 35, grade: 3, pa: 2, corruption: "+3%" },
  { assimilation: 50, grade: 4, pa: 2, corruption: "+4%" },
  { assimilation: 70, grade: 5, pa: 3, corruption: "+6%" },
] as const;

export const PA_RECOVERY = [
  "Descanso curto (10–15 min): recupera 2 PA.",
  "Descanso longo (8 horas): recupera PA completo.",
  "Meditar com Relíquia sintonizada (Ação Principal): recupera 1 PA.",
  "Força Bruta — usar poder sem PA: Corrupção dobrada sem redução e +3 na CD.",
] as const;

// Cap. 3.2 — Ganho de Corrupção
export const CORRUPTION_GAIN = [
  { event: "Usar poder elemental nível 1–2", value: "+1%" },
  { event: "Usar poder elemental nível 3–4", value: "+2%" },
  { event: "Usar poder elemental nível 5", value: "+3%" },
  { event: "Usar Relíquia sem sincronia", value: "+5%" },
  { event: "Entrar em zona de distorção", value: "+1d4%" },
  { event: "Falha em teste de Sanidade (visão anômala)", value: "+1d4%" },
  { event: "Receber dano espiritual crônico", value: "+1–3%" },
  { event: "Rituais de alto risco / reviver mortos / interferir no tempo", value: "+10%" },
] as const;

// Cap. 3.6 — Redução de Corrupção
export const CORRUPTION_REDUCTION = [
  { method: "Meditação Dimensional (auto)", value: "-1d4%", cost: "Perde 1d6 PS" },
  { method: "Ritual de Harmonização (grupo)", value: "-1d6%", cost: "3 portadores + 1 relíquia, 1 cena" },
  { method: "Selo de Luz", value: "-1d10%", cost: "Incapacitado por cena; exige Lanterna Solar" },
  { method: "Sacrifício Biológico", value: "-1d8%", cost: "Perde PV máx. permanentemente" },
  { method: "Transferência Científica", value: "Até 1d6%", cost: "Alvo: Resiliência CD 20" },
] as const;

export const CORRUPTION_AS_RESOURCE = [
  "Pagar 5% de Corrupção: +50% ao efeito de um poder.",
  "Pagar 10%: ignora custos de Vitalidade para um efeito maior.",
  "Nunca reduz abaixo de 5% por métodos comuns.",
] as const;

// Cap. 1.4 — Custos e recuperação de Sanidade
export const SANITY_COSTS = [
  { event: "Falha em teste de Sanidade", value: "-1 PS" },
  { event: "Ver ou enfrentar anomalia leve", value: "-1 PS" },
  { event: "Ver ou enfrentar anomalia grave", value: "-2 PS" },
  { event: "Contato direto com entidade cósmica", value: "-3 PS" },
  { event: "Usar poder de nível 5 sem controle", value: "-1 PS" },
  { event: "Morte de aliado próximo em cena", value: "-1 PS" },
] as const;

export const SANITY_RECOVERY = [
  { method: "Descanso curto (10–15 min)", value: "+1 PS", condition: "Ambiente seguro" },
  { method: "Descanso longo (8 horas)", value: "+1d4 PS", condition: "Local protegido" },
  { method: "Apoio de aliado (diálogo genuíno)", value: "+1 PS", condition: "1x/sessão por aliado" },
  { method: "Ritual de Harmonização Mental", value: "+1d6 PS", condition: "Requer Éter ou Luz, 1 cena" },
  { method: "Purificação por Relíquia Solar", value: "+2d4 PS", condition: "Lanterna Solar sintonizada" },
  { method: "Conquista narrativa significativa", value: "+1d4 PS", condition: "A critério do Narrador" },
] as const;

// Cap. 2.2 — Condições
export const CONDITIONS = [
  { name: "Atordoado", effect: "Perde a Ação Principal.", duration: "1 turno (Res. CD 10)", removal: "Descanso curto ou cura." },
  { name: "Cego", effect: "-5 em testes visuais.", duration: "Ferimento/efeito", removal: "Remédio ou ritual." },
  { name: "Sangrando", effect: "Perde 1d4 PV por turno.", duration: "Até estancar", removal: "Medicina CD 12." },
  { name: "Enraizado", effect: "Não pode mover-se.", duration: "Força CD 15", removal: "Teste de Força ou perícia." },
  { name: "Corrompido (suave)", effect: "Bônus em ataque, penalidade social.", duration: "Persistente", removal: "Reduzir Corrupção." },
  { name: "Deslocado", effect: "Gravidade instável; -2 Defesa/DES.", duration: "Variável", removal: "Estabilização." },
  { name: "Dominado", effect: "Age conforme o controlador.", duration: "Variável", removal: "Resiliência CD alto ou ritual." },
  { name: "Iludido", effect: "-3 em testes intelectuais.", duration: "Até clarificação", removal: "Efeito revelador." },
  { name: "Assombrado", effect: "-2 em testes mentais.", duration: "Até exorcismo", removal: "Exorcismo ou ritual." },
  { name: "Fragmentado", effect: "Corpo entre planos; vulnerável a Éter.", duration: "Progressiva", removal: "Intervenção drástica." },
] as const;

// Cap. 1.2 — Estrutura de rodada
export const ROUND_RULES = [
  "Cada rodada dura 6 segundos. Iniciativa: 1d20 + Destreza (empate pelo maior Intelecto).",
  "Ação Principal: atacar, usar poder, ritual curto, item anômalo ou Relíquia.",
  "Ação Menor: mover-se, sacar arma, usar item comum ou dispositivo preparado.",
  "Reação: aparar, interromper, contra-atacar (fora do turno).",
  "Deslocamento base 9 m por rodada; correr dobra, terreno difícil reduz à metade.",
] as const;



// Perícias oficiais (Cap. 4.3)
export const SKILLS: { key: string; name: string; attr: AttributeKey }[] = [
  { key: "luta", name: "Luta", attr: "str" },
  { key: "atletismo", name: "Atletismo", attr: "str" },
  { key: "furtividade", name: "Furtividade", attr: "dex" },
  { key: "mira", name: "Mira", attr: "dex" },
  { key: "ocultismo", name: "Ocultismo", attr: "int" },
  { key: "ritualismo", name: "Ritualismo", attr: "int" },
  { key: "persuasao", name: "Persuasão", attr: "cha" },
  { key: "vontade", name: "Resistência/Vontade", attr: "res" },
  { key: "iniciativa", name: "Iniciativa", attr: "dex" },
];

export const DIFFICULTIES = [
  { label: "Fácil", cd: 5 },
  { label: "Moderado", cd: 10 },
  { label: "Difícil", cd: 15 },
  { label: "Muito Difícil", cd: 20 },
  { label: "Sobrenatural", cd: 25 },
] as const;

export function randomInviteCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
