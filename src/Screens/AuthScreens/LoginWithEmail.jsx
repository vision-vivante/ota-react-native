import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';

import React, {useState} from 'react';
import AuthScreenHeaders from '../../Components/UI/AuthScreenHeaders';
import CustomInput from '../../Components/UI/CustomInput';
import {COLOR, Matrics, typography} from '../../Config/AppStyling';
import {Images} from '../../Config';
import {useNavigation} from '@react-navigation/native';
import {loginUserWithEmail} from '../../Redux/Reducers/AuthSlice';
import {useDispatch, useSelector} from 'react-redux';
import CustomLoader from '../../Components/Loader/CustomLoader';
import {checkUniversalToken} from '../../Redux/Reducers/ContentTokenSlice';
import {errorToast} from '../../Helpers/ToastMessage';
import {SafeAreaView} from 'react-native-safe-area-context';
import i18n from '../../i18n/i18n';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

const LoginWithEmail = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const AuthState = useSelector(state => state.auth);
  const token = useSelector(state => state.contentToken.universalToken);
  const dispatch = useDispatch();
  const globalLanguage = useSelector(
    state => state.selectedLanguage.globalLanguage,
  );

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateEmail = value => {
    if (!value.trim()) {
      const error = i18n.t('validationMessages.noEmail');
      return error;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      const error = i18n.t('validationMessages.notValidEmail');
      return error;
    }
    return '';
  };

  const validatePassword = value => {
    if (!value) {
      const error = i18n.t('validationMessages.noPassword');
      return error;
    }
    if (value.length < 8) {
      const error = i18n.t('validationMessages.shortPassword');
      return error;
    }
    return '';
  };

  const handleEmailChange = value => {
    setEmail(value);
    console.log('errors', errors);

    setErrors(prev => ({...prev, email: validateEmail(value)}));
  };

  const handlePasswordChange = value => {
    setPassword(value);
    console.log('errors', errors);
    setErrors(prev => ({...prev, password: validatePassword(value)}));
  };

  const validateForm = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    return !(emailError || passwordError);
  };

  const onLoginUserPress = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const userDetailsForLogin = {
        email: email,
        password,
        login_with_otp: false,
        type: 'user',
      };
      let currentToken = token;
      if (!currentToken) {
        const tokenResult = await dispatch(checkUniversalToken());

        if (checkUniversalToken.fulfilled.match(tokenResult)) {
          currentToken = tokenResult.payload.token;
        } else {
          console.log('Unable to get authentication token');
          return;
        }
      }
      const response = await dispatch(
        loginUserWithEmail({
          details: userDetailsForLogin,
        }),
      );
      if (response?.error?.message === 'Rejected') {
        errorToast(response?.payload?.message || response?.payload?.error);
      }
    } catch (error) {
      console.log('Error', 'login in account', error);
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
            height: Matrics.screenHeight,
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
      <TouchableWithoutFeedback style={{flex: 1}} onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={styles.keyboardAvoidingView}>
          <View style={styles.container}>
            <AuthScreenHeaders
              title={i18n.t('LoginWithEmail.loginWithEmail')}
              showBackButton={true}
            />
            <View style={styles.inputContainer}>
              <CustomInput
                label={i18n.t('LoginWithEmail.email')}
                value={email}
                onChangeText={handleEmailChange}
                placeholder={i18n.t('LoginWithEmail.emailPlaceholder')}
                type="email"
                error={errors.email}
                required
              />
              <CustomInput
                label={i18n.t('LoginWithEmail.password')}
                value={password}
                onChangeText={handlePasswordChange}
                placeholder={i18n.t('LoginWithEmail.passwordPlaceholder')}
                type="password"
                error={errors.password}
                required
              />
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                activeOpacity={0.7}>
                <Text style={styles.textStyle}>
                  {i18n.t('LoginWithEmail.forgotPassword')}
                </Text>
              </TouchableOpacity>
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
                onPress={onLoginUserPress}
                disabled={AuthState?.isLoading}
                activeOpacity={0.7}>
                <Image
                  style={styles.bottomElipseButtonStlye}
                  source={Images.BOTTOM_ELIPSE_BUTTON}
                />
              </TouchableOpacity>
            </View>
          </View>
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
    //     paddingHorizontal: 16,
  },
  inputContainer: {
    paddingHorizontal: Matrics.s(10),
    marginTop: Matrics.screenHeight * 0.25,
    flex: 1,
    gap: Matrics.vs(10),
  },
  textStyle: {
    fontFamily: typography.fontFamily.Montserrat.Regular,
    fontSize: typography.fontSizes.fs15,
    color: COLOR.DIM_TEXT_COLOR,
    textDecorationLine: 'underline',
  },
  bottomElipseButtonStlye: {
    width: Matrics.screenWidth * 0.5,
    height: Matrics.screenHeight * 0.2,
    resizeMode: 'contain',
  },
  buttonContainer: {
    borderTopLeftRadius: 170,
    marginRight: Matrics.s(-17),
  },
  parentButtonContainer: {
    alignItems: 'flex-end',
  },
});

export default LoginWithEmail;
