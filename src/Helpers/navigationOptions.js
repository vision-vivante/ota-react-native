import {I18nManager, Platform} from 'react-native';

export const rtlNavigationOptions = {
  headerTitleAlign: I18nManager.isRTL ? 'right' : 'left',

  headerBackTitleVisible: false,

  headerLeft: Platform.OS === 'ios'
    ? undefined // iOS handles back gesture automatically
    : undefined,

  headerStyle: {
    direction: I18nManager.isRTL ? 'rtl' : 'ltr',
  },

  headerTitleStyle: {
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },

  // 🔥 IMPORTANT: iOS gesture direction
  gestureDirection: I18nManager.isRTL ? 'horizontal-inverted' : 'horizontal',
};
