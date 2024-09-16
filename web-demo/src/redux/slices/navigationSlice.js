import { createSlice } from '@reduxjs/toolkit';

const initialNavigation = {
  navigationItems: [
    { name: 'Background removal', href: '/home', current: true },
    { name: 'Inpainting', href: '/inpainting', current: false },
    { name: 'Users', href: '/users', current: false },
  ],
  isPinned: false,
  isOpen: true,
  themeCupcake: false,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState: initialNavigation,
  reducers: {
    setActive(state, action) {
      state.navigationItems = state.navigationItems.map((item) => ({
        ...item,
        current: item.name === action.payload,
      }));
    },
    filterAdmin(state) {
      state.navigationItems = state.navigationItems.filter((item) => item.name !== 'Users');
    },
    togglePin(state) {
      state.isPinned = !state.isPinned;
      if(state.isPinned === true){
        state.isOpen = true;
      }
    },
    toggleOpen(state){
      state.isOpen = !state.isOpen;
      if(state.isOpen === false){
        state.isPinned = false;
      }
    },
    toggleThemCupcake(state){
      state.themeCupcake = !state.themeCupcake;
    }
  },
});

export const { setActive, filterAdmin, togglePin, toggleOpen,toggleThemCupcake } = navigationSlice.actions;

export default navigationSlice.reducer;
