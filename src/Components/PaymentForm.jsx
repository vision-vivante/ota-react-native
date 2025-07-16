import React, {useCallback, useContext, useState} from 'react';
import {Alert, TouchableOpacity, Text, ActivityIndicator} from 'react-native';
import {COLOR, Matrics, typography} from '../Config/AppStyling';
import {RoomContext} from '../Context/RoomContext';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {bookHotelThunk} from '../Redux/Reducers/HotelReducer/BookHotelSlice';
import dayjs from 'dayjs';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {errorToast} from '../Helpers/ToastMessage';

const PaymentForm = () => {
  const priceConfirmAllState = useSelector(state => state?.confirmPrice);
  const {savedCard} = useSelector(state => state.bookingList);
  const {bookingConfirmationDetails} = useSelector(state => state.hotelBooking);
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const {guests, hotelStayStartDate, hotelStayEndDate, selectedRoom} =
    useContext(RoomContext);
  console.log('Selected Room', selectedRoom);

  const GUEST_DETAILS_KEY = 'guestDetails';
  const [guestDetails, setGuestDetails] = useState(
    Array(guests)
      .fill(null)
      .map(() => ({})),
  );
  const {loadingBooking} = useSelector(state => state.hotelBooking);
  useFocusEffect(
    useCallback(() => {
      const loadGuestDetails = async () => {
        try {
          console.log(
            'Price confirm total price',
            priceConfirmAllState.priceConfirmDetails,
          );
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
    }, [guests]),
  );

  const sendToBackend = useCallback(async () => {
    console.log(
      'Price confirm total price',
      priceConfirmAllState.priceConfirmDetails,
    );

    try {
      const holder = guestDetails[0] || {};
      const payload = {
        ReferenceNo: priceConfirmAllState.priceConfirmDetails.ReferenceNo,
        Holder_details: {
          Name: holder.firstName || '',
          Surname: holder.lastName || '',
          Gender: holder.gender || 'Unknown',
          Age: holder.age || '',
          Email: holder.email || '',
          phone_number: holder.phone || '',
          DocumentType: holder.documentType || '',
          DocumentNo: holder.documentNumber || '',
          Address: holder.address || '',
          City: holder.city || '',
          PostalCode: holder.postalCode || '',
          Country: holder.country || '',
          Nationality: holder.country || '',
          country_code: holder.countryCode || '',
          country_code_name: holder.country_code_name || 'IN',
        },
        NumOfRooms: guests,
        CheckInDate: dayjs(hotelStayStartDate).format('YYYY-MM-DD'),
        CheckOutDate: dayjs(hotelStayEndDate).format('YYYY-MM-DD'),
        GuestList: guestDetails.map((guest, index) => ({
          RoomNum: index + 1,
          GuestInfo: [
            {
              Name: {
                First: guest.firstName || '',
                Last: guest.lastName || '',
              },
              IsAdult: guest.age >= 18,
              Age: guest.age || 0,
            },
          ],
        })),
        card_details: {
          payment_method: savedCard?.id,
          amount: priceConfirmAllState.priceConfirmDetails.totalprice,
        },
        RatePlanID: priceConfirmAllState.priceConfirmDetails.RatePlanID,
        provider: 'DIDA',
        HotelID: priceConfirmAllState.priceConfirmDetails.HotelID,
        Currency: priceConfirmAllState.priceConfirmDetails.Currency,
        roomDetail: [
          {
            RoomName: selectedRoom?.RoomName,
            totalPrice: selectedRoom?.totalprice,
          },
        ],
      };

      console.log('Backend payload:', payload);
      // Dispatch booking
      const response = await dispatch(
        bookHotelThunk({details: payload}),
      ).unwrap();
      if (response?.status === true) {
        navigation.navigate('HotelBookingStatus');
      } else {
        errorToast('Something went wrong please try again');
      }
    } catch (error) {
      console.error('Error booking hotel:', error);
      errorToast('Something went wrong please try again');
    }
  }, [
    dispatch,
    guestDetails,
    guests,
    hotelStayEndDate,
    hotelStayStartDate,
    priceConfirmAllState,
    savedCard,
    navigation,
  ]);

  return (
    <TouchableOpacity
      onPress={sendToBackend}
      style={{
        backgroundColor: COLOR.PRIMARY,
        paddingVertical: Matrics.vs(10),
        borderRadius: Matrics.vs(10),
        marginTop: Matrics.vs(15),
      }}
      disabled={loadingBooking}
      activeOpacity={0.8}>
      {loadingBooking ? (
        <ActivityIndicator size="small" color={COLOR.WHITE} />
      ) : (
        <Text
          style={{
            color: COLOR.WHITE,
            fontFamily: typography.fontFamily.Montserrat.Bold,
            fontSize: typography.fontSizes.fs14,
            textAlign: 'center',
          }}>
          Pay with Saved Card
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PaymentForm;
