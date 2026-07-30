// Anomalia Cósmica RPG — Bestiário de Vetraxis
import type { CosmicElement } from "./game-data";

export type ThreatLevel = "menor" | "moderada" | "severa" | "cataclismica";

export type Behavior =
  | "predador"
  | "emboscador"
  | "enxame"
  | "guardiao"
  | "parasita"
  | "manipulador"
  | "errante";

export const THREATS: Record<
  ThreatLevel,
  { name: string; color: string; note: string }
> = {
  menor: { name: "Menor", color: "#84cc16", note: "Anomalia instável, perigo isolado." },
  moderada: { name: "Moderada", color: "#facc15", note: "Ameaça a um grupo despreparado." },
  severa: { name: "Severa", color: "#fb923c", note: "Capaz de dizimar Portadores experientes." },
  cataclismica: {
    name: "Cataclísmica",
    color: "#a855f7",
    note: "Reescreve a realidade ao redor. Evento de campanha.",
  },
};

export const BEHAVIORS: Record<Behavior, { name: string; description: string }> = {
  predador: { name: "Predador", description: "Caça ativamente, persegue até o fim." },
  emboscador: { name: "Emboscador", description: "Ataca de surpresa e recua." },
  enxame: { name: "Enxame", description: "Age em massa, sobrepuja por número." },
  guardiao: { name: "Guardião", description: "Protege um local ou objeto; só ataca se provocado." },
  parasita: { name: "Parasita", description: "Busca hospedeiros; corrompe por dentro." },
  manipulador: { name: "Manipulador", description: "Usa mente, ilusão e barganha." },
  errante: { name: "Errante", description: "Vaga sem propósito aparente; reage ao acaso." },
};

export type Creature = {
  id: string;
  name: string;
  epithet: string;
  threat: ThreatLevel;
  element: CosmicElement;
  behavior: Behavior;
  hp: number;
  ca: number;
  initiative: string;
  sanityDC: number;
  corruption: number;
  attacks: { name: string; roll: string; damage: string; note?: string }[];
  traits: { name: string; description: string }[];
  lore: string;
};

