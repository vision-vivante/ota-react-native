// Change the path for additional details
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  getAdditionalDetail,
  getHotelDetailsThunk,
} from '../../../Redux/Reducers/HotelReducer/GetHotelDetailSlice';

import NormalHeader from '../../../Components/UI/NormalHeader';
import {COLOR, Matrics, typography} from '../../../Config/AppStyling';
import {Images} from '../../../Config';
import {SafeAreaView} from 'react-native-safe-area-context';
import RoomCard from '../../../Components/UI/RoomCard';
import ModifyCard from '../../../Components/UI/ModifyCard';
import HotelCarousel from '../../../Components/UI/HotelCarousel';
import SimpleLoader from '../../../Components/Loader/SimpleLoader';
import HotelAmenities from './HotelAmenities';
import RoomPolicies from './RoomPolicies';
import HotelReviews from './HotelReviews';
import i18n from '../../../i18n/i18n';
import RoomAmenities from '../../../Components/UI/RoomAmenities';
import SimilarHotels from '../../../Components/HotelComponents/SimilarHotels';
import {PolicyInfoContext} from '../../../Context/PolicyInfoContext';
const StarRating = ({rating = 0, reviewCount = 0}) => {
  return (
    <View style={styles.ratingContainer}>
      <View
        style={{
          backgroundColor: COLOR.PRIMARY,
          flexDirection: 'row',
          paddingHorizontal: Matrics.s(10),
          paddingVertical: Matrics.vs(3),
          borderRadius: Matrics.s(4),
          alignItems: 'center',
        }}>
        <Text style={styles.ratingNumber}>{rating}</Text>
        <Image
          source={Images.FULL_STAR_WHITE}
          style={{
            width: Matrics.s(15),
            resizeMode: 'contain',
            height: Matrics.vs(15),
          }}
        />
      </View>

      <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>
    </View>
  );
};
const HotelDetail = ({route, navigation}) => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const {provider, hotelId, GiataId} = route.params;
  const {setProvider, setHotelId, setGiataId} = useContext(PolicyInfoContext);
  useEffect(() => {
    setProvider(provider);
    setHotelId(hotelId);
    setGiataId(GiataId);
  }, [provider, hotelId, GiataId]);
  const hotelDetail = useSelector(state => state?.hotelDetail);

  const roomState = useSelector(state => state?.rooms);
  const additionalDetails = useSelector(
    state => state?.hotelDetail?.additionalDetails,
  );
  console.log('additionalDetails', additionalDetails);

  const images = [Images.HOTEL1, Images.HOTEL2, Images.HOTEL3];
  const details = useMemo(
    () =>
      GiataId ? {GiataId: GiataId} : {provider: provider, HotelID: hotelId},
    [GiataId, provider, hotelId],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch hotel details first
        await dispatch(getHotelDetailsThunk({details})).unwrap();
      } catch (error) {
        console.error('Error in fetching hotel details:', error);
      }
    };

    fetchData();
  }, [details]);
  useEffect(() => {
    if (
      hotelDetail?.hotel?.Name &&
      (hotelDetail?.hotel?.longitude || hotelDetail?.hotel?.Longitude) &&
      (hotelDetail?.hotel?.latitude || hotelDetail?.hotel?.Latitude)
    ) {
      const detailsForAdditionalDetails = {
        Name: hotelDetail.hotel.Name,
        Longitude: hotelDetail.hotel.Longitude || hotelDetail.hotel.longitude,
        Latitude: hotelDetail.hotel.Latitude || hotelDetail.hotel.latitude,
      };
      dispatch(getAdditionalDetail({details: detailsForAdditionalDetails}));
    }
  }, [hotelDetail?.hotel, dispatch]);
  const handleLoadMore = async () => {
    if (!isLoadingMore && !roomState.loadingRooms) {
      try {
        setIsLoadingMore(true);
        const nextPage = page + 1;
        await dispatch(
          getHotelDetailsThunk({
            details: {
              ...details,
              page: nextPage,
              limit: 5,
            },
          }),
        );
        setPage(nextPage);
      } catch (error) {
        console.error('Error loading more rooms:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const ListFooterComponent = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLOR.PRIMARY} />
      </View>
    );
  };
  const renderEmptyList = () => {
    return (
      <Text
        style={{
          fontFamily: typography.fontFamily.Montserrat.SemiBold,
          fontSize: typography.fontSizes.fs16,
          color: COLOR.DARK_TEXT_COLOR,
          flexWrap: 'wrap',
          width: Matrics.screenWidth * 0.9,
        }}>
        No rooms right now. Modify Date to see other options
      </Text>
    );
  };

  const renderStars = cate => {
    const totalStars = 5;
    const stars = [];

    for (let i = 0; i < cate; i++) {
      stars.push(
        <Image
          key={`purple-${i}`}
          source={Images.FULL_PURPLE_STAR}
          style={styles.starIcon}
        />,
      );
    }
    for (let i = cate; i < totalStars; i++) {
      stars.push(
        <Image
          key={`grey-${i}`}
          source={Images.FULL_GREY_STAR}
          style={styles.starIcon}
        />,
      );
    }
    return stars;
  };

  const renderContent = () => (
    <>
      {' '}
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <NormalHeader
          title={i18n.t('hotelDetails.hotelDetailPageTitle')}
          onCrossPress={() => navigation.goBack()}
          showLeftButton={true}
          showRightButton={false}
          leftIconName="BACK_ROUND"
        />
        <View>
          {hotelDetail?.loadingHotels ? (
            <View
              style={{
                height: Matrics.screenHeight * 0.8,
                justifyContent: 'center',
              }}>
              <SimpleLoader
                loadingText={i18n.t('loading.loadingHotelDetail')}
              />
            </View>
          ) : (
            <>
              <View style={styles.mainCarouselContainer}>
                {hotelDetail?.hotel?.images?.length > 0 ? (
                  <HotelCarousel images={hotelDetail?.hotel?.images} />
                ) : (
                  <HotelCarousel images={images} />
                )}
              </View>
              <View style={styles.hotelInfoContainer}>
                <View style={styles.container}>
                  <Text style={styles.hotelName}>
                    <Text style={styles.nameText}>
                      {hotelDetail?.hotel?.Name}
                    </Text>
                    <View style={{flexDirection: 'row'}}>
                      {renderStars(hotelDetail?.hotel?.category)}
                    </View>
                  </Text>
                </View>
                <StarRating
                  rating={hotelDetail?.additionalDetails?.rating}
                  reviewCount={hotelDetail?.additionalDetails?.total_reviews}
                />
                <View style={styles.addressContainer}>
                  <Image source={Images.LOCATION} style={styles.locationPin} />
                  <Text style={styles.hotelAddress}>
                    {hotelDetail?.additionalDetails?.result?.address ||
                      additionalDetails?.address}
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: Matrics.vs(10),
                    paddingHorizontal: Matrics.s(5),
                  }}>
                  <Text
                    style={{
                      color: COLOR.DARK_TEXT_COLOR,
                      fontFamily: typography.fontFamily.Montserrat.Medium,
                      fontSize: typography.fontSizes.fs14,
                    }}>
                    {!hotelDetail?.hotel?.content?.section[0].para ? (
                      <>No Address Detail Available </>
                    ) : (
                      hotelDetail?.hotel?.content?.section[0].para
                    )}
                  </Text>
                </View>
              </View>
              <View>
                <HotelAmenities hotelDetail={hotelDetail?.hotel} />
              </View>
              <View
                style={{
                  paddingHorizontal: Matrics.s(16),
                  marginTop: Matrics.vs(25),
                }}>
                <ModifyCard provider={provider} hotelId={hotelId} />
              </View>
              <View style={{paddingHorizontal: Matrics.s(16)}}>
                <Text style={styles.title}>Rooms & Amenities</Text>
                <RoomAmenities hotelDetail={hotelDetail?.hotel} />
                {roomState?.loadingRooms === false ? (
                  <FlatList
                    data={roomState.rooms}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) => <RoomCard room={item} />}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyList}
                    ItemSeparatorComponent={() => <View style={{width: 20}} />}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={ListFooterComponent}
                  />
                ) : (
                  <>
                    <SimpleLoader
                      loadingText={i18n.t('loading.gettingRooms')}
                    />
                  </>
                )}
              </View>
              {roomState?.rooms?.length > 0 && (
                <RoomPolicies
                  roomInfo={roomState?.rooms}
                  provider={provider}
                  hotelId={hotelId}
                  GiataId={GiataId}
                />
              )}
              <HotelReviews hotelDetail={hotelDetail} />
              <SimilarHotels />
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
  return Platform.OS === 'android' ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <SafeAreaView>{renderContent()}</SafeAreaView>
    </KeyboardAvoidingView>
  ) : (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View>{renderContent()}</View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: Matrics.vs(20),
  },
  hotelInfoContainer: {
    paddingHorizontal: Matrics.s(16),
  },
  hotelName: {
    fontFamily: typography.fontFamily.Montserrat.Bold,
    fontSize: typography.fontSizes.fs24,
  },
  hotelAddress: {
    fontFamily: typography.fontFamily.Montserrat.Medium,
    fontSize: typography.fontSizes.fs14,
    color: '#666',
    flex: 1,
  },
  amenitiesContainer: {
    padding: Matrics.s(16),
  },
  facilitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Matrics.s(8),
  },
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: Matrics.vs(5),
    gap: 3,
  },
  locationPin: {
    resizeMode: 'contain',
    width: Matrics.s(15),
    height: Matrics.s(15),
    marginTop: 3,
  },
  reviewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  startImages: {
    resizeMode: 'contain',
    height: Matrics.vs(14),
    width: Matrics.s(14),
  },
  starContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  title: {
    fontFamily: typography.fontFamily.Montserrat.Bold,
    fontSize: typography.fontSizes.fs18,
    marginBottom: Matrics.vs(10),
    marginTop: Matrics.vs(10),
  },
  reivewVisuals: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  policiesContainer: {
    padding: Matrics.s(16),
  },

  modalStyle: {
    backgroundColor: COLOR.WHITE,
    width: Matrics.screenWidth * 0.9,
    flexDirection: 'row',
    paddingVertical: Matrics.vs(10),
    borderRadius: Matrics.s(5),
    paddingHorizontal: Matrics.s(5),
    justifyContent: 'space-between',
    position: 'relative',
  },
  modalParent: {
    position: 'absolute',
    flex: 1,
    backgroundColor: 'red',
  },
  selectedRoomText: {
    fontFamily: typography.fontFamily.Montserrat.SemiBold,
    fontSize: typography.fontSizes.fs16,
  },
  starIcon: {
    width: 14,
    height: 14,
    marginHorizontal: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Matrics.vs(8),
    gap: 8,
  },
  ratingNumber: {
    fontSize: 16,
    marginRight: 4,
    fontFamily: typography.fontFamily.Montserrat.Medium,
    color: COLOR.WHITE,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    fontFamily: typography.fontFamily.Montserrat.Medium,
  },
});

export default HotelDetail;
