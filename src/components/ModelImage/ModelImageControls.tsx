import React, { useRef } from "react";
import { Box, Button, Slider, TextField, Typography, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  clearModelImage,
  setModelImage,
  setModelImageBase,
  setModelImageOpacity,
  setModelImagePosition,
  setModelImageScale,
  setModelImageSize,
} from "./ModelImageSlice";

const MAX_DIM = 800;
const SCALE_MIN = 0.1;
const SCALE_MAX = 3;
const SCALE_STEP = 0.05;

interface CompressedImage {
  dataUrl: string;
  width: number;
  height: number;
}

const compressImage = (dataUrl: string): Promise<CompressedImage> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const targetWidth = Math.round(img.width * scale);
      const targetHeight = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Cannot get 2D context"));
        return;
      }
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      resolve({
        dataUrl: canvas.toDataURL("image/png"),
        width: targetWidth,
        height: targetHeight,
      });
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });

const ModelImageControls: React.FC = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { imageData, x, y, width, height, scale, opacity } = useSelector(
    (state: RootState) => state.modelImage
  );
  const effectiveScale = scale ?? 1;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const raw = e.target?.result as string;
      if (!raw) return;
      try {
        const compressed = await compressImage(raw);
        dispatch(setModelImage(compressed.dataUrl));
        dispatch(
          setModelImageBase({ baseWidth: compressed.width, baseHeight: compressed.height })
        );
      } catch (err) {
        console.error("Image compression failed", err);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNumberChange = (setter: (value: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!Number.isNaN(value)) setter(value);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
          {imageData ? "Replace unit image" : "Upload unit image"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        {imageData && (
          <>
            <Stack direction="row" spacing={1}>
              <TextField
                label="X"
                type="number"
                size="small"
                value={x}
                onChange={handleNumberChange((v) => dispatch(setModelImagePosition({ x: v, y })))}
                fullWidth
              />
              <TextField
                label="Y"
                type="number"
                size="small"
                value={y}
                onChange={handleNumberChange((v) => dispatch(setModelImagePosition({ x, y: v })))}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={1}>
              <TextField
                label="Width"
                type="number"
                size="small"
                value={width}
                onChange={handleNumberChange((v) => dispatch(setModelImageSize({ width: v, height })))}
                fullWidth
              />
              <TextField
                label="Height"
                type="number"
                size="small"
                value={height}
                onChange={handleNumberChange((v) => dispatch(setModelImageSize({ width, height: v })))}
                fullWidth
              />
            </Stack>
            <Box>
              <Typography variant="body2" gutterBottom>
                Scale: {effectiveScale.toFixed(2)}x
              </Typography>
              <Slider
                size="small"
                min={SCALE_MIN}
                max={SCALE_MAX}
                step={SCALE_STEP}
                value={effectiveScale}
                onChange={(_, v) =>
                  dispatch(setModelImageScale(Array.isArray(v) ? v[0] : v))
                }
                valueLabelDisplay="auto"
              />
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>
                Opacity: {opacity.toFixed(2)}
              </Typography>
              <Slider
                size="small"
                min={0}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(_, v) => dispatch(setModelImageOpacity(Array.isArray(v) ? v[0] : v))}
              />
            </Box>
            <Button color="warning" variant="outlined" onClick={() => dispatch(clearModelImage())}>
              Remove unit image
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default ModelImageControls;
