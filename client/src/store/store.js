import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice.js';

export default configureStore({
  reducer: {
    ui: uiReducer,
  },
});
