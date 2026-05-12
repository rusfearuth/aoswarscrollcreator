import React from "react";
import { Box, Button, Slider, Stack, Typography, Divider } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  FontSizeBlock,
  IconKind,
  LineHeightBlock,
  fontSizeLimits,
  iconSizeLimits,
  lineHeightLimits,
  resetCustomization,
  setFontSize,
  setIconSize,
  setLineHeight,
} from "./CustomizationSlice";

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({ label, value, min, max, step, unit = "px", onChange }) => (
  <Box>
    <Typography variant="body2" gutterBottom>
      {label}: {value} {unit}
    </Typography>
    <Slider
      size="small"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(_, v) => onChange(Array.isArray(v) ? v[0] : v)}
      valueLabelDisplay="auto"
    />
  </Box>
);

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
      {title}
    </Typography>
    <Stack spacing={1.5}>{children}</Stack>
  </Box>
);

const Customization: React.FC = () => {
  const dispatch = useDispatch();
  const { fontSizes, lineHeights, iconSizes } = useSelector(
    (state: RootState) => state.customization
  );

  const onFontSize = (block: FontSizeBlock) => (value: number) =>
    dispatch(setFontSize({ block, value }));

  const onLineHeight = (block: LineHeightBlock) => (value: number) =>
    dispatch(setLineHeight({ block, value }));

  const onIconSize = (kind: IconKind) => (value: number) =>
    dispatch(setIconSize({ kind, value }));

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2} divider={<Divider flexItem />}>
        <Section title="Characteristics">
          <SliderRow
            label="Font size"
            value={fontSizes.characteristics}
            min={fontSizeLimits.characteristics.min}
            max={fontSizeLimits.characteristics.max}
            step={fontSizeLimits.characteristics.step}
            onChange={onFontSize("characteristics")}
          />
        </Section>

        <Section title="Weapons">
          <SliderRow
            label="Header font size"
            value={fontSizes.weaponsHeader}
            min={fontSizeLimits.weaponsHeader.min}
            max={fontSizeLimits.weaponsHeader.max}
            step={fontSizeLimits.weaponsHeader.step}
            onChange={onFontSize("weaponsHeader")}
          />
          <SliderRow
            label="Row font size"
            value={fontSizes.weapons}
            min={fontSizeLimits.weapons.min}
            max={fontSizeLimits.weapons.max}
            step={fontSizeLimits.weapons.step}
            onChange={onFontSize("weapons")}
          />
          <SliderRow
            label="Row height"
            value={lineHeights.weapons}
            min={lineHeightLimits.weapons.min}
            max={lineHeightLimits.weapons.max}
            step={lineHeightLimits.weapons.step}
            onChange={onLineHeight("weapons")}
          />
        </Section>

        <Section title="Abilities">
          <SliderRow
            label="Header font size"
            value={fontSizes.abilitiesHeader}
            min={fontSizeLimits.abilitiesHeader.min}
            max={fontSizeLimits.abilitiesHeader.max}
            step={fontSizeLimits.abilitiesHeader.step}
            onChange={onFontSize("abilitiesHeader")}
          />
          <SliderRow
            label="Body font size"
            value={fontSizes.abilities}
            min={fontSizeLimits.abilities.min}
            max={fontSizeLimits.abilities.max}
            step={fontSizeLimits.abilities.step}
            onChange={onFontSize("abilities")}
          />
          <SliderRow
            label="Body line height"
            value={lineHeights.abilities}
            min={lineHeightLimits.abilities.min}
            max={lineHeightLimits.abilities.max}
            step={lineHeightLimits.abilities.step}
            onChange={onLineHeight("abilities")}
          />
        </Section>

        <Section title="Loadout">
          <SliderRow
            label="Font size"
            value={fontSizes.loadout}
            min={fontSizeLimits.loadout.min}
            max={fontSizeLimits.loadout.max}
            step={fontSizeLimits.loadout.step}
            onChange={onFontSize("loadout")}
          />
          <SliderRow
            label="Line height"
            value={lineHeights.loadout}
            min={lineHeightLimits.loadout.min}
            max={lineHeightLimits.loadout.max}
            step={lineHeightLimits.loadout.step}
            onChange={onLineHeight("loadout")}
          />
        </Section>

        <Section title="Keywords">
          <SliderRow
            label="Font size"
            value={fontSizes.keywords}
            min={fontSizeLimits.keywords.min}
            max={fontSizeLimits.keywords.max}
            step={fontSizeLimits.keywords.step}
            onChange={onFontSize("keywords")}
          />
        </Section>

        <Section title="Icons">
          <SliderRow
            label="Ability icon size"
            value={iconSizes.ability}
            min={iconSizeLimits.ability.min}
            max={iconSizeLimits.ability.max}
            step={iconSizeLimits.ability.step}
            onChange={onIconSize("ability")}
          />
          <SliderRow
            label="Ability type icon size"
            value={iconSizes.abilityType}
            min={iconSizeLimits.abilityType.min}
            max={iconSizeLimits.abilityType.max}
            step={iconSizeLimits.abilityType.step}
            onChange={onIconSize("abilityType")}
          />
        </Section>

        <Button variant="outlined" color="warning" onClick={() => dispatch(resetCustomization())}>
          Reset to defaults
        </Button>
      </Stack>
    </Box>
  );
};

export default Customization;
