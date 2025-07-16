import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, {useEffect} from 'react';
import {Images} from '../../Config';
import {COLOR, Matrics, typography} from '../../Config/AppStyling';
import LoginOptionButton from '../../Components/UI/LoginOptionButton';
import AuthScreenHeaders from '../../Components/UI/AuthScreenHeaders';
import {useNavigation} from '@react-navigation/native';
import i18n from '../../i18n/i18n';
import {useDispatch, useSelector} from 'react-redux';
import {
  facebookLogin,
  googleLogin,
  appleLogin,
} from '../../Redux/Reducers/AuthSlice';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import CustomLoader from '../../Components/Loader/CustomLoader';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import ReferralModal from '../../Components/UI/ReferralModal';
import {useReferralCode} from '../../Context/ReferralCodeContext';

const Login = () => {
  const navigation = useNavigation();
  const globalLanguage = useSelector(
    state => state.selectedLanguage.globalLanguage,
  );
  const AuthState = useSelector(state => state.auth);

  const dispatch = useDispatch();
  const [showReferallCodeModal, setShowReferallCodeModal] =
    React.useState(false);
  const {setWhatTriggered} = useReferralCode();
  const handleAppleLogin = async () => {
    try {
      // Check if Apple Sign In is available
      const isAppleAuthSupported = await appleAuth.isSupported;
      if (!isAppleAuthSupported) {
        console.log('Apple Sign In is not supported on this device');
        return;
      }
      setWhatTriggered('apple');
    } catch (error) {
      console.log('Error initiating Apple login:', error);
    }
  };
  const handleGoogleLogin = () => {
    setShowReferallCodeModal(true);
    setWhatTriggered('google');
  };
  const renderContent = () => (
    <>
      {AuthState?.isLoading && (
        <Animated.View
          entering={FadeIn.duration(25)}
          exiting={FadeOut.duration(25)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            height: Matrics?.screenHeight,
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
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <AuthScreenHeaders
          title={i18n.t('MainScreen.WelcomeToLogin')}
          showBackButton={false}
        />

        <View style={styles.bottomContainer}>
          <View style={[styles.buttonContainer]}>
            <LoginOptionButton
              title={i18n.t('MainScreen.email')}
              isActive={true}
              iconName={'EMAIL'}
              handlePress={() => navigation.navigate('LoginWithEmail')}
              width={
                globalLanguage === 'ar' ? Matrics?.s(160) : Matrics?.s(150)
              }
            />
            <LoginOptionButton
              title={i18n.t('MainScreen.phone')}
              isActive={false}
              iconName={'PHONE'}
              handlePress={() => navigation.navigate('LoginWithPhone')}
              width={
                globalLanguage === 'ar' ? Matrics?.s(160) : Matrics?.s(150)
              }
            />
          </View>
          <View style={styles.lastContainer}>
            <View>
              <Text style={styles.orTextStyle}>{i18n.t('MainScreen.or')}</Text>
            </View>
            <View>
              <Text style={styles.signInWith}>
                {i18n.t('MainScreen.signInWith')}
              </Text>
            </View>
            <View style={styles.socailLoginContainer}>
              <TouchableOpacity
                onPress={() => handleGoogleLogin()}
                activeOpacity={0.7}>
                <Image style={styles.socialIcons} source={Images.GOOGLE} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  console.log('Login pressed');
                  dispatch(facebookLogin());
                }}
                activeOpacity={0.7}>
                <Image style={styles.socialIcons} source={Images.FACEBOOK} />
              </TouchableOpacity>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={() => handleAppleLogin()}
                  activeOpacity={0.7}>
                  <Image style={styles.socialIcons} source={Images.APPLE} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {showReferallCodeModal && (
          <ReferralModal
            visible={showReferallCodeModal}
            onClose={() => setShowReferallCodeModal(false)}
          />
        )}
      </ScrollView>
    </>
  );
  return Platform.OS === 'android' ? (
    <SafeAreaView style={[styles.safeAreaView, {paddingTop: '7%'}]}>
      {renderContent()}
    </SafeAreaView>
  ) : (
    <View style={styles.safeAreaView}>{renderContent()}</View>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddinTop: '7%',
  },
  halfCircle: {
    width: Matrics?.screenWidth * 2.5,
    height: Matrics?.screenWidth * 2.5,
    backgroundColor: 'white',
    position: 'absolute',
    alignItems: 'center',
    bottom: -Matrics?.screenWidth * 1.95,
    left: -Matrics?.screenWidth * 0.76,
    borderRadius: Matrics?.screenWidth * 1.5,
    //     zIndex: 2,
  },
  topContainer: {
    zIndex: 1,
  },
  headerBottomContainer: {
    position: 'absolute',
    top: Matrics?.screenHeight * 0.47,
  },
  appLogoContainer: {
    width: Matrics?.screenWidth,
  },
  appLogo: {
    width: Matrics?.screenWidth * 0.4,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  pageTitleText: {
    fontFamily: typography?.fontFamily?.Montserrat?.Bold,
    fontSize: typography?.fontSizes?.fs22,
    color: COLOR?.TITLE_COLOR,
    textAlign: 'center',
  },
  image: {
    width: Matrics?.screenWidth,
    resizeMode: 'cover',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Matrics?.s(20),
    marginTop: Matrics?.vs(25),
    // paddingHorizontal: Matrics?.s(20),
  },
  socailLoginContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: Matrics?.screenHeight * 0.04,
    width: Matrics?.screenWidth * 0.6,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  socialIcons: {
    width: Matrics?.s(28),
    height: Matrics?.vs(28),
    resizeMode: 'contain',
  },
  bottomContainer: {
    position: 'absolute',
    top: Matrics?.vs(420),
    width: Matrics?.screenWidth,
    height: Matrics?.screenHeight * 0.5,
    alignItems: 'center',
    zIndex: 3,
  },
  orTextStyle: {
    fontFamily: typography?.fontFamily?.Montserrat?.Medium,
    textAlign: 'center',
    fontSize: typography?.fontSizes?.fs16,
    marginBottom: Matrics?.vs(10),
    color: COLOR?.DIM_TEXT_COLOR,
  },
  signInWith: {
    fontFamily: typography?.fontFamily?.Montserrat?.SemiBold,
    textAlign: 'center',
    fontSize: typography?.fontSizes?.fs18,
    color: COLOR?.DIM_TEXT_COLOR,
  },
  lastContainer: {
    flexDirection: 'column',
    height: Matrics?.screenHeight * 0.11,
    justifyContent: 'space-around',
    marginTop: Matrics?.screenHeight * 0.03,
  },
});

export default Login;
