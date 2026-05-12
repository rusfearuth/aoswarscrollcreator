import { useDispatch } from "react-redux";
import { resetAbilities } from "../Abilities/AbilitiesSlice";
import { resetFaction } from "../GrandAlliances/GrandAlliancsSlice";
import { resetCharacteristics } from "../Characteristics/CharacteristicsSlice";
import { resetLoadout } from "../Loadouts/LoadoutSlice";
import { resetKeywords } from "../Keywords/KeywordsSlice";
import { resetWeapons } from "../Weapons/WeaponsSlice";
import { resetModelImage } from "../ModelImage/ModelImageSlice";
import { resetCustomization } from "../Customization/CustomizationSlice";

const ResetWarscroll = () => {
  const dispatch = useDispatch();
  const useResetWarscroll = () => {
    dispatch(resetAbilities());
    dispatch(resetCharacteristics());
    dispatch(resetFaction());
    dispatch(resetKeywords());
    dispatch(resetLoadout());
    dispatch(resetWeapons());
    dispatch(resetModelImage());
    dispatch(resetCustomization());
  };

  return useResetWarscroll;
};

export default ResetWarscroll;
