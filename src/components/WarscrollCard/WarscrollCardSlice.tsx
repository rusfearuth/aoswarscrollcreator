import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DownloadFormat = "png" | "pdf-a6";

export const warscrollCardSlice = createSlice({
  name: "warscrollDownload",
  initialState: {
    downloadFormat: null as DownloadFormat | null,
  },
  reducers: {
    initDownload: (state, action: PayloadAction<DownloadFormat>) => {
      state.downloadFormat = action.payload;
    },
    resetDownload: (state) => {
      state.downloadFormat = null;
    },
  },
});

export const { initDownload, resetDownload } = warscrollCardSlice.actions;
export default warscrollCardSlice.reducer;
