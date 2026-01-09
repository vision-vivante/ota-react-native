import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLocales} from 'react-native-localize';
import {I18nManager, NativeModules, Platform} from 'react-native';
import i18n from '../../i18n/i18n';
import RNRestart from 'react-native-restart';

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

// 🔧 FIXED: Helper function to handle RTL based on language
const updateRTL = async language => {
  const shouldBeRTL = language === 'ar';
  const currentlyRTL = I18nManager.isRTL;

  console.log('🔄 RTL check:', {
    language,
    shouldBeRTL,
    currentlyRTL,
  });

  // ✅ No change needed
  if (shouldBeRTL === currentlyRTL) {
    return false;
  }

  // ✅ Apply change
  I18nManager.allowRTL(shouldBeRTL);
  I18nManager.forceRTL(shouldBeRTL);

  return true; // restart REQUIRED
};

export const initializeLanguage = () => async dispatch => {
  try {
    const savedLang = await AsyncStorage.getItem('language');
    const languageToUse = savedLang || 'en';

    dispatch(setGlobalLanguage(languageToUse));
    await i18n.changeLanguage(languageToUse);

    const needsRestart = await updateRTL(languageToUse);

    // 🔒 Prevent infinite restart loop
    const restartDone = await AsyncStorage.getItem('__rtl_restart_done__');

    if (
      needsRestart &&
      Platform.OS === 'ios' &&
      restartDone !== languageToUse
    ) {
      // Mark restart as done for this language
      await AsyncStorage.setItem('__rtl_restart_done__', languageToUse);

      RNRestart.Restart();
    }
  } catch (error) {
    console.error('❌ initializeLanguage failed:', error);
  }
};

export const setLanguageWithStorage = language => async dispatch => {
  try {
    await AsyncStorage.setItem('language', language);

    // 🔓 Allow restart again for new language
    await AsyncStorage.removeItem('__rtl_restart_done__');

    dispatch(setGlobalLanguage(language));
    await i18n.changeLanguage(language);

    const needsRestart = await updateRTL(language);

    if (needsRestart && Platform.OS === 'ios') {
      RNRestart.Restart();
    }
  } catch (error) {
    console.error('❌ Error saving language:', error);
    throw error;
  }
};

export default languageSlice.reducer;
