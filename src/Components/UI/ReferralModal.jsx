import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useReferralCode} from '../../Context/ReferralCodeContext';
import {useDispatch} from 'react-redux';
import {appleLogin, googleLogin} from '../../Redux/Reducers/AuthSlice';

const ReferralModal = ({visible, onClose}) => {
  const {referralCode, setReferralCode, whatTriggered} = useReferralCode();
  const dispatch = useDispatch();
  const handleSubmit = () => {
    if (referralCode.trim()) {
      if (whatTriggered === 'apple') {
        console.log('Apple login with referral code:', referralCode.trim());

        dispatch(appleLogin(referralCode.trim()));
      }
      if (whatTriggered === 'google') {
        console.log('Google login with referral code:', referralCode.trim());

        dispatch(googleLogin(referralCode.trim()));
      }
    }
    onClose();
  };

  const handleSkip = () => {
    if (whatTriggered === 'apple') {
      dispatch(appleLogin());
    } else if (whatTriggered === 'google') {
      dispatch(googleLogin());
    }
    console.log('Skipped referral code');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modal}>
            {/* Header */}
            <Text style={styles.title}>Referral Code</Text>
            <Text style={styles.subtitle}>
              Enter your referral code if you have one
            </Text>

            {/* Input */}
            <TextInput
              style={styles.input}
              placeholder="Enter referral code (optional)"
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}>
                <Text style={styles.submitText}>
                  {referralCode.trim() ? 'Submit' : 'Continue'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
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
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#6d338a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  skipText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReferralModal;
