# Cosmic Anomaly Nexus

Desenvolva um sistema web completo para o RPG "Anomalia Cósmica"

Crie uma aplicação web moderna chamada Anomalia Cósmica RPG, baseada no universo de Vetraxis, um planeta vivo onde anomalias cósmicas alteram a realidade. O sistema deve transmitir uma atmosfera de horror cósmico, mistério e tecnologia sobrenatural.

O objetivo é substituir fichas em papel, automatizar as mecânicas do sistema e oferecer uma plataforma completa para Mestres e Jogadores.

Estilo Visual

O design deve ser premium.

Inspirado em:

Fears to Fathom

Celeste

Hollow Knight

Baldur's Gate 3

Undertale

Visual:

Tema escuro

Preto

Azul profundo

Roxo prismático

Dourado

Branco brilhante

Efeitos de vidro (Glassmorphism)

Partículas cósmicas

Cristais flutuantes

Interface futurista misturada com fantasia

Sistema de Login

Cadastro

Login

Discord Login

Perfil

Avatar

Nome do Portador

Configurações

Página Inicial

Após entrar no sistema mostrar:

Campanhas

Personagens

Criaturas

Relíquias

Livro de Regras

Missões

Eventos

Sistema de Campanhas

Cada campanha possui

Nome

Descrição

Imagem

Narrador

Jogadores

Código de convite

Chat

Somente o Mestre pode editar.

Sistema de Personagens

Cada personagem possui:

Informações

Nome

Imagem

Classe

Trilha

Elemento Cósmico

Nível

XP

História

Idade

Altura

Itens (Com botão para adicionar todos os itens que existem no livro)

Poderes/Rituais (Com botão para adicionar todos os poderes que existem no livro)

Atributos

Força

Destreza

Intelecto

Carisma

Resiliência

Os atributos devem calcular automaticamente todos os modificadores.

Recursos

PV Atual

PV Máximo

PS Atual

PS Máximo

PA Atual

PA Máximo

Corrupção (%)

Defesa

Deslocamento

Iniciativa

Todos os cálculos devem seguir automaticamente as regras do sistema.
O cálculo do pv, ps é de acordo com os atributos pontuados.

Sistema de Corrupção

Criar uma barra dinâmica de Corrupção.

Mostrar:

0%

5%

10%

15%

20%

...

95%

99%

Cada faixa deve alterar automaticamente:

Descrição

Sintomas

Penalidades

Benefícios

Efeitos narrativos

Quando atingir 100%, o personagem torna-se um Fragmento e deixa de ser jogável.

Sistema de Sanidade

Barra dinâmica de PS.

Registrar automaticamente:

Perdas

Recuperações

Colapso Mental

Testes

Histórico

Sistema de Poderes

Cada personagem possui:

Elemento

Lista de poderes

Nível dos poderes

Descrição

Custo de PA

Corrupção gerada

CD

Dano

Botão "Usar Poder"

Ao utilizar um poder o sistema deve:

Consumir PA

Adicionar Corrupção

Executar testes automaticamente

Mostrar animação

Registrar no log de combate

Sistema de Combate

Sistema totalmente automatizado.

Possuir:

Rolagem de iniciativa

Turnos

Fila de iniciativa

Ação Principal

Ação Menor

Reação

Ataques

Poderes

Condições

Corrupção

Sanidade

Dano

Cura

Efeitos

Buffs

Debuffs

Histórico completo.

O sistema deve calcular automaticamente:

Acerto

Defesa

Dano

Crítico

Falha crítica

Testes de resistência

Consumo de PA

Consumo de PS

Corrupção

Rolagem de Dados

Aceitar:

d4

d6

d8

d12

d20

d100

Também aceitar:

1d20+4

2d6+3

3d8+5

5d12

Exibir:

Dados individuais

Resultado final

Animação

Histórico

Escudo do Mestre

Exclusivo do Mestre da Campanha.

Visual dividido em painéis.

Permite visualizar:

Todos os jogadores

PV

PS

PA

Corrupção

Condições

Inventário

Relíquias

Criaturas

Anomalias

Missões

Anotações privadas

O Mestre pode editar qualquer valor em tempo real.

Sistema de Criaturas

Somente o Mestre da Campanha pode acessar.

Banco completo de criaturas.

Cada criatura possui:

Nome

Imagem

Categoria

Descrição

PV

Defesa

Ataques

Poderes

Sanidade

Corrupção

Loot

XP

Fraquezas

Resistências

Condições

As criaturas nunca ficam visíveis aos jogadores até serem reveladas pelo Mestre.

Livro de Regras

Criar uma área navegável contendo todo o livro de regras.

Pesquisar por:

Classes

Poderes

Elementos

Relíquias

Condições

Itens

Armas

Equipamentos

Corrupção

Sanidade

Combate

Sem necessidade de sair da campanha.

Chat da Campanha

Mensagens em tempo real.

Rolagens aparecem automaticamente.

Uso de poderes aparece automaticamente.

Mudanças de Corrupção aparecem automaticamente.

Mensagens do Mestre ficam destacadas.

Inventário

Sistema visual com ícones.

Equipamentos

Armas

Itens

Itens Anômalos

Relíquias

Consumíveis

Peso

Capacidade

Equipar e desequipar com um clique.

Painel Administrativo

Gerenciar usuários.

Gerenciar campanhas.

Gerenciar criaturas.

Gerenciar Relíquias.

Backup.

Logs.

Requisitos Técnicos

Utilizar Next.js + React + TypeScript.

Tailwind CSS para interface.

Prisma ORM.

PostgreSQL.

NextAuth para autenticação.

Socket.io para atualizações em tempo real.

Arquitetura modular e escalável.

Código limpo, reutilizável e bem documentado.

Criar banco de dados completo, APIs, autenticação, layout responsivo, sistema de permissões por função (Administrador, Mestre e Jogador) e uma interface de alta qualidade pronta para produção.

O sistema deve ser totalmente baseado nas regras oficiais do Anomalia Cósmica RPG, automatizando cálculos de atributos, PV, PS, PA, Corrupção, testes, combate, poderes, Relíquias e progressão dos personagens.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vetraxis-loom.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/60e41717-4869-4b12-8b60-dede966b23f4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