export const CREATURES: Creature[] = [
  {
    id: "estilhaco-vivo",
    name: "Estilhaço Vivo",
    epithet: "Caco que Recorda",
    threat: "menor",
    element: "prisma",
    behavior: "errante",
    hp: 14,
    ca: 13,
    initiative: "1d20+2",
    sanityDC: 8,
    corruption: 1,
    attacks: [
      { name: "Corte Refratado", roll: "+4", damage: "1d6+2 prismático", note: "Ignora 2 de CA." },
    ],
    traits: [
      {
        name: "Reflexo Espelhado",
        description: "Ao ser atingido, devolve 1d4 de dano prismático ao atacante adjacente.",
      },
      { name: "Frágil", description: "Dano contundente causa +2 contra o Estilhaço." },
    ],
    lore: "Fragmento de um Portador morto. Ainda repete o último gesto que fez em vida.",
  },
  {
    id: "cinzavivo",
    name: "Cinzavivo",
    epithet: "Brasa que Odeia",
    threat: "moderada",
    element: "chama",
    behavior: "predador",
    hp: 32,
    ca: 14,
    initiative: "1d20+3",
    sanityDC: 10,
    corruption: 2,
    attacks: [
      { name: "Garra Incandescente", roll: "+6", damage: "2d6+3 fogo" },
      { name: "Sopro de Cinzas", roll: "CD 13 DES", damage: "3d6 fogo (cone 6m)", note: "1x por cena." },
    ],
    traits: [
      {
        name: "Fúria Crescente",
        description: "A cada 10 PV perdidos, ganha +1d4 de dano e +5m de deslocamento.",
      },
      { name: "Vulnerável ao Vazio", description: "Sofre dano dobrado de efeitos de Nebulosa." },
    ],
    lore: "Nasce onde alguém morreu gritando. A chama guarda o rancor que o corpo não conseguiu.",
  },
  {
    id: "sopro-oco",
    name: "Sopro Oco",
    epithet: "O Que Falta no Ar",
    threat: "moderada",
    element: "nebulosa",
    behavior: "emboscador",
    hp: 26,
    ca: 16,
    initiative: "1d20+5",
    sanityDC: 12,
    corruption: 3,
    attacks: [
      { name: "Sucção", roll: "+5", damage: "1d8+3 + 1d4 PS", note: "Alvo fica sem fôlego (-1 PA)." },
    ],
    traits: [
      { name: "Incorpóreo Parcial", description: "Atravessa paredes finas; imune a dano físico não-anômalo." },
      { name: "Silêncio Cósmico", description: "Anula sons num raio de 9m. Testes de Percepção com desvantagem." },
    ],
    lore: "Não é criatura: é uma ausência que aprendeu a se mover.",
  },
  {
    id: "vigia-solar",
    name: "Vigia Solar",
    epithet: "Sentinela Cega",
    threat: "severa",
    element: "luz",
    behavior: "guardiao",
    hp: 58,
    ca: 18,
    initiative: "1d20+1",
    sanityDC: 14,
    corruption: 4,
    attacks: [
      { name: "Lança de Aurora", roll: "+8", damage: "2d10+4 radiante" },
      { name: "Julgamento", roll: "CD 16 RES", damage: "4d8 radiante", note: "Só contra alvos com Corrupção ≥ 40." },
    ],
    traits: [
      { name: "Imparcial", description: "Ignora criaturas com Corrupção 0. Não pode ser enganado." },
      { name: "Aura Ofuscante", description: "Inimigos a 6m sofrem -2 em ataques à distância." },
    ],
    lore: "Foi colocado ali para proteger algo. Ninguém lembra o quê — nem ele.",
  },
  {
    id: "raizmae",
    name: "Raiz-Mãe",
    epithet: "A Que Cresce por Baixo",
    threat: "severa",
    element: "raiz",
    behavior: "guardiao",
    hp: 76,
    ca: 15,
    initiative: "1d20-1",
    sanityDC: 13,
    corruption: 5,
    attacks: [
      { name: "Tentáculo Lenhoso", roll: "+7", damage: "2d8+5 contundente", note: "Agarra (CD 15 FOR)." },
      { name: "Esporo Antigo", roll: "CD 14 RES", damage: "2d6 veneno/rodada", note: "Área 9m, 3 rodadas." },
    ],
    traits: [
      { name: "Regeneração", description: "Recupera 1d8 PV por rodada enquanto tocar solo natural." },
      { name: "Memória do Planeta", description: "Sabe tudo que aconteceu no terreno em que cresce." },
    ],
    lore: "Vetraxis não a criou. Ela é Vetraxis lembrando que está viva.",
  },
  {
    id: "coro-de-ecos",
    name: "Coro de Ecos",
    epithet: "Os Que Não Calaram",
    threat: "moderada",
    element: "eter",
    behavior: "enxame",
    hp: 40,
    ca: 13,
    initiative: "1d20+4",
    sanityDC: 15,
    corruption: 4,
    attacks: [
      { name: "Lamento", roll: "CD 15 INT", damage: "3d6 PS", note: "Todos que ouvem, sem limite de alcance." },
      { name: "Mãos de Névoa", roll: "+4", damage: "1d6 necrótico por espírito (até 4)" },
    ],
    traits: [
      { name: "Divisível", description: "Ao sofrer dano em área, divide-se em dois ecos com metade dos PV." },
      { name: "Vinculado", description: "Só é destruído permanentemente se o corpo original for sepultado." },
    ],
    lore: "Chamam pelo seu nome com a voz de quem você enterrou.",
  },
  {
    id: "reflexo-faminto",
    name: "Reflexo Faminto",
    epithet: "Você, Um Passo Atrás",
    threat: "severa",
    element: "sombra",
    behavior: "manipulador",
    hp: 48,
    ca: 17,
    initiative: "1d20+6",
    sanityDC: 16,
    corruption: 6,
    attacks: [
      { name: "Punhal do Eu", roll: "+9", damage: "3d6+4 perfurante", note: "+2d6 se estava oculto." },
      { name: "Troca", roll: "CD 17 RES", damage: "—", note: "Assume o lugar do alvo por 1 rodada." },
    ],
    traits: [
      { name: "Cópia", description: "Usa a maior perícia do alvo como se fosse sua." },
      { name: "Regeneração Sombria", description: "Recupera 1d4 PV por turno enquanto oculto." },
    ],
    lore: "Não quer te matar. Quer o seu lugar — e está disposto a esperar.",
  },
  {
    id: "larva-do-prisma",
    name: "Larva do Prisma",
    epithet: "Semente de Verdade",
    threat: "menor",
    element: "prisma",
    behavior: "parasita",
    hp: 10,
    ca: 12,
    initiative: "1d20+3",
    sanityDC: 9,
    corruption: 3,
    attacks: [
      { name: "Enterrar-se", roll: "+5", damage: "1d4", note: "Se acertar, hospeda-se: +1 Corrupção/dia." },
    ],
    traits: [
      { name: "Hospedeiro", description: "Removida com Medicina CD 15 ou Ritual CD 12." },
      { name: "Sussurro Interno", description: "O hospedeiro tem desvantagem em testes de Sanidade." },
    ],
    lore: "Ela não mente. É esse o problema.",
  },
  {
    id: "arauto-da-fenda",
    name: "Arauto da Fenda",
    epithet: "A Boca do Vazio",
    threat: "cataclismica",
    element: "nebulosa",
    behavior: "predador",
    hp: 140,
    ca: 20,
    initiative: "1d20+7",
    sanityDC: 20,
    corruption: 10,
    attacks: [
      { name: "Colapso", roll: "+12", damage: "4d10+8 anômalo" },
      { name: "Abrir Fenda", roll: "CD 19 RES", damage: "6d8 + banimento", note: "Falha crítica: alvo desaparece da cena." },
    ],
    traits: [
      { name: "Presença Impossível", description: "Todos em cena repetem teste de Sanidade a cada rodada." },
      { name: "Reescrita", description: "1x por combate, desfaz a última rodada de ações dos Portadores." },
      { name: "Imune", description: "Imune a dano não-anômalo e a efeitos de controle." },
    ],
    lore: "Quando ele chega, a campanha muda. Sempre.",
  },
  {
    id: "peregrino-de-cinzas",
    name: "Peregrino de Cinzas",
    epithet: "O Que Anda Sem Chegar",
    threat: "menor",
    element: "chama",
    behavior: "errante",
    hp: 18,
    ca: 12,
    initiative: "1d20+0",
    sanityDC: 10,
    corruption: 2,
    attacks: [{ name: "Toque Ardente", roll: "+3", damage: "1d8 fogo" }],
    traits: [
      { name: "Indiferente", description: "Só ataca quem bloquear seu caminho." },
      { name: "Rastro", description: "Deixa cinzas quentes: 1d4 de dano a quem pisar." },
    ],
    lore: "Perguntaram para onde ia. Ele respondeu 'ainda'.",
  },
  {
    id: "tecela-de-sono",
    name: "Tecelã de Sono",
    epithet: "Aquela que Costura Noites",
    threat: "severa",
    element: "eter",
    behavior: "manipulador",
    hp: 54,
    ca: 16,
    initiative: "1d20+5",
    sanityDC: 17,
    corruption: 7,
    attacks: [
      { name: "Fio Onírico", roll: "+8", damage: "2d8+3 psíquico", note: "Alvo adormece (CD 16 RES)." },
      { name: "Pesadelo Vivo", roll: "CD 17 INT", damage: "4d6 PS", note: "Só contra alvos adormecidos." },
    ],
    traits: [
      { name: "Domínio do Sonho", description: "Dentro de um sonho, tem CA 22 e regenera 2d6/rodada." },
      { name: "Barganha", description: "Oferece um desejo. Custa 10 de Corrupção." },
    ],
    lore: "Todo mundo dorme. É só isso que ela precisa de você.",
  },
  {
    id: "enxame-de-lascas",
    name: "Enxame de Lascas",
    epithet: "Mil Bordas",
    threat: "moderada",
    element: "sombra",
    behavior: "enxame",
    hp: 36,
    ca: 15,
    initiative: "1d20+4",
    sanityDC: 11,
    corruption: 3,
    attacks: [
      { name: "Maré Cortante", roll: "+6", damage: "3d4+2 cortante", note: "Atinge todos no espaço ocupado." },
    ],
    traits: [
      { name: "Forma de Enxame", description: "Resistência a dano de arma; vulnerável a dano em área." },
      { name: "Ocupação", description: "Pode ocupar o mesmo espaço que criaturas." },
    ],
    lore: "Um espelho que se quebrou com raiva, e não parou de quebrar.",
  },
  {
    id: "guarda-de-osso-branco",
    name: "Guarda de Osso Branco",
    epithet: "Fé Petrificada",
    threat: "moderada",
    element: "luz",
    behavior: "guardiao",
    hp: 44,
    ca: 17,
    initiative: "1d20+1",
    sanityDC: 11,
    corruption: 2,
    attacks: [
      { name: "Malho Sagrado", roll: "+7", damage: "2d8+4 contundente" },
      { name: "Repelir", roll: "CD 14 FOR", damage: "1d6", note: "Empurra 6m." },
    ],
    traits: [
      { name: "Postura Inabalável", description: "Imune a Empurrão e a medo." },
      { name: "Ordem", description: "Nunca persegue além de 12m do que protege." },
    ],
    lore: "Continua de guarda. O templo caiu há trezentos anos.",
  },
  {
    id: "verme-da-seiva",
    name: "Verme da Seiva",
    epithet: "Fome de Raiz",
    threat: "menor",
    element: "raiz",
    behavior: "parasita",
    hp: 16,
    ca: 11,
    initiative: "1d20+2",
    sanityDC: 8,
    corruption: 1,
    attacks: [
      { name: "Mordida Sugadora", roll: "+4", damage: "1d6+2", note: "Cura o verme no mesmo valor." },
    ],
    traits: [
      { name: "Escavador", description: "Move-se 6m sob a terra sem ser detectado (Percepção CD 14)." },
      { name: "Infestação", description: "Se ignorado por 3 rodadas, chama 1d4 vermes." },
    ],
    lore: "Onde há um, há sempre um ninho — e o ninho está com fome há mais tempo.",
  },
  {
    id: "aquele-que-nomeia",
    name: "Aquele que Nomeia",
    epithet: "A Última Palavra",
    threat: "cataclismica",
    element: "prisma",
    behavior: "manipulador",
    hp: 120,
    ca: 19,
    initiative: "1d20+8",
    sanityDC: 22,
    corruption: 12,
    attacks: [
      { name: "Nome Verdadeiro", roll: "CD 20 RES", damage: "5d10 psíquico", note: "Falha: alvo perde 1 perícia até descanso longo." },
      { name: "Fragmentar", roll: "+11", damage: "3d12+6 prismático", note: "Ignora 4 de CA." },
    ],
    traits: [
      { name: "Onisciente Local", description: "Conhece o histórico e os medos de cada Portador em cena." },
      { name: "Não Pode Ser Surpreendido", description: "Age sempre primeiro na rodada." },
      { name: "Verdade Absoluta", description: "Qualquer mentira dita perto dele causa 2d6 PS ao mentiroso." },
    ],
    lore: "Ele diz o seu nome. E você descobre que nunca foi esse.",
  },
];

export function creatureById(id: string) {
  return CREATURES.find((c) => c.id === id);
}
