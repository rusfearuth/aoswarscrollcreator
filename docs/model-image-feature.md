# Model Image Layer

## Контекст

Пользователи Warscroll-редактора хотели иметь возможность добавить картинку модели юнита поверх фракционного фона (но под полоской Keywords). Картинка должна быть позиционируема, сохраняться между сессиями и попадать в PNG-экспорт.

## Архитектура слоёв

Карточка состоит из четырёх абсолютно-позиционированных `<canvas>` элементов:

```
DOM order (= z-order):
┌────────────────────────────────────┐  z = 0  background (faction template)
│ ┌────────────────────────────────┐ │
│ │                                │ │
│ │   ┌────────────────────────┐   │ │  z = 1  modelImage   ← новый слой
│ │   │   user photo           │   │ │
│ │   └────────────────────────┘   │ │
│ │                                │ │
│ ├────────────────────────────────┤ │  z = 2  characteristics (включая keywords)
│ │ Move, Health, Save, Control    │ │
│ ├────────────────────────────────┤ │  z = 3  body (weapons, abilities, loadout)
│ │ Weapons table                  │ │
│ │ Abilities cards                │ │
│ │ Loadout                        │ │
│ ├────────────────────────────────┤ │
│ │ KEYWORDS — — —                 │ │  ← рисуется на z=2 поверх modelImage
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

Все canvas имеют одинаковый размер `658×995` и `position: absolute; top: 0; left: 0`. Порядок слоёв определяется порядком в DOM.

## Модель данных

`src/components/ModelImage/ModelImageSlice.tsx`:

```ts
interface ModelImageState {
  imageData: string;   // base64 data URL ("" = пусто)
  x: number;           // координаты в canvas-space (658x995)
  y: number;
  width: number;
  height: number;
  opacity: number;     // 0..1
}
```

Координаты задаются в **canvas-space**, а не в screen-space. Это значит:
- значения стабильны независимо от размера окна
- предсказуемое поведение при экспорте в PNG (один к одному)
- значения совпадают с пикселями на финальной картинке 658×995

Дефолтное значение: `x=50, y=200, width=558, height=600, opacity=1` — центр карточки.

## Сжатие изображения

В `ModelImageControls.tsx` функция `compressImage`:

1. Читает файл как DataURL через `FileReader.readAsDataURL`
2. Загружает в `Image` объект
3. Масштабирует так, чтобы `max(width, height) <= 800px`
4. Рисует на offscreen canvas
5. Экспортирует через `toDataURL("image/jpeg", 0.8)`

**Результат:** ~150–400 KB base64 для большинства фото. Это критично для localStorage (лимит ~5–10 MB).

## Интеграция с PNG-экспортом

В `WarscrollCard.tsx`, при `triggerDownload`:

```ts
combinedCtx.drawImage(backgroundCanvas, 0, 0);
combinedCtx.drawImage(modelImageCanvas, 0, 0);   // ← между фоном и характеристиками
combinedCtx.drawImage(characteristicsCanvas, 0, 0);
combinedCtx.drawImage(bodyCanvas, 0, 0);
```

Порядок drawImage в combinedCtx повторяет порядок слоёв на экране.

## Интеграция с persist / import / export

- **Автосейв:** через redux-persist (модули хранятся в localStorage под ключом `root`).
- **JSON export:** `state.modelImage` автоматически попадает в `JSON.stringify(state)` в `ExportData.tsx` без специальной обработки.
- **JSON import:** через `applySnapshot` (общий хелпер) — диспатчит `setModelImage`, `setModelImagePosition`, `setModelImageSize`, `setModelImageOpacity`.
- **Reset:** `ResetWarscroll` диспатчит `resetModelImage()` вместе с остальными reset'ами.

## UI

В `AccordianLayout.tsx` после "Faction Selection" добавлен Accordion **"Model Image"** с компонентом `ModelImageControls`:

- кнопка **Upload / Replace model image** (file input)
- поля **X, Y** (canvas-space координаты)
- поля **Width, Height**
- slider **Opacity** (0..1, шаг 0.05)
- кнопка **Remove model image**

## Тестирование

| Сценарий | Ожидаемое поведение |
|---|---|
| Загрузить PNG 2000×2000 | в localStorage запись <500 KB |
| Изменить X на 100 | картинка сдвигается вправо |
| Opacity 0.5 | картинка полупрозрачная, фон проступает |
| Заглянуть в правый нижний угол | полоска KEYWORDS остаётся читаемой поверх картинки |
| Скачать PNG | модельная картинка присутствует в экспорте |
| Export → Reset → Import | картинка возвращается с теми же координатами |
| Reload браузера | картинка восстанавливается из localStorage |

## Ограничения

- Загрузка только из файла (не URL, не drag-and-drop).
- Сжатие необратимо: оригинал не хранится.
- Нет интерактивного перемещения/ресайза прямо на canvas — только через числовые поля.
- Один слой картинки — мульти-изображения не поддерживаются.

## Возможные улучшения

- Drag/resize прямо на canvas (overlay-div поверх canvas).
- Preserve aspect ratio toggle.
- Поддержка PNG с прозрачностью (сейчас JPEG-сжатие убирает alpha-канал).
- Загрузка по URL.
