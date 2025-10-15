import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import NormalHeader from '../../../Components/UI/NormalHeader';
import {useNavigation} from '@react-navigation/native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {COLOR, Matrics, typography} from '../../../Config/AppStyling';
import {RoomContext} from '../../../Context/RoomContext';
import {Images} from '../../../Config';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {TextInput} from 'react-native-gesture-handler';
import GuestForm from '../../../Components/GuestForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {errorToast} from '../../../Helpers/ToastMessage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

const GUEST_DETAILS_KEY = 'guestDetails';
// GuestForm Component for Bottom Sheet

// Main HotelBooking Component
const HotelBooking = () => {
  const navigation = useNavigation();
  const {guests} = useContext(RoomContext);
  const {authData} = useSelector(state => state.auth);

  const bottomSheetModalRef = useRef(null);
  const snapPoints = useCallback(() => ['50%', '80%'], []);
  const [guestDetails, setGuestDetails] = useState(
    Array(guests)
      .fill(null)
      .map(() => ({})),
  );
  const [currentGuestIndex, setCurrentGuestIndex] = useState(null);
  useEffect(() => {
    const loadGuestDetails = async () => {
      try {
        const storedData = await AsyncStorage.getItem(GUEST_DETAILS_KEY);
        let newDetails = Array(guests)
          .fill(null)
          .map(() => ({}));
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (Array.isArray(parsedData)) {
            newDetails = Array(guests)
              .fill(null)
              .map((_, index) => parsedData[index] || {});
            console.log('Loaded and merged from AsyncStorage:', newDetails);
          } else {
            console.log('Invalid stored data, using default:', parsedData);
          }
        }
        setGuestDetails(newDetails);
      } catch (error) {
        console.error('Error loading guest details:', error);
      }
    };
    loadGuestDetails();
  }, [guests]);
  const handleBackPress = () => {
    navigation.goBack();
  };

  const openBottomSheet = index => {
    setCurrentGuestIndex(index);
    bottomSheetModalRef.current?.present();
  };

  const handleSaveGuest = async (index, data) => {
    const updatedGuests = [...guestDetails];
    updatedGuests[index] = data;
    setGuestDetails(updatedGuests);
    try {
      await AsyncStorage.setItem(
        GUEST_DETAILS_KEY,
        JSON.stringify(updatedGuests),
      );
    } catch (error) {
      console.error('Error saving guest details:', error);
    }
    bottomSheetModalRef.current?.dismiss();
  };

  const handleCancel = () => {
    bottomSheetModalRef.current?.dismiss();
  };

  const handleContinue = () => {
    const hasPrimaryGuestDetails =
      guestDetails[0]?.firstName &&
      guestDetails[0]?.lastName &&
      guestDetails[0]?.email &&
      guestDetails[0]?.phone &&
      guestDetails[0]?.gender &&
      guestDetails[0]?.documentType &&
      guestDetails[0]?.countryCode &&
      guestDetails[0]?.country &&
      guestDetails[0]?.postalCode &&
      guestDetails[0]?.documentNumber &&
      guestDetails[0]?.age;
    const missingNameIndices = [];
    guestDetails.forEach((guest, index) => {
      const hasNames = guest.firstName?.trim() && guest.lastName?.trim();
      console.log(`Guest ${index + 1} hasNames:`, hasNames, guest);
      if (!hasNames) {
        missingNameIndices.push(index + 1);
      }
    });
    const hasAllGuestNames = missingNameIndices.length === 0;

    console.log('Primary Guest Details:', hasPrimaryGuestDetails);
    console.log('Guest Details:', guestDetails);
    console.log('Has All Guest Names:', hasAllGuestNames);
    console.log('Missing Name Indices:', missingNameIndices);

    if (!hasPrimaryGuestDetails) {
      errorToast('Please fill all primary guest details');
      return;
    }
    if (!hasAllGuestNames) {
      let errorMessage;
      if (missingNameIndices.length === 1) {
        errorMessage = `Please enter all details for Guest ${missingNameIndices[0]}.`;
      } else {
        const guestsList = missingNameIndices.join(', ');
        errorMessage = `Please enter all details for Guests ${guestsList}.`;
      }
      errorToast(errorMessage);
      return;
    }

    navigation.navigate('ReviewUserDetails', {guestDetails});
  };
  const renderContent = () => (
    <>
      <GestureHandlerRootView
        style={{
          flex: 1,
        }}>
        <BottomSheetModalProvider>
          <KeyboardAwareScrollView>
            <NormalHeader
              title={'Fill Details'}
              rightIconName="Next"
              leftIconName="round"
              onCrossPress={handleBackPress}
              onCheckPress={handleContinue}
            />
            <View style={{padding: Matrics.vs(8)}}>
              <Text style={styles.sectionTitle}>Persons</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10}}>
                {Array.from({length: guests}).map((_, index) => {
                  const isPrimaryGuest = index === 0;
                  const guestData = guestDetails[index] || {};
                  const isFilled = guestData.firstName && guestData.lastName;

                  return (
                    <View key={index} style={styles.cardContainer}>
                      <View style={styles.contentRow}>
                        <Image
                          source={Images.FILL_DETAIL_PERSON}
                          style={styles.icon}
                        />
                        <View>
                          <Text style={styles.title}>
                            {isPrimaryGuest
                              ? 'Primary Guest'
                              : `Guest ${index + 1}`}
                          </Text>
                          <Text style={styles.subtitle}>
                            * Adult - Should be above 18 years
                          </Text>
                          {isFilled && (
                            <Text style={styles.filledText}>Details Added</Text>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => openBottomSheet(index)}>
                        <Text style={styles.buttonText}>
                          {isFilled ? 'Edit' : '+ Add'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>

            <BottomSheetModal
              ref={bottomSheetModalRef}
              index={0}
              snapPoints={snapPoints()}
              backgroundStyle={styles.bottomSheetBackground}
              handleIndicatorStyle={styles.handleIndicator}
              style={{
                alignSelf: 'center',
                justifyContent: 'center',
              }}>
              <BottomSheetScrollView
                contentContainerStyle={{
                  justifyContent: 'center',
                  paddingTop: Platform.OS === 'android' ? 0 : Matrics.vs(10),
                }}>
                {currentGuestIndex !== null && (
                  <GuestForm
                    guestIndex={currentGuestIndex}
                    guestData={guestDetails[currentGuestIndex]}
                    onSave={handleSaveGuest}
                    onCancel={handleCancel}
                  />
                )}
              </BottomSheetScrollView>
            </BottomSheetModal>
          </KeyboardAwareScrollView>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
  return Platform.OS === 'android' ? (
    <SafeAreaView style={{flex: 1}}>{renderContent()}</SafeAreaView>
  ) : (
    <View style={{flex: 1}}>{renderContent()}</View>
  );
};

export default HotelBooking;

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: COLOR.WHITE,
    borderTopLeftRadius: Matrics.s(25),
    borderTopRightRadius: Matrics.s(25),
    boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.15)',
  },
  handleIndicator: {
    backgroundColor: COLOR.PRIMARY,
    width: Matrics.s(50),
    height: Matrics.vs(5),
    borderRadius: Matrics.s(2.5),
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: Matrics.s(5),
    paddingHorizontal: Matrics.s(15),
    paddingVertical: Matrics.vs(15),
    width: Matrics.screenWidth * 0.93, // Adjusted for two cards per row
  },
  contentRow: {
    flexDirection: 'row',
    marginBottom: 15,
    // alignItems: 'center',
  },
  icon: {
    marginRight: 10,
    width: Matrics.s(30),
    height: Matrics.vs(30),
    resizeMode: 'contain',
  },
  title: {
    fontSize: typography.fontSizes.fs14,
    color: COLOR.BLACK,
    fontFamily: typography.fontFamily.Montserrat.Medium,
  },
  subtitle: {
    fontSize: typography.fontSizes.fs12,
    fontFamily: typography.fontFamily.Montserrat.Regular,
    color: '#000',
    width: '80%',
  },
  filledText: {
    fontSize: typography.fontSizes.fs12,
    color: COLOR.PRIMARY,
    fontFamily: typography.fontFamily.Montserrat.Medium,
  },
  button: {
    backgroundColor: '#6A1B9A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.fontSizes.fs14,
    color: COLOR.WHITE,
    fontFamily: typography.fontFamily.Montserrat.Bold,
  },
  continueButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Matrics.vs(20),
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.Montserrat.Bold,
    fontSize: typography.fontSizes.fs16,
    marginBottom: Matrics.vs(10),
  },
});
