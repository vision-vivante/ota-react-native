import {View, Text, StyleSheet, Platform} from 'react-native';
import React, {useContext, useEffect} from 'react';
import {COLOR, Matrics, typography} from '../../../Config/AppStyling';
import {RoomContext} from '../../../Context/RoomContext';
import CheckoutToast from '../../../Components/UI/CheckoutToast';
import {useDispatch, useSelector} from 'react-redux';
import dayjs from 'dayjs';
import {confirmPrice} from '../../../Redux/Reducers/HotelReducer/PriceConfirmSlice';
import {errorToast} from '../../../Helpers/ToastMessage';
import {useNavigation} from '@react-navigation/native';
import i18n from '../../../i18n/i18n';
import AuthenticationModal from '../../../Components/AuthenticationModal';
import {
  saveHotelDetails,
  stashPendingHotelFlow,
} from '../../../Utils/GuestBookingFlowFunctions';
import useCancellationPolicy from '../../../Context/CustomHookForRoomCancellationPolicy';

const RoomPolicies = ({
  roomInfo,
  provider,
  hotelId,
  GiataId,
  showProceedButton = true,
  containerStyle,
}) => {
  const {authData, userToken} = useSelector(state => state.auth);
  console.log('Auth Data', authData);

  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const dispatch = useDispatch();
  const {selectedRoomId, setRoomDetails} = useContext(RoomContext);
  const selectedRoom = roomInfo?.find(
    room => room?.RatePlanID === selectedRoomId,
  );

  console.log('*********************************Room Info', selectedRoom);

  const {ratePlanId} = useContext(RoomContext);
  const {
    hotelStayStartDate,
    hotelStayEndDate,
    adults,
    rooms,
    pluaralChild,
    setRoomTypeId,
  } = useContext(RoomContext);

  const navigation = useNavigation();
  const handleCheckoutPress = async () => {
    if (!authData && !userToken) {
      try {
        await saveHotelDetails({hotelId: hotelId, giataId: GiataId, provider});
        await stashPendingHotelFlow({
          hotelId,
          giataId: GiataId,
          provider,
          targetRoute: 'HotelBooking',
          targetParams: {provider, hotelId, giataId: GiataId},
        });
      } catch (error) {
        console.log('Error storing hotel ID:', error);
      }
      setShowLoginModal(true);
      return;
    }

    if (!hotelStayStartDate || !hotelStayEndDate) {
      const error = 'Please select check-in and check-out dates';
      return errorToast(error);
    }
    setRoomDetails([
      {
        RoomName: selectedRoom?.RoomName || selectedRoom?.RatePlanName,
        totalPrice: selectedRoom?.totalprice,
      },
    ]);
    setRoomTypeId(selectedRoom?.RoomTypeID);
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
      roomDetail: [
        {
          RoomName: selectedRoom?.RoomName || selectedRoom?.RatePlanName,
          totalprice: selectedRoom?.totalprice,
        },
      ],
    };

    try {
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

  // Auto-close auth modal and resume once authenticated
  useEffect(() => {
    if ((authData || userToken) && showLoginModal) {
      setShowLoginModal(false);
      // Resume flow on the next tick to allow modal state to settle
      setTimeout(() => {
        handleCheckoutPress();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authData, userToken, showLoginModal]);
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
            <Text
              style={{
                fontFamily: typography.fontFamily.Montserrat.Medium,
                color: COLOR.PRIMARY,
                width: '80%',
              }}>
              {useCancellationPolicy(
                selectedRoom?.RatePlanCancellationPolicyList,
              )}
            </Text>
          </View>
        </View>
        {selectedRoomId && showProceedButton && (
          <View>
            <CheckoutToast handlePress={handleCheckoutPress} />
          </View>
        )}
      </View>
      <AuthenticationModal
        visible={showLoginModal}
        onCancelPress={() => setShowLoginModal(false)}
        onCreateAccountPress={() => {
          setShowLoginModal(false);
          navigation.navigate('CreateAccount');
        }}
        onLoginPress={() => {
          setShowLoginModal(false);
          navigation.navigate('Login');
        }}
      />
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
