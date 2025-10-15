import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import {COLOR, Matrics, typography} from '../Config/AppStyling';

const {width} = Dimensions.get('window');

/**
 * AuthenticationModal Component
 * Shows when unauthenticated user tries to book a hotel
 * User can choose to login, create account, or cancel
 */
const AuthenticationModal = ({
  visible = false,
  onLoginPress = () => {},
  onCreateAccountPress = () => {},
  onCancelPress = () => {},
  isLoading = false,
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scaleAnim]);

  const animatedStyle = {
    transform: [{scale: scaleAnim}],
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancelPress}>
      {/* Background Overlay */}
      <View style={styles.overlay}>
        {/* Animated Card */}
        <Animated.View style={[styles.cardContainer, animatedStyle]}>
          <View style={styles.card}>
            {/* Header Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔐</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Authentication Required</Text>

            {/* Description */}
            <Text style={styles.description}>
              Please log in or create an account to proceed with your booking.
            </Text>

            {/* Button Container */}
            <View style={styles.buttonContainer}>
              {/* Create Account Button (Primary) */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={onCreateAccountPress}
                disabled={isLoading}
                activeOpacity={0.8}>
                <Text style={styles.primaryButtonText}>Create Account</Text>
              </TouchableOpacity>

              {/* Login Button (Secondary) */}
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={onLoginPress}
                disabled={isLoading}
                activeOpacity={0.8}>
                <Text style={styles.secondaryButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Cancel/Dismiss Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancelPress}
              disabled={isLoading}
              activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Matrics.s(20),
  },
  cardContainer: {
    width: '100%',
    maxWidth: width - Matrics.s(40),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: Matrics.s(16),
    paddingVertical: Matrics.vs(32),
    paddingHorizontal: Matrics.s(24),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Matrics.vs(16),
  },
  icon: {
    fontSize: Matrics.s(48),
  },
  title: {
    fontSize: typography.fontSizes.fs18,
    fontFamily: typography.fontFamily.Montserrat.Bold,
    color: COLOR.TEXT_COLOR,
    textAlign: 'center',
    marginBottom: Matrics.vs(12),
  },
  description: {
    fontSize: typography.fontSizes.fs14,
    fontFamily: typography.fontFamily.Montserrat.Regular,
    color: COLOR.DIM_TEXT_COLOR,
    textAlign: 'center',
    marginBottom: Matrics.vs(28),
    lineHeight: 20,
  },
  buttonContainer: {
    gap: Matrics.vs(12),
    marginBottom: Matrics.vs(16),
  },
  primaryButton: {
    backgroundColor: COLOR.PRIMARY,
    paddingVertical: Matrics.vs(14),
    borderRadius: Matrics.s(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: typography.fontSizes.fs16,
    fontFamily: typography.fontFamily.Montserrat.SemiBold,
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: Matrics.vs(14),
    borderRadius: Matrics.s(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLOR.PRIMARY,
  },
  secondaryButtonText: {
    color: COLOR.PRIMARY,
    fontSize: typography.fontSizes.fs16,
    fontFamily: typography.fontFamily.Montserrat.SemiBold,
  },
  cancelButton: {
    paddingVertical: Matrics.vs(10),
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLOR.DIM_TEXT_COLOR,
    fontSize: typography.fontSizes.fs14,
    fontFamily: typography.fontFamily.Montserrat.Medium,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default AuthenticationModal;
