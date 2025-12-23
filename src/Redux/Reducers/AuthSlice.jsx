import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  createAccount,
  forgotPasswordSer,
  loginWithEmail,
  loginWithPhone,
  sendOtptobackend,
  socialLogin,
} from '../../Services/AuthServices';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LoginManager, Profile, AccessToken} from 'react-native-fbsdk-next';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {clearUniversalToken} from './ContentTokenSlice';

const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Constants
const GUEST_DETAILS_KEY = 'guestDetails';

const initialState = {
  isLoading: false,
  isSuccess: false,
  isFailure: false,
  authData: '',
  userToken: '',
  errorMessage: '',
};

console.log('Islogin', initialState.isLoading);

const saveToken = async token => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log('Token saved successfully');
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log('Token removed successfully');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};
export const createUserAccount = createAsyncThunk(
  'auth/createAccount',
  async ({details, contentToken}, {rejectWithValue}) => {
    try {
      const response = await createAccount({
        details: details,
        contentToken: contentToken,
      });
      return response.data;
    } catch (err) {
      console.error('Error in creating account:', err);
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  },
);

export const loginUserWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({details, contentToken}, {rejectWithValue}) => {
    console.log('details', details);
    try {
      const response = await loginWithEmail({
        details: details,
        contentToken: contentToken,
      });

      console.log('response of login email', response);

      return response.data;
    } catch (err) {
      console.error('Error in login with email:', err.response);
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  },
);

export const loginUserWithPhone = createAsyncThunk(
  'auth/loginWithPhone',
  async ({details, contentToken}, {rejectWithValue}) => {
    try {
      console.log('Details', details, contentToken);

      const response = await loginWithPhone({
        details: details,
        contentToken: contentToken,
      });

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message,
      );
    }
  },
);

export const checkStoredToken = createAsyncThunk(
  'auth/checkStoredToken',
  async (_, {rejectWithValue}) => {
    try {
      const token = await getToken();
      return {token};
    } catch (error) {
      // await removeToken();
      return rejectWithValue('Token validation failed');
    }
  },
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, {rejectWithValue}) => {
    try {
      await GoogleSignin.hasPlayServices();
      const googleResponse = await GoogleSignin.signIn();
      console.log('Google response', googleResponse);
      if (googleResponse.type === 'cancelled') {
        return rejectWithValue('Google sign in cancelled by user');
      }
      const googleId = googleResponse?.data?.user?.id;
      const googleName = googleResponse?.data?.user?.name;
      const googleEmail = googleResponse?.data?.user?.email;
      const details = {
        google_id: googleId,
        name: googleName,
        email: googleEmail,
      };
      console.log('Details', details);
      const response = await socialLogin({details: details});
      console.log('Google sign in response', response);
      return response?.data?.data;
    } catch (error) {
      console.log('Google sign in error', error);
    }
  },
);

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async ({details}, {rejectWithValue}) => {
    try {
      const response = await forgotPasswordSer({
        details: details,
      });
      console.log('response', response);
      return response.data;
    } catch (error) {
      console.log(error);

      return rejectWithValue(
        error.response ? error.response.data : error.message,
      );
    }
  },
);

export const facebookLogin = createAsyncThunk(
  'auth/facebookLogin',
  async (_, {rejectWithValue}) => {
    try {
      console.log('Inside login with facebook');

      // Attempt login with permissions
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
      ]);

      // Check if login was cancelled
      if (result.isCancelled) {
        console.log('Login cancelled');
        return rejectWithValue('Login was cancelled by the user');
      }

      console.log(
        'Login success with permissions: ',
        result.grantedPermissions,
      );

      // Get the access token
      const accessTokenData = await AccessToken.getCurrentAccessToken();
      if (!accessTokenData) {
        console.log('No access token received');
        return rejectWithValue('Failed to retrieve access token');
      }

      // Get the current user profile
      const currentProfile = await Profile.getCurrentProfile();
      if (!currentProfile) {
        console.log('No profile data available');
        return rejectWithValue('Failed to retrieve profile data');
      }

      // Log profile details
      console.log(
        'The current logged user is: ' +
          currentProfile.name +
          '. Their profile ID is: ' +
          currentProfile.userID,
      );
      const details = {
        facebook_id: currentProfile.userID,
        name: currentProfile.name,
        email: '',
      };
      console.log(details);

      const response = await socialLogin({details: details});
      console.log('response from backend', response);

      // Return the profile data and access token to Redux
      return response?.data?.data;
    } catch (error) {
      console.log('Error while facebook login: ', error);
      return rejectWithValue(error.message || 'Facebook login failed');
    }
  },
);

export const sendOtpToBackendThunk = createAsyncThunk(
  'auth/sendOtpToBackend',
  async ({details, contentToken}, {rejectWithValue}) => {
    console.log('details', details);
    console.log('contentToken', contentToken);

    try {
      const response = await sendOtptobackend({details, contentToken});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Send OTP to backend failed');
    }
  },
);

