import {
  SafeAreaView,
  // ScrollView,
  View,
  // KeyboardAvoidingView,
  Platform,
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
import {useDispatch, useSelector} from 'react-redux';
import {
  createUserAccount,
  facebookLogin,
  googleLogin,
} from '../../Redux/Reducers/AuthSlice';
import {CountryPicker} from 'react-native-country-codes-picker';
import {useNavigation} from '@react-navigation/native';
import CustomLoader from '../../Components/Loader/CustomLoader';
import {checkUniversalToken} from '../../Redux/Reducers/ContentTokenSlice';
import {errorToast, success} from '../../Helpers/ToastMessage';
import i18n from '../../i18n/i18n';
import {countryPhoneLength} from '../../Utils/countryPhoneLength';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

const CreateAccount = () => {
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [countryCodeName, setCountryCodeName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referalCode, setReferalCode] = useState('');
  const [show, setShow] = useState(false);

  const token = useSelector(state => state.contentToken.universalToken);

  // Error states
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const AuthState = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  // Validation functions
  const validateName = value => {
    if (!value.trim()) {
      const error = i18n.t('validationMessages.noName');
      return error;
    }
    if (value.length < 3) {
      const error = i18n.t('validationMessages.shortName');
      return error;
    }
    if (!/^[a-zA-Z\s]*$/.test(value)) {
      const error = i18n.t('validationMessages.invalidName');
      return error;
    }
    return '';
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

  const validatePhone = value => {
    if (!value.trim()) {
      return i18n.t('validationMessages.noPhone');
    }

    // Find the selected country from the list
    const country = countryPhoneLength.find(
      c => c.phone === countryCode.replace('+', ''),
    );
    setCountryCodeName(country.code);
    console.log('country', country);

    if (!country) {
      return i18n.t('validationMessages.validPhoneLength');
    }

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

    if (!/^\d+$/.test(value)) {
      return i18n.t('validationMessages.validPhoneLength');
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

  const validateConfirmPassword = value => {
    if (!value) {
      const error = i18n.t('validationMessages.noConfirmPassword');
      return error;
    }
    if (value !== password) {
      const error = i18n.t('validationMessages.noMatch');
      return error;
    }
    return '';
  };

  // Handle input changes with validation
  const handleNameChange = value => {
    setName(value);
    setErrors(prev => ({...prev, name: validateName(value)}));
  };

  const handleEmailChange = value => {
    setEmail(value);
    setErrors(prev => ({...prev, email: validateEmail(value)}));
  };

  const handlePhoneChange = value => {
    setPhone(value);
    setErrors(prev => ({...prev, phone: validatePhone(value)}));
  };

  const handlePasswordChange = value => {
    setPassword(value);
    setErrors(prev => ({...prev, password: validatePassword(value)}));
  };

  const handleConfirmPasswordChange = value => {
    setConfirmPassword(value);
    setErrors(prev => ({
      ...prev,
      confirmPassword: validateConfirmPassword(value),
    }));
  };

  const validateForm = () => {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    setErrors({
      name: nameError,
      email: emailError,
      phone: phoneError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    return !(
      nameError ||
      emailError ||
      phoneError ||
      passwordError ||
      confirmPasswordError
    );
  };

  const onCreateAccountPress = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const userDetailsForCreateAccount = {
        name,
        email,
        phone_number: phone,
        password,
        referral_code: referalCode,
        country_code: countryCode,
        country_code_name: countryCodeName,
        // username: name,
        role: 'user',
      };
      let currentToken = token;
      if (!currentToken) {
        const tokenResult = await dispatch(checkUniversalToken());
        if (checkUniversalToken.fulfilled.match(tokenResult)) {
          currentToken = tokenResult.payload.token;
        } else {
          // Handle case where token retrieval failed
          console.log('Unable to get authentication token');
          return;
        }
      }
      console.log('userDetailsForCreateAccount', userDetailsForCreateAccount);

      const response = await dispatch(
        createUserAccount({
          details: userDetailsForCreateAccount,
          contentToken: currentToken,
        }),
      );

      console.log('response sign up', response);

      if (response?.payload?.status === true) {
        success(
          i18n.t('Toast.accountCreatedSuccess'),
          i18n.t('Toast.checkEmail'),
        );
        navigation.replace('Login');
      } else if (response?.payload?.status === false) {
        errorToast(response?.payload?.error);
      } else if (response?.error?.message === 'Rejected') {
        errorToast(response?.payload?.error);
      }
    } catch (error) {
      console.log('Error', 'creating account');
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
          message="Checking your details..."
          isVisible={AuthState?.isLoading}
        />
      )}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{flex: 1}}>
        <KeyboardAwareScrollView style={styles.keyboardAvoidingView}>
          <View style={styles.container}>
            <AuthScreenHeaders
              title={i18n.t('CreateAccount.createNewAccount')}
              showCreateAccountButton={false}
              showLoginButton={true}
              showBackButton={false}
            />
            <View style={styles.inputContainer}>
              <CustomInput
                label={i18n.t('CreateAccount.name')}
                value={name}
                onChangeText={handleNameChange}
                placeholder={i18n.t('CreateAccount.namePlaceholder')}
                type="text"
                required
                error={errors.name}
              />
              <CustomInput
                label={i18n.t('CreateAccount.email')}
                value={email}
                onChangeText={handleEmailChange}
                placeholder={i18n.t('CreateAccount.emailPlaceholder')}
                type="email"
                required
                error={errors.email}
              />
              <View style={styles.phoneNumberContainer}>
                <TouchableOpacity
                  onPress={() => setShow(true)}
                  style={[
                    styles.countryPicker,
                    {
                      marginTop: errors.phone ? Matrics.vs(-5) : Matrics.vs(14),
                      // position: 'absolute',
                      // top: 20
                    },
                  ]}
                  activeOpacity={0.7}>
                  <Text style={styles.countryPickerTextStyle}>
                    {countryCode}
                  </Text>
                </TouchableOpacity>
                <View style={{flex: 1}}>
                  <CustomInput
                    label={i18n.t('CreateAccount.phone')}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    placeholder={i18n.t('CreateAccount.phonePlaceholder')}
                    type="phone"
                    required
                    error={errors.phone}
                    labelStyle={{right: Matrics.screenWidth * 0.21}}
                    containerStyle={styles.phoneNumberField}
                    // inputStyle={{marginBottom: Matrics.s(3)}}
                  />
                </View>
              </View>
              <CustomInput
                label={i18n.t('CreateAccount.password')}
                value={password}
                onChangeText={handlePasswordChange}
                placeholder={i18n.t('CreateAccount.passwordPlaceholder')}
                type="password"
                required
                error={errors.password}
                labelStyle={{marginLeft: Matrics.s(3)}}
              />
              <CustomInput
                label={i18n.t('CreateAccount.confirmPassword')}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                placeholder={i18n.t('CreateAccount.confirmPasswordPlaceholder')}
                type="password"
                required
                error={errors.confirmPassword}
                labelStyle={{marginLeft: Matrics.s(3)}}
              />
              <CustomInput
                label={i18n.t('CreateAccount.referalCode')}
                value={referalCode}
                onChangeText={setReferalCode}
                placeholder={i18n.t('CreateAccount.referalCodePlaceholder')}
                type="text"
                labelStyle={{marginLeft: Matrics.s(3)}}
              />
              <View style={styles.lastContainer}>
                <View style={styles.iconContainer}>
                  <View>
                    <Text style={styles.orTextStyle}>
                      {i18n.t('CreateAccount.or')}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.signInWith}>
                      {i18n.t('CreateAccount.signUpWith')}
                    </Text>
                  </View>
                  <View style={styles.socailLoginContainer}>
                    <TouchableOpacity
                      onPress={() => dispatch(googleLogin())}
                      activeOpacity={0.7}>
                      <Image
                        style={styles.socialIcons}
                        source={Images.GOOGLE}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => dispatch(facebookLogin())}
                      activeOpacity={0.7}>
                      <Image
                        style={styles.socialIcons}
                        source={Images.FACEBOOK}
                      />
                    </TouchableOpacity>
                    <View>
                      <Image style={styles.socialIcons} source={Images.APPLE} />
                    </View>
                  </View>
                </View>
                <View style={styles.parentButtonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.buttonContainer,
                      AuthState.isLoading && {opacity: 0.5},
                    ]}
                    onPress={onCreateAccountPress}
                    disabled={AuthState.isLoading}
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
                console.log('Selected country:', item);
                setCountryCode(item.dial_code);
                setShow(false);
              }}
              popularCountries={['en', 'ua', 'pl']}
              searchMessage={i18n.t('CreateAccount.searchMessage')}
              onBackdropPress={() => setShow(false)}
              enableModalAvoiding={true}
              androidWindowSoftInputMode="pan"
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
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </>
  );

  return Platform.OS === 'android' ? (
    <SafeAreaView style={styles.safeAreaView}>{renderContent()}</SafeAreaView>
  ) : (
    <View style={styles.safeAreaView}>{renderContent()}</View>
  );
};

