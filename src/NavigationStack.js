import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

// Screens
import Splash from './splash';
import Login from './Screens/AuthScreens/Login';
import EnterOtp from './Screens/AuthScreens/EnterOtp';
import ForgotPassword from './Screens/AuthScreens/ForgotPassword';
import LoginWithEmail from './Screens/AuthScreens/LoginWithEmail';
import LoginWithPhone from './Screens/AuthScreens/LoginWithPhone';
import CreateAccount from './Screens/AuthScreens/CreateAccount';
import CheckEmail from './Screens/AuthScreens/CheckEmail';
import {
  checkUniversalToken,
  getUniversalToken,
} from './Redux/Reducers/ContentTokenSlice';
import {checkStoredToken} from './Redux/Reducers/AuthSlice';
import Booking from './Screens/Bookings/Booking';
import Referrals from './Screens/Referrals/Referrals';
import {Images} from './Config';
import {Image, Pressable, Text, View} from 'react-native';
import {COLOR, Matrics, typography} from './Config/AppStyling';
import HomeStack from './Screens/Home';
import BookingStack from './Screens/Bookings';
import ProfileStack from './Screens/Profile';
import {getDeviceLocation} from './Redux/Reducers/LocationReducer';
import {initializeLanguage} from './Redux/Reducers/LanguageSlice';
import * as RNLocalize from 'react-native-localize';
import {getCurrencyThunk} from './Redux/Reducers/CurrencyReducer';
import i18n from './i18n/i18n';
import ReferralStack from './Screens/Referrals';
import ChangePassword from './Screens/Profile/ChangePassword';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {consumePendingHotelFlow} from './Utils/GuestBookingFlowFunctions';

// Define Stacks
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator({
  screenOptions: {
    animation: 'shift',
    tabBarPressColor: 'transparent',
  },
});

// Auth Screens
const AuthRoutes = {
  Home: HomeStack,
  Login,
  CheckEmail,
  CreateAccount,
  EnterOtp,
  ForgotPassword,
  LoginWithEmail,
  LoginWithPhone,
};

// Protected Screens
const MainRoutes = {
  Home: HomeStack,
  Booking: BookingStack,
  Cashback: ReferralStack,
  Profile: ProfileStack,
};

const tabLabels = {
  Home: i18n.t('Tabs.Home'),
  Cashback: i18n.t('Tabs.Cashback'),
  Profile: i18n.t('Tabs.Profile'),
  Booking: i18n.t('Tabs.Booking'),
};

// Auth Stack (Login, Register, etc.)
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{headerShown: false, animationEnabled: false}}>
    {Object.keys(AuthRoutes).map(route => (
      <Stack.Screen key={route} name={route} component={AuthRoutes[route]} />
    ))}
  </Stack.Navigator>
);

