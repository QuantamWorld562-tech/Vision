import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    channelData: null,
    authLoading: true, // true until GetCurrentUser resolves
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.authLoading = false;
    },
    setAuthLoading: (state, action) => {
      state.authLoading = action.payload;
    },
    setChannelData: (state, action) => {
      state.channelData = action.payload;
    },
  },
});

export const { setUserData, setChannelData, setAuthLoading } = userSlice.actions;

export default userSlice.reducer;
