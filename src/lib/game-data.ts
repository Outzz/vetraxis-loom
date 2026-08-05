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

// Classes (Cap. 4.2)
export type CharacterClass = "conduite_fisico" | "condutor_anomalo" | "tecnicista_dimensional";

export const CLASSES: Record<
  CharacterClass,
  {
    name: string;
    tagline: string;
    keyAttrs: AttributeKey[];
    abilities: { level: number; text: string }[];
    tracks: string[];
  }
> = {
  conduite_fisico: {
    name: "Conduíte Físico",
    tagline: "Tanques e frontliners; fundem o corpo com energia elemental.",
    keyAttrs: ["str", "res"],
    abilities: [
      { level: 1, text: "Surgimento do Sangue — ataque imbuído, +1d4 dano elemental" },
      { level: 3, text: "Postura Anômala — +1 Defesa por 2 turnos" },
      { level: 6, text: "Pele de Pedra (Guardião) — regenera 1d4 PV por turno" },
      { level: 9, text: "Título de Protetor — absorve dano por aliado" },
      { level: 10, text: "Despertar: Estigma Vital — regenera PV massivamente, consome Corrupção" },
    ],
    tracks: ["Guardião da Raiz", "Executor Rubro", "Sentinela Solar"],
  },
  condutor_anomalo: {
    name: "Condutor Anômalo",
    tagline: "Controladores, manipuladores do véu.",
    keyAttrs: ["int", "cha"],
    abilities: [
      { level: 1, text: "Canalizar Elemento — usa 1 poder elemental (nível 1)" },
      { level: 3, text: "Foco de Véu — +2 em testes de Ritualismo por 2 turnos" },
      { level: 6, text: "Ruptura Caótica (Prisma) — cria efeitos randômicos" },
      { level: 9, text: "Chamada Etérea — invoca aliado espectral" },
      { level: 10, text: "Despertar: Voz do Véu — ordena entidades, custo massivo de Corrupção" },
    ],
    tracks: ["Portador Prismático", "Invocador Etéreo", "Luminar Celeste"],
  },
  tecnicista_dimensional: {
    name: "Tecnicista Dimensional",
    tagline: "Engenheiros de anomalia, suporte tático.",
    keyAttrs: ["int", "dex"],
    abilities: [
      { level: 1, text: "Montagem Rápida — ativa dispositivo simples" },
      { level: 3, text: "Dispositivo Experimental — arma improvisada com efeito anômalo" },
      { level: 6, text: "Estabilização Temporal — anula uma distorção local" },
      { level: 9, text: "Rede de Sinais — altera campo de batalha (bônus tático)" },
      { level: 10, text: "Despertar: Máquina Viva — artefato de grande poder; risco extremo" },
    ],
    tracks: ["Engenheiro de Dispositivos Arcanos", "Analista Cósmico", "Exilado do Vório"],
  },
};

// No Anomalia Cósmica o valor do atributo JÁ é o bônus somado nos testes.
export function attrModifier(score: number): number {
  return score;
}

// Fórmulas oficiais (Cap. 1.6 e 4.1)
export function maxHP(res: number): number {
  return 10 + res * 2;
}

export function maxSanity(int: number): number {
  return 10 + int * 2;
}

export function maxPA(int: number): number {
  return 10 + int * 2;
}

// Defesa (Cap. 1.5): 10 + Destreza + bônus de armadura
export function defenseValue(dex: number, armor = 0): number {
  return 10 + dex + armor;
}

export function initiative(dex: number): string {
  return `1d20${dex >= 0 ? "+" : ""}${dex}`;
}

// XP: 500 XP = 1 nível (Cap. 4.3)
export const XP_PER_LEVEL = 500;

// Faixas de corrupção — do livro (Cap. 3)
export const CORRUPTION_TIERS = [
  {
    max: 20,
    name: "Tocado",
    effects: "Sonhos vívidos. Visões ocasionais. Sem penalidade mecânica.",
    color: "#84cc16",
  },
  {
    max: 40,
    name: "Marcado",
    effects: "Marcas visíveis na pele. -1 Carisma em situações sociais mundanas.",
    color: "#facc15",
  },
  {
    max: 60,
    name: "Distorcido",
    effects: "Percepção alterada. -2 em Sanidade. +1d4 de dano anômalo.",
    color: "#fb923c",
  },
  {
    max: 80,
    name: "Consumido",
    effects:
      "Corpo se transforma. -3 Sanidade máx. Ganha um Poder Anômalo (Mestre define).",
    color: "#ef4444",
  },
  {
    max: 100,
    name: "Anomalia Viva",
    effects:
      "Deixa de ser humano. O personagem passa ao controle do Mestre — tornou-se uma entidade.",
    color: "#a855f7",
  },
] as const;

export function corruptionTier(value: number) {
  return CORRUPTION_TIERS.find((t) => value <= t.max) ?? CORRUPTION_TIERS[0];
}

// Perícias padrão do livro
export const SKILLS: { key: string; name: string; attr: AttributeKey }[] = [
  { key: "atletismo", name: "Atletismo", attr: "str" },
  { key: "acrobacia", name: "Acrobacia", attr: "dex" },
  { key: "furtividade", name: "Furtividade", attr: "dex" },
  { key: "prestidigitacao", name: "Prestidigitação", attr: "dex" },
  { key: "arcano", name: "Arcano", attr: "int" },
  { key: "investigacao", name: "Investigação", attr: "int" },
  { key: "medicina", name: "Medicina", attr: "int" },
  { key: "ritual", name: "Ritual", attr: "int" },
  { key: "sobrevivencia", name: "Sobrevivência", attr: "res" },
  { key: "intimidacao", name: "Intimidação", attr: "cha" },
  { key: "persuasao", name: "Persuasão", attr: "cha" },
  { key: "enganacao", name: "Enganação", attr: "cha" },
  { key: "percepcao", name: "Percepção", attr: "per" },
  { key: "intuicao", name: "Intuição", attr: "per" },
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