// Protected Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      tabBarPressColor: 'transparent',
      headerShown: false,
      tabBarLabel: '',
      tabBarStyle: {
        height: Matrics.vs(70),
        paddingBottom: Matrics.vs(5),
        paddingTop: Matrics.vs(15),
        backgroundColor: '#fff',
        elevation: 8,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -1},
      },
      tabBarItemStyle: {
        width: Matrics.screenWidth / 4,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Matrics.s(5),
      },
      tabBarIconStyle: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      tabBarButton: props => (
        <Pressable
          {...props}
          android_ripple={{color: 'transparent'}}
          android_disableSound={true}
          hitSlop={0}
        />
      ),
      tabBarIcon: ({focused}) => {
        let iconSource;
        switch (route.name) {
          case 'Home':
            iconSource = focused ? Images.HOUSE : Images.HOUSE_INACTIVE;
            break;
          case 'Profile':
            iconSource = focused
              ? Images.USER_PLACEHOLDER
              : Images.USER_PLACEHOLDER;
            break;
          case 'Booking':
            iconSource = focused
              ? Images.BOOKING_ACTIVE
              : Images.BOOKING_INACTIVE;
            break;
          case 'Cashback':
            iconSource = focused
              ? Images.REFERRAL_ACTIVE
              : Images.REFERRAL_INACTIVE;
            break;
          default:
            iconSource = Images.HOUSE_INACTIVE;
        }

        // Return the image component with custom label
        return (
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <View
              style={{
                borderTopWidth: focused ? 2 : 0, // Width 2 when focused
                borderTopColor: COLOR.PRIMARY, // Primary color
                width: Matrics.s(60), // Full tab width
                height: focused ? 2 : 0, // Ensure the View has height when focused
                position: 'absolute', // Position at the top
                top: -16, // Align with the top of the tab item
                zIndex: 1, // Ensure it's above other content
              }}
            />
            <Image
              source={iconSource}
              style={{
                height: focused ? 25 : 23,
                width: Matrics.s(25),
                opacity: focused ? 1 : 0.8,
                resizeMode: 'contain',
              }}
            />
            <Text
              style={{
                fontSize: focused
                  ? typography.fontSizes.fs14
                  : typography.fontSizes.fs12,
                fontFamily: focused
                  ? typography.fontFamily.Montserrat.SemiBold
                  : typography.fontFamily.Montserrat.Medium,
                color: focused ? COLOR.PRIMARY : COLOR.DIM_TEXT_COLOR,
                marginTop: Matrics.vs(2),
                opacity: focused ? 1 : 0.8,
                textAlign: 'center',
                width: '100%',
                paddingHorizontal: Matrics.s(2),
              }}
              numberOfLines={1}
              ellipsizeMode="tail">
              {tabLabels[route.name]}
            </Text>
          </View>
        );
      },
    })}>
    {Object.keys(MainRoutes).map(route => (
      <Tab.Screen key={route} name={route} component={MainRoutes[route]} />
    ))}
  </Tab.Navigator>
);

// Main Navigation Stack
const NavigationStack = () => {
  const dispatch = useDispatch();
  const {userToken, authData} = useSelector(state => state.auth);
  const [isSplashVisible, setSplashVisible] = useState(true);
  const [isNavReady, setNavReady] = useState(false);
  const navigationRef = useNavigationContainerRef();
  console.log('Auth data', authData);

  // Helper function to determine which screen to show initially
  const renderInitialScreen = () => {
    if (!userToken) {
      return <Stack.Screen name="AuthStack" component={AuthStack} />;
    }

    return <Stack.Screen name="MainTabs" component={MainTabs} />;
  };

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId:
        '41423272295-vm0l15ab248c7nd2isc2o5u83jg6241p.apps.googleusercontent.com',
    });

    const initializeApp = async () => {
      const splashDelay = new Promise(resolve => setTimeout(resolve, 5000));
      const {payload} = await dispatch(checkUniversalToken());
      console.log('Payload content token', payload);

      await dispatch(checkStoredToken());
      if (!payload.token) {
        console.log('No token found, getting new token');
        await dispatch(getUniversalToken())
          .then(result => {
            console.log('Dispatch result:', result);
          })
          .catch(error => {
            console.error('Dispatch error:', error);
          });
      }

      dispatch(getDeviceLocation());
      const deviceLanguage = RNLocalize.getLocales()[0]?.languageCode;

      dispatch(initializeLanguage(deviceLanguage));
      await dispatch(getCurrencyThunk());
      // Wait for both the token logic and the 5-second delay to complete
      await splashDelay;
      setSplashVisible(false);
    };

    initializeApp();
  }, [dispatch]);

  // Resume any pending hotel booking flow after authentication completes
  useEffect(() => {
    const resumePendingHotelFlow = async () => {
      if (!userToken || !isNavReady) {
        return;
      }

      const pending = await consumePendingHotelFlow();
      if (pending?.hotelId) {
        const {hotelId, giataId, provider, targetRoute, targetParams} = pending;
        navigationRef.current?.navigate('Home', {
          screen: 'Hotels',
          params: {
            screen: targetRoute || 'HotelDetail',
            params: {
              provider,
              hotelId,
              GiataId: giataId,
              ...(targetParams || {}),
            },
          },
        });
      }
    };

    resumePendingHotelFlow();
  }, [userToken, isNavReady, navigationRef]);

  if (isSplashVisible) {
    return <Splash />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => setNavReady(true)}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {renderInitialScreen()}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationStack;
