import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    favorites: [],
  },
  reducers: {
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    toggleFavoriteLocal: (state, action) => {
      const id = action.payload;
      const idx = state.favorites.indexOf(id);
      if (idx >= 0) state.favorites.splice(idx, 1);
      else state.favorites.push(id);
    },
  },
});

export const { setFavorites, toggleFavoriteLocal } = uiSlice.actions;
export default uiSlice.reducer;