export default CreateAccount;
const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
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
    paddingTop: '7%',
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
    //     position: 'absolute',
  },
  iconContainer: {
    paddingLeft: Matrics.s(20),
  },
  buttonContainer: {
    // width: Matrics.screenWidth * 0.38,
    borderTopLeftRadius: 170,
    marginRight: Matrics.s(-3),
  },
  parentButtonContainer: {
    // flexDirection: 'row',
    // width: Matrics.screenWidth * 0.5,
  },
  socailLoginContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: Matrics.screenHeight * 0.02,
    width: Matrics.screenWidth * 0.5,
    justifyContent: 'flex-start',
    gap: Matrics.s(30),
    alignItems: 'center',
  },
  socialIcons: {
    width: Matrics.s(28),
    height: Matrics.vs(28),
    resizeMode: 'contain',
  },
  orTextStyle: {
    fontFamily: typography.fontFamily.Montserrat.Medium,
    textAlign: 'left',
    fontSize: typography.fontSizes.fs16,
    marginBottom: Matrics.vs(20),
    color: COLOR.DIM_TEXT_COLOR,
  },
  signInWith: {
    fontFamily: typography.fontFamily.Montserrat.SemiBold,
    textAlign: 'left',
    fontSize: typography.fontSizes.fs18,
    color: COLOR.DIM_TEXT_COLOR,
  },
  lastContainer: {
    flexDirection: 'row',
    // height: Matrics.screenHeight * 0.3,
    justifyContent: 'center',
    marginTop: Matrics.screenHeight * 0.03,
  },
  countryPicker: {
    width: Matrics.screenWidth * 0.2,
    backgroundColor: '#F5F5F5',
    height: Matrics.vs(40),
    borderRadius: Matrics.s(7),
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: Matrics.vs(15),
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
  phoneNumberField: {
    // backgroundColor: 'red',
    // marginBottom: Matrics.s(-1)
  },
});
