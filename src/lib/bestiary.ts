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
  image?: string | null;
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
      { name: "Frágil", description: "Dano contundente causa +1 passo contra o Estilhaço." },
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
      { name: "Sopro de Cinzas", roll: "DT 7 Físico + Acrobacia", damage: "3d6 fogo (cone 6m)", note: "1x por cena." },
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
      { name: "Silêncio Cósmico", description: "Anula sons num raio de 9m. Testes de Percepção com −1 passo." },
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
      { name: "Julgamento", roll: "DT 8 Físico + Vigor", damage: "4d8 radiante", note: "Só contra alvos com Corrupção ≥ 40." },
    ],
    traits: [
      { name: "Imparcial", description: "Ignora criaturas com Corrupção 0. Não pode ser enganado." },
      { name: "Aura Ofuscante", description: "Inimigos a 6m sofrem -1 passo em ataques à distância." },
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
      { name: "Tentáculo Lenhoso", roll: "+7", damage: "2d8+5 contundente", note: "Agarra (DT 8 Físico + Atletismo)." },
      { name: "Esporo Antigo", roll: "DT 7 Físico + Vigor", damage: "2d6 veneno/rodada", note: "Área 9m, 3 rodadas." },
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
      { name: "Lamento", roll: "DT 8 Emoção + Disciplina", damage: "3d6 PS", note: "Todos que ouvem, sem limite de alcance." },
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
      { name: "Troca", roll: "DT 9 Físico + Vigor", damage: "—", note: "Assume o lugar do alvo por 1 rodada." },
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
      { name: "Hospedeiro", description: "Removida com Mente + Medicina DT 8 ou Bruxaria DT 6." },
      { name: "Sussurro Interno", description: "O hospedeiro tem −1 passo em testes de Sanidade." },
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
      { name: "Abrir Fenda", roll: "DT 10 Físico + Vigor", damage: "6d8 + banimento", note: "Falha crítica: alvo desaparece da cena." },
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
      { name: "Fio Onírico", roll: "+8", damage: "2d8+3 psíquico", note: "Alvo adormece (DT 8 Físico + Vigor)." },
      { name: "Pesadelo Vivo", roll: "DT 9 Emoção + Disciplina", damage: "4d6 PS", note: "Só contra alvos adormecidos." },
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
      { name: "Repelir", roll: "DT 7 Físico + Atletismo", damage: "1d6", note: "Empurra 6m." },
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
      { name: "Escavador", description: "Move-se 6m sob a terra sem ser detectado (Percepção DT 7)." },
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
      { name: "Nome Verdadeiro", roll: "DT 10 Físico + Vigor", damage: "5d10 psíquico", note: "Falha: alvo perde 1 perícia até descanso longo." },
      { name: "Fragmentar", roll: "+11", damage: "3d12+6 prismático", note: "Ignora 4 de CA." },
    ],
    traits: [
      { name: "Onisciente Local", description: "Conhece o histórico e os medos de cada Portador em cena." },
      { name: "Não Pode Ser Surpreendido", description: "Age sempre primeiro na rodada." },
      { name: "Verdade Absoluta", description: "Qualquer mentira dita perto dele causa 2d6 PS ao mentiroso." },
    ],
    lore: "Ele diz o seu nome. E você descobre que nunca foi esse.",
  },
  {
    id: "afogado",
    name: "Afogado",
    epithet: "Respira-Vazio",
    threat: "moderada",
    element: "nebulosa",
    behavior: "emboscador",
    hp: 72,
    ca: 14,
    initiative: "1d20+4",
    sanityDC: 15,
    corruption: 2,
    attacks: [
      { name: "Garra", roll: "+5", damage: "2d6+3", note: "Corpo a corpo" },
      { name: "Pressão", roll: "+5", damage: "2d8+3", note: "Movimento reduzido" },
      { name: "Arrasto", roll: "+4", damage: "1d8+2", note: "Puxa 4 m" },
    ],
    traits: [
      {
        name: "Afogamento Seco",
        description:
          "Criaturas a até 6 m testam no início do turno. Falhas geram marcadores de Afogamento: 3 marcadores = -1 passo em testes físicos; 5 marcadores = 1d6 de dano por rodada.",
      },
      {
        name: "Maré Invertida",
        description: "A cada 3 rodadas, todas as criaturas num raio de 5 m são puxadas 3 m em direção ao Afogado.",
      },
      {
        name: "Imóvel nas Águas",
        description: "Enquanto não tiver sido detectado, recebe +1 dado adicional no primeiro ataque.",
      },
    ],
    lore: "Seus movimentos parecem ocorrer debaixo d'água. Onde ele chega, a pressão aumenta e os pulmões se enchem de algo que não existe.",
  },
  {
    id: "cinzento",
    name: "Cinzento",
    epithet: "Pastor de Cinzas",
    threat: "severa",
    element: "chama",
    behavior: "enxame",
    hp: 120,
    ca: 15,
    initiative: "1d20+5",
    sanityDC: 16,
    corruption: 3,
    attacks: [
      { name: "Mão Ardente", roll: "+7", damage: "2d10+3", note: "Corpo a corpo" },
      { name: "Sopro", roll: "+6", damage: "3d6", note: "Cone de 5 m" },
      { name: "Carbonizar", roll: "+7", damage: "2d8+4", note: "Aplica Queimadura" },
    ],
    traits: [
      {
        name: "Rebanho",
        description:
          "Cria um Servo de Cinzas quando uma criatura morre próxima ou sofre grande dano de Chama. Máximo de 4 servos. Servo: PV 10, CA 12, ataque +3, dano 1d6+1.",
      },
      { name: "Cinzas Explosivas", description: "Quando um Servo é destruído, criaturas num raio de 2 m sofrem 1d8." },
      { name: "Corpo Carbonizado", description: "Recebe metade do dano de Chama." },
    ],
    lore: "Uma figura carbonizada coberta de cinzas. Cada criatura que caminha ao seu redor já foi alguém.",
  },
  {
    id: "fotofago",
    name: "Fotófago",
    epithet: "Devora-Luz",
    threat: "moderada",
    element: "luz",
    behavior: "predador",
    hp: 65,
    ca: 15,
    initiative: "1d20+6",
    sanityDC: 14,
    corruption: 2,
    attacks: [
      { name: "Mordida", roll: "+6", damage: "2d8+3", note: "Corpo a corpo" },
      { name: "Clarão Reverso", roll: "+5", damage: "2d6+2", note: "Sanidade DT 7" },
      { name: "Garra", roll: "+5", damage: "2d6+3", note: "Corpo a corpo" },
    ],
    traits: [
      { name: "Devorar Luz", description: "Destrói uma fonte de iluminação próxima e recupera 1d8+3 PV." },
      { name: "Fome Luminosa", description: "Depois de consumir uma fonte, seu próximo ataque causa +1d6." },
      {
        name: "Predador Escuro",
        description: "Em escuridão total recebe +1 passo em iniciativa e em testes de aproximação furtiva.",
      },
    ],
    lore: "Não procura carne: procura iluminação. Conforme a luz some do ambiente, pontos luminosos surgem dentro dele.",
  },
  {
    id: "duplo",
    name: "Duplo",
    epithet: "Rosto Roubado",
    threat: "moderada",
    element: "sombra",
    behavior: "manipulador",
    hp: 60,
    ca: 15,
    initiative: "1d20+5",
    sanityDC: 16,
    corruption: 2,
    attacks: [
      { name: "Garra", roll: "+5", damage: "2d6+3", note: "Forma verdadeira" },
      { name: "Golpe Copiado", roll: "+5", damage: "até 2d8+3", note: "Replica ataque observado" },
      { name: "Investida", roll: "+5", damage: "1d10+3", note: "Derruba em falha" },
    ],
    traits: [
      { name: "Imitação", description: "Após observar uma criatura por 1 minuto, copia sua aparência e voz." },
      {
        name: "Rosto Conhecido",
        description: "Atacar um Duplo imitando alguém conhecido exige Sanidade DT 8. Falha perde o ataque.",
      },
      { name: "Aprendizado", description: "Pode copiar um ataque físico simples que tenha presenciado." },
      { name: "Imperfeição", description: "Investigação cuidadosa revela pequenos erros na imitação." },
    ],
    lore: "O sorriso dura demais. Os olhos acompanham rápido demais. E às vezes ele sabe o que nunca deveria saber.",
  },
  {
    id: "colmeia",
    name: "Colmeia",
    epithet: "Muitos em Um",
    threat: "cataclismica",
    element: "raiz",
    behavior: "enxame",
    hp: 240,
    ca: 18,
    initiative: "1d20+4",
    sanityDC: 19,
    corruption: 5,
    attacks: [
      { name: "Braço Coletivo", roll: "+9", damage: "3d10+5", note: "Corpo a corpo" },
      { name: "Mordidas", roll: "+8", damage: "4d6+4", note: "Múltiplas bocas" },
      { name: "Investida", roll: "+8", damage: "3d8+5", note: "Pode derrubar" },
    ],
    traits: [
      {
        name: "Corpo Plural",
        description: "A cada 60 PV perdidos, desprende um Fragmento: PV 20, CA 13, ataque +5, dano 1d8+2.",
      },
      {
        name: "Território Vivo",
        description: "O solo num raio de 10 m vira extensão orgânica da criatura e conta como terreno difícil.",
      },
      { name: "Coro", description: "Quando a Colmeia é revelada, todos fazem Sanidade DT 10." },
      { name: "Muitos Olhos", description: "Não pode ser flanqueada." },
    ],
    lore: "Uma comunidade de corpos que perderam a individualidade. Quando uma parte morre, outra assume sua função.",
  },
  {
    id: "intervalo",
    name: "Intervalo",
    epithet: "Entre Olhares",
    threat: "severa",
    element: "eter",
    behavior: "emboscador",
    hp: 85,
    ca: 18,
    initiative: "1d20+9",
    sanityDC: 17,
    corruption: 3,
    attacks: [
      { name: "Lacuna", roll: "+8", damage: "3d8+4", note: "Ataque principal" },
      { name: "Mão Fria", roll: "+7", damage: "2d8+3", note: "Corpo a corpo" },
      { name: "Aparição", roll: "+8", damage: "2d6+4", note: "Bônus se surgir atrás" },
    ],
    traits: [
      {
        name: "Entre Quadros",
        description: "Se ninguém olhar diretamente para ele no fim da rodada, desloca-se instantaneamente até 12 m.",
      },
      { name: "Não Pisque", description: "Com duas criaturas o observando diretamente, Entre Quadros fica bloqueado." },
      { name: "Ataque Invisível", description: "Ao aparecer atrás de uma criatura causa +1d8." },
    ],
    lore: "Numa foto está no fim do corredor; na seguinte, a poucos metros. Nenhuma imagem mostra o trajeto.",
  },
  {
    id: "lamento",
    name: "Lamento",
    epithet: "Voz Errada",
    threat: "moderada",
    element: "nebulosa",
    behavior: "manipulador",
    hp: 75,
    ca: 14,
    initiative: "1d20+4",
    sanityDC: 15,
    corruption: 2,
    attacks: [
      { name: "Garra", roll: "+5", damage: "2d6+2", note: "Corpo a corpo" },
      { name: "Grito", roll: "DT 8", damage: "2d8", note: "Desorientação" },
      { name: "Impacto Sonoro", roll: "+5", damage: "1d10+3", note: "Empurra 2 m" },
    ],
    traits: [
      { name: "Eco Invertido", description: "Dentro de 10 m, ataques à distância recebem -2." },
      { name: "Sem Norte", description: "Quem falhar contra Grito perde reações até seu próximo turno." },
      {
        name: "Lamento Crescente",
        description: "Grito em rodadas consecutivas causa +1d6. O bônus some se a sequência for interrompida.",
      },
    ],
    lore: "Depois de ouvi-lo, passos atrás parecem vir da frente e um aliado à esquerda parece estar à direita.",
  },
  {
    id: "inacabado",
    name: "Inacabado",
    epithet: "Corpo Incompleto",
    threat: "severa",
    element: "prisma",
    behavior: "parasita",
    hp: 130,
    ca: 16,
    initiative: "1d20+5",
    sanityDC: 17,
    corruption: 4,
    attacks: [
      { name: "Membro Novo", roll: "+7", damage: "2d10+4", note: "Alcance variável" },
      { name: "Mordida", roll: "+7", damage: "2d8+4", note: "Copia características" },
      { name: "Ossos", roll: "+6", damage: "3d6+3", note: "Ataque perfurante" },
    ],
    traits: [
      {
        name: "Aprendizado Orgânico",
        description: "Ao receber o mesmo tipo de ataque duas vezes seguidas, ganha +2 CA contra ele. Técnica diferente remove a adaptação.",
      },
      {
        name: "Roubo de Forma",
        description: "Após ferir corpo a corpo, ganha +2 m de movimento, +1 CA ou +2 de dano. Máximo de 3 adaptações.",
      },
      { name: "Muda", description: "Ao chegar à metade dos PV, reorganiza a anatomia e recupera 20 PV." },
    ],
    lore: "Seu organismo parece convencido de que ainda não terminou de ser criado. Ele aprende com os corpos que derruba.",
  },
  {
    id: "silente",
    name: "Silente",
    epithet: "Som Morto",
    threat: "severa",
    element: "sombra",
    behavior: "emboscador",
    hp: 105,
    ca: 17,
    initiative: "1d20+6",
    sanityDC: 17,
    corruption: 4,
    attacks: [
      { name: "Toque Mudo", roll: "+7", damage: "2d8+4", note: "Corpo a corpo" },
      { name: "Garra", roll: "+7", damage: "3d6+3", note: "Ataque principal" },
      { name: "Aproximação", roll: "+8", damage: "2d8+3", note: "Contra alvo isolado" },
    ],
    traits: [
      {
        name: "Zona Muda",
        description: "Cria silêncio absoluto num raio de 8 m; falas, gritos e habilidades de voz não funcionam.",
      },
      { name: "Ela Escuta", description: "Se alguém tentar falar na Zona Muda, Silente sabe onde essa criatura está." },
      { name: "Caçada Silenciosa", description: "Contra criatura isolada recebe +1 passo nas rolagens de ataque." },
    ],
    lore: "Primeiro somem os sons distantes, depois os passos, depois a respiração. Aí ele já está dentro da sala.",
  },
  {
    id: "reflexo",
    name: "Reflexo",
    epithet: "Golpe Anterior",
    threat: "severa",
    element: "prisma",
    behavior: "predador",
    hp: 110,
    ca: 17,
    initiative: "1d20+8",
    sanityDC: 15,
    corruption: 3,
    attacks: [
      { name: "Contra-Golpe", roll: "+8", damage: "2d10+4", note: "Reação" },
      { name: "Impacto", roll: "+7", damage: "2d8+3", note: "Corpo a corpo" },
      { name: "Corte Adaptado", roll: "+7", damage: "3d6+3", note: "Muda conforme o alvo" },
    ],
    traits: [
      {
        name: "Padrão Aprendido",
        description: "Cada repetição do mesmo ataque concede +2 CA contra aquela técnica (máx. +6). Ação diferente reinicia.",
      },
      {
        name: "Contra-Movimento",
        description: "Após ver uma técnica duas vezes, usa reação para atacar quem tentar repeti-la.",
      },
      {
        name: "Espelho Ofensivo",
        description: "1x por combate, seu próximo ataque usa o mesmo tipo de dano do último golpe recebido.",
      },
    ],
    lore: "Quanto mais previsível o adversário se torna, mais perigoso Reflexo fica.",
  },
  {
    id: "precursor",
    name: "Precursor",
    epithet: "Lembra Amanhã",
    threat: "cataclismica",
    element: "eter",
    behavior: "errante",
    hp: 190,
    ca: 19,
    initiative: "1d20+10",
    sanityDC: 20,
    corruption: 5,
    attacks: [
      { name: "Golpe Previsto", roll: "+10", damage: "3d10+5", note: "Corpo a corpo" },
      { name: "Ruptura Futura", roll: "+9", damage: "4d8+3", note: "Ataque de Éter" },
      { name: "Toque do Amanhã", roll: "+9", damage: "2d10+4", note: "-2 iniciativa" },
    ],
    traits: [
      {
        name: "Antes de Acontecer",
        description: "1x por rodada, força um atacante a repetir a rolagem e usar o pior resultado.",
      },
      { name: "Eu Já Vi Isso", description: "Se uma criatura repetir a ação do turno anterior, ganha +3 CA contra ela." },
      {
        name: "Profecia",
        description: "No começo da rodada o Mestre escolhe secretamente um personagem; se ele atacar, Precursor desloca-se 5 m imediatamente.",
      },
      {
        name: "Acontecimento Inevitável",
        description: "Ao chegar a 50 PV, todos fazem Sanidade DT 10. Quem falhar vê seu futuro e sofre -1 passo na próxima ação.",
      },
      {
        name: "Últimas Palavras",
        description: "Ao ser derrotado, permanece consciente por segundos e revela uma pista sobre o futuro da campanha.",
      },
    ],
    lore: "Ele pergunta se você ainda tem esse braço. Talvez não preveja o futuro — talvez esteja lembrando dele.",
  },
];

export function creatureById(id: string) {
  return CREATURES.find((c) => c.id === id);
}
