import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserData, ChannelData } from "../types";

interface UserState {
  userData: UserData | null;
  channelData: ChannelData | null;
  authLoading: boolean;
}

const initialState: UserState = {
  userData: null,
  channelData: null,
  authLoading: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData | null>) => {
      state.userData = action.payload;
      state.authLoading = false;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.authLoading = action.payload;
    },
    setChannelData: (state, action: PayloadAction<ChannelData | null>) => {
      state.channelData = action.payload;
    },
  },
});

export const { setUserData, setChannelData, setAuthLoading } = userSlice.actions;

export default userSlice.reducer;
