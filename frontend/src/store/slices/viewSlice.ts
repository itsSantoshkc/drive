import { createSlice } from "@reduxjs/toolkit";

type ViewMode = "grid" | "list";

interface ViewState {
  mode: ViewMode;
}

const getInitialView = (): ViewMode => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("viewMode") as ViewMode;
    if (saved) return saved;
  }
  return "grid";
};

const initialState: ViewState = {
  mode: getInitialView(),
};

const viewSlice = createSlice({
  name: "view",
  initialState,
  reducers: {
    setViewMode: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem("viewMode", state.mode);
    },
    toggleViewMode: (state) => {
      state.mode = state.mode === "grid" ? "list" : "grid";
      localStorage.setItem("viewMode", state.mode);
    },
  },
});

export const { setViewMode, toggleViewMode } = viewSlice.actions;
export default viewSlice.reducer;
