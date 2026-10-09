import {createAsyncThunk} from '@reduxjs/toolkit';
import {generateUserErrorMessage} from '@/utils/common';
import type {GreenApiCredentials} from '@/types/GreenApiCredentials';
import GreenApiService from '@/services/GreenApiService';

export default {
  login: createAsyncThunk<GreenApiCredentials, GreenApiCredentials, {rejectValue: string}>(
    'session/login',

    async (credentials, thunkApi) => {
      const {rejectWithValue} = thunkApi;

      try {
        return await GreenApiService.authorize(credentials);
      } catch (error: unknown) {
        return rejectWithValue(generateUserErrorMessage(error));
      }
    },
  ),

  logout: createAsyncThunk('session/logout', () => undefined),
};
