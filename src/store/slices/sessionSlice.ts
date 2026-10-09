import {createSlice} from '@reduxjs/toolkit';
import type {GreenApiCredentials} from '@/types/GreenApiCredentials';
import sessionThunk from '@/store/thunks/sessionThunk';

type SessionState = {
  credentials: GreenApiCredentials | null;
};

export default createSlice({
  name: 'session',

  initialState: {
    credentials: null,
  } as SessionState,

  reducers: {},

  extraReducers: (builder) => {
    builder.addCase(sessionThunk.login.fulfilled, (state, action) => {
      state.credentials = action.payload;
    });

    builder.addCase(sessionThunk.logout.fulfilled, (state) => {
      state.credentials = null;
    });
  },
});
