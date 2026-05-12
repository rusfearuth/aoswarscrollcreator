import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { FactionState } from "../GrandAlliances/GrandAlliancsSlice";
import type { CharacteristicState } from "../Characteristics/CharacteristicsSlice";
import type { KeywordsState } from "../Keywords/KeywordsSlice";
import type { WeaponsState } from "../Weapons/WeaponsSlice";
import type { AbilitiesState } from "../Abilities/AbilitiesSlice";
import type { LoadoutState } from "../Loadouts/LoadoutSlice";
import type { ModelImageState } from "../ModelImage/ModelImageSlice";
import type { CustomizationState } from "../Customization/CustomizationSlice";

export interface WarscrollSnapshot {
  faction: FactionState;
  characteristics: CharacteristicState;
  keywords: KeywordsState;
  weapons: WeaponsState;
  abilities: AbilitiesState;
  loadout: LoadoutState;
  modelImage: ModelImageState;
  customization?: CustomizationState;
  schemaVersion: 1 | 2;
}

export interface SavedCard {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  snapshot: WarscrollSnapshot;
}

export interface SavedCardsState {
  cards: SavedCard[];
}

const initialState: SavedCardsState = {
  cards: [],
};

export const savedCardsSlice = createSlice({
  name: "savedCards",
  initialState,
  reducers: {
    addSavedCard: (state, action: PayloadAction<SavedCard>) => {
      state.cards.push(action.payload);
    },
    updateSavedCard: (
      state,
      action: PayloadAction<{ id: string; snapshot: WarscrollSnapshot }>
    ) => {
      const card = state.cards.find((c) => c.id === action.payload.id);
      if (card) {
        card.snapshot = action.payload.snapshot;
        card.updatedAt = Date.now();
      }
    },
    renameSavedCard: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const card = state.cards.find((c) => c.id === action.payload.id);
      if (card) {
        card.name = action.payload.name;
        card.updatedAt = Date.now();
      }
    },
    removeSavedCard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter((c) => c.id !== action.payload);
    },
    resetSavedCards: () => initialState,
  },
});

export const {
  addSavedCard,
  updateSavedCard,
  renameSavedCard,
  removeSavedCard,
  resetSavedCards,
} = savedCardsSlice.actions;

export default savedCardsSlice.reducer;
