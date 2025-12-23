import {Platform, NativeModules} from 'react-native';
import RNRestart from 'react-native-restart';

const {AppRestartManager} = NativeModules;

export const restartApp = () => {
  if (Platform.OS === 'ios') {
    // iOS → Native JS reload (Safe)
    AppRestartManager?.restartApp();
  } else {
    // Android → Full restart
    RNRestart.restart();
  }
};
