import React, {
  useState,
  useCallback,
  useRef,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import NormalHeader from '../../Components/UI/NormalHeader';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {
  updateUserProfile,
  getUserProfileData,
} from '../../Redux/Reducers/UserProfileSlice';
import {unwrapResult} from '@reduxjs/toolkit';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import debounce from 'lodash/debounce';
import {Images} from '../../Config';
import {COLOR, Matrics, typography} from '../../Config/AppStyling';
import i18n from '../../i18n/i18n'; // Assuming i18n is available for translations
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {CountryPicker} from 'react-native-country-codes-picker';
import {countryPhoneLength} from '../../Utils/countryPhoneLength';
import {ConfirmationModalContext} from '../../Context/ConfirmationModalContext';
import ConfirmationModal from '../../Components/UI/ConfirmationModal';
import {errorToast, success} from '../../Helpers/ToastMessage';
import {getCityDetailsThunk} from '../../Redux/Reducers/HotelReducer/GetCitySlice';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomLoader from '../../Components/Loader/CustomLoader';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {userProfileData, isLoading} = useSelector(state => state.userProfile);
  const {cityDetails, loadingCityDetails} = useSelector(state => state.getCity);

  // Add refs for scrolling functionality
  const scrollViewRef = useRef(null);
  const cityInputRef = useRef(null);

  const initialProfile = {
    email: userProfileData?.email || '',
    phone: userProfileData?.phone_number?.toString() || '',
    city: userProfileData?.city,
    state: userProfileData?.state,
    zipCode: userProfileData?.zip_code,
    profilePic: userProfileData?.profile_pic || '',
    countryCode: userProfileData?.country_code || '',
    countryCodeName: userProfileData?.country_code_name || '',
    address: userProfileData?.address || '',
  };
  // Individual state for each field
  const [email, setEmail] = useState(userProfileData?.email || '');
  const [phone, setPhone] = useState(
    userProfileData?.phone_number?.toString() || '',
  );
  const [city, setCity] = useState(userProfileData?.city);
  const [state, setState] = useState(userProfileData?.state);
  const [zipCode, setZipCode] = useState(userProfileData?.zip_code);
  const [profilePic, setProfilePic] = useState(userProfileData?.profile_pic);
  const [countryCode, setCountryCode] = useState(
    userProfileData?.country_code || '+1',
  );
  const [countryCodeName, setCountryCodeName] = useState('');
  const [show, setShow] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [address, setAddress] = useState(userProfileData?.address || '');
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    city: '',
    state: '',
    zipCode: '',
    address: '',
  });
  const {showCancelModal, setShowCancelModal} = useContext(
    ConfirmationModalContext,
  );
  const bottomSheetModalRef = useRef(null);
  const [showFlatList, setShowFlatList] = useState(false);
  const [selectedCityIndex, setSelectedCityIndex] = useState(null);

  const updateHasChanges = (field, newValue) => {
    const initialValue = initialProfile[field];
    if (newValue !== initialValue) {
      setHasChanges(true);
    } else {
      const currentProfile = {
        email,
        phone,
        city,
        state,
        zipCode,
        profilePic,
        countryCode,
        countryCodeName,
        address,
      };
      currentProfile[field] = newValue;
      const noChanges = Object.keys(currentProfile).every(
        key => currentProfile[key] === initialProfile[key],
      );
      setHasChanges(!noChanges);
    }
  };

  const validateEmail = value => {
    if (!value.trim()) {
      return i18n.t('validationMessages.noEmail');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return i18n.t('validationMessages.notValidEmail');
    }
    return '';
  };

  const validatePhone = value => {
    if (!value.trim()) {
      return i18n.t('validationMessages.noPhone');
    }

    const country = countryPhoneLength.find(
      c => c.phone === countryCode.replace('+', ''),
    );
    setCountryCodeName(country.code);

    if (!country) {
      return i18n.t('validationMessages.validPhoneLength');
    }

    const phoneLength =
      country.phoneLength ||
      (country.min && country.max ? [country.min, country.max] : null);

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

  const validateCity = value => {
    if (value && value.length < 2) {
      return i18n.t('validationMessages.shortCity');
    }
    return '';
  };

  const validateState = value => {
    if (value && value.length < 2) {
      return i18n.t('validationMessages.shortState');
    }
    return '';
  };

  const validateZipCode = value => {
    if (value && !/^\d{6}$/.test(value)) {
      return i18n.t('validationMessages.invalidZip');
    }
    return '';
  };

  const validateAddress = value => {
    if (!value.trim()) {
      return i18n.t('validationMessages.noAddress');
    }
    if (value.length < 10) {
      return i18n.t('validationMessages.shortAddress');
    }
    return '';
  };

  const handleEmailChange = value => {
    setEmail(value);
    setErrors(prev => ({...prev, email: validateEmail(value)}));
    updateHasChanges('email', value);
  };

  const handlePhoneChange = value => {
    setPhone(value);
    setErrors(prev => ({...prev, phone: validatePhone(value)}));
    updateHasChanges('phone', value);
  };

  const debouncedSearchFunction = useMemo(
    () =>
      debounce(async searchText => {
        if (searchText.length < 2) {
          return;
        }
        try {
          console.log('[debouncedSearch] Searching for city:', searchText);
          const response = await dispatch(
            getCityDetailsThunk({cityName: searchText}),
          );
        } catch (error) {
          console.error('Error getting city details', error);
        }
      }, 500),
    [dispatch],
  );

  const debouncedSearch = useCallback(
    searchText => {
      debouncedSearchFunction(searchText);
    },
    [debouncedSearchFunction],
  );

  useEffect(() => {
    return () => {
      debouncedSearchFunction.cancel();
    };
  }, [debouncedSearchFunction]);

  const handleFlatListShow = text => {
    if (text.length === 0) {
      setShowFlatList(false);
    } else {
      setShowFlatList(true);
    }
  };

  const handleCityFlatListPress = (cityName, index) => {
    Keyboard.dismiss();
    setSelectedCityIndex(index);
    setCity(cityName);

    // Set country from the selected city details
    if (cityDetails[index]?.countryName) {
      setState(cityDetails[index].countryName);
      setErrors(prev => ({
        ...prev,
        state: validateState(cityDetails[index].countryName),
      }));
      updateHasChanges('state', cityDetails[index].countryName);
    }

    setShowFlatList(false);
    setErrors(prev => ({...prev, city: validateCity(cityName)}));
    updateHasChanges('city', cityName);
  };

  const handleCityChange = value => {
    debouncedSearch(value);
    handleFlatListShow(value);
    setCity(value);
    setErrors(prev => ({...prev, city: validateCity(value)}));
    updateHasChanges('city', value);
  };

  // Add function to handle city input focus with auto-scroll
  const handleCityInputFocus = () => {
    setCity('');
    setShowFlatList(false);

    // Auto-scroll to city input position after a small delay
    setTimeout(() => {
      if (cityInputRef.current && scrollViewRef.current) {
        cityInputRef.current.measure((x, y, width, height, pageX, pageY) => {
          // Calculate scroll position to ensure city dropdown + state/zip inputs are visible
          // Scroll to show the city input near the top with space for dropdown below
          const scrollPosition = Math.max(0, pageY - 150);

          scrollViewRef.current.scrollTo({
            y: scrollPosition,
            animated: true,
          });
        });
      } else {
        // Fallback if refs are not available - scroll to a reasonable position
        scrollViewRef.current?.scrollTo({
          y: 250,
          animated: true,
        });
      }
    }, 100); // Small delay to ensure layout is ready
  };

  const handleStateChange = value => {
    setState(value);
    setErrors(prev => ({...prev, state: validateState(value)}));
    updateHasChanges('state', value);
  };

  const handleZipCodeChange = value => {
    setZipCode(value);
    setErrors(prev => ({...prev, zipCode: validateZipCode(value)}));
    updateHasChanges('zipCode', value);
  };

  const handleAddressChange = value => {
    setAddress(value);
    setErrors(prev => ({...prev, address: validateAddress(value)}));
    updateHasChanges('address', value);
  };

  const validateForm = () => {
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const cityError = validateCity(city);
    const stateError = validateState(state);
    const zipCodeError = validateZipCode(zipCode);
    const addressError = validateAddress(address);

    setErrors({
      email: emailError,
      phone: phoneError,
      city: cityError,
      state: stateError,
      zipCode: zipCodeError,
      address: addressError,
    });

    return !(
      emailError ||
      phoneError ||
      cityError ||
      stateError ||
      zipCodeError ||
      addressError
    );
  };

  // Bottom Sheet Snap Points
  const snapPoints = useCallback(() => ['20%', '40%'], []);

  // Handle Modal Presentation
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleProfilePictureFromLibrary = () => {
    bottomSheetModalRef.current?.dismiss();
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (!response.didCancel && response.assets) {
        const newPic = response.assets[0].uri;
        setProfilePic(newPic);
        updateHasChanges('profilePic', newPic);
      }
    });
  };

  // Handle Image Selection from Camera
  const handleProfilePictureFromCamera = () => {
    bottomSheetModalRef.current?.dismiss();
    launchCamera({mediaType: 'photo', cameraType: 'back'}, response => {
      if (!response.didCancel && response.assets) {
        const newPic = response.assets[0].uri;
        setProfilePic(newPic);
        updateHasChanges('profilePic', newPic);
      }
    });
  };

  // Handle Profile Update
  const editProfile = async () => {
    if (!validateForm()) {
      // Only log if there are actual validation errors (not empty strings)
      const hasActualErrors = Object.values(errors).some(
        error => error && error.trim() !== '',
      );
      if (hasActualErrors) {
        console.log('[editProfile] Validation Error:', errors);
      }
      errorToast('Validation Error', 'Please fix the errors in the form.');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('phone_number', phone);
    formData.append('city', city || '');
    formData.append('state', state || '');
    formData.append('zip_code', zipCode || '');
    formData.append('country_code', countryCode || '');
    formData.append('country_code_name', countryCodeName || '');
    formData.append('address', address || '');

    if (profilePic && profilePic.startsWith('file://')) {
      formData.append('picture', {
        uri: profilePic,
        type: 'image/jpeg',
        name: 'profile_picture.jpg',
      });
    } else if (profilePic) {
      formData.append('picture', profilePic);
    }

    try {
      const response = await dispatch(updateUserProfile({details: formData}));
      const result = unwrapResult(response);

      // Refresh user profile data
      await dispatch(getUserProfileData());

      success('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.log('Update profile error:', error);
      const errorMessage =
        error?.message || 'Failed to update profile. Please try again.';
      errorToast('Error', errorMessage);
    }
  };
  const handleCrossPress = () => {
    if (hasChanges) {
      setShowCancelModal(true);
    } else {
      navigation.goBack();
    }
  };
  const renderContent = () => (
    <>
      {isLoading && (
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
      {isLoading && <CustomLoader isVisible={isLoading} />}
      <GestureHandlerRootView style={{flex: 1}}>
        {showCancelModal && (
          <ConfirmationModal
            title={'Are you sure you want to discard changes?'}
            handleYesPressed={() => {
              navigation.goBack();
              setShowCancelModal(false);
            }}
            handleNoPressed={() => {
              setShowCancelModal(false);
            }}
          />
        )}
        <BottomSheetModalProvider>
          <TouchableWithoutFeedback
            keyboardShouldPersistTaps="handled"
            onPress={Keyboard.dismiss}>
            <KeyboardAwareScrollView
              ref={scrollViewRef}
              style={styles.containerMain}
              keyboardShouldPersistTaps="handled">
              <NormalHeader
                title={i18n.t('EditProfile.title')}
                onCrossPress={handleCrossPress}
                onCheckPress={editProfile}
                showLeftButton={true}
                showRightButton={true}
                leftIconName="CROSS"
              />

              <TouchableOpacity
                style={styles.imageContainer}
                onPress={handlePresentModalPress}
                activeOpacity={0.7}>
                <Image
                  style={styles.image}
                  source={
                    profilePic
                      ? {uri: `https://otaapi.visionvivante.in/${profilePic}`}
                      : Images.USER_PLACEHOLDER
                  }
                />
                <View style={styles.editIconContainer}>
                  <Image
                    source={Images.EDIT_PROFILE_PICTURE}
                    style={styles.editIcon}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {i18n.t('EditProfile.email')}{' '}
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.email ? styles.inputError : null,
                      styles.emailInput,
                    ]}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder={i18n.t('EditProfile.emailPlaceholder')}
                    placeholderTextColor="#999"
                    multiline={false}
                  />
                  {errors.email ? (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  ) : null}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {i18n.t('CreateAccount.phone')}{' '}
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={styles.phoneNumberContainer}>
                    <TouchableOpacity
                      onPress={() => setShow(true)}
                      style={[
                        styles.countryPicker,
                        {
                          marginTop: errors.phone
                            ? Matrics.vs(1)
                            : Matrics.vs(0),
                        },
                      ]}
                      activeOpacity={0.7}>
                      <Text style={styles.countryPickerTextStyle}>
                        {countryCode}
                      </Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[
                        styles.input,
                        {flex: 1},
                        errors.phone ? styles.inputError : null,
                      ]}
                      value={phone}
                      onChangeText={handlePhoneChange}
                      placeholder={i18n.t('CreateAccount.phonePlaceholder')}
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                      scrollEnabled={true}
                    />
                  </View>
                  {errors.phone ? (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  ) : null}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {i18n.t('EditProfile.address')}{' '}
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.addressInput,
                      errors.address ? styles.inputError : null,
                    ]}
                    value={address}
                    onChangeText={handleAddressChange}
                    placeholder={i18n.t('EditProfile.addressPlaceholder')}
                    placeholderTextColor="#999"
                    multiline={false}
                  />
                  {errors.address ? (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  ) : null}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {i18n.t('EditProfile.city')}{' '}
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View ref={cityInputRef} style={styles.cityInputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        errors.city ? styles.inputError : null,
                      ]}
                      value={city}
                      onChangeText={handleCityChange}
                      onFocus={handleCityInputFocus}
                      placeholder={i18n.t('EditProfile.cityPlaceholder')}
                      placeholderTextColor="#999"
                      keyboardShouldPersistTaps="handled"
                      multiline={Platform.OS === 'android' ? true : false}
                      scrollEnabled={true}
                    />
                    <View style={styles.cityDropdownContainer}>
                      {loadingCityDetails && showFlatList ? (
                        <View style={styles.cityFlatListStyle}>
                          <ActivityIndicator
                            size="large"
                            color={COLOR.PRIMARY}
                            style={styles.loader}
                          />
                        </View>
                      ) : (
                        showFlatList &&
                        cityDetails?.length > 0 && (
                          <FlatList
                            data={cityDetails}
                            style={styles.cityFlatListStyle}
                            keyExtractor={(item, index) => index.toString()}
                            keyboardShouldPersistTaps="always"
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={true}
                            onScrollBeginDrag={() => {
                              Keyboard.dismiss();
                            }}
                            renderItem={({item, index}) => {
                              console.log('item', item);
                              return (
                                <TouchableOpacity
                                  style={styles.cityItem}
                                  onPress={() =>
                                    handleCityFlatListPress(
                                      item.cityName,
                                      index,
                                    )
                                  }
                                  activeOpacity={0.7}>
                                  <Image
                                    source={Images.DROPDOWN_LOCATION}
                                    style={styles.cityLocationIcon}
                                  />
                                  <View style={styles.cityTextContainer}>
                                    <Text style={styles.cityName}>
                                      {item.cityName}
                                    </Text>
                                    <Text style={styles.destinationName}>
                                      {item.countryName}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              );
                            }}
                          />
                        )
                      )}
                    </View>
                  </View>
                  {errors.city ? (
                    <Text style={styles.errorText}>{errors.city}</Text>
                  ) : null}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {i18n.t('EditProfile.state')}{' '}
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.state ? styles.inputError : null,
                    ]}
                    value={state}
                    onChangeText={handleStateChange}
                    placeholder={i18n.t('EditProfile.statePlaceholder')}
                    placeholderTextColor="#999"
                    multiline={Platform.OS === 'android' ? true : false}
                    scrollEnabled={true}
                  />
                  {errors.state ? (
                    <Text style={styles.errorText}>{errors.state}</Text>
                  ) : null}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {i18n.t('EditProfile.zipCode')}{' '}
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.zipCode ? styles.inputError : null,
                    ]}
                    value={zipCode}
                    onChangeText={handleZipCodeChange}
                    placeholder={i18n.t('EditProfile.zipCodePlaceholder')}
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    multiline={Platform.OS === 'android' ? true : false}
                    scrollEnabled={true}
                  />
                  {errors.zipCode ? (
                    <Text style={styles.errorText}>{errors.zipCode}</Text>
                  ) : null}
                </View>

                <CountryPicker
                  show={show}
                  pickerButtonOnPress={item => {
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

          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={1}
            snapPoints={snapPoints()}
            backgroundStyle={styles.bottomSheetBackground}
            handleIndicatorStyle={styles.handleIndicator}>
            <BottomSheetView style={styles.bottomSheetContent}>
              <Text style={styles.bottomSheetTitle}>
                {i18n.t('EditProfile.updatePicture')}
              </Text>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleProfilePictureFromCamera}>
                <Text style={styles.optionText}>
                  {i18n.t('EditProfile.takePhoto')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleProfilePictureFromLibrary}>
                <Text style={styles.optionText}>
                  {i18n.t('EditProfile.chooseFromLibrary')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => bottomSheetModalRef.current?.dismiss()}>
                <Text style={styles.cancelText}>
                  {i18n.t('EditProfile.cancel')}
                </Text>
              </TouchableOpacity>
            </BottomSheetView>
          </BottomSheetModal>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );

  return Platform.OS === 'android' ? (
    <SafeAreaView style={{flex: 1}}>{renderContent()}</SafeAreaView>
  ) : (
    <View style={{flex: 1}}>{renderContent()}</View>
  );
};

