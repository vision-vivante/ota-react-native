import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {priceConfirm} from '../../../Services/HotelService.js/PriceConfirmService';

const initialState = {
  priceConfirmDetails: null,
  confirmingPriceFromServer: null,
  priceConfirmError: null,
  roomDetailFromSelection: [],
};

export const confirmPrice = createAsyncThunk(
  'price/confirmPrice',
  async ({details}, {rejectWithValue}) => {
    console.log('inside confirmPrice', details);

    try {
      const response = await priceConfirm({details: details});
      console.log('Response', response);
      return response;
    } catch (error) {
      return rejectWithValue('Error getting hotels', error);
    }
  },
);

const confirmPriceSlice = createSlice({
  name: 'priceConfirmSlice',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(confirmPrice.pending, state => {
        state.confirmingPriceFromServer = true;
        state.priceConfirmDetails = null;
      })
      .addCase(confirmPrice.fulfilled, (state, action) => {
        console.log('Actoin. payload', action.payload);
        state.confirmingPriceFromServer = false;
        if (action?.payload?.status === true) {
          console.log('Inside true');

          console.log('Before state update:', state);
          state.priceConfirmDetails = action.payload.result;
          state.roomDetailFromSelection =
            action.meta?.arg?.details?.roomDetail || [];
          console.log('After state update:', state);
        } else if (action?.payload?.status === false) {
          console.log('Inside false');
          state.priceConfirmDetails = action?.payload;
          state.roomDetailFromSelection =
            action.meta?.arg?.details?.roomDetail || [];
        }
      })
      .addCase(confirmPrice.rejected, (state, action) => {
        state.confirmingPriceFromServer = false;
        state.priceConfirmError = action.payload;
        console.log('Rejected price confirm request', action.payload);
      });
  },
});

export default confirmPriceSlice.reducer;
