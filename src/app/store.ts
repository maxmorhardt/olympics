import { configureStore } from '@reduxjs/toolkit';
import { tournamentsReducer } from '../features/tournaments/tournamentsSlice';

const rootReducer = {
  tournaments: tournamentsReducer,
};

export const store = configureStore({
  reducer: rootReducer,
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
