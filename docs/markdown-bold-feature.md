# Markdown `**bold**` Support

## Контекст

Текст в карточке Warscroll рисуется через Canvas API (`ctx.fillText`), а не HTML. До этой фичи нельзя было выделить ключевые слова в описаниях способностей. Теперь пользователь может обернуть фрагмент в `**...**` (markdown-синтаксис) — и при отрисовке этот фрагмент станет жирным.

## Поддерживаемые поля

| Источник | Базовый стиль | Что происходит с `**...**` |
|---|---|---|
| `Ability.name_desc` | `italic` | становится `bold-italic` |
| `Ability.declare_desc` | `regular` | становится `bold` |
| `Ability.effect_desc` | `regular` | становится `bold` |
| `RangedWeapon.ability` | `regular` | становится `bold` |
| `MeleeWeapon.ability` | `regular` | становится `bold` |
| `Loadout.body` | `bold-italic` | остаётся `bold-italic` (стиль уже жирный) |
| `Loadout.points[]` | `bold-italic` | остаётся `bold-italic` |

## Архитектура

Реализация в `src/components/WarscrollCard/MarkdownText.ts`. Три функции:

```ts
tokenizeMarkdown(raw: string, base: InlineStyle): InlineToken[]
fontFor(style: InlineStyle, fontSize: number): string
drawInlineTokens(params: DrawInlineParams): { heightOffset, lineCount }
```

### Шаги отрисовки

1. **Токенизация** — `tokenizeMarkdown` разрезает строку по regex `/\*\*([^*]+)\*\*/g`. Внутренние сегменты получают `combineStyle(base, true)`, внешние — `base`. Слова и пробелы становятся отдельными токенами.
2. **Layout** — `layoutLines` (внутри `drawInlineTokens`) измеряет каждый токен через `ctx.measureText` с правильным `ctx.font` и группирует токены по строкам с word-wrap. Пробелы в начале новой строки отбрасываются.
3. **Отрисовка** — для каждой строки определяется `startX` (по alignment), потом каждый токен рисуется через `ctx.fillText` со своим `ctx.font`.

### Ключевые отличия от старого `getTextHeight`

| Аспект | Старый `getTextHeight` | Новый `drawInlineTokens` |
|---|---|---|
| Bold для prefix ("Declare:", "Effect:", имя способности) | Хак: первые N слов рисуются bold по индексу `wordIndex+1 < unshift.split(" ").length` | Явные `prefix` токены со стилем `"bold"` |
| Перенос строк | По словам, char-based для weapon.ability | По словам, всегда pixel-based через `ctx.measureText` |
| Поддержка inline-bold | нет | да (через `**...**`) |
| Возврат | `heightOffset` | `{ heightOffset, lineCount }` |

## Контракт высоты блока

Чтобы не сломать вёрстку, `heightOffset` сохраняет формулу старого `getTextHeight`:

```
heightOffset = 7 + fontSize * lineCount
```

Это позволяет существующим вызовам в `drawAbilitiesOnCanvas` (`boxHeight += offset`) работать с теми же координатами рамок.

## Граничные случаи

- **Незакрытый `**`** — текст после него остаётся в `base` стиле (regex не матчит → попадает в финальный slice).
- **Пустой текст внутри `****`** — `[^*]+` требует минимум один символ, поэтому такая комбинация игнорируется.
- **Вложенность (`***foo***`)** — поведение определяется regex'ом; не поддерживается официально.
- **Экранирование (`\*\*`)** — не реализовано. Для warscroll-карточек это допустимо.
- **`\n` в тексте** — поддерживается как принудительный перенос строки.

## Пользовательский флоу

1. Открыть Accordion с нужной секцией (Abilities / Weapons / Loadout).
2. В описании ввести текст с маркерами: `Roll a D6. On **a 4 or higher**, deal a mortal wound.`
3. На карточке слова "a 4 or higher" отображаются жирным.

## Тестирование

| Сценарий | Ожидаемое поведение |
|---|---|
| Простой `**word**` в effect_desc | слово жирное, остальной текст regular |
| `**word1 word2**` на разрыве строки | оба слова bold, корректный wrap |
| Текст без `**` в любом поле | визуально идентичен прежней версии |
| Weapon ability с центр-выравниванием и `**` | центрирование сохранено, bold виден |
| Loadout point с `**special**` | bullet `•`, текст bold-italic |
| Незакрытый `**foo` | вся строка regular |

## Ограничения и потенциальные улучшения

- Только bold. Не поддержано: italic-маркер `*...*`, подчёркивание, цветной текст.
- Pixel-based wrap для weapon.ability даёт чуть другую разбивку строк по сравнению с char-based (27 символов). Это побочный эффект, влияющий на старые карточки с длинными ability.
- При наличии вложенного `**` parser ведёт себя предсказуемо, но не выдаёт ошибки.
