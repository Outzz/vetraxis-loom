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

export type AttributeKey = "str" | "dex" | "int" | "res" | "cha" | "per";

export const ATTRIBUTES: Record<
  AttributeKey,
  { name: string; short: string; description: string }
> = {
  str: {
    name: "Força",
    short: "FOR",
    description: "Poder físico bruto. Dano corpo a corpo, carga, esmagar.",
  },
  dex: {
    name: "Destreza",
    short: "DES",
    description: "Agilidade e reflexos. Iniciativa, esquiva, ataques ágeis.",
  },
  int: {
    name: "Intelecto",
    short: "INT",
    description: "Raciocínio e memória. Testes de Sanidade, arcano, análise.",
  },
  res: {
    name: "Resiliência",
    short: "RES",
    description: "Vontade e vigor. Testes de Corrupção, resistência a dano.",
  },
  cha: {
    name: "Carisma",
    short: "CAR",
    description: "Presença e persuasão. Interação com PNs, liderança.",
  },
  per: {
    name: "Percepção",
    short: "PER",
    description: "Sentidos aguçados. Notar, rastrear, sentir anomalias.",
  },
};

// Modificador clássico: (atributo - 10) / 2 arredondado para baixo
export function attrModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Fórmulas derivadas do livro
export function maxHP(res: number, level: number): number {
  return 10 + attrModifier(res) * 2 + (level - 1) * 4;
}

export function maxSanity(int: number, res: number, level: number): number {
  return 10 + attrModifier(int) + attrModifier(res) + Math.floor(level / 2);
}

export function maxPA(level: number): number {
  // Livro: PA base cresce lentamente. 3 no nível 1, +1 a cada 3 níveis.
  return 3 + Math.floor((level - 1) / 3);
}

export function initiative(dex: number): string {
  const mod = attrModifier(dex);
  return `1d20${mod >= 0 ? "+" : ""}${mod}`;
}

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
