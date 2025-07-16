import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useNetwork } from '../../Context/NetworkContext';


const {width} = Dimensions.get('window');

const OfflineBanner = () => {
  const {isOnline} = useNetwork();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (!isOnline) {
      // Show banner
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Hide banner
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOnline]);

  const getStatusBarHeight = () => {
    return Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
  };

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          transform: [{translateY: slideAnim}],
          top: getStatusBarHeight(),
        },
      ]}>
      <Text style={styles.bannerText}>No Internet Connection</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#ff4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 10,
  },
  bannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default OfflineBanner;
