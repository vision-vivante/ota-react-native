import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import NormalHeader from '../../Components/UI/NormalHeader';
import KeyboardAwareScrollViewBoilerplate from '../../Components/UI/KeyboardAwareScrollViewBoilerplate';
import BookingControllerCard from '../../Components/UI/BookingComponents/BookingControllerCard';
import BookingOverviewCards from '../../Components/UI/BookingComponents/BookingOverviewCards';
import {COLOR, Matrics, typography} from '../../Config/AppStyling';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  getBookingListThunk,
  resetBookingList,
  cancelBookingThunk,
} from '../../Redux/Reducers/BookingOverviewReducer/BookingListSlice';
import {useDispatch, useSelector} from 'react-redux';
import {FlatList} from 'react-native-gesture-handler';
import ConfirmationModal from '../../Components/UI/ConfirmationModal';
import {SafeAreaView} from 'react-native-safe-area-context';
import i18n from '../../i18n/i18n';
import {success} from '../../Helpers/ToastMessage';
import {Images} from '../../Config';

const Booking = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedGds, setSelectedGds] = useState(null);
  const {
    bookingList,
    loadingBookingList,
    cancelBookingLoading,
    currentCancellingBookingId,
  } = useSelector(state => state.bookingList);
  const handleCancelBooking = useCallback((bookingId, gds) => {
    setSelectedBookingId(bookingId);
    setSelectedGds(gds);
    setShowCancelModal(true);
  }, []);
  console.log('bookingList', bookingList);
  const confirmCancelBooking = useCallback(() => {
    if (selectedBookingId && selectedGds) {
      console.log('selectedBookingId', selectedBookingId);
      console.log('selectedGds', selectedGds);
      dispatch(
        cancelBookingThunk({
          bookingNo: selectedBookingId,
          provider: selectedGds,
        }),
      ).then(result => {
        console.log('result for cancel booking', result);
        if (!result.error) {
          success(i18n.t('Booking.bookingCancelledSuccessfully'));
        }
      });
    }
    setShowCancelModal(false);
    setSelectedBookingId(null);
    setSelectedGds(null);
  }, [selectedBookingId, selectedGds, dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(
        getBookingListThunk({
          page: 1,
          limit: 10,
          isAdmin: false,
        }),
      ).catch(error => {
        console.error('Error fetching booking list:', error);
      });

      return () => {
        dispatch(resetBookingList());
      };
    }, [dispatch]),
  );
  const renderItem = useCallback(
    ({item}) => {
      return (
        <BookingControllerCard
          name={`${item?.Holder_details?.Name || ''} ${
            item?.Holder_details?.Surname || ''
          }`}
          status={item?.Status}
          date={item?.OrderDate}
          bookingPrice={Number(item?.totalAmount).toFixed(2)}
          invoicePath={item?.invoicePath}
          bookingId={item?.BookingID}
          gds={item?.provider}
          checkInDate={item?.CheckInDate}
          onCancelBooking={handleCancelBooking}
          cancelBookingLoading={cancelBookingLoading}
          currentCancellingBookingId={currentCancellingBookingId}
          onPress={() =>
            navigation.navigate('BookingDetails', {
              booking_no: item?.BookingID,
              provider: item?.provider,
              booking_Id: item?._id,
            })
          }
        />
      );
    },
    [
      navigation,
      handleCancelBooking,
      cancelBookingLoading,
      currentCancellingBookingId,
    ],
  );
  const keyExtractor = useCallback(
    item => item?._id?.toString() || Math.random().toString(),
    [],
  );

  const ItemSeparator = () => <View style={styles.separator} />;

  const renderContent = () => (
    <>
      <KeyboardAwareScrollViewBoilerplate
        headerComponent={
          <NormalHeader
            title={i18n.t('Booking.bookingTitle')}
            showLeftButton={false}
            showRightButton={false}
            headerHeight={Matrics.screenHeight * 0.1}
          />
        }
        footerComponent={null}>
        <View style={{backgroundColor: '#401a6d'}}>
          <View
            style={{
              backgroundColor: COLOR.SMALL_CARD_BACKGROUND,
              paddingVertical: Matrics.vs(10),
              paddingHorizontal: Matrics.s(5),
              borderTopRightRadius: Matrics.vs(20),
              borderTopLeftRadius: Matrics.vs(20),
            }}>
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                paddingHorizontal: 5,
                marginTop: Matrics.vs(10),
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
              <BookingOverviewCards
                gradientStart={COLOR.TOTAL_BOOKING_START}
                gradientEnd={COLOR.TOTAL_BOOKING_END}
                title={i18n.t('Booking.totalBookings')}
                value={bookingList?.length}
              />
              <BookingOverviewCards
                gradientStart={COLOR.PROCESSING_BOOKING_START}
                gradientEnd={COLOR.PROCESSING_BOOKING_END}
                title={i18n.t('Booking.processingBooking')}
                value="0"
              />
              <BookingOverviewCards
                gradientStart={COLOR.COMPLETED_BOOKING_START}
                gradientEnd={COLOR.COMPLETED_BOOKING_END}
                title={i18n.t('Booking.completedBooking')}
                value="0"
              />
              <BookingOverviewCards
                gradientStart={COLOR.CANCELLED_BOOKING_START}
                gradientEnd={COLOR.CANCELLED_BOOKING_END}
                title={i18n.t('Booking.cancelledBooking')}
                value={bookingList?.canceledBookings}
              />
            </View>
            <View style={{marginTop: Matrics.vs(20)}}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.Montserrat.Bold,
                  fontSize: typography.fontSizes.fs16,
                }}>
                {i18n.t('Booking.listOfBookings')}
              </Text>
            </View>
            <View
              style={{
                gap: 20,
                marginTop: Matrics.vs(10),
                paddingHorizontal: Matrics.s(5),
              }}>
              {bookingList?.data && bookingList.data.length > 0 ? (
                <FlatList
                  data={bookingList?.data}
                  renderItem={renderItem}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={keyExtractor}
                  ItemSeparatorComponent={ItemSeparator}
                  contentContainerStyle={styles.contentContainer}
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={21}
                />
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Image
                    source={Images.NO_RESULT_FOUND}
                    style={styles.emptyStateImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.emptyStateTitle}>
                    {i18n.t('Booking.noBookingsTitle')}
                  </Text>
                  <Text style={styles.emptyStateMessage}>
                    {i18n.t('Booking.noBookingsMessage')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </KeyboardAwareScrollViewBoilerplate>

      {loadingBookingList && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLOR.PRIMARY} />
            <Text style={styles.loadingText}>
              {i18n.t('Booking.loadingBookings')}
            </Text>
          </View>
        </View>
      )}

      {/* {cancelBookingLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLOR.PRIMARY} />
            <Text style={styles.loadingText}>Cancelling Booking...</Text>
          </View>
        </View>
      )} */}
      {showCancelModal && (
        <ConfirmationModal
          title={i18n.t('Booking.cancelBooking')}
          handleYesPressed={confirmCancelBooking}
          handleNoPressed={() => {
            setShowCancelModal(false);
            setSelectedBookingId(null);
            setSelectedGds(null);
          }}
        />
      )}
    </>
  );
  return Platform.OS === 'android' ? (
    <SafeAreaView style={styles.container}>{renderContent()}</SafeAreaView>
  ) : (
    <View style={{flex: 1}}>{renderContent()}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    gap: 10,
  },
  separator: {
    height: Matrics.vs(10),
  },
  contentContainer: {
    // paddingVertical: Matrics.vs(10),
  },
  emptyText: {
    fontFamily: typography.fontFamily.Montserrat.Medium,
    fontSize: typography.fontSizes.fs14,
    color: COLOR.DIM_TEXT_COLOR,
    textAlign: 'center',
    paddingVertical: Matrics.vs(20),
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: COLOR.WHITE,
    paddingHorizontal: Matrics.s(30),
    paddingVertical: Matrics.vs(20),
    borderRadius: Matrics.s(10),
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loadingText: {
    marginTop: Matrics.vs(10),
    fontFamily: typography.fontFamily.Montserrat.Medium,
    fontSize: typography.fontSizes.fs16,
    color: COLOR.PRIMARY,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Matrics.vs(40),
    paddingHorizontal: Matrics.s(20),
    minHeight: Matrics.vs(200),
  },
  emptyStateImage: {
    width: Matrics.vs(120),
    height: Matrics.vs(120),
    opacity: 0.7,
  },
  emptyStateTitle: {
    fontFamily: typography.fontFamily.Montserrat.Bold,
    fontSize: typography.fontSizes.fs18,
    color: COLOR.PRIMARY,
    marginTop: Matrics.vs(20),
    marginBottom: Matrics.vs(10),
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontFamily: typography.fontFamily.Montserrat.Medium,
    fontSize: typography.fontSizes.fs14,
    color: COLOR.DIM_TEXT_COLOR,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Matrics.s(10),
  },
});

export default Booking;
