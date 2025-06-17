import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {Dropdown} from 'react-native-element-dropdown';
import {CountryPicker} from 'react-native-country-codes-picker';
import {COLOR, Matrics, typography} from '../Config/AppStyling';
import debounce from 'lodash.debounce';
import i18n from '../i18n/i18n';
import {countryPhoneLength} from '../Utils/countryPhoneLength';
import {Images} from '../Config';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useDispatch, useSelector} from 'react-redux';
import {getCityDetailsThunk} from '../Redux/Reducers/HotelReducer/GetCitySlice';

const GENDER_OPTIONS = [
  {label: 'Male', value: 'male'},
  {label: 'Female', value: 'female'},
  {label: 'Transgender', value: 'transgender'},
];

const DOCUMENT_TYPES = [
  {label: 'Passport', value: 'passport'},
  {label: 'Driving License', value: 'driving_license'},
];

const GuestForm = ({guestIndex, guestData, onSave, onCancel}) => {
  const dispatch = useDispatch();
  const {cityDetails, loadingCityDetails} = useSelector(state => state.getCity);

  const isPrimaryGuest = guestIndex === 0;
  const [formData, setFormData] = useState({
    firstName: guestData?.firstName || '',
    lastName: guestData?.lastName || '',
    gender: guestData?.gender || '',
    age: guestData?.age || '',
    documentType: guestData?.documentType || '',
    documentNumber: guestData?.documentNumber || '',
    address: guestData?.address || '',
    city: guestData?.city || '',
    country: guestData?.country || '',
    postalCode: guestData?.postalCode || '',
    email: guestData?.email || '',
    phone: guestData?.phone || '',
    countryCode: guestData?.countryCode || '+91',
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    age: '',
    documentType: '',
    documentNumber: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    email: '',
    phone: '',
  });
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    countryPhoneLength.find(
      c => c.phone === formData.countryCode.replace('+', ''),
    ) || null,
  );
  const [showCityFlatList, setShowCityFlatList] = useState(false);
  const [selectedCityIndex, setSelectedCityIndex] = useState(null);

  // Debounced search function for city
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
          console.log('[debouncedSearch] API Response:', response);
          console.log('[debouncedSearch] City Details:', response.payload);
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

  const handleCityFlatListShow = text => {
    if (text.length === 0) {
      setShowCityFlatList(false);
    } else {
      setShowCityFlatList(true);
    }
  };

  const handleCityFlatListPress = (cityName, index) => {
    console.log('[handleCityFlatListPress] Pressed city:', cityName);
    console.log('[handleCityFlatListPress] City details:', cityDetails[index]);
    Keyboard.dismiss();
    setSelectedCityIndex(index);
    setFormData(prev => ({...prev, city: cityName}));

    // Set country from the selected city details
    if (cityDetails[index]?.countryName) {
      setFormData(prev => ({...prev, country: cityDetails[index].countryName}));
      setErrors(prev => ({
        ...prev,
        country: validateText(cityDetails[index].countryName, 'Country'),
      }));
    }

    setShowCityFlatList(false);
    setErrors(prev => ({...prev, city: validateText(cityName, 'City')}));
  };

  // Validation functions
  const validateText = (value, fieldName) => {
    if (!value.trim()) {
      return i18n.t(`validationMessages.no${fieldName}`);
    }
    return '';
  };

  const validateGender = value => {
    if (!value) {
      return i18n.t('validationMessages.noGender');
    }
    return '';
  };

  const validateAge = value => {
    if (!value) {
      return i18n.t('validationMessages.noAge');
    }
    const age = parseInt(value, 10);
    if (isNaN(age) || age < 1) {
      return i18n.t('validationMessages.invalidAge');
    }
    if (isPrimaryGuest && age <= 18) {
      return i18n.t('validationMessages.ageOver18');
    }
    return '';
  };

  const validateDocumentType = value => {
    if (!value) {
      return i18n.t('validationMessages.noDocumentType');
    }
    return '';
  };

  const validateDocumentNumber = value => {
    if (!value.trim()) {
      return i18n.t('validationMessages.noDocumentNumber');
    }
    if (!/^[a-zA-Z0-9-]+$/.test(value)) {
      return i18n.t('validationMessages.invalidDocumentNumber');
    }
    return '';
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
    if (!/^\d+$/.test(value)) {
      return i18n.t('validationMessages.validPhoneLength');
    }

    if (!selectedCountry) {
      return i18n.t('validationMessages.validPhoneLength');
    }

    const {phoneLength, min, max} = selectedCountry;
    const length = value.length;

    if (phoneLength) {
      if (Array.isArray(phoneLength)) {
        if (!phoneLength.includes(length)) {
          return i18n
            .t('validationMessages.validPhoneLength')
            .replace('{length}', phoneLength.join(' or '));
        }
      } else if (length !== phoneLength) {
        return i18n
          .t('validationMessages.validPhoneLength')
          .replace('{length}', phoneLength);
      }
    } else if (min && max && (length < min || length > max)) {
      return i18n
        .t('validationMessages.validPhoneLength')
        .replace('{length}', `${min}-${max}`);
    }

    return '';
  };

  // Debounced validation for text and numeric inputs
  const debouncedValidate = debounce((field, value, validateFn) => {
    setErrors(prev => ({...prev, [field]: validateFn(value)}));
  }, 300);

  // Handle input changes
  const handleTextChange = (field, value, validateFn) => {
    setFormData(prev => ({...prev, [field]: value}));
    debouncedValidate(field, value, validateFn);
  };

  // Special handler for city input with search functionality
  const handleCityChange = value => {
    debouncedSearch(value);
    handleCityFlatListShow(value);
    setFormData(prev => ({...prev, city: value}));
    setErrors(prev => ({...prev, city: validateText(value, 'City')}));
  };

  const handleDropdownChange = (field, value, validateFn) => {
    setFormData(prev => ({...prev, [field]: value}));
    setErrors(prev => ({...prev, [field]: validateFn(value)}));
  };

  const handleCountryCodeChange = dial_code => {
    const country = countryPhoneLength.find(
      c => c.phone === dial_code.replace('+', ''),
    );
    setSelectedCountry(country || null);
    setFormData(prev => ({...prev, countryCode: dial_code}));
    setShowCountryPicker(false);
    setErrors(prev => ({...prev, phone: validatePhone(formData.phone)}));
  };

  const handleSave = () => {
    const validations = {
      firstName: validateText(formData.firstName, 'FirstName'),
      lastName: validateText(formData.lastName, 'LastName'),
      gender: validateGender(formData.gender),
      age: validateAge(formData.age),
      email: isPrimaryGuest
        ? validateEmail(formData.email)
        : formData.email.trim()
        ? validateEmail(formData.email)
        : '',
      documentType: isPrimaryGuest
        ? validateDocumentType(formData.documentType)
        : '',
      documentNumber: isPrimaryGuest
        ? validateDocumentNumber(formData.documentNumber)
        : '',
      address: isPrimaryGuest ? validateText(formData.address, 'Address') : '',
      city: isPrimaryGuest ? validateText(formData.city, 'City') : '',
      country: isPrimaryGuest ? validateText(formData.country, 'Country') : '',
      postalCode: isPrimaryGuest
        ? validateText(formData.postalCode, 'PostalCode')
        : '',
      phone: isPrimaryGuest ? validatePhone(formData.phone) : '',
    };
    console.log('validations', validations);

    setErrors(validations);
    const hasErrors = Object.values(validations).some(error => error !== '');
    if (hasErrors) {
      return;
    }
    onSave(guestIndex, formData);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAwareScrollView>
        <View style={styles.formContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: Matrics.vs(15),
            }}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Image
                source={Images.CROSS_BLACK}
                style={{
                  height: Matrics.vs(25),
                  width: Matrics.vs(25),
                  resizeMode: 'contain',
                }}
              />
            </TouchableOpacity>
            <Text style={styles.formTitle}>
              {isPrimaryGuest
                ? 'Add Primary Guest'
                : `Add Person ${guestIndex + 1}`}
            </Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Image
                source={Images.CHECK_BLACK}
                style={{
                  height: Matrics.vs(25),
                  width: Matrics.vs(25),
                  resizeMode: 'contain',
                }}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              First Name <Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.firstName ? styles.inputError : null,
              ]}
              placeholder="Enter your first name"
              placeholderTextColor="#999"
              value={formData.firstName}
              onChangeText={value =>
                handleTextChange(
                  'firstName',
                  value,
                  validateText.bind(null, 'FirstName'),
                )
              }
            />
            {errors.firstName ? (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            ) : null}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Last Name <Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.lastName ? styles.inputError : null]}
              placeholder="Enter your last name"
              placeholderTextColor="#999"
              value={formData.lastName}
              onChangeText={value =>
                handleTextChange(
                  'lastName',
                  value,
                  validateText.bind(null, 'LastName'),
                )
              }
            />
            {errors.lastName ? (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            ) : null}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Gender <Text style={styles.asterisk}>*</Text>
            </Text>
            <Dropdown
              style={[
                styles.dropdown,
                errors.gender ? styles.inputError : null,
              ]}
              data={GENDER_OPTIONS}
              labelField="label"
              valueField="value"
              placeholder="Select gender"
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownText}
              itemTextStyle={styles.dropdownText}
              containerStyle={styles.dropdownContainer}
              value={formData.gender}
              onChange={item =>
                handleDropdownChange('gender', item.value, validateGender)
              }
              fontFamily={typography.fontFamily.Montserrat.Regular}
            />
            {errors.gender ? (
              <Text style={styles.errorText}>{errors.gender}</Text>
            ) : null}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Age <Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.age ? styles.inputError : null]}
              placeholder="Enter age"
              placeholderTextColor="#999"
              value={formData.age}
              onChangeText={value =>
                handleTextChange('age', value, validateAge)
              }
              keyboardType="numeric"
            />
            {errors.age ? (
              <Text style={styles.errorText}>{errors.age}</Text>
            ) : null}
          </View>
          {isPrimaryGuest && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Document Type <Text style={styles.asterisk}>*</Text>
                </Text>
                <Dropdown
                  style={[
                    styles.dropdown,
                    errors.documentType ? styles.inputError : null,
                  ]}
                  data={DOCUMENT_TYPES}
                  labelField="label"
                  valueField="value"
                  placeholder="Select document type"
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownText}
                  itemTextStyle={styles.dropdownText}
                  containerStyle={styles.dropdownContainer}
                  value={formData.documentType}
                  onChange={item =>
                    handleDropdownChange(
                      'documentType',
                      item.value,
                      validateDocumentType,
                    )
                  }
                  fontFamily={typography.fontFamily.Montserrat.Regular}
                />
                {errors.documentType ? (
                  <Text style={styles.errorText}>{errors.documentType}</Text>
                ) : null}
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Document Number <Text style={styles.asterisk}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.documentNumber ? styles.inputError : null,
                  ]}
                  placeholder="Enter document number"
                  placeholderTextColor="#999"
                  value={formData.documentNumber}
                  onChangeText={value =>
                    handleTextChange(
                      'documentNumber',
                      value,
                      validateDocumentNumber,
                    )
                  }
                />
                {errors.documentNumber ? (
                  <Text style={styles.errorText}>{errors.documentNumber}</Text>
                ) : null}
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Address <Text style={styles.asterisk}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.address ? styles.inputError : null,
                  ]}
                  placeholder="Enter address"
                  placeholderTextColor="#999"
                  value={formData.address}
                  onChangeText={value =>
                    handleTextChange(
                      'address',
                      value,
                      validateText.bind(null, 'Address'),
                    )
                  }
                />
                {errors.address ? (
                  <Text style={styles.errorText}>{errors.address}</Text>
                ) : null}
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  City <Text style={styles.asterisk}>*</Text>
                </Text>
                <View style={styles.cityInputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      errors.city ? styles.inputError : null,
                    ]}
                    placeholder="Enter city"
                    placeholderTextColor="#999"
                    value={formData.city}
                    onChangeText={handleCityChange}
                    onFocus={() => {
                      setFormData(prev => ({...prev, city: ''}));
                      setShowCityFlatList(false);
                    }}
                    keyboardShouldPersistTaps="handled"
                    multiline={Platform.OS === 'android' ? true : false}
                    scrollEnabled={true}
                  />
                  <View style={styles.cityDropdownContainer}>
                    {loadingCityDetails && showCityFlatList ? (
                      <View style={styles.cityFlatListStyle}>
                        <ActivityIndicator
                          size="large"
                          color={COLOR.PRIMARY}
                          style={styles.loader}
                        />
                      </View>
                    ) : (
                      showCityFlatList &&
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
                          renderItem={({item, index}) => (
                            <TouchableOpacity
                              style={styles.cityItem}
                              onPress={() =>
                                handleCityFlatListPress(item.cityName, index)
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
                          )}
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
                  Country <Text style={styles.asterisk}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.country ? styles.inputError : null,
                  ]}
                  placeholder="Enter country"
                  placeholderTextColor="#999"
                  value={formData.country}
                  onChangeText={value =>
                    handleTextChange(
                      'country',
                      value,
                      validateText.bind(null, 'Country'),
                    )
                  }
                />
                {errors.country ? (
                  <Text style={styles.errorText}>{errors.country}</Text>
                ) : null}
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Postal Code <Text style={styles.asterisk}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.postalCode ? styles.inputError : null,
                  ]}
                  placeholder="Enter postal code"
                  placeholderTextColor="#999"
                  value={formData.postalCode}
                  onChangeText={value =>
                    handleTextChange(
                      'postalCode',
                      value,
                      validateText.bind(null, 'PostalCode'),
                    )
                  }
                />
                {errors.postalCode ? (
                  <Text style={styles.errorText}>{errors.postalCode}</Text>
                ) : null}
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Phone Number <Text style={styles.asterisk}>*</Text>
                </Text>
                <View style={styles.phoneNumberContainer}>
                  <TouchableOpacity
                    onPress={() => setShowCountryPicker(true)}
                    style={styles.countryPicker}
                    activeOpacity={0.7}>
                    <Text style={styles.countryPickerTextStyle}>
                      {formData.countryCode}
                    </Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[
                      styles.input,
                      {flex: 1},
                      errors.phone ? styles.inputError : null,
                    ]}
                    placeholder="Enter phone number"
                    placeholderTextColor="#999"
                    value={formData.phone}
                    onChangeText={value =>
                      handleTextChange('phone', value, validatePhone)
                    }
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.phone ? (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                ) : null}
                <CountryPicker
                  show={showCountryPicker}
                  pickerButtonOnPress={item =>
                    handleCountryCodeChange(item.dial_code)
                  }
                  popularCountries={['en', 'ua', 'pl']}
                  searchMessage={i18n.t('CreateAccount.searchMessage')}
                  onBackdropPress={() => setShowCountryPicker(false)}
                  enableModalAvoiding={true}
                  androidWindowSoftInputMode="pan"
                  style={{
                    modal: {
                      height: 350,
                    },
                    textInput: {
                      height: Matrics.vs(40),
                      borderRadius: Matrics.s(10),
                      fontFamily: typography.fontFamily.Montserrat.Regular,
                      paddingLeft: Matrics.s(12),
                      backgroundColor: '#fff',
                      elevation: 2,
                    },
                    countryName: {
                      fontFamily: typography.fontFamily.Montserrat.Regular,
                      color: '#000',
                    },
                    dialCode: {
                      fontFamily: typography.fontFamily.Montserrat.Regular,
                      color: '#000',
                    },
                    countryButtonStyles: {
                      height: Matrics.vs(50),
                      backgroundColor: '#fff',
                      elevation: 2,
                    },
                  }}
                />
              </View>
            </>
          )}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Email {isPrimaryGuest && <Text style={styles.asterisk}>*</Text>}
            </Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Enter email"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={value =>
                handleTextChange('email', value, validateEmail)
              }
              keyboardType="email-address"
              numberOfLines={1}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    //     padding: Matrics.s(20),
    paddingVertical: Matrics.vs(5),
    paddingHorizontal: Matrics.vs(20),
    backgroundColor: '#fff',
  },
  formTitle: {
    fontSize: Matrics.s(16),
    fontFamily: typography.fontFamily.Montserrat.Bold,
    color: '#6A1B9A', // Matches the purple in the screenshot
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: Matrics.vs(15), // Increased spacing between fields
  },
  label: {
    fontSize: Matrics.s(14), // Reduced from 16px
    fontFamily: typography.fontFamily.Montserrat.Regular,
    color: '#000', // Black to match screenshot
    marginBottom: Matrics.vs(4), // Reduced from 5px
    textTransform: 'capitalize',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: Matrics.s(10), // Increased from 4px
    padding: Matrics.s(10),
    paddingVertical: Matrics.vs(8), // Increased from 10px
    height: Matrics.vs(42), // Consistent height for all inputs
    fontSize: Matrics.s(16),
    fontFamily: typography.fontFamily.Montserrat.Regular,
    borderWidth: 1,
    borderColor: COLOR.BORDER_COLOR,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: Matrics.s(10),
    padding: Matrics.s(10),
    paddingVertical: Matrics.vs(8),
    height: Matrics.vs(48), // Consistent height for all dropdowns
    fontSize: Matrics.s(16),
    fontFamily: typography.fontFamily.Montserrat.Bold,
    borderWidth: 1,
    borderColor: COLOR.BORDER_COLOR,
  },
  dropdownPlaceholder: {
    fontSize: Matrics.s(16),
    fontFamily: typography.fontFamily.Montserrat.Regular,
    color: '#999', // Light grey placeholder
  },
  dropdownText: {
    fontSize: Matrics.s(16),
    fontFamily: typography.fontFamily.Montserrat.Regular,
    color: '#000',
  },
  dropdownContainer: {
    borderRadius: Matrics.s(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputError: {
    borderWidth: 1, // Add border for errors since no default border
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
    height: Matrics.vs(42), // Match input height
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
    color: '#000', // Black to match screenshot
    fontSize: Matrics.s(16),
    fontFamily: typography.fontFamily.Montserrat.Regular,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Matrics.vs(20),
  },
  cancelButton: {},
  saveButton: {},
  buttonText: {
    fontSize: Matrics.s(14),
    color: COLOR.WHITE,
    fontFamily: typography.fontFamily.Montserrat.Bold,
  },
  asterisk: {
    color: '#e74c3c',
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
});

export default GuestForm;
