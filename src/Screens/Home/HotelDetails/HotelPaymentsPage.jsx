import {View, Text, Image, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useContext} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import NormalHeader from '../../../Components/UI/NormalHeader';
import {useNavigation} from '@react-navigation/native';
import {Images} from '../../../Config';
import {COLOR, Matrics, typography} from '../../../Config/AppStyling';
import {useSelector} from 'react-redux';
import {RoomContext} from '../../../Context/RoomContext';
import dayjs from 'dayjs';
import EditCardComponent from '../../../Components/HotelComponents/EditCardComponent';
import PaymentForm from '../../../Components/PaymentForm';
import RoomPolicies from './RoomPolicies';
import {PolicyInfoContext} from '../../../Context/PolicyInfoContext';
const HotelPaymentsPage = () => {
  const navigation = useNavigation();
  const hotelDetail = useSelector(state => state?.hotelDetail?.hotel);
  const additionalDetails = useSelector(
    state => state?.hotelDetail?.additionalDetails,
  );
  console.log('hotelDetail', hotelDetail);
  const roomState = useSelector(state => state?.rooms);

  const BASE_IMAGE_URL = 'https://giata.visionvivante.in/image?link=';
  const {loadingSavedCard, savedCard} = useSelector(state => state.bookingList);
  const {guests, hotelStayStartDate, hotelStayEndDate, selectedRoom} =
    useContext(RoomContext);
  console.log('selectedRoom_+_+_+_+_+_+_', selectedRoom);

  const {provider, hotelId, GiataId} = useContext(PolicyInfoContext);
  const renderContent = () => (
    <>
      <View style={{flex: 1}}>
        <NormalHeader
          title={'Payment'}
          showRightButton={false}
          leftIconName="BACK"
          onCrossPress={() => navigation.goBack()}
        />
        <KeyboardAwareScrollView style={{paddingHorizontal: Matrics.s(10)}}>
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
                {hotelDetail?.Name}
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
                  alignItems: 'center',
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
                  {guests.length > 1 ? `${guests} Persons` : `${guests} Person`}{' '}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: Matrics.vs(10),
                  gap: 10,
                  alignItems: 'center',
                }}>
                <Image
                  source={Images.CALENDAR_PURPLE}
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
                  {dayjs(hotelStayStartDate).format('DD MMM YYYY')}{' '}
                  {dayjs(hotelStayEndDate).format('DD MMM YYYY')}
                </Text>
              </View>
            </View>
            <View>
              <Image
                source={
                  hotelDetail?.images?.[0]
                    ? {uri: `${BASE_IMAGE_URL}${hotelDetail.images[0]}`}
                    : Images.BANNER
                }
                style={{
                  width: Matrics.s(100),
                  height: Matrics.s(70),
                  resizeMode: 'cover',
                  borderRadius: Matrics.s(10),
                }}
              />
            </View>
          </View>
          <View style={{marginTop: Matrics.vs(10)}}>
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
                  {selectedRoom.RoomName}
                </Text>
                {/* <Text
                  style={{
                    color: COLOR.DARK_TEXT_COLOR,
                    fontFamily: typography.fontFamily.Montserrat.Regular,
                    fontSize: typography.fontSizes.fs11,
                    width: '60%',
                  }}>
                  {selectedRoom.RoomOccupancy.RoomNum} Room
                </Text> */}
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
                  ${Number(selectedRoom.price).toFixed(2)}
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
                ${Number(selectedRoom.price).toFixed(2)}
              </Text>
            </View>
          </View>

          <View>
            <EditCardComponent savedCardDetails={savedCard} />
            <PaymentForm />
          </View>
          <View>
            <RoomPolicies
              roomInfo={roomState?.rooms}
              provider={provider}
              hotelId={hotelId}
              GiataId={GiataId}
              showProceedButton={false}
              containerStyle={{paddingHorizontal: Matrics.s(0)}}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    </>
  );
  return Platform.OS === 'android' ? (
    <SafeAreaView style={{flex: 1}}>{renderContent()}</SafeAreaView>
  ) : (
    renderContent()
  );
};

export default HotelPaymentsPage;
