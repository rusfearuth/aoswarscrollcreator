import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ModelImageState {
  imageData: string;
  x: number;
  y: number;
  width: number;
  height: number;
  baseWidth: number;
  baseHeight: number;
  scale: number;
  opacity: number;
}

const initialState: ModelImageState = {
  imageData: "",
  x: 50,
  y: 200,
  width: 558,
  height: 600,
  baseWidth: 558,
  baseHeight: 600,
  scale: 1,
  opacity: 1,
};

export const modelImageSlice = createSlice({
  name: "modelImage",
  initialState,
  reducers: {
    setModelImage: (state, action: PayloadAction<string>) => {
      state.imageData = action.payload;
    },
    setModelImageBase: (
      state,
      action: PayloadAction<{ baseWidth: number; baseHeight: number }>
    ) => {
      state.baseWidth = action.payload.baseWidth;
      state.baseHeight = action.payload.baseHeight;
      state.scale = 1;
      state.width = action.payload.baseWidth;
      state.height = action.payload.baseHeight;
    },
    setModelImagePosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.x = action.payload.x;
      state.y = action.payload.y;
    },
    setModelImageSize: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.width = action.payload.width;
      state.height = action.payload.height;
    },
    setModelImageScale: (state, action: PayloadAction<number>) => {
      const baseW = state.baseWidth || state.width || 1;
      const baseH = state.baseHeight || state.height || 1;
      state.baseWidth = baseW;
      state.baseHeight = baseH;
      state.scale = action.payload;
      state.width = Math.max(1, Math.round(baseW * action.payload));
      state.height = Math.max(1, Math.round(baseH * action.payload));
    },
    setModelImageOpacity: (state, action: PayloadAction<number>) => {
      state.opacity = action.payload;
    },
    clearModelImage: (state) => {
      state.imageData = "";
    },
    resetModelImage: () => initialState,
  },
});

export const {
  setModelImage,
  setModelImageBase,
  setModelImagePosition,
  setModelImageSize,
  setModelImageScale,
  setModelImageOpacity,
  clearModelImage,
  resetModelImage,
} = modelImageSlice.actions;

export default modelImageSlice.reducer;
