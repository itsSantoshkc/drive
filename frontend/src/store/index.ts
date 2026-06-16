import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import viewReducer from "./slices/viewSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    view: viewReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
