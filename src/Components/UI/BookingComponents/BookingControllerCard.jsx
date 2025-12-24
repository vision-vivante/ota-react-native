import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {COLOR, Matrics, typography} from '../../../Config/AppStyling';
import BookingStatusTag from './BookingStatusTag';
import CheckInDateCard from './CheckInDateCard';
import AddReviewCard from './AddReviewCard';
import BookingPriceDisplay from './BookingPriceDisplay';
import DownloadButton from './DownloadButton';
import CancelBookingButton from './CancelBookingButton';
import BookingTypeIcon from './BookingTypeIcon';
import dayjs from 'dayjs';

const BookingControllerCard = ({
  name,
  status,
  date,
  bookingPrice,
  invoicePath,
  bookingId,
  gds,
  checkInDate,
  onCancelBooking,
  cancelBookingLoading,
  currentCancellingBookingId,
  onPress,
}) => {
  const handleCancelBooking = () => {
    onCancelBooking(bookingId, gds);
  };

  // Check if this specific booking is being cancelled
  const isThisBookingCancelling =
    cancelBookingLoading && currentCancellingBookingId === bookingId;

  // Check if booking is already cancelled (status 3 or 4)
  const isBookingCancelled =
    status?.toString() === '3' || status?.toString() === '4';

  // Check if check-in date has passed
  const isCheckInDatePassed = dayjs(checkInDate).isBefore(dayjs(), 'day');
  console.log('INvoice path', invoicePath);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: COLOR.WHITE,
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Matrics.s(10),
        paddingVertical: Matrics.vs(15),
        borderRadius: Matrics.vs(10),
        // boxShadow: '0px 4px 12px rgba(109, 51, 138, 0.15)',
      }}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={{gap: 5}}>
        <View style={{flexDirection: 'row', alignItems: 'flex-start', gap: 10}}>
          <View style={{alignItems: 'flex-start'}}>
            <View style={{flexDirection: 'row', gap: 5}}>
              <BookingStatusTag status={status} />
              <BookingTypeIcon bookingType={'hotel'} />
            </View>
            <Text
              style={{
                fontFamily: typography.fontFamily.Montserrat.Medium,
                fontSize: typography.fontSizes.fs15,
              }}>
              {name}
            </Text>
          </View>
        </View>
        <CheckInDateCard date={date} />
        <AddReviewCard />
      </View>
      <View
        style={{
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}>
        <BookingPriceDisplay bookingPrice={bookingPrice} />
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginTop: 10,
          }}>
          <DownloadButton invoicePath={invoicePath} />
          {!isBookingCancelled && !isCheckInDatePassed && (
            <CancelBookingButton
              cancelBooking={handleCancelBooking}
              bookingId={bookingId}
              provider={gds}
              isLoading={isThisBookingCancelling}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BookingControllerCard;
