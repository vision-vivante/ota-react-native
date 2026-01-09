import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLocales} from 'react-native-localize';
import {I18nManager, NativeModules, Platform} from 'react-native';
import i18n from '../../i18n/i18n';


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
const updateRTL = async (language) => {
  const isRTL = language === 'ar';
  
  console.log('🔄 Setting RTL for language:', language, 'isRTL:', isRTL);
  console.log('📱 Current RTL state BEFORE:', I18nManager.isRTL);
  
  // Force RTL settings
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
  
  // iOS specific RTL handling
  if (Platform.OS === 'ios') {
  I18nManager.doLeftAndRightSwapInRTL();
  }
  
  console.log('📱 Current RTL state AFTER:', I18nManager.isRTL !== isRTL);
  
  // Return whether restart is needed
  return I18nManager.isRTL !== isRTL;
};

export const initializeLanguage = () => async dispatch => {
  try {
    const savedLang = await AsyncStorage.getItem('language');
    const deviceLang = getLocales()[0]?.languageCode || 'en';
    
    // Determine which language to use
    const languageToUse = savedLang || deviceLang;
    
    console.log('🚀 Initializing app with language:', languageToUse);
    console.log('💾 Saved language:', savedLang);
    console.log('📱 Device language:', deviceLang);
    
    // Set Redux state
    dispatch(setGlobalLanguage(languageToUse));
    
    // Change i18n language
    await i18n.changeLanguage(languageToUse);
    
    // Update RTL settings
    const needsRestart = await updateRTL(languageToUse);
    
    // Save language if it wasn't saved before
    if (!savedLang) {
      await AsyncStorage.setItem('language', languageToUse);
    }
    
    console.log('✅ Language initialized successfully');
    console.log('🔄 Needs restart:', needsRestart);
    
  } catch (error) {
    console.error('❌ Error initializing language:', error);
    
    // Fallback
    // const fallbackLang = 'en';
    // dispatch(setGlobalLanguage(fallbackLang));
    // await i18n.changeLanguage(fallbackLang);
    // await updateRTL(fallbackLang);
  }
};

export const setLanguageWithStorage = language => async dispatch => {
  try {
    console.log('🔄 Changing language to:', language);
    
    // Save to AsyncStorage FIRST
    await AsyncStorage.setItem('language', language);
    
    // Update Redux state
    dispatch(setGlobalLanguage(language));
    
    // Change i18n language
    await i18n.changeLanguage(language);
    
    // Update RTL settings
    const needsRestart = await updateRTL(language);
    
    console.log('✅ Language changed successfully');
    console.log('🔄 Needs restart:', needsRestart);
    
  } catch (error) {
    console.error('❌ Error saving language:', error);
    throw error;
  }
};

export default languageSlice.reducer;