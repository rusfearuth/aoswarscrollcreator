import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type FontSizeBlock =
  | "characteristics"
  | "weapons"
  | "weaponsHeader"
  | "abilities"
  | "abilitiesHeader"
  | "loadout"
  | "keywords";

export type LineHeightBlock = "weapons" | "abilities" | "loadout";

export type IconKind = "ability" | "abilityType";

export interface CustomizationState {
  fontSizes: {
    characteristics: number;
    weapons: number;
    weaponsHeader: number;
    abilities: number;
    abilitiesHeader: number;
    loadout: number;
    keywords: number;
  };
  lineHeights: {
    weapons: number;
    abilities: number;
    loadout: number;
  };
  iconSizes: {
    ability: number;
    abilityType: number;
  };
}

export const defaultCustomization: CustomizationState = {
  fontSizes: {
    characteristics: 25,
    weapons: 20,
    weaponsHeader: 18,
    abilities: 19,
    abilitiesHeader: 21,
    loadout: 15,
    keywords: 16,
  },
  lineHeights: {
    weapons: 28,
    abilities: 18,
    loadout: 16,
  },
  iconSizes: {
    ability: 17,
    abilityType: 33,
  },
};

export interface CustomizationLimits {
  min: number;
  max: number;
  step: number;
}

export const fontSizeLimits: Record<FontSizeBlock, CustomizationLimits> = {
  characteristics: { min: 18, max: 32, step: 1 },
  weapons: { min: 10, max: 26, step: 1 },
  weaponsHeader: { min: 9, max: 24, step: 1 },
  abilities: { min: 10, max: 24, step: 1 },
  abilitiesHeader: { min: 9, max: 28, step: 1 },
  loadout: { min: 10, max: 22, step: 1 },
  keywords: { min: 8, max: 22, step: 1 },
};

export const lineHeightLimits: Record<LineHeightBlock, CustomizationLimits> = {
  weapons: { min: 14, max: 36, step: 1 },
  abilities: { min: 12, max: 26, step: 1 },
  loadout: { min: 12, max: 24, step: 1 },
};

export const iconSizeLimits: Record<IconKind, CustomizationLimits> = {
  ability: { min: 12, max: 28, step: 1 },
  abilityType: { min: 24, max: 48, step: 1 },
};

export const customizationSlice = createSlice({
  name: "customization",
  initialState: defaultCustomization,
  reducers: {
    setFontSize: (
      state,
      action: PayloadAction<{ block: FontSizeBlock; value: number }>
    ) => {
      state.fontSizes[action.payload.block] = action.payload.value;
    },
    setLineHeight: (
      state,
      action: PayloadAction<{ block: LineHeightBlock; value: number }>
    ) => {
      state.lineHeights[action.payload.block] = action.payload.value;
    },
    setIconSize: (
      state,
      action: PayloadAction<{ kind: IconKind; value: number }>
    ) => {
      state.iconSizes[action.payload.kind] = action.payload.value;
    },
    resetCustomization: () => defaultCustomization,
  },
});

export const { setFontSize, setLineHeight, setIconSize, resetCustomization } =
  customizationSlice.actions;

export default customizationSlice.reducer;
