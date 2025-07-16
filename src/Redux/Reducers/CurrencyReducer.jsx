import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLocales} from 'react-native-localize';
import {getCurrency} from '../../Services/CurrencyService';

// Map country codes to currencies (expandable later)
const countryToCurrencyMap = {
  us: 'USD', // United States
  ca: 'CAD', // Canada
  in: 'INR',
};

// Thunk to fetch currencies from API (if needed)
export const getCurrencyThunk = createAsyncThunk(
  'currency/getCurrency',
  async (_, {rejectWithValue}) => {
    try {
      const currenciesResponse = await getCurrency();
      return currenciesResponse?.data;
    } catch (error) {
      const {code, message} = error;
      return rejectWithValue({code, message});
    }
  },
);

const initialState = {
  loadingCurrencies: false,
  currencies: ['USD', 'CAD', 'INR'],
  errorMessage: '',
  selectedCurrency: null, // Null until initialized
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.selectedCurrency = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getCurrencyThunk.pending, state => {
        state.loadingCurrencies = true;
      })
      .addCase(getCurrencyThunk.fulfilled, (state, action) => {
        state.loadingCurrencies = false;
        state.currencies = action.payload.currency || state.currencies; // Use API data if available
      })
      .addCase(getCurrencyThunk.rejected, (state, action) => {
        state.loadingCurrencies = false;
        state.errorMessage =
          action.payload?.message || 'Failed to load currencies';
      });
  },
});

// Export actions
export const {setCurrency} = currencySlice.actions;

// Initialize currency on app start
export const initializeCurrency = () => async dispatch => {
  try {
    // Get the device's country code and map to currency
    const countryCode = getLocales()[0]?.countryCode?.toLowerCase() || 'us';
    const deviceCurrency = countryToCurrencyMap[countryCode] || 'USD';

    // Check if a user-selected currency exists in storage
    const savedCurrency = await AsyncStorage.getItem('currency');

    if (savedCurrency === null) {
      // No saved currency: use device-based currency (or USD if unmapped)
      dispatch(setCurrency(deviceCurrency));
    } else {
      dispatch(setCurrency(savedCurrency));
    }
  } catch (error) {
    console.error('Error initializing currency:', error);
    // Fallback to USD on error
    dispatch(setCurrency('USD'));
  }
};

// Set currency when user manually changes and saves it
export const setCurrencyWithStorage = currency => async dispatch => {
  try {
    console.log('User manually saved currency:', currency);
    // Save the user's choice to storage
    await AsyncStorage.setItem('currency', currency);
    // Apply it immediately
    dispatch(setCurrency(currency));
  } catch (error) {
    console.error('Error saving currency:', error);
    // Fallback to USD on error
    dispatch(setCurrency('USD'));
  }
};

export default currencySlice.reducer;
