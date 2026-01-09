import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Text,
  Alert,
  Pressable,
  Platform,
  AppState,
  I18nManager,
} from 'react-native';
import React, {useContext, useRef, useEffect} from 'react';
import {COLOR, Matrics, typography} from '../../Config/AppStyling';
import {Images} from '../../Config';
import {setLanguageWithStorage} from '../../Redux/Reducers/LanguageSlice';
import {useDispatch} from 'react-redux';
import {HeaderOptionContext} from '../../Context/HeaderOptionContext';
import {useTranslation} from 'react-i18next';
import {restartApp} from '../../Utils/AppRestart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Linking} from 'react-native';
import RNRestart from 'react-native-restart';

const LanguageSelector = () => {
  const dispatch = useDispatch();
  const {showModal, setShowModal, setShowCurrencyModal} =
    useContext(HeaderOptionContext);
  const {i18n} = useTranslation();

  // Ref to prevent multiple rapid taps
  const isProcessing = useRef(false);

  const languages = ['ar', 'en'];
  const selectedLanguage = i18n.language;

  console.log('SELECTED LANGUAGE', selectedLanguage)

  // 🔹 iOS: Sync language when app returns from Settings
  useEffect(() => {
    if (Platform.OS === 'ios') {
      const handleAppStateChange = async (nextAppState) => {
        if (nextAppState === 'active') {
          try {
            const savedLanguage = await AsyncStorage.getItem('language');
            
            if (savedLanguage && savedLanguage !== i18n.language) {
              // Change language properly
              await dispatch(setLanguageWithStorage(savedLanguage));
              
              // Restart to apply changes
              setTimeout(() => {
                RNRestart.Restart();
              }, 100);
            }
          } catch (error) {
            console.error('Error syncing language:', error);
          }
        }
      };

      const subscription = AppState.addEventListener('change', handleAppStateChange);

      return () => {
        subscription?.remove();
      };
    }
  }, [i18n, dispatch]);

  const handleLanguageChange = async (language) => {
    if (language === selectedLanguage) {
      setShowModal(false);
      return;
    }

    if (isProcessing.current) {
      return;
    }

    isProcessing.current = true;

    // 🔹 iOS FLOW — ask user to open Settings
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Change your app language',
        "To change the app language on iOS: \n\n1. Tap 'Go to Settings'\n2. Find this app in the list\n3. Tap 'Language'\n4. Select '" + (language === 'ar' ? 'Arabic' : 'English') + "'\n5. Return to the app",
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setShowModal(false);
              isProcessing.current = false;
            },
          },
          {
            text: 'Go to Settings',
            onPress: async () => {
              try {
                // Save the intended language
                await AsyncStorage.setItem('language', language);
              } catch (e) {
                console.error('Error saving language for settings flow', e);
              }
              setShowModal(false);
              isProcessing.current = false;
              Linking.openSettings();
            },
          },
        ],
      );
      return;
    }

    // 🔹 ANDROID FLOW
    Alert.alert(
      'Language Change',
      'The app needs to restart to apply the new language settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setShowModal(false);
            isProcessing.current = false;
          },
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              // Save language using Redux action (handles i18n + RTL)
              await dispatch(setLanguageWithStorage(language));
              
              setShowModal(false);
              
              // Restart app to apply changes
              setTimeout(() => {
                restartApp();
              }, 100);
            } catch (error) {
              console.error('Error changing language:', error);
              isProcessing.current = false;
            }
          },
        },
      ],
    );
  };

  const toggleModal = () => {
    if (showModal) {
      return;
    }
    setShowModal(true);
    setShowCurrencyModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Reorder languages to put the selected one first
  const reorderedLanguages = selectedLanguage
    ? [selectedLanguage, ...languages.filter(lang => lang !== selectedLanguage)]
    : languages;

  const languageDisplayNames = {
    ar: 'Arabic',
    en: 'English',
  };

  return (
    <>
      {/* Invisible overlay to detect outside touches */}
      {showModal && <Pressable style={styles.overlay} onPress={closeModal} />}

      <View style={styles.container}>
        <TouchableOpacity
          onPress={toggleModal}
          style={styles.secondaryOptions}
          disabled={showModal}
          activeOpacity={0.7}>
          <Image
            style={styles.secondaryOptionsImages}
            source={Images.TRANSLATE_ICON}
          />
        </TouchableOpacity>

        {/* Language Options Modal */}
        {showModal && (
          <View style={styles.modal}>
            {reorderedLanguages?.map((lang, index) => (
              <Pressable
                key={index}
                onPress={e => {
                  e.stopPropagation();
                  handleLanguageChange(lang);
                }}
                style={({pressed}) => [
                  styles.languageItem,
                  lang === selectedLanguage && styles.selectedLanguageItem,
                  pressed && styles.pressedLanguageItem,
                ]}>
                <Text
                  style={[
                    styles.modalText,
                    lang === selectedLanguage && styles.selectedModalText,
                  ]}>
                  {languageDisplayNames[lang] || lang}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </>
  );
};

export default LanguageSelector;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: Matrics.screenWidth,
    height: Matrics.screenHeight,
    zIndex: 999,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
  },
  secondaryOptionsImages: {
    width: Matrics.s(16),
    height: Matrics.vs(16),
    resizeMode: 'contain',
  },
  secondaryOptions: {
    backgroundColor: '#51176F',
    paddingHorizontal: Matrics.s(14),
    paddingVertical: Matrics.vs(12),
    borderRadius: Matrics.s(10),
    borderColor: '#6D338A',
    borderWidth: 1,
  },
  modal: {
    position: 'absolute',
    top: Matrics.vs(50),
    right: 0,
    backgroundColor: COLOR.WHITE,
    width: Matrics.s(120),
    borderRadius: Matrics.s(12),
    paddingVertical: Matrics.vs(8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
  },
  languageItem: {
    paddingVertical: Matrics.vs(12),
    paddingHorizontal: Matrics.s(15),
    minHeight: Matrics.vs(44),
    justifyContent: 'center',
  },
  selectedLanguageItem: {
    backgroundColor: COLOR.PRIMARY,
  },
  pressedLanguageItem: {
    backgroundColor: COLOR.PRIMARY + '20',
  },
  modalText: {
    fontFamily: typography.fontFamily.Montserrat.Medium,
    fontSize: typography.fontSizes.fs16,
    color: COLOR.BLACK,
    textAlign: 'left',
  },
  selectedModalText: {
    color: COLOR.WHITE,
    fontFamily: typography.fontFamily.Montserrat.Bold,
  },
});
