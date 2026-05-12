import { useDispatch } from "react-redux";
import { AppDispatch, RootState, store } from "../../store/store";
import {
  addSavedCard,
  removeSavedCard,
  renameSavedCard,
  SavedCard,
  updateSavedCard,
  WarscrollSnapshot,
} from "./SavedCardsSlice";
import {
  setCustomFactionName,
  setFactionName,
  setFactionTemplate,
  setFactionWeaponBanner,
  setGrandAlliance,
} from "../GrandAlliances/GrandAlliancsSlice";
import {
  setWarscrollControl,
  setWarscrollHealth,
  setWarscrollMove,
  setWarscrollName,
  setWarscrollSave,
  setWarscrollSubtype,
} from "../Characteristics/CharacteristicsSlice";
import { setKeywordAbility, setKeywordIdentity } from "../Keywords/KeywordsSlice";
import {
  setAllWeaponNames,
  setMeleeWeapons,
  setRangedWeapons,
} from "../Weapons/WeaponsSlice";
import { setAbilities } from "../Abilities/AbilitiesSlice";
import { setLoadoutBody, setLoadoutPoints } from "../Loadouts/LoadoutSlice";
import {
  setModelImage,
  setModelImageBase,
  setModelImageOpacity,
  setModelImagePosition,
  setModelImageScale,
  setModelImageSize,
} from "../ModelImage/ModelImageSlice";
import {
  resetCustomization,
  setFontSize,
  setIconSize,
  setLineHeight,
} from "../Customization/CustomizationSlice";

const generateId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const buildSnapshotFromState = (state: RootState): WarscrollSnapshot => ({
  faction: state.faction,
  characteristics: state.characteristics,
  keywords: state.keywords,
  weapons: state.weapons,
  abilities: state.abilities,
  loadout: state.loadout,
  modelImage: state.modelImage,
  customization: state.customization,
  schemaVersion: 2,
});

export const applySnapshot = (
  dispatch: AppDispatch,
  snapshot: Partial<WarscrollSnapshot>
) => {
  if (snapshot.faction) {
    const f = snapshot.faction;
    if (f.grandAlliance !== undefined) dispatch(setGrandAlliance(f.grandAlliance));
    if (f.factionName !== undefined) dispatch(setFactionName(f.factionName));
    if (f.customFactionName !== undefined) dispatch(setCustomFactionName(f.customFactionName));
    if (f.factionTemplate !== undefined) dispatch(setFactionTemplate(f.factionTemplate));
    if (f.factionWeaponBanner !== undefined) dispatch(setFactionWeaponBanner(f.factionWeaponBanner));
  }

  if (snapshot.characteristics) {
    const c = snapshot.characteristics;
    if (c.warscrollName !== undefined) dispatch(setWarscrollName(c.warscrollName));
    if (c.warscrollSubtype !== undefined) dispatch(setWarscrollSubtype(c.warscrollSubtype));
    if (c.warscrollMove !== undefined) dispatch(setWarscrollMove(c.warscrollMove));
    if (c.warscrollSave !== undefined) dispatch(setWarscrollSave(c.warscrollSave));
    if (c.warscrollControl !== undefined) dispatch(setWarscrollControl(c.warscrollControl));
    if (c.warscrollHealth !== undefined) dispatch(setWarscrollHealth(c.warscrollHealth));
  }

  if (snapshot.weapons) {
    const w = snapshot.weapons;
    if (w.meleeWeaponStats !== undefined) dispatch(setMeleeWeapons(w.meleeWeaponStats));
    if (w.rangedWeaponStats !== undefined) dispatch(setRangedWeapons(w.rangedWeaponStats));
    if (w.allWeaponNames !== undefined) dispatch(setAllWeaponNames());
  }

  if (snapshot.abilities?.abilities !== undefined) {
    dispatch(setAbilities(snapshot.abilities.abilities));
  }

  if (snapshot.loadout) {
    if (snapshot.loadout.body !== undefined) dispatch(setLoadoutBody(snapshot.loadout.body));
    if (snapshot.loadout.points !== undefined) dispatch(setLoadoutPoints(snapshot.loadout.points));
  }

  if (snapshot.keywords) {
    if (snapshot.keywords.keywordAbilities !== undefined)
      dispatch(setKeywordAbility(snapshot.keywords.keywordAbilities));
    if (snapshot.keywords.keywordIdentities !== undefined)
      dispatch(setKeywordIdentity(snapshot.keywords.keywordIdentities));
  }

  if (snapshot.modelImage) {
    const m = snapshot.modelImage;
    if (m.imageData !== undefined) dispatch(setModelImage(m.imageData));
    if (m.baseWidth !== undefined && m.baseHeight !== undefined)
      dispatch(setModelImageBase({ baseWidth: m.baseWidth, baseHeight: m.baseHeight }));
    if (m.x !== undefined && m.y !== undefined)
      dispatch(setModelImagePosition({ x: m.x, y: m.y }));
    if (m.width !== undefined && m.height !== undefined)
      dispatch(setModelImageSize({ width: m.width, height: m.height }));
    if (m.scale !== undefined) dispatch(setModelImageScale(m.scale));
    if (m.opacity !== undefined) dispatch(setModelImageOpacity(m.opacity));
  }

  if (snapshot.customization) {
    dispatch(resetCustomization());
    const c = snapshot.customization;
    if (c.fontSizes) {
      (Object.keys(c.fontSizes) as Array<keyof typeof c.fontSizes>).forEach((block) => {
        const value = c.fontSizes[block];
        if (typeof value === "number") dispatch(setFontSize({ block, value }));
      });
    }
    if (c.lineHeights) {
      (Object.keys(c.lineHeights) as Array<keyof typeof c.lineHeights>).forEach((block) => {
        const value = c.lineHeights[block];
        if (typeof value === "number") dispatch(setLineHeight({ block, value }));
      });
    }
    if (c.iconSizes) {
      (Object.keys(c.iconSizes) as Array<keyof typeof c.iconSizes>).forEach((kind) => {
        const value = c.iconSizes[kind];
        if (typeof value === "number") dispatch(setIconSize({ kind, value }));
      });
    }
  } else {
    dispatch(resetCustomization());
  }
};

export const useSaveCurrentAsNewSlot = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (name: string) => {
    const state = store.getState();
    const snapshot = buildSnapshotFromState(state);
    const card: SavedCard = {
      id: generateId(),
      name: name || snapshot.characteristics.warscrollName || "Untitled",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      snapshot,
    };
    dispatch(addSavedCard(card));
  };
};

export const useOverwriteSlot = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (id: string) => {
    const snapshot = buildSnapshotFromState(store.getState());
    dispatch(updateSavedCard({ id, snapshot }));
  };
};

export const useLoadSlot = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (card: SavedCard) => {
    applySnapshot(dispatch, card.snapshot);
  };
};

export const useRenameSlot = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (id: string, name: string) => {
    dispatch(renameSavedCard({ id, name }));
  };
};

export const useDeleteSlot = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (id: string) => {
    dispatch(removeSavedCard(id));
  };
};
