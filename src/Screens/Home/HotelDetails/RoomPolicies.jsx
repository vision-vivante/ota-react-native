import {View, Text, StyleSheet, Platform} from 'react-native';
import React, {useContext} from 'react';
import {COLOR, Matrics, typography} from '../../../Config/AppStyling';
import {RoomContext} from '../../../Context/RoomContext';
import CheckoutToast from '../../../Components/UI/CheckoutToast';
import {useDispatch, useSelector} from 'react-redux';
import dayjs from 'dayjs';
import {confirmPrice} from '../../../Redux/Reducers/HotelReducer/PriceConfirmSlice';
import {errorToast} from '../../../Helpers/ToastMessage';
import {useNavigation} from '@react-navigation/native';
import i18n from '../../../i18n/i18n';

const RoomPolicies = ({
  roomInfo,
  provider,
  hotelId,
  GiataId,
  showProceedButton = true,
  containerStyle,
}) => {
  console.log('Room info', roomInfo);
  console.log('Provider', provider);
  console.log('hotelId', hotelId);
  console.log('giataId', GiataId);

  const dispatch = useDispatch();
  const {selectedRoomId} = useContext(RoomContext);
  console.log('Selected Room Id', selectedRoomId);

  const selectedRoom = roomInfo?.find(room => {
    // If both are arrays
    if (Array.isArray(room?.RatePlanID) && Array.isArray(selectedRoomId)) {
      return selectedRoomId.every(id => room.RatePlanID.includes(id));
    }
    // If RatePlanID is an array and selectedRoomId is a string
    if (Array.isArray(room?.RatePlanID) && typeof selectedRoomId === 'string') {
      return room.RatePlanID.includes(selectedRoomId);
    }
    // If RatePlanID is a string and selectedRoomId is a string
    if (
      typeof room?.RatePlanID === 'string' &&
      typeof selectedRoomId === 'string'
    ) {
      return room.RatePlanID === selectedRoomId;
    }
    // If RatePlanID is a string and selectedRoomId is an array
    if (typeof room?.RatePlanID === 'string' && Array.isArray(selectedRoomId)) {
      return selectedRoomId.includes(room.RatePlanID);
    }
    return false; // Fallback for unmatched cases
  });

  const {ratePlanId} = useContext(RoomContext);
  const {hotelStayStartDate, hotelStayEndDate, adults, rooms, pluaralChild} =
    useContext(RoomContext);

  const navigation = useNavigation();
  const handleCheckoutPress = async () => {
    if (!hotelStayStartDate || !hotelStayEndDate) {
      const error = 'Please select check-in and check-out dates';
      return errorToast(error);
    }
    const detailsForPriceConfirm = {
      RatePlanID: ratePlanId,
      provider: provider,
      HotelID: hotelId,
      CheckInDate: dayjs(hotelStayStartDate).format('YYYY-MM-DD'),
      CheckOutDate: dayjs(hotelStayEndDate).format('YYYY-MM-DD'),
      RoomCount: rooms,
      Nationality: 'US',
      Currency: 'USD',
      OccupancyDetails: [
        {
          ChildCount: pluaralChild,
          AdultCount: adults,
          RoomNum: rooms,
        },
      ],
    };

    try {
      if (provider === 'RESTAL') {
        navigation.navigate('HotelBooking', {
          provider: provider,
          hotelId: hotelId,
          giataId: GiataId,
        });
        return;
      }

      const response = await dispatch(
        confirmPrice({details: detailsForPriceConfirm}),
      ).unwrap();
      if (response?.status === false) {
        errorToast(response?.error);
      } else if (response?.status === true) {
        navigation.navigate('HotelBooking', {
          provider: provider,
          hotelId: hotelId,
          giataId: GiataId,
        });
      }
    } catch (error) {
      console.log('Error in price confirm', error);
    }
  };
  return (
    <View
      style={[
        {paddingHorizontal: Matrics.s(15), marginTop: Matrics.vs(15)},
        containerStyle,
      ]}>
      <Text
        style={{
          fontFamily: typography.fontFamily.Montserrat.Bold,
          fontSize: typography.fontSizes.fs18,
        }}>
        {i18n.t('hotelDetails.roomPolicies')}
      </Text>
      <View>
        <View>
          <Text
            style={{
              fontFamily: typography.fontFamily.Montserrat.SemiBold,
              fontSize: typography.fontSizes.fs14,
            }}>
            {i18n.t('hotelDetails.roomInfo')}
          </Text>
          <Text
            style={{
              fontFamily: typography.fontFamily.Montserrat.Regular,
              fontSize: typography.fontSizes.fs14,
              color: COLOR.DARK_TEXT_COLOR,
            }}>
            {selectedRoom?.RoomName}
          </Text>
        </View>
        <View
          style={{
            marginTop: Matrics.vs(5),
          }}>
          {selectedRoom?.facility?.length > 0 &&
            selectedRoom?.facility?.map((item, index) => {
              return (
                <View key={index} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.facilityText}>{item.Name || item}</Text>
                </View>
              );
            })}
        </View>
        <View
          style={{marginVertical: Matrics.vs(10), marginTop: Matrics.vs(15)}}>
          <Text
            style={{
              fontFamily: typography.fontFamily.Montserrat.Bold,
              fontSize: typography.fontSizes.fs18,
              marginLeft: Matrics.s(2),
            }}>
            {i18n.t('hotelDetails.cancellation')}
          </Text>
          <View style={{flexDirection: 'row', gap: 10}}>
            <Text
              style={{
                fontFamily: typography.fontFamily.Montserrat.Medium,
                color: COLOR.DARK_TEXT_COLOR,
                marginLeft:
                  Platform.OS === 'android' ? Matrics.s(0) : Matrics.s(5),
              }}>
              {i18n.t('hotelDetails.amount')}
            </Text>

            {selectedRoom?.RatePlanCancellationPolicyList !== null && (
              <Text
                style={{
                  fontFamily: typography.fontFamily.Montserrat.Medium,
                  color: COLOR.PRIMARY,
                }}>
                ${selectedRoom?.RatePlanCancellationPolicyList[0]?.Amount}
              </Text>
            )}
          </View>
        </View>
        {selectedRoomId && showProceedButton && (
          <View>
            <CheckoutToast handlePress={handleCheckoutPress} />
          </View>
        )}
      </View>
    </View>
  );
};

export default RoomPolicies;
const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Matrics.vs(5),
    paddingLeft: Matrics.s(10),
  },
  bullet: {
    width: Matrics.s(6),
    height: Matrics.s(6),
    borderRadius: Matrics.s(3),
    backgroundColor: COLOR.PRIMARY,
    marginRight: Matrics.s(8),
  },
  facilityText: {
    fontFamily: typography.fontFamily.Montserrat.Medium,
    fontSize: typography.fontSizes.fs12,
    color: COLOR.PRIMARY,
    flexShrink: 1,
  },
});