export default EditProfile;
const imageSize = Matrics.screenWidth * 0.3;
const editIconSize = Matrics.s(40);
const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
    backgroundColor: COLOR.WHITE,
  },
  imageContainer: {
    alignSelf: 'center',
    marginVertical: Matrics.vs(20),
    position: 'relative',
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: imageSize / 2,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLOR.WHITE,
    width: editIconSize,
    height: editIconSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: editIconSize / 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  editIcon: {
    width: Matrics.s(30),
    height: Matrics.vs(30),
    resizeMode: 'contain',
  },
  inputContainer: {
    paddingHorizontal: Matrics.s(10),
    marginTop: Matrics.vs(20),
    flex: 1,
    gap: Matrics.vs(10),
    paddingBottom: Matrics.vs(50),
  },
  formGroup: {
    // marginBottom: Matrics.vs(15),
  },
  label: {
    fontSize: Matrics.s(14),
    fontFamily: typography.fontFamily.Montserrat.Regular,
    color: '#000',
    marginBottom: Matrics.vs(4),
    textTransform: 'capitalize',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: Matrics.s(10),
    // padding: Matrics.s(10),
    paddingVertical: Matrics.vs(6),
    paddingHorizontal: Matrics.s(10),
    fontSize: Matrics.s(16),
    fontFamily: typography.fontFamily.Montserrat.Regular,
    borderWidth: 1,
    borderColor: COLOR.BORDER_COLOR,
    height: Matrics.vs(40),
    minHeight: Matrics.vs(40),
    maxHeight: Matrics.vs(40),
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  errorText: {
    fontSize: Matrics.s(12),
    color: '#e74c3c',
    fontFamily: typography.fontFamily.Montserrat.Regular,
    marginTop: Matrics.vs(5),
  },
  phoneNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryPicker: {
    width: Matrics.screenWidth * 0.2,
    backgroundColor: '#fff',
    height: Matrics.vs(38),
    borderRadius: Matrics.s(10),
    padding: Matrics.s(10),
    paddingVertical: Matrics.vs(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Matrics.s(5),
    borderWidth: 1,
    borderColor: COLOR.BORDER_COLOR,
  },
  countryPickerTextStyle: {
    color: '#000',
    fontSize: Matrics.s(16),
    fontFamily: typography.fontFamily.Montserrat.Regular,
  },
  bottomSheetBackground: {
    backgroundColor: COLOR.WHITE,
    borderTopLeftRadius: Matrics.s(25),
    borderTopRightRadius: Matrics.s(25),
    borderWidth: 1,
    borderColor: COLOR.PRIMARY,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  handleIndicator: {
    backgroundColor: COLOR.PRIMARY,
    width: Matrics.s(50),
    height: Matrics.vs(5),
    borderRadius: Matrics.s(2.5),
  },
  bottomSheetContent: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Matrics.vs(25),
    paddingHorizontal: Matrics.s(20),
    backgroundColor: COLOR.LIGHT_GRAY,
    borderTopLeftRadius: Matrics.s(25),
    borderTopRightRadius: Matrics.s(25),
  },
  bottomSheetTitle: {
    fontFamily: typography.fontFamily.Montserrat.Bold,
    fontSize: typography.fontSizes.fs20,
    color: COLOR.PRIMARY,
    marginBottom: Matrics.vs(25),
    textTransform: 'uppercase',
  },
  optionButton: {
    width: '100%',
    paddingVertical: Matrics.vs(10),
    alignItems: 'center',
    backgroundColor: COLOR.WHITE,
    borderRadius: Matrics.s(10),
    marginVertical: Matrics.vs(8),
  },
  optionText: {
    fontSize: typography.fontSizes.fs16,
    fontFamily: typography.fontFamily.Montserrat.Medium,
    color: COLOR.PRIMARY,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: Matrics.vs(10),
    alignItems: 'center',
    backgroundColor: COLOR.WHITE,
    borderRadius: Matrics.s(10),
    marginVertical: Matrics.vs(8),
    borderWidth: 1,
    borderColor: COLOR.RED,
  },
  cancelText: {
    fontSize: typography.fontSizes.fs16,
    fontFamily: typography.fontFamily.Montserrat.Medium,
    color: COLOR.RED,
  },
  cityInputContainer: {
    position: 'relative',
    width: '100%',
  },
  cityDropdownContainer: {
    position: 'absolute',
    top: Matrics.vs(43),
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'white',
    borderRadius: Matrics.s(10),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cityFlatListStyle: {
    maxHeight: Matrics.vs(200),
    backgroundColor: 'white',
    borderRadius: Matrics.s(10),
    paddingHorizontal: Matrics.s(10),
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Matrics.vs(12),
    borderBottomWidth: 1,
    borderBottomColor: COLOR.BORDER_COLOR,
  },
  cityLocationIcon: {
    width: Matrics.s(20),
    height: Matrics.s(20),
    resizeMode: 'contain',
    marginRight: Matrics.s(10),
  },
  cityTextContainer: {
    flex: 1,
  },
  cityName: {
    fontSize: Matrics.s(15),
    fontFamily: typography.fontFamily.Montserrat.SemiBold,
    color: '#000',
  },
  destinationName: {
    fontSize: Matrics.s(13),
    fontFamily: typography.fontFamily.Montserrat.Regular,
    color: '#666',
    marginTop: Matrics.vs(2),
  },
  loader: {
    marginTop: Matrics.vs(10),
  },
  requiredAsterisk: {
    color: COLOR.RED,
    fontSize: typography.fontSizes.fs16,
  },
  emailInput: {
    height: Matrics.vs(40),
    minHeight: Matrics.vs(40),
    maxHeight: Matrics.vs(40),
  },
  addressInput: {
    height: Matrics.vs(40),
    minHeight: Matrics.vs(40),
    maxHeight: Matrics.vs(40),
  },
});
