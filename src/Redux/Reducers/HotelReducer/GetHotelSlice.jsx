import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {getHotels} from '../../../Services/HotelService.js/GetHotelService';
import {getTopHotels} from '../../../Services/HotelService.js/TopHotels';

const initialState = {
  hotels: [],
  loadingHotels: null,
  topHotels: [],
  topCities: [],
  loadingTopHotels: null,
};

export const getAllHotelsThunk = createAsyncThunk(
  'hotels/getAllHotels',
  async ({details}, {rejectWithValue}) => {
    try {
      const response = await getHotels({
        details: details,
      });
      return response.result;
    } catch (error) {
      return rejectWithValue('Error getting hotels', error);
    }
  },
);

export const getTopHotelsThunk = createAsyncThunk(
  'hotels/getTopHotels',
  async ({details}, {rejectWithValue}) => {
    try {
      const response = await getTopHotels({
        details: details,
      });
      console.log('response in top hotels thunk', response);

      return response;
    } catch (error) {
      return rejectWithValue('Error getting top hotels', error);
    }
  },
);

const hotelSlice = createSlice({
  name: 'hotelSlice',
  initialState,
  reducers: {
    resetHotelState: state => {
      state.hotels = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getAllHotelsThunk.pending, state => {
        state.loadingHotels = true;
        state.hotels = [];
      })
      .addCase(getAllHotelsThunk.fulfilled, (state, action) => {
        state.loadingHotels = false;
        state.hotels = action.payload;
      })
      .addCase(getAllHotelsThunk.rejected, (state, action) => {
        state.loadingHotels = false;
        console.log('Rejected hotel request', action.payload);
      })
      .addCase(getTopHotelsThunk.pending, state => {
        state.loadingTopHotels = true;
        state.topHotels = [];
      })
      .addCase(getTopHotelsThunk.fulfilled, (state, action) => {
        console.log('Top hotels fetched successfully', action.payload);
        state.loadingTopHotels = true;
        state.topHotels = action.payload.topHotels;
        state.topCities = action.payload.topCities;
      })
      .addCase(getTopHotelsThunk.rejected, (state, action) => {
        state.loadingTopHotels = false;
        console.log('Rejected top hotel request', action.payload);
      });
  },
});
export const {resetHotelState} = hotelSlice.actions;
export default hotelSlice.reducer;
