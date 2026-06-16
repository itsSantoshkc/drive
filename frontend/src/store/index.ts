import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import viewReducer from "./slices/viewSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    view: viewReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
