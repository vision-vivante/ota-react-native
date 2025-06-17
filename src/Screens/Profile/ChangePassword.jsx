import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {Matrics, COLOR, typography} from '../../Config/AppStyling';
import CustomLoader from '../../Components/Loader/CustomLoader';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import NormalHeader from '../../Components/UI/NormalHeader';
import {useNavigation, CommonActions} from '@react-navigation/native';
import {changeUserPassword} from '../../Redux/Reducers/UserProfileSlice';
import {useDispatch, useSelector} from 'react-redux';
import {errorToast, success} from '../../Helpers/ToastMessage';
import {Eye, EyeOff} from 'lucide-react-native';

const ChangePassword = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {isLoading, isSuccess, isFailure, errorMessage} = useSelector(
    state => state.userProfile,
  );

  const {userProfileData} = route?.params || {};
  const isPasswordSet = userProfileData?.isPasswordSet;
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const validateOldPassword = value => {
    if (!value) {
      const error = 'Old Password is required';
      return error;
    }
    if (value.length < 8) {
      const error = 'Password must be 8 digits';
      return error;
    }
    return '';
  };

  const validateNewPassword = value => {
    if (!value) {
      const error = 'New Password is required';
      return error;
    }
    if (value.length < 8) {
      const error = 'Password must be 8 digits';
      return error;
    }
    return '';
  };

  const validateConfirmPassword = value => {
    if (!value) {
      const error = 'Confirm Password is required';
      return error;
    }
    if (value !== newPassword) {
      const error = 'Confirm Password does not match';
      return error;
    }
  };

  const handleCurrentPasswordChange = value => {
    setCurrentPassword(value);
    setErrors(prev => ({...prev, currentPassword: validateOldPassword(value)}));
  };
  const handleNewPasswordChange = value => {
    setNewPassword(value);
    setErrors(prev => ({...prev, newPassword: validateNewPassword(value)}));
  };
  const handleConfirmPasswordChange = value => {
    setConfirmNewPassword(value);
    setErrors(prev => ({
      ...prev,
      confirmNewPassword: validateConfirmPassword(value),
    }));
  };

  const validatePassword = () => {
    const currentPasswordError = isPasswordSet
      ? validateOldPassword(currentPassword)
      : '';
    const newPasswordError = validateNewPassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(confirmNewPassword);
    setErrors({
      currentPassword: currentPasswordError,
      newPassword: newPasswordError,
      confirmNewPassword: confirmPasswordError,
    });
    return !(currentPasswordError || newPasswordError || confirmPasswordError);
  };
  const onChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }
    const detailsForPasswordChange = {
      currentPassword: isPasswordSet ? currentPassword : '',
      newPassword: newPassword,
    };
    try {
      const response = await dispatch(
        changeUserPassword({
          details: detailsForPasswordChange,
        }),
      );

      if (response?.error?.message === 'Rejected') {
        errorToast(response?.payload?.message);
        setConfirmNewPassword('');
        setNewPassword('');
        setCurrentPassword('');
      } else if (response?.payload?.message === 'SUCCESS') {
        success('Password Changed Successfully');
        setConfirmNewPassword('');
        setNewPassword('');
        setCurrentPassword('');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'MainTabs'}],
          }),
        );
      }
      console.log('response', response);
    } catch (error) {
      console.log('Error in change password screen', error);
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView style={{flex: 1}}>
          <NormalHeader
            title={isPasswordSet ? 'Change Password' : 'Set Password'}
            onCrossPress={() => navigation.goBack()}
            onCheckPress={onChangePassword}
            showLeftButton={isPasswordSet ? true : false}
            showRightButton={true}
            leftIconName="CROSS"
          />
          <View style={styles.inputContainer}>
            {isPasswordSet && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Old Password <Text style={{color: 'red'}}>*</Text>
                </Text>
                <View
                  style={[
                    styles.passwordInputContainer,
                    errors.currentPassword ? styles.inputError : null,
                  ]}>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={handleCurrentPasswordChange}
                    placeholder="Enter Old Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    activeOpacity={0.7}>
                    {showCurrentPassword ? (
                      <Eye size={20} color="#666" />
                    ) : (
                      <EyeOff size={20} color="#666" />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.currentPassword ? (
                  <Text style={styles.errorText}>{errors.currentPassword}</Text>
                ) : null}
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                New Password <Text style={{color: 'red'}}>*</Text>
              </Text>
              <View
                style={[
                  styles.passwordInputContainer,
                  errors.newPassword ? styles.inputError : null,
                ]}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={handleNewPasswordChange}
                  placeholder="Enter New Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  activeOpacity={0.7}>
                  {showNewPassword ? (
                    <Eye size={20} color="#666" />
                  ) : (
                    <EyeOff size={20} color="#666" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.newPassword ? (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              ) : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Confirm Password <Text style={{color: 'red'}}>*</Text>
              </Text>
              <View
                style={[
                  styles.passwordInputContainer,
                  errors.confirmNewPassword ? styles.inputError : null,
                ]}>
                <TextInput
                  style={styles.input}
                  value={confirmNewPassword}
                  onChangeText={handleConfirmPasswordChange}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}>
                  {showConfirmPassword ? (
                    <Eye size={20} color="#666" />
                  ) : (
                    <EyeOff size={20} color="#666" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmNewPassword ? (
                <Text style={styles.errorText}>
                  {errors.confirmNewPassword}
                </Text>
              ) : null}
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

export default ChangePassword;

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    paddingHorizontal: Matrics.s(10),
    marginTop: Matrics.vs(20),
    flex: 1,
    gap: Matrics.vs(10),
    paddingBottom: Matrics.vs(50),
  },
  formGroup: {
    marginBottom: Matrics.vs(5),
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
    paddingVertical: Matrics.vs(6),
    paddingHorizontal: Matrics.s(10),
    fontSize: Matrics.s(16),
    fontFamily: typography.fontFamily.Montserrat.Regular,
    height: Matrics.vs(40),
    minHeight: Matrics.vs(40),
    maxHeight: Matrics.vs(40),
    flex: 1,
    borderWidth: 0,
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
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Matrics.s(10),
    borderWidth: 1,
    borderColor: COLOR.BORDER_COLOR,
  },
  eyeIcon: {
    padding: 8,
  },
});
