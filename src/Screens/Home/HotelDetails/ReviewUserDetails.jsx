import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import NormalHeader from '../../../Components/UI/NormalHeader'; // Adjust path
import {COLOR, Matrics, typography} from '../../../Config/AppStyling'; // Adjust path
import {Images} from '../../../Config'; // Adjust path
import KeyboardAwareScrollViewBoilerplate from '../../../Components/UI/KeyboardAwareScrollViewBoilerplate';
import {getSavedCardThunk} from '../../../Redux/Reducers/BookingOverviewReducer/BookingListSlice';
import {useDispatch, useSelector} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';

const ReviewUserDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {guestDetails} = route.params;
  const [expandedIndex, setExpandedIndex] = useState(null); // Track which accordion is expanded
  const [rotationAnimations, setRotationAnimations] = useState(
    guestDetails.map(() => new Animated.Value(0)),
  ); // Animation for each accordion arrow
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getSavedCardThunk()).unwrap();
  }, []);
  const {savedCard} = useSelector(state => state.bookingList);
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleEditGuest = index => {
    navigation.navigate('HotelBooking', {editGuestIndex: index});
  };

  const toggleAccordion = index => {
    const isExpanding = expandedIndex !== index;
    setExpandedIndex(isExpanding ? index : null);

    // Animate arrow rotation
    Animated.timing(rotationAnimations[index], {
      toValue: isExpanding ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleCheckPress = async () => {
    try {
      console.log('savedCard', savedCard);
      if (savedCard) {
        navigation.navigate('HotelPaymentsPage');
      } else {
        console.log('No saved card found, navigating to AddCard');

        navigation.navigate('AddCard');
      }
    } catch (error) {
      navigation.navigate('AddCard');
    }
  };

  const renderGuestDetails = (guest, index) => {
    const isExpanded = expandedIndex === index;
    const isPrimaryGuest = index === 0;

    const rotateInterpolate = rotationAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <View key={index} style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.accordionHeader}
          activeOpacity={0.9}
          onPress={() => toggleAccordion(index)}>
          <View style={styles.headerContent}>
            <Image source={Images.FILL_DETAIL_PERSON} style={styles.icon} />
            <View>
              <Text style={styles.title}>
                {isPrimaryGuest ? 'Primary Guest' : `Guest ${index + 1}`}
              </Text>
              <Text style={styles.subtitle}>
                {guest.firstName && guest.lastName
                  ? `${guest.firstName} ${guest.lastName}`
                  : 'Details not filled'}
              </Text>
            </View>
          </View>
          <Animated.View
            style={[
              styles.arrowContainer,
              {transform: [{rotate: rotateInterpolate}]},
            ]}>
            <Image source={Images.DOWN} style={styles.arrowIcon} />
          </Animated.View>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.accordionContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Title:</Text>
              <Text style={styles.detailValue}>{guest.title || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>First Name:</Text>
              <Text style={styles.detailValue}>{guest.firstName || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Name:</Text>
              <Text style={styles.detailValue}>{guest.lastName || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gender:</Text>
              <Text style={styles.detailValue}>{guest.gender || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>DOB:</Text>
              <Text style={styles.detailValue}>
                {guest.birth_date || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Age:</Text>
              <Text style={styles.detailValue}>{guest.age || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{guest.email || 'N/A'}</Text>
            </View>
            {isPrimaryGuest && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>
                    {guest.countryCode && guest.phone
                      ? `${guest.countryCode} ${guest.phone}`
                      : guest.phone || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Document Type:</Text>
                  <Text style={styles.detailValue}>
                    {guest.documentType || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Document Number:</Text>
                  <Text style={styles.detailValue}>
                    {guest.documentNumber || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address:</Text>
                  <Text style={styles.detailValue}>
                    {guest.address || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>City:</Text>
                  <Text style={styles.detailValue}>{guest.city || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Country:</Text>
                  <Text style={styles.detailValue}>
                    {guest.country || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Postal Code:</Text>
                  <Text style={styles.detailValue}>
                    {guest.postalCode || 'N/A'}
                  </Text>
                </View>
              </>
            )}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditGuest(index)}>
              <Text style={styles.buttonText}>Edit Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  const renderContent = () => (
    <>
      <KeyboardAwareScrollViewBoilerplate
        headerComponent={
          <NormalHeader
            title="Review Details"
            leftIconName="round"
            rightIconName="Next"
            onCrossPress={handleBackPress}
            onCheckPress={handleCheckPress}
          />
        }>
        <Text style={styles.sectionTitle}>Guest Details</Text>
        {guestDetails.map((guest, index) => renderGuestDetails(guest, index))}
      </KeyboardAwareScrollViewBoilerplate>
    </>
  );
  return Platform.OS === 'android' ? (
    <SafeAreaView
      style={{
        flex: 1,
      }}>
      {renderContent()}
    </SafeAreaView>
  ) : (
    <View style={{flex: 1}}>{renderContent()}</View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLOR.WHITE,
    borderRadius: Matrics.s(20),
    marginHorizontal: Matrics.s(10),
    marginVertical: Matrics.vs(8),
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLOR.PRIMARY,
    borderRadius: Matrics.s(15),
    padding: Matrics.s(12),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Matrics.s(12),
    width: Matrics.s(28),
    height: Matrics.s(28),
    resizeMode: 'contain',
    tintColor: COLOR.WHITE,
  },
  title: {
    fontSize: typography.fontSizes.fs16,
    color: COLOR.WHITE,
    fontFamily: typography.fontFamily.Montserrat.SemiBold,
  },
  subtitle: {
    fontSize: typography.fontSizes.fs12,
    fontFamily: typography.fontFamily.Montserrat.Regular,
    color: COLOR.WHITE,
    opacity: 0.8,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: Matrics.s(20),
    height: Matrics.s(20),
    resizeMode: 'contain',
    tintColor: COLOR.WHITE,
    marginRight: Matrics.s(10),
  },
  accordionContent: {
    padding: Matrics.s(15),
    backgroundColor: COLOR.WHITE,
    borderRadius: Matrics.s(10),
    marginTop: Matrics.vs(10),
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: Matrics.vs(8),
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: typography.fontSizes.fs13,
    fontFamily: typography.fontFamily.Montserrat.Medium,
    color: COLOR.BLACK,
    width: Matrics.screenWidth * 0.3,
  },
  detailValue: {
    fontSize: typography.fontSizes.fs13,
    fontFamily: typography.fontFamily.Montserrat.Regular,
    color: COLOR.BLACK,
    flex: 1,
  },
  editButton: {
    backgroundColor: COLOR.WHITE,
    borderWidth: 2,
    borderColor: COLOR.PRIMARY,
    borderRadius: Matrics.s(12),
    paddingVertical: Matrics.vs(10),
    alignItems: 'center',
    marginTop: Matrics.vs(12),
  },
  buttonText: {
    fontSize: typography.fontSizes.fs14,
    color: COLOR.PRIMARY,
    fontFamily: typography.fontFamily.Montserrat.Bold,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.Montserrat.Bold,
    fontSize: typography.fontSizes.fs18,
    color: COLOR.BLACK,
    marginTop: Matrics.vs(10),
    marginHorizontal: Matrics.s(10),
  },
});

export default ReviewUserDetails;
