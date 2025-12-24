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
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const {
    guests,
    hotelStayStartDate,
    hotelStayEndDate,
    roomDetails,
    destinationInfo,
    roomTypeId,
  } = useContext(RoomContext);

  console.log('Destination000000000000000000', roomDetails);

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
      'Price confirm All state----------------------',
      priceConfirmAllState,
    );

    try {
      const priceDetails = priceConfirmAllState?.priceConfirmDetails;

      console.log(
        '------------------>>>>>>>>>>>>>>>>priceDetails',
        priceDetails,
      );

      const holder = guestDetails[0] || {};
      const holderAge = Number(holder.age) || 0;
      const cardAmount =
        priceDetails?.totalprice ||
        priceDetails?.TotalPrice ||
        priceDetails?.price;
      const ratePlanId =
        priceDetails?.RatePlanID ||
        priceDetails?.ratePlanId ||
        priceDetails?.rate_plan_id;

      const cancellation = priceDetails?.CancellationPolicyList || [];

      const requestId =
        priceDetails?.request_id ?? priceDetails?.requestId ?? null;
      const searchId =
        priceDetails?.Search_id ??
        priceDetails?.search_id ??
        priceDetails?.searchId ??
        null;
      const payload = {
        ReferenceNo: priceDetails?.ReferenceNo || '',
        Holder_details: {
          title: holder.title || '',
          Name: holder.firstName || '',
          Surname: holder.lastName || '',
          Gender: holder.gender || 'Unknown',
          birth_date: holder.birth_date || '',
          Age: holderAge,
          Email: holder.email || '',
          phone_number: Number(holder.phone) || '',
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
        departureDate: dayjs(hotelStayEndDate).format('YYYY-MM-DD'),
        GuestList: guestDetails.map((guest, index) => {
          const guestAge = Number(guest.age) || 0;
          return {
            RoomNum: index + 1,
            GuestInfo: [
              {
                title: guest.title || '',
                Name: {
                  First: guest.firstName || '',
                  Last: guest.lastName || '',
                },
                IsAdult: guestAge >= 18,
                Age: guestAge,
                birth_date: guest.birth_date || '',
              },
            ],
          };
        }),
        card_details: {
          payment_method: savedCard?.id,
          amount: cardAmount,
          price: cardAmount,
        },
        RatePlanID: ratePlanId,
        RoomTypeID: roomTypeId,
        request_id: requestId,
        Search_id: searchId,
        roomDetail: roomDetails,
        provider: priceDetails?.provider || 'DIDA',
        HotelID: priceDetails?.HotelID,
        Currency: priceDetails?.Currency,
        destination: destinationInfo,
        cancellation,
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
    roomDetails,
    navigation,
    roomTypeId,
    destinationInfo,
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
