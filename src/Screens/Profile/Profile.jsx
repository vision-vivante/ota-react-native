import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import React, {useCallback, useContext, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getUserProfileData} from '../../Redux/Reducers/UserProfileSlice';
import {COLOR, Matrics, typography} from '../../Config/AppStyling';
import {Images} from '../../Config';
import {logout} from '../../Redux/Reducers/AuthSlice';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import CustomLoader from '../../Components/Loader/CustomLoader';
import {ConfirmationModalContext} from '../../Context/ConfirmationModalContext';
import ConfirmationModal from '../../Components/UI/ConfirmationModal';

const Profile = () => {
  const userToken = useSelector(state => state.auth.userToken);
  const contentToken = useSelector(state => state.contentToken.universalToken);
  const {isLoading, userProfileData} = useSelector(state => state.userProfile);

  const navigation = useNavigation();

  const {showCancelModal, setShowCancelModal} = useContext(
    ConfirmationModalContext,
  );
  const dispatch = useDispatch();
  console.log('Show cancel modal', showCancelModal);

useFocusEffect(
  useCallback(() => {
    const backAction = () => {
      if (showCancelModal) {
        setShowCancelModal(false);
        return true; // back handled
      }
      return false; // allow default back
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove(); // ✅ safe cleanup
  }, [showCancelModal])
);


  useFocusEffect(
    useCallback(() => {
      if (!userProfileData || Object.keys(userProfileData).length === 0) {
      dispatch(getUserProfileData({userToken, contentToken}));
      }
    }, [contentToken, dispatch, userToken, userProfileData]),
  );

  return (
    <>
      {showCancelModal && (
        <ConfirmationModal
          title={'Are you sure you want to logout?'}
          handleYesPressed={() => {
            dispatch(logout());
            setShowCancelModal(false);
          }}
          handleNoPressed={() => setShowCancelModal(false)}
        />
      )}
      {isLoading && (
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
          }}>
          <CustomLoader isVisible={isLoading} />
        </Animated.View>
      )}
      <ScrollView>
        <View>
          <ImageBackground
            source={Images.PROFILE_BACKGROUND}
            imageStyle={styles.backgroundImage}
            style={styles.upperContainer}>
            <View>
              {userProfileData?.profile_pic ? (
                <Image
                  source={{
                    uri: `https://otaapi.visionvivante.in/${userProfileData?.profile_pic}`,
                  }}
                  style={styles.userProfilePic}
                />
              ) : (
                <Image
                  source={Images.USER_PLACEHOLDER}
                  style={styles.userProfilePic}
                />
              )}
            </View>
            <View>
              <Text style={styles.userName}>{userProfileData?.name}</Text>
            </View>
          </ImageBackground>
          <View style={styles.menuOptionContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.7}>
              <Image source={Images.EDIT_PROFILE} style={styles.menuIcon} />
              <Text style={styles.menuTitle}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                navigation.navigate('ChangePassword', {userProfileData})
              }
              activeOpacity={0.7}>
              <Image source={Images.LOCK} style={styles.menuIcon} />
              <Text style={styles.menuTitle}>
                {userProfileData?.isPasswordSet
                  ? 'Change Password'
                  : 'Set Password'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Support')}
              activeOpacity={0.7}>
              <Image source={Images.SUPPORT} style={styles.menuIcon} />
              <Text style={styles.menuTitle}>Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowCancelModal(true)}
              activeOpacity={0.7}>
              <Image source={Images.LOGOUT} style={styles.menuIcon} />
              <Text
                style={[
                  styles.menuTitle,
                  {
                    color: COLOR.PRIMARY,
                  },
                ]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default Profile;
const imageSize = Matrics.screenWidth * 0.3;

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },

  userProfilePic: {
    width: imageSize,
    height: imageSize,
    borderRadius: imageSize / 2,
  },
  upperContainer: {
    height: Matrics.screenHeight * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    borderBottomLeftRadius: Matrics.s(10),
    borderBottomRightRadius: Matrics.s(10),
  },
  userName: {
    fontFamily: typography.fontFamily.Montserrat.SemiBold,
    color: COLOR.WHITE,
    fontSize: typography.fontSizes.fs24,
    textAlign: 'center',
    marginTop: Matrics.vs(15),
  },
  smallImages: {
    width: Matrics.s(20),
    height: Matrics.s(20),
    resizeMode: 'contain',
  },
  additionalUserInfoContainer: {
    alignItems: 'center',
  },
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Matrics.vs(30),
  },
  userDetails: {
    color: COLOR.WHITE,
    fontFamily: typography.fontFamily.Montserrat.Regular,
    fontSize: typography.fontSizes.fs14,
    marginTop: Matrics.vs(5),
  },
  menuIcon: {
    width: Matrics.s(20),
    height: Matrics.vs(20),
    resizeMode: 'contain',
  },
  menuItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomColor: COLOR.BORDER_COLOR,
    borderBottomWidth: 1,
    paddingLeft: Matrics.s(10),
  },
  menuTitle: {
    fontFamily: typography.fontFamily.Montserrat.Medium,
    fontSize: typography.fontSizes.fs18,
  },

  menuOptionContainer: {
    marginHorizontal: Matrics.s(20),
    marginVertical: Matrics.vs(10),
  },
});
