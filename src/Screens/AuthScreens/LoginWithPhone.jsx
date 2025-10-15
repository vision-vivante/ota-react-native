import {
  SafeAreaView,
  View,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import React, {useEffect, useState, useRef} from 'react';
import AuthScreenHeaders from '../../Components/UI/AuthScreenHeaders';
import CustomInput from '../../Components/UI/CustomInput';
import {COLOR, Matrics, typography} from '../../Config/AppStyling';
import {Images} from '../../Config';
import {CountryPicker} from 'react-native-country-codes-picker';
import {loginUserWithPhone} from '../../Redux/Reducers/AuthSlice';
import {checkUniversalToken} from '../../Redux/Reducers/ContentTokenSlice';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import CustomLoader from '../../Components/Loader/CustomLoader';
import {useNavigation} from '@react-navigation/native';
import i18n from '../../i18n/i18n';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {countryPhoneLength} from '../../Utils/countryPhoneLength';
import {errorToast} from '../../Helpers/ToastMessage';

const LoginWithPhone = () => {
  const globalLanguage = useSelector(
    state => state.selectedLanguage.globalLanguage,
  );
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [phone, setPhone] = useState('');
  const [show, setShow] = useState(false);
  const [countryCodeName, setCountryCodeName] = useState('');
  const scrollRef = useRef(null);
  const [errors, setErrors] = useState({
    phone: '',
  });
  const AuthState = useSelector(state => state.auth);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useSelector(state => state.contentToken.universalToken);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  const validatePhone = value => {
    if (!value.trim()) return i18n.t('validationMessages.noPhone');

    // Find the selected country from the list
    const country = countryPhoneLength.find(
      c => c.phone === countryCode.replace('+', ''),
    );
    setCountryCodeName(country.code);

    if (!country) return i18n.t('validationMessages.validPhoneLength');

    const phoneLength =
      country.phoneLength ||
      (country.min && country.max ? [country.min, country.max] : null);

    // Handle different phoneLength formats
    if (Array.isArray(phoneLength)) {
      if (!phoneLength.includes(value.length)) {
        return i18n
          .t('validationMessages.validPhoneLength')
          .replace('{length}', phoneLength.join(' or '));
      }
    } else if (typeof phoneLength === 'number') {
      if (value.length !== phoneLength) {
        return i18n
          .t('validationMessages.validPhoneLength')
          .replace('{length}', phoneLength);
      }
    } else if (country.min && country.max) {
      if (value.length < country.min || value.length > country.max) {
        return i18n
          .t('validationMessages.validPhoneLength')
          .replace('{length}', `${country.min}-${country.max}`);
      }
    }

    if (!/^\d+$/.test(value))
      return i18n.t('validationMessages.validPhoneLength');
    return '';
  };
  const handlePhoneChange = value => {
    setPhone(value);
    setErrors(prev => ({...prev, phone: validatePhone(value)}));
  };
  const [countryCode, setCountryCode] = useState('+91');

  const validateForm = () => {
    const phoneError = validatePhone(phone);
    setErrors({
      phone: phoneError,
    });
    return !phoneError;
  };
  const scrollToInput = reactNode => {
    if (reactNode) {
      scrollRef.current?.scrollToFocusedInput(reactNode);
    }
  };
  const onLoginButtonPress = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const loginDetails = {
        phoneNo: phone,
        countryCode: countryCode,
        type: 'user',
      };
      let currentToken = token;
      if (!currentToken) {
        const tokenResult = await dispatch(checkUniversalToken());
        if (checkUniversalToken.fulfilled.match(tokenResult)) {
          currentToken = tokenResult.payload.token;
        } else {
          return;
        }
      }

      const response = await dispatch(
        loginUserWithPhone({details: loginDetails, contentToken: currentToken}),
      );

      if (response?.payload?.status === 200) {
        navigation.navigate('EnterOtp', {
          phone: phone,
          countryCode: countryCode,
        });
        Toast.show({
          type: 'success',
          text1: i18n.t('Toast.otpSentSuccess'),
        });
      } else if (response?.payload?.status === 'error') {
        console.log('Response', response);
        
        errorToast(response?.payload?.message);
      } else if (response?.error) {
        errorToast('Phone No. does not exist');
      }
    } catch (error) {
      console.log('Error', error);
    }
  };
  const renderContent = () => (
    <>
      {AuthState?.isLoading && (
        <Animated.View
          entering={FadeIn.duration(25)}
          exiting={FadeOut.duration(25)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            height: Matrics.screenHeight * 1.2,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        />
      )}
      {AuthState?.isLoading && (
        <CustomLoader
          message={i18n.t('validationMessages.checkingCreditionals')}
          isVisible={AuthState?.isLoading}
        />
      )}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{flex: 1}}>
        <KeyboardAwareScrollView style={{flex: 1}}>
          <View style={styles.container}>
            <AuthScreenHeaders
              title={i18n.t('LoginWithPhone.loginWithPhone')}
              showCreateAccountButton={false}
              showBackButton={true}
            />
            <View style={styles.inputContainer}>
              <View style={styles.phoneNumberContainer}>
                <TouchableOpacity
                  onPress={() => setShow(true)}
                  style={[
                    styles.countryPicker,
                    {
                      marginTop: errors.phone ? Matrics.vs(-5) : Matrics.vs(14),
                    },
                  ]}
                  activeOpacity={0.7}>
                  <Text style={styles.countryPickerTextStyle}>
                    {countryCode}
                  </Text>
                </TouchableOpacity>
                <View style={{flex: 1}}>
                  <CustomInput
                    label={i18n.t('LoginWithPhone.phone')}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    placeholder={i18n.t('LoginWithPhone.phonePlaceholder')}
                    type="phone"
                    required
                    labelStyle={{right: Matrics.screenWidth * 0.2}}
                    error={errors.phone}
                    onFocus={event => {
                      scrollToInput(event.target);
                    }}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.parentButtonContainer,
                  {
                    alignItems:
                      globalLanguage === 'ar' ? 'flex-start' : 'flex-end',
                    marginLeft: globalLanguage === 'ar' ? -15 : 0,
                    marginTop: globalLanguage === 'ar' ? 10 : 0,
                  },
                ]}>
                <TouchableOpacity
                  style={[
                    styles.buttonContainer,
                    AuthState.isLoading && {opacity: 0.5},
                  ]}
                  onPress={() => onLoginButtonPress()}
                  disabled={AuthState?.isLoading}
                  activeOpacity={0.7}>
                  <Image
                    style={styles.bottomElipseButtonStlye}
                    source={Images.BOTTOM_ELIPSE_BUTTON}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <CountryPicker
            show={show}
            pickerButtonOnPress={item => {
              setCountryCode(item.dial_code);
              setShow(false);
            }}
            searchMessage="Search For Country"
            onBackdropPress={() => setShow(false)}
            style={{
              modal: {
                height: 350,
              },
              textInput: {
                height: Matrics.vs(40),
                borderRadius: Matrics.s(7),
                fontFamily: typography.fontFamily.Montserrat.Regular,
                paddingLeft: Matrics.s(10),
              },
              countryName: {
                fontFamily: typography.fontFamily.Montserrat.Regular,
              },
              dialCode: {
                fontFamily: typography.fontFamily.Montserrat.Regular,
              },
              countryButtonStyles: {
                height: Matrics.vs(50),
              },
            }}
          />
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </>
  );
  return Platform.OS === 'android' ? (
    <SafeAreaView style={styles.safeAreaView}>{renderContent()}</SafeAreaView>
  ) : (
    <View style={{flex: 1}}>{renderContent()}</View>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    // Add padding to ensure content is visible above keyboard
    //     paddingBottom: Platform.OS === 'ios' ? 50 : Matrics.vs(50),
  },
  container: {
    flex: 1,
    paddingTop: '7%',
    //     paddingHorizontal: 16,
  },
  inputContainer: {
    paddingHorizontal: Matrics.s(10),
    marginTop: Matrics.vs(165),
    flex: 1,
  },
  textStyle: {
    fontFamily: typography.fontFamily.Montserrat.Regular,
    fontSize: typography.fontSizes.fs15,
    color: COLOR.DIM_TEXT_COLOR,
    textDecorationLine: 'underline',
  },
  bottomElipseButtonStlye: {
    width: Matrics.screenWidth * 0.5,
    height: Matrics.screenHeight * 0.25,
    resizeMode: 'contain',
  },
  buttonContainer: {
    borderTopLeftRadius: 170,
    marginRight: Matrics.s(-13),
    marginBottom: Matrics.vs(-6),
    marginTop: Matrics.vs(50),
  },
  parentButtonContainer: {
    alignItems: 'flex-end',
  },
  countryPicker: {
    width: Matrics.screenWidth * 0.2,
    backgroundColor: '#F5F5F5',
    height: Matrics.vs(40),
    borderRadius: Matrics.s(7),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Matrics.vs(9),
    marginRight: Matrics.s(5),
  },
  countryPickerTextStyle: {
    color: COLOR.DIM_TEXT_COLOR,
    fontSize: typography.fontSizes.fs16,
    fontFamily: typography.fontFamily.Montserrat.Regular,
  },
  phoneNumberContainer: {
    flexDirection: 'row',
    // backgroundColor: 'red',
    alignItems: 'center',
  },
});

export default LoginWithPhone;
