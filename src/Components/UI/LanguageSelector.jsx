import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Text,
  Alert,
  Pressable,
} from 'react-native';
import React, {useContext, useRef} from 'react';
import {COLOR, Matrics, typography} from '../../Config/AppStyling';
import {Images} from '../../Config';
import {setLanguageWithStorage} from '../../Redux/Reducers/LanguageSlice';
import {useDispatch} from 'react-redux';
import RNRestart from 'react-native-restart';
import {HeaderOptionContext} from '../../Context/HeaderOptionContext';
import {useTranslation} from 'react-i18next';
import { restartApp } from '../../Utils/AppRestart';

const LanguageSelector = () => {
  const dispatch = useDispatch();
  const {showModal, setShowModal, setShowCurrencyModal} =
    useContext(HeaderOptionContext);
  const {i18n} = useTranslation();

  // Ref to prevent multiple rapid taps
  const isProcessing = useRef(false);

  const languages = ['ar', 'en'];
  const selectedLanguage = i18n.language;

  const handleLanguageChange = language => {
    // If the selected language is the same as current language, just close the modal
    if (language === selectedLanguage) {
      setShowModal(false);
      return;
    }

    // Prevent multiple rapid taps
    if (isProcessing.current) {
      return;
    }

    isProcessing.current = true;

    Alert.alert(
      'Language Change',
      'The app needs to restart to apply the new language settings.',
      [
        {
          text: 'Cancel',
          onPress: () => {
            setShowModal(false);
            isProcessing.current = false;
          },
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            dispatch(setLanguageWithStorage(language));
            setShowModal(false);
           restartApp();
          },
        },
      ],
      {
        onDismiss: () => {
          isProcessing.current = false;
        },
      },
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
