import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getContentToken} from '../../Services/ContentTokenService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UNIVERSAL_TOKEN_KEY = 'universal_token';

/**
 * Save universal token to AsyncStorage
 * @param {string} token - The universal token
 */
const saveUniversalToken = async token => {
  try {
    await AsyncStorage.setItem(UNIVERSAL_TOKEN_KEY, token);
    console.log('Universal token saved successfully');
  } catch (error) {
    console.error('Error saving universal token', error);
  }
};

/**
 * Get universal token from AsyncStorage
 * @returns {Promise<string|null>} - The universal token or null if not found
 */
const getUniversalTokenFromKeychain = async () => {
  try {
    const token = await AsyncStorage.getItem(UNIVERSAL_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting universal token', error);
    return null;
  }
};

/**
 * Remove universal token from AsyncStorage
 */
const removeUniversalToken = async () => {
  try {
    await AsyncStorage.removeItem(UNIVERSAL_TOKEN_KEY);
    console.log('Universal token removed successfully');
  } catch (error) {
    console.error('Error removing universal token', error);
  }
};

/**
 * Async thunk to fetch a new universal token
 */
export const getUniversalToken = createAsyncThunk(
  'contentToken/getUniversalToken',
  async (_, {rejectWithValue}) => {
    try {
      console.log('getting universal token');

      const response = await getContentToken();
      console.log(response);

      return response;
    } catch (error) {
      return rejectWithValue('Error getting universal token');
    }
  },
);

/**
 * Async thunk to check if universal token exists in storage
 */
export const checkUniversalToken = createAsyncThunk(
  'contentToken/checkUniversalToken',
  async (_, {rejectWithValue}) => {
    try {
      const token = await getUniversalTokenFromKeychain();
      return {token};
    } catch (error) {
      return rejectWithValue('Token validation failed');
    }
  },
);

/**
 * Async thunk to remove universal token
 */
export const removeUniversalTokenThunk = createAsyncThunk(
  'contentToken/removeUniversalToken',
  async (_, {rejectWithValue}) => {
    try {
      await removeUniversalToken();
      return {token: null};
    } catch (error) {
      return rejectWithValue('Error removing universal token');
    }
  },
);

const initialState = {
  universalToken: '',
  isLoading: false,
  status: null,
};

const contentTokenSlice = createSlice({
  name: 'contentToken',
  initialState,
  reducers: {
    /**
     * Manually clear the token
     */
    clearUniversalToken: state => {
      state.universalToken = '';
      state.status = null;
    },
  },
  extraReducers: builder => {
    // Get Universal Token
    builder
      .addCase(getUniversalToken.pending, state => {
        state.isLoading = true;
        state.status = null;
        state.universalToken = '';
      })
      .addCase(getUniversalToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.universalToken = action.payload.data;
        state.status = action.payload.status;
        console.log('Universal token getUniversal token', action.payload);

        saveUniversalToken(action.payload.data);
      })
      .addCase(getUniversalToken.rejected, (state, action) => {
        state.isLoading = false;
        state.status = action.payload.status;
        state.universalToken = '';
      });

    // Check Universal Token
    builder
      .addCase(checkUniversalToken.pending, state => {
        state.isLoading = true;
        state.status = null;
      })
      .addCase(checkUniversalToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.universalToken = action.payload.token;
        state.status = 'Token Found';
      })
      .addCase(checkUniversalToken.rejected, (state, action) => {
        state.isLoading = false;
        state.universalToken = '';
        state.status = action.payload;
      });

    // Remove Universal Token
    builder
      .addCase(removeUniversalTokenThunk.pending, state => {
        state.isLoading = true;
        state.status = null;
      })
      .addCase(removeUniversalTokenThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.universalToken = '';
        state.status = 'Token Removed';
      })
      .addCase(removeUniversalTokenThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.status = action.payload;
      });
  },
});

export const {clearUniversalToken} = contentTokenSlice.actions;
export default contentTokenSlice.reducer;
