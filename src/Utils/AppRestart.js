import {Platform, NativeModules} from 'react-native';
import RNRestart from 'react-native-restart';

export const restartApp = language => {
  if (Platform.OS === 'android') {
    RNRestart.Restart();
  } else {
    const isRTL = language === 'ar';
    NativeModules.RTLManager?.setRTLDirection(isRTL);
  }
};
