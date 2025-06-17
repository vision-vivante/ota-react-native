import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import AuthScreenHeaders from '../../Components/UI/AuthScreenHeaders';
import CustomInput from '../../Components/UI/CustomInput';
import {Matrics, typography} from '../../Config/AppStyling';

import {Images} from '../../Config';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import CustomLoader from '../../Components/Loader/CustomLoader';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import i18n from '../../i18n/i18n';
import {forgotPasswordThunk} from '../../Redux/Reducers/AuthSlice';
import {errorToast} from '../../Helpers/ToastMessage';
import {useNavigation} from '@react-navigation/native';
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const AuthState = useSelector(state => state.auth);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({
    email: '',
  });
  const handleEmailChange = value => {
    setEmail(value);
    console.log('errors', errors);

    setErrors(prev => ({...prev, email: validateEmail(value)}));
  };
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

  const validateForm = () => {
    const emailError = validateEmail(email);

    setErrors({
      email: emailError,
    });

    return !emailError;
  };
  const handleForgotPassword = async () => {
    if (!validateForm()) {
      return;
    }
    console.log('Pressed');
    const details = {
      email: email.toLowerCase().trim(),
    };
    const result = await dispatch(forgotPasswordThunk({details: details}));
    console.log('result', result);
    if (result?.error) {
      const error = i18n.t('toastMessages.emailNotExist');
      errorToast(error);
    } else if (result?.payload?.message === 'SUCCESS') {
      console.log('here');

      navigation.navigate('CheckEmail');
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{flex: 1}}>
        <KeyboardAwareScrollView style={styles.keyboardAvoidingView}>
          <View style={styles.container}>
            <AuthScreenHeaders
              title="Forgot Password"
              showCreateAccountButton={false}
              showBackButton={true}
            />
            <View style={styles.inputContainer}>
              <CustomInput
                label="Email"
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Enter your email"
                type="email"
                error={errors.email}
                required
              />

              <View style={styles.parentButtonContainer}>
                <TouchableOpacity
                  style={styles.buttonContainer}
                  activeOpacity={0.7}
                  onPress={() => handleForgotPassword()}>
                  <Image
                    style={styles.bottomElipseButtonStlye}
                    source={Images.BOTTOM_ELIPSE_BUTTON}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </>
  );
  return Platform.OS === 'android' ? (
    <SafeAreaView
      style={[
        styles.safeAreaView,
        {
          paddingTop: '7%',
        },
      ]}>
      {renderContent()}
    </SafeAreaView>
  ) : (
    <View style={{flex: 1}}>{renderContent()}</View>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    paddingHorizontal: Matrics.s(10),
    marginTop: Matrics.vs(163),
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  parentButtonContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginTop: Matrics.vs(65),
    marginRight: Matrics.s(-5),
  },
  buttonContainer: {
    width: Matrics.screenWidth * 0.438,
    borderTopLeftRadius: 170,
  },
  otpTitle: {
    marginHorizontal: Matrics.s(10),
    fontFamily: typography.fontFamily.Montserrat.SemiBold,
  },
  otpHandlerContainer: {
    justifyContent: 'flex-start',
  },
  bottomElipseButtonStlye: {
    width: Matrics.screenWidth * 0.5,
    height: Matrics.screenHeight * 0.2,
    resizeMode: 'contain',
  },
});

export default ForgotPassword;
