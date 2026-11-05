<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Dice mechanic: all tests are Attribute die + Skill die vs DT (src/lib/dice.ts); character score columns store die sides (str_score=Físico, int_score=Mente, cha_score=Emoção; skills JSON = die sides). Legacy d20 values (creature CA/CD/+bonus) are converted at display/use via helpers in game-data.ts/combat.ts — why: keeps old content without rewriting stored data.
