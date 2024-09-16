import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './slices/navigationSlice';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, navigationReducer);


const store = configureStore({
  reducer: {
    navigation: persistedReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
    },
  }),
});
export const persistor = persistStore(store);
export default store;
