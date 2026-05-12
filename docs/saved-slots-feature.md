# Saved Warscrolls Library

## Контекст

До этой фичи в редакторе была только одна "текущая" карточка — она автоматически сохранялась в localStorage через redux-persist. Чтобы переключиться между несколькими карточками, приходилось экспортировать JSON, сбрасывать и импортировать другой JSON. Теперь пользователь может сохранять несколько именованных слотов прямо в браузере и переключаться между ними одним кликом.

## Разделение "hot state" и "library"

Принципиальный архитектурный момент:

| Сущность | Что это | Хранение |
|---|---|---|
| **Hot state** | текущая редактируемая карточка | redux-persist под ключом `root` (как раньше) |
| **Library** | массив сохранённых снапшотов | новый slice `savedCards`, тот же persist под ключом `root` |

Это значит:
- Редактирование (печать в поле) → автосейв в hot state — поведение не изменилось.
- Сохранение в слот → копия hot state + name + id попадает в library.
- Загрузка слота → snapshot копируется обратно в hot state (через применение setter'ов всех slice'ов).
- Reset → чистит ТОЛЬКО hot state, library не трогается.

## Модель данных

`src/components/SavedCards/SavedCardsSlice.tsx`:

```ts
interface WarscrollSnapshot {
  faction: FactionState;
  characteristics: CharacteristicState;
  keywords: KeywordsState;
  weapons: WeaponsState;
  abilities: AbilitiesState;
  loadout: LoadoutState;
  modelImage: ModelImageState;
  schemaVersion: 1;
  // ВАЖНО: НЕ включает savedCards (избежать рекурсии)
  // и warscroll.triggerDownload (runtime-флаг)
}

interface SavedCard {
  id: string;            // crypto.randomUUID() (fallback Date.now()-random)
  name: string;          // user-defined
  createdAt: number;
  updatedAt: number;
  snapshot: WarscrollSnapshot;
}

interface SavedCardsState {
  cards: SavedCard[];
}
```

## API хелперов

`src/components/SavedCards/SavedCardsHooks.ts` — фабрики React-хуков:

```ts
buildSnapshotFromState(state: RootState): WarscrollSnapshot
applySnapshot(dispatch, snapshot: Partial<WarscrollSnapshot>): void

useSaveCurrentAsNewSlot()  → (name: string) => void
useOverwriteSlot()         → (id: string) => void
useLoadSlot()              → (card: SavedCard) => void
useRenameSlot()            → (id: string, name: string) => void
useDeleteSlot()            → (id: string) => void
```

**Особенность `applySnapshot`** — он используется и в `useLoadSlot`, и в `ImportData.tsx`. Это устраняет дублирование dispatch-цепочки между двумя точками входа (json-импорт и загрузка слота). `applySnapshot` принимает `Partial<WarscrollSnapshot>` и проверяет каждое поле через `!== undefined` (НЕ truthy-check — это позволяет корректно обрабатывать `x: 0`, `imageData: ""` и т. п.).

## UI

`src/components/SavedCards/SavedCardsPanel.tsx` — встроен в Drawer (`ResponsiveDrawer.tsx`) под заголовком **"My Warscrolls"**:

```
┌─────────────────────────────┐
│ Save current as new slot    │ ← открывает диалог с TextField
├─────────────────────────────┤
│ Thunderhost                 │
│ 12.05.2026 14:30  [↻][✎][✗] │
├─────────────────────────────┤
│ Stormcast Lord              │
│ 11.05.2026 09:15  [↻][✎][✗] │
└─────────────────────────────┘
```

Каждая карточка-строка:
- **Click на ListItemButton** → диалог "Replace current with X?" → load.
- **Save icon (↻)** → confirm → overwrite slot текущим state.
- **Rename icon (✎)** → диалог TextField → переименование.
- **Delete icon (✗)** → confirm → удаление.

Все деструктивные действия защищены confirm-диалогами.

## UX-флоу

1. Пользователь заполняет карточку (faction, characteristics, weapons, abilities).
2. Открывает Drawer → секция **My Warscrolls**.
3. Жмёт **Save current as new slot**. В диалоге default name = `warscrollName`.
4. После сохранения слот появляется в списке.
5. Пользователь начинает новую карточку (или сбрасывает через Reset).
6. Чтобы вернуться — клик на слот → confirm → состояние полностью восстанавливается.

## Интеграция с существующим Import/Export

- `ExportData.tsx` экспортирует **весь** `state.*` включая `savedCards`. Это удобно для бэкапа.
- `ImportData.tsx` через `applySnapshot` импортирует только поля из `WarscrollSnapshot` (faction, characteristics, etc.). Поле `savedCards` из импорта **игнорируется** — иначе при импорте легко затереть собственную библиотеку.
- Reset не вызывает `resetSavedCards()`.

Если нужно перенести библиотеку между браузерами, выгрузите JSON и в новом месте импортируйте — `savedCards` сохранятся в файле, но не примутся при импорте (это намеренно). Для full-restore можно использовать DevTools / редактировать persist напрямую.

## Тестирование

| Сценарий | Ожидаемое |
|---|---|
| Заполнить + Save as new slot "Test1" | слот появляется |
| Изменить warscrollName на "Foo" → Save | default name в диалоге = "Foo" |
| Reload | список слотов сохранён |
| Reset → check library | current пустая, слоты НЕ тронуты |
| Click слот → Load | весь state восстановлен (включая weapons, abilities, modelImage) |
| Rename | имя меняется |
| Overwrite | updatedAt обновляется, snapshot заменён |
| Delete | слот исчезает |
| Сохранить много слотов с modelImage | localStorage не лопается (compression в Task 2 спасает) |

## Риски и ограничения

- **localStorage capacity**: суммарный размер = current state + sum(snapshots). При 10 слотах с modelImage по 500KB = ~5MB. В лимите большинства браузеров.
- **Recursive snapshot**: тип `WarscrollSnapshot` намеренно НЕ включает `savedCards`. Иначе сохранение слота сохраняло бы себя и быстро бы раздуло persist.
- **Schema migration**: `schemaVersion: 1` зарезервирован для будущих миграций. `applySnapshot` defensively проверяет `!== undefined` для каждого поля — старые snapshot'ы (без поля `modelImage`, например) корректно загружаются с дефолтами.
- **crypto.randomUUID** доступен в secure context (HTTPS / localhost). Fallback: `${Date.now()}-${Math.random().toString(36).slice(2,10)}`.

## Возможные улучшения

- **Экспорт/импорт всей библиотеки** (отдельные кнопки) — для переноса между браузерами.
- **Display capacity** — индикатор "Storage usage: X / 10MB".
- **Search / Filter** в длинном списке слотов.
- **Tags / categories** — например, тэг по фракции.
- **Cloud sync** — гораздо больший проект.