export const appleLogin = createAsyncThunk(
  'auth/appleLogin',
  async (_, {rejectWithValue}) => {
    try {
      // Request Apple authentication
      const appleAuthResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identify token returned');
      }

      // Get user details
      const {identityToken, email, fullName} = appleAuthResponse;

      const details = {
        apple_id: identityToken,
        name: fullName
          ? `${fullName.givenName} ${fullName.familyName}`.trim()
          : '',
        email: email || '',
      };

      // Call your backend API with the Apple credentials
      const response = await socialLogin({details: details});
      return response?.data?.data;
    } catch (error) {
      console.log('Apple sign in error', error);
      return rejectWithValue(error.message || 'Apple login failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth: state => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
    },
    logout: state => {
      state.authData = null;
      state.userToken = null;
      state.isSuccess = false;
      removeToken();
      clearUniversalToken();
      // Clear guest details from AsyncStorage
      AsyncStorage.removeItem(GUEST_DETAILS_KEY).catch(error => {
      console.error('Error removing guest details:', error);
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createUserAccount.pending, state => {
        state.isLoading = true;
        state.isFailure = false;
        state.isSuccess = false;
        state.errorMessage = '';
      })
      .addCase(createUserAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.authData = action.payload.user;
        // state.userToken = action.payload.token;
      })
      .addCase(createUserAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      .addCase(loginUserWithEmail.pending, state => {
        state.isLoading = true;
        state.isFailure = false;
        state.isSuccess = false;
        state.errorMessage = '';
      })
      .addCase(loginUserWithEmail.fulfilled, (state, action) => {
        console.log('action.payload', action.payload);

        state.isLoading = false;
        state.isSuccess = true;
        state.authData = action.payload.data;
        state.userToken = action.payload.data.token;
        saveToken(action.payload.data.token);
      })
      .addCase(loginUserWithEmail.rejected, (state, action) => {
        console.log('Reject login with email', action.payload);
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      .addCase(loginUserWithPhone.pending, state => {
        state.isLoading = true;
        state.isFailure = false;
        state.isSuccess = false;
        state.errorMessage = '';
      })
      .addCase(loginUserWithPhone.fulfilled, (state, action) => {
        console.log('action.payload login user with phone', action.payload);
        state.isLoading = false;
        state.isSuccess = true;
        state.authData = action.payload.data;
        state.userToken = action.payload.data.token;
      })
      .addCase(loginUserWithPhone.rejected, (state, action) => {
        console.log('action.pyaload login user with phone', action.payload);

        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      .addCase(checkStoredToken.pending, state => {
        state.isLoading = true;
        state.isFailure = false;
        state.isSuccess = false;
        state.errorMessage = '';
      })
      .addCase(checkStoredToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userToken = action.payload.token;
      })
      .addCase(checkStoredToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      .addCase(googleLogin.pending, state => {
        state.isLoading = true;
        state.isFailure = false;
        state.isSuccess = false;
        state.errorMessage = '';
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        console.log('Action payload for google login', action.payload);

        state.authData = action.payload;
        state.userToken = action.payload.token;
        saveToken(action.payload.token);
      })
      .addCase(googleLogin.rejected, (state, action) => {
        console.log('action.payload google login rejected', action.payload);
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      .addCase(facebookLogin.pending, state => {
        state.isLoading = true;
        state.isFailure = false;
        state.isSuccess = false;
        state.errorMessage = '';
      })
      .addCase(facebookLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.authData = action.payload;
        state.userToken = action.payload.token;
        saveToken(action.payload.token);
      })
      .addCase(facebookLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      .addCase(forgotPasswordThunk.pending, state => {
        state.isLoading = true;
        state.isSuccess = false;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action?.payload?.data?.message === 'SUCCESS') {
          state.isSuccess = true;
        }
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload.message;
      })
      .addCase(sendOtpToBackendThunk.pending, state => {
        state.isLoading = true;
        state.isSuccess = false;
      })
      .addCase(sendOtpToBackendThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.authData = action.payload.data;
        state.userToken = action.payload.data.token;
        saveToken(action.payload.data.token);
      })
      .addCase(sendOtpToBackendThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      .addCase(appleLogin.pending, state => {
        state.isLoading = true;
        state.isFailure = false;
        state.isSuccess = false;
        state.errorMessage = '';
      })
      .addCase(appleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.authData = action.payload;
        state.userToken = action.payload.token;
        saveToken(action.payload.token);
      })
      .addCase(appleLogin.rejected, (state, action) => {
        console.log('action.payload apple login rejected', action.payload);
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      });
  },
});

export const {resetAuth, logout} = authSlice.actions;
export default authSlice.reducer;
