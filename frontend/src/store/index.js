import { configureStore } from "@reduxjs/toolkit";
import eventsMapStoreReducer from "./eventsMapStoreSlice.ts";

const store = configureStore({
  reducer: {
    eventsMapStore: eventsMapStoreReducer,
  },
});

export default store;
