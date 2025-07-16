import {View, Text, Image, ActivityIndicator} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import NormalHeader from '../../Components/UI/NormalHeader';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {
  cancelBookingThunk,
  getBookingDetailsThunk,
} from '../../Redux/Reducers/BookingOverviewReducer/BookingListSlice';
import {COLOR, Matrics, typography} from '../../Config/AppStyling';
import {Images} from '../../Config';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import dayjs from 'dayjs';
import BookingStatusTag from '../../Components/UI/BookingComponents/BookingStatusTag';
import DownloadButton from '../../Components/UI/BookingComponents/DownloadButton';
import CancelBookingButton from '../../Components/UI/BookingComponents/CancelBookingButton';
import ConfirmationModal from '../../Components/UI/ConfirmationModal';
import CustomLoader from '../../Components/Loader/CustomLoader';

const BookingDetail = ({route}) => {
  const navigation = useNavigation();
  const {bookingDetails, loadingBookingDetails} = useSelector(
    state => state.bookingList,
  );
  console.log('bookingDetails', bookingDetails, loadingBookingDetails);
  const BASE_IMAGE_URL = 'https://giata.visionvivante.in/image?link=';
  const {booking_no, provider, booking_Id} = route.params;
  console.log('Provider from params', provider);

  const isBookingCancelled =
    bookingDetails?.Status?.toString() === '3' ||
    bookingDetails?.Status?.toString() === '4';
  const personDetails = bookingDetails?.booking_data;
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(
          getBookingDetailsThunk({
            bookingNo: booking_no,
            provider,
            bookingId: booking_Id,
          }),
        );
      } catch (error) {
        console.error('error in fetching booking details', error);
      }
    };
    fetchData();
  }, [booking_Id, booking_no, dispatch, provider]);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelBooking = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const confirmCancelBooking = useCallback(() => {
    dispatch(cancelBookingThunk({bookingNo: booking_Id, provider: provider}));
    setShowCancelModal(false);
  }, [booking_Id, provider, dispatch]);
  const additionalDetails = useSelector(
    state => state?.hotelDetail?.additionalDetails,
  );


  // Show loading state when fetching booking details
  if (loadingBookingDetails) {
    return (
      <SafeAreaView style={{flex: 1}}>
        <NormalHeader
          title={'Booking Details'}
          showRightButton={false}
          leftIconName="BACK_ROUND"
          onCrossPress={() => navigation.goBack()}
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color={COLOR.PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if no booking details are available
  if (!bookingDetails && !loadingBookingDetails) {
    return (
      <SafeAreaView style={{flex: 1}}>
        <NormalHeader
          title={'Booking Details'}
          showRightButton={false}
          leftIconName="BACK_ROUND"
          onCrossPress={() => navigation.goBack()}
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: Matrics.s(20),
          }}>
          <Text
            style={{
              fontFamily: typography.fontFamily.Montserrat.Medium,
              fontSize: typography.fontSizes.fs16,
              color: COLOR.DIM_TEXT_COLOR,
              textAlign: 'center',
            }}>
            Unable to load booking details. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAwareScrollView>
      <SafeAreaView>
        <NormalHeader
          title={'Booking Details'}
          showRightButton={false}
          leftIconName="BACK_ROUND"
          onCrossPress={() => navigation.goBack()}
        />
        <View style={{paddingHorizontal: Matrics.s(10)}}>
          <View
            style={{
              flexDirection: 'row',
              marginTop: Matrics.s(20),
              justifyContent: 'space-between',
            }}>
            <View style={{width: '60%'}}>
              <Text
                style={{
                  width: Matrics.s(170),
                  fontFamily: typography.fontFamily.Montserrat.Bold,
                  fontSize: typography.fontSizes.fs18,
                  marginBottom: Matrics.vs(10),
                }}>
                {bookingDetails?.roomData?.[0]?.RoomName ||
                  'Room Name Not Available'}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: Matrics.vs(10),
                  gap: 10,
                }}>
                <Image
                  source={Images.LOCATION}
                  style={{
                    width: Matrics.s(20),
                    resizeMode: 'contain',
                    height: Matrics.s(20),
                    marginTop: Matrics.vs(3),
                  }}
                />
                <Text
                  style={{
                    fontFamily: typography.fontFamily.Montserrat.Regular,
                  }}>
                  {additionalDetails?.address
                    ? additionalDetails?.address
                    : 'No address available'}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: Matrics.vs(10),
                  gap: 10,
                }}>
                <Image
                  source={Images.PERSON}
                  style={{
                    width: Matrics.s(20),
                    resizeMode: 'contain',
                    height: Matrics.s(20),
                  }}
                />
                <Text
                  style={{
                    fontFamily: typography.fontFamily.Montserrat.Regular,
                  }}>
                  {bookingDetails?.GuestList?.length > 1
                    ? `${bookingDetails?.GuestList?.length} Persons`
                    : `${bookingDetails?.GuestList?.length} Person`}{' '}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: Matrics.vs(10),
                  gap: 10,
                }}>
                <Image
                  source={Images.CALENDAR_PURPLE}
                  style={{
                    width: Matrics.s(20),
                    resizeMode: 'contain',
                    height: Matrics.s(20),
                  }}
                />
                <View style={{flexDirection: 'row', gap: 5}}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.Montserrat.Regular,
                    }}>
                    {dayjs(bookingDetails?.CheckInDate).format('DD MMM YYYY')}
                  </Text>
                  <Image
                    source={Images.LEFT_ARROW}
                    style={{
                      width: Matrics.s(20),
                      height: Matrics.s(20),
                      resizeMode: 'contain',
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.Montserrat.Regular,
                    }}>
                    {dayjs(bookingDetails?.CheckOutDate).format('DD MMM YYYY')}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  marginTop: 10,
                }}>
                <DownloadButton
                  title={'Download'}
                  invoicePath={bookingDetails?.invoicePath}
                />
                {/* {!isBookingCancelled && (
                  <CancelBookingButton
                    cancelBooking={handleCancelBooking}
                    bookingId={booking_Id}
                    provider={provider}
                  />
                )} */}
              </View>
            </View>
            <View style={{gap: 10}}>
              {/* <Image
                source={
                  bookingDetails?.Hotel_details?.images?.[0]
                    ? {
                        uri: `${BASE_IMAGE_URL}${bookingDetails?.Hotel_details?.images[0]}`,
                      }
                    : Images.BANNER
                }
                style={{
                  width: Matrics.s(100),
                  height: Matrics.s(70),
                  resizeMode: 'cover',
                  borderRadius: Matrics.s(10),
                }}
              /> */}
              <BookingStatusTag
                borderRadius={Matrics.vs(5)}
                status={bookingDetails?.Status}
              />
            </View>
          </View>
          <View
            style={{
              marginTop: Matrics.vs(10),
              boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
              padding: Matrics.s(10),
              borderRadius: Matrics.s(10),
            }}>
            <Text
              style={{
                fontFamily: typography.fontFamily.Montserrat.Bold,
                fontSize: typography.fontSizes.fs18,
              }}>
              Person Details
            </Text>
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                marginTop: Matrics.vs(5),
              }}>
              <Image
                source={Images.PERSON_DETAILS}
                style={{
                  width: Matrics.s(30),
                  height: Matrics.s(30),
                  resizeMode: 'contain',
                  marginTop: Matrics.vs(3),
                }}
              />
              <View>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.Roboto.Medium,
                    fontSize: typography.fontSizes.fs16,
                    color: COLOR.TITLE_COLOR,
                  }}>
                  {personDetails?.Name} {personDetails?.Surname}
                </Text>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.Roboto.Regular,
                    fontSize: typography.fontSizes.fs14,
                    color: COLOR.DIM_TEXT_COLOR,
                  }}>
                  {personDetails?.Email
                    ? personDetails.Email.toLowerCase()
                    : ''}
                </Text>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.Roboto.Regular,
                    fontSize: typography.fontSizes.fs14,
                    color: COLOR.DIM_TEXT_COLOR,
                  }}>
                  {personDetails?.country_code} {personDetails?.phone_number}
                </Text>

                <Text
                  style={{
                    fontFamily: typography.fontFamily.Roboto.Medium,
                    fontSize: typography.fontSizes.fs16,
                    color: COLOR.TITLE_COLOR,
                    marginTop: Matrics.vs(10),
                  }}>
                  Address
                </Text>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.Roboto.Regular,
                    fontSize: typography.fontSizes.fs14,
                    color: COLOR.DIM_TEXT_COLOR,
                  }}>
                  {personDetails?.Address}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              marginTop: Matrics.vs(10),
              boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
              padding: Matrics.s(10),
              borderRadius: Matrics.s(10),
            }}>
            <Text
              style={{
                width: Matrics.s(170),
                fontFamily: typography.fontFamily.Montserrat.Bold,
                fontSize: typography.fontSizes.fs18,
              }}>
              Price
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderStyle: 'dashed',
                borderBottomWidth: 2,
                borderColor: COLOR.BORDER_COLOR,
                paddingBottom: Matrics.vs(10),
              }}>
              <View style={{}}>
                <Text
                  style={{
                    color: COLOR.DARK_TEXT_COLOR,
                    fontFamily: typography.fontFamily.Montserrat.Regular,
                  }}>
                  {/* {bookingDetails?.roomData[0]?.RoomName
                    ? bookingDetails?.roomData[0]?.RoomName
                    : bookingDetails?.roomData[0]?.RatePlanName} */}
                </Text>
                <Text
                  style={{
                    color: COLOR.DARK_TEXT_COLOR,
                    fontFamily: typography.fontFamily.Montserrat.Regular,
                    fontSize: typography.fontSizes.fs11,
                    width: '80%',
                  }}>
                  {/* {bookingDetails?.roomData[0]?.RoomOccupancy?.RoomNum} Room */}
                </Text>
              </View>
              <View style={{flexDirection: 'row', gap: 5}}>
                {/* <Text
                style={{
                  fontFamily: typography.fontFamily.Montserrat.Regular,
                  fontSize: typography.fontSizes.fs11,
                }}>
                $45
              </Text> */}
                <Text
                  style={{
                    fontFamily: typography.fontFamily.Montserrat.Medium,
                    fontSize: typography.fontSizes.fs15,
                  }}>
                  ${Number(bookingDetails?.totalAmount).toFixed(2)}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: Matrics.vs(5),
              }}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.Montserrat.SemiBold,
                  color: COLOR.PRIMARY,
                  fontSize: typography.fontSizes.fs18,
                }}>
                Total (incl.VAT)
              </Text>
              <Text
                style={{
                  fontFamily: typography.fontFamily.Montserrat.SemiBold,
                  color: COLOR.PRIMARY,
                  fontSize: typography.fontSizes.fs18,
                }}>
                ${Number(bookingDetails?.totalAmount).toFixed(2)}
              </Text>
            </View>
          </View>
          <View
            style={{
              marginTop: Matrics.vs(10),
              boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
              padding: Matrics.s(10),
              borderRadius: Matrics.s(10),
              marginBottom: Matrics.vs(10),
            }}>
            <Text
              style={{
                fontFamily: typography.fontFamily.Montserrat.Bold,
                fontSize: typography.fontSizes.fs18,
              }}>
              Card Details
            </Text>
            <View style={{flexDirection: 'row', gap: 10}}>
              <Image
                source={Images.CARD_PURPLE}
                style={{
                  width: Matrics.s(30),
                  height: Matrics.s(30),
                  resizeMode: 'contain',
                }}
              />
              <View>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.Roboto.Medium,
                    fontSize: typography.fontSizes.fs16,
                    color: COLOR.TITLE_COLOR,
                  }}>
                  Card Number
                </Text>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.Roboto.Regular,
                    fontSize: typography.fontSizes.fs14,
                    color: COLOR.DIM_TEXT_COLOR,
                  }}>
                  **** **** **** {bookingDetails?.card?.last4}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {showCancelModal && (
          <ConfirmationModal
            title={'Are you sure you want to cancel this booking?'}
            handleYesPressed={confirmCancelBooking}
            handleNoPressed={() => {
              setShowCancelModal(false);
            }}
          />
        )}
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

export default BookingDetail;
