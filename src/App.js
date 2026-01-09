if (__DEV__) {
  require('./../ReactotronConfig');
}
import React, {useEffect} from 'react';
import NavigationStack from './NavigationStack';
import {Provider} from 'react-redux';
import {Store} from './Redux/store';
import Toast from 'react-native-toast-message';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {toastConfig} from './Helpers';
import {I18nextProvider} from 'react-i18next';
import i18n from './i18n/i18n';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {RoomProvider} from './Context/RoomContext';
import {FilterProvider} from './Context/FilterContext';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {ConfirmationModalProvider} from './Context/ConfirmationModalContext';
import {HeaderOptionProvider} from './Context/HeaderOptionContext';
import {StripeProvider} from '@stripe/stripe-react-native';
import {CardProvider} from './Context/CardDetailContext';
import CustomStatusBar from './Components/UI/CustomStatusBar';
import {PolicyInfoProvider} from './Context/PolicyInfoContext';
import Config from 'react-native-config';
import {I18nManager} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {initializeLanguage} from './Redux/Reducers/LanguageSlice';

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize language on app start
    dispatch(initializeLanguage());
  }, [dispatch]);

  return (
    <>
      <HeaderOptionProvider>
        <CardProvider>
          <ConfirmationModalProvider>
            <RoomProvider>
              <PolicyInfoProvider>
                <FilterProvider>
                  <NavigationStack />
                  <Toast config={toastConfig} autoHide={true} />
                </FilterProvider>
              </PolicyInfoProvider>
            </RoomProvider>
          </ConfirmationModalProvider>
        </CardProvider>
      </HeaderOptionProvider>
    </>
  );
};

const App = () => {
  // ❌ Remove these hardcoded lines - they cause the issue!
  // I18nManager.allowRTL(true);
  // I18nManager.forceRTL(true);

  return (
    <StripeProvider publishableKey="pk_test_HaildCNdMAkdT0HruXtJPvig">
      <KeyboardProvider>
        <GestureHandlerRootView style={{flex: 1}}>
          <SafeAreaProvider>
            <CustomStatusBar />
            <Provider store={Store}>
              <I18nextProvider i18n={i18n}>
                <AppContent />
              </I18nextProvider>
            </Provider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </StripeProvider>
  );
};

export default App;
