import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLocales} from 'react-native-localize';
import {I18nManager, NativeModules, Platform} from 'react-native';
import i18n from '../../i18n/i18n';

const {RTLManager} = NativeModules;
const initialState = {
  globalLanguage: null,
};

const languageSlice = createSlice({
  name: 'languageSlice',
  initialState: initialState,
  reducers: {
    setGlobalLanguage: (state, action) => {
      state.globalLanguage = action?.payload;
    },
  },
});

export const {setGlobalLanguage} = languageSlice.actions;

// Helper function to handle RTL based on language
const updateRTL = language => {
  const isRTL = language === 'ar';

  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);

  if (Platform.OS === 'ios' && NativeModules.RTLManager) {
    NativeModules.RTLManager.setRTLDirection(isRTL);
  }
};

export const initializeLanguage = lang => async dispatch => {
  try {
    const deviceLang = getLocales()[0]?.languageCode || 'en';
    const savedLang = await AsyncStorage.getItem('language');
    if (savedLang === null) {
      dispatch(setGlobalLanguage(deviceLang));
      i18n.changeLanguage(deviceLang);
      updateRTL(deviceLang);
    } else {
      // Subsequent launch: use saved language
      console.log('Using saved language:', savedLang);
      dispatch(setGlobalLanguage(savedLang));
      i18n.changeLanguage(savedLang);
      updateRTL(savedLang);
    }
  } catch (error) {
    console.error('Error initializing language:', error);
    const fallbackLang = getLocales()[0]?.languageCode || 'en';
    dispatch(setGlobalLanguage(fallbackLang));
    i18n.changeLanguage(fallbackLang);
    updateRTL(fallbackLang);
  }
};

export const setLanguageWithStorage = language => async dispatch => {
  try {
    await AsyncStorage.setItem('language', language);
    dispatch(setGlobalLanguage(language));
    i18n.changeLanguage(language);
    updateRTL(language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

export default languageSlice.reducer;
