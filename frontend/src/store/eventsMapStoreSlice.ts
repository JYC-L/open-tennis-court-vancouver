import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  old: {},
  new: {},
};

const eventsMapSlice = createSlice({
  name: "eventsMapStore",
  initialState,
  reducers: {
    deleteOldEventsMap(state) {
      state.old = {};
    },

    moveNewEventsMapToOld(state) {
      state.old = { ...state.new };
      state.new = {};
    },

    addNewEventsMap(state, action) {
      state.new = { ...action.payload };
    },
  },
});

export const { deleteOldEventsMap, moveNewEventsMapToOld, addNewEventsMap } =
  eventsMapSlice.actions;

export default eventsMapSlice.reducer;
