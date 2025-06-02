import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    favorites: [],
    notifications: [],
    unreadNotifications: 0,
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
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    setUnreadNotifications: (state, action) => {
      state.unreadNotifications = action.payload;
    },
  },
});

export const { setFavorites, toggleFavoriteLocal, setNotifications, setUnreadNotifications } = uiSlice.actions;
export default uiSlice.reducer;