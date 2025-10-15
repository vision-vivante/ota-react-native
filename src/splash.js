// Splash.js
import React, {useEffect} from 'react';
import {
  View,
  StyleSheet,
  Image,
  SafeAreaView,
  I18nManager,
  Platform,
} from 'react-native';
import Images from './Config/Images';
import colors from './Config/AppStyling/colors';
import {Matrics} from './Config/AppStyling';
import FastImage from 'react-native-fast-image';
import {useDispatch, useSelector} from 'react-redux';
import {getUniversalToken} from './Redux/Reducers/ContentTokenSlice';

const Splash = () => {
  const globalLanguage = useSelector(
    state => state.selectedLanguage.globalLanguage,
  );
  const dispatch = useDispatch();
  // useEffect for getting content token
  useEffect(() => {
    const getUniversalTokenFromServer = async () => {
      await dispatch(getUniversalToken())
        .then(result => {
          console.log('Dispatch result:', result);
        })
        .catch(error => {
          console.error('Dispatch error:', error);
        });
    };

    getUniversalTokenFromServer();
  }, []);

  useEffect(() => {
    // Force LTR layout for splash screen
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);

    return () => {
      // Reset RTL settings when component unmounts
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(false);
    };
  }, []);
  const renderContent = () => (
    <>
      <View style={styles.container}>
        <View style={styles.topElipseContainer}>
          <Image source={Images.TOP_ELIPSE} />
        </View>
        <FastImage
          source={Images.SPLASH_GIF}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.bottomElipseContainer}>
          <Image
            source={Images.BOTTOM_ELIPSE}
            style={styles.bottomElipseImage}
          />
        </View>
      </View>
    </>
  );
  return Platform.OS === 'android' ? (
    <SafeAreaView style={{flex: 1}}>{renderContent()}</SafeAreaView>
  ) : (
    <View style={{flex: 1}}>{renderContent()}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 300,
    height: Matrics.vs(350),
  },
  bottomElipseContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'flex-end',
    left: 0,
    // height: Matrics.screenHeight * 0.25,
  },
  bottomElipseImage: {
    position: 'relative',
    width: Matrics?.screenWidth * 0.5,
    bottom: -Matrics.vs(70),
    resizeMode: 'contain',
  },
  topElipseContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default Splash;
