import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import GetLocation from 'react-native-get-location';

export const getDeviceLocation = createAsyncThunk(
  'deviceLocation/getDeviceLocation',
  async (_, {rejectWithValue}) => {
    try {
      console.log('Requesting device location...');

      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 60000,
      });

      return location;
    } catch (error) {
      const {code, message} = error;
      return rejectWithValue({code, message});
    }
  },
);

const initialState = {
  loadingLocation: false,
  deviceLocation: null,
  errorMessage: '',
};

const deviceLocationSlice = createSlice({
  name: 'deviceLocation',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getDeviceLocation.pending, state => {
        state.loadingLocation = true;
        state.deviceLocation = null;
        state.errorMessage = '';
      })
      .addCase(getDeviceLocation.fulfilled, (state, action) => {
        state.loadingLocation = false;
        state.deviceLocation = action.payload;
        state.errorMessage = '';
      })
      .addCase(getDeviceLocation.rejected, (state, action) => {
        state.loadingLocation = false;
        state.deviceLocation = null;
        state.errorMessage = action.payload?.message || 'Unknown error';
      });
  },
});

export default deviceLocationSlice.reducer;
