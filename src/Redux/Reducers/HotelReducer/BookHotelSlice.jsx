import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {bookHotel} from '../../../Services/HotelService.js/BookHotelService';
const initialState = {
  bookingConfirmationDetails: {},
  loadingBooking: false,
};

export const bookHotelThunk = createAsyncThunk(
  'booking/bookHotel',
  async ({details}, {rejectWithValue}) => {
    console.log('details', details);

    try {
      const response = await bookHotel({
        details,
      });
      console.log('Response for book hotel', response);

      return response;
    } catch (err) {
      console.error('Error booking hotel', err);
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  },
);

const bookHotelSlice = createSlice({
  name: 'bookHotel',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(bookHotelThunk.pending, state => {
        state.loadingBooking = true;
        state.bookingConfirmationDetails = {};
      })
      .addCase(bookHotelThunk.fulfilled, (state, action) => {
        state.loadingBooking = false;
        console.log('action payload fullfileed', action.payload);

        state.bookingConfirmationDetails = action.payload;
      })
      .addCase(bookHotelThunk.rejected, state => {
        console.log('REject');

        state.loadingBooking = false;
        state.bookingConfirmationDetails = {};
      });
  },
});

export default bookHotelSlice.reducer;
