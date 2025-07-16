import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import React from 'react';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import HotelCard from '../UI/HotelCard';
import {Images} from '../../Config';
import {COLOR, Matrics, typography} from '../../Config/AppStyling';

const SimilarHotels = () => {
  const hotelDataS = useSelector(state => state.hotelSlice);
  const navigation = useNavigation();
  const BASE_IMAGE_URL = 'https://giata.visionvivante.in/image?link=';

  // Limit hotels to 20
  const limitedHotels = hotelDataS?.hotels?.slice(0, 20) || [];

  const formatHotelData = hotel => {
    return {
      imageSource:
        hotel?.imageLinks?.length > 0 && hotel.imageLinks[0]
          ? {uri: `${BASE_IMAGE_URL}${hotel.imageLinks[0]}`}
          : Images.HOTEL_CARD_BACKGROUND,
      name: hotel.Name,
      rating: hotel?.rating,
      reviewCount: hotel?.total_reviews,
      amenities:
        hotel.facilities === null ? null : hotel?.facilities?.slice(0, 6),
      price: hotel.totalprice,
      currency: '$',
      category: hotel.category,
    };
  };

  const icons = {
    fullStar: Images.FULL_STAR,
    halfStar: Images.HALF_STAR,
    amenities: {
      'Air conditioning': Images.AC,
      Parking: Images.PARKING,
      ATM: Images.ATM,
      '24-hour reception': Images.RECEPTION,
      'Free Wifi': Images.WIFI,
      Gym: Images.GYM,
      'Hotel Safe': Images.SAFE,
      'Currency Exchange': Images.CURRENCY_EXCHANGE,
      Lifts: Images.CURRENCY_EXCHANGE,
      Café: Images.CAFE,
      'Newspaper kiosk': Images.KIOSK,
    },
  };

  const renderHotelCard = ({item}) => {
    return (
      <Pressable
        onPress={() =>
          navigation.navigate('HotelDetail', {
            provider: item.provider,
            hotelId: item.HotelID,
            GiataId: item.GiataId,
          })
        }>
        <HotelCard
          hotel={formatHotelData(item)}
          icons={icons}
          onBookPress={() =>
            navigation.navigate('HotelDetail', {
              provider: item.provider,
              hotelId: item.HotelID,
              giataId: item.GiataId,
            })
          }
          provider={item.provider}
        />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Similar Hotels</Text>
      <FlatList
        data={limitedHotels}
        renderItem={renderHotelCard}
        keyExtractor={item => item.HotelID.toString()}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        ListEmptyComponent={
          hotelDataS.loadingHotels ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLOR.PRIMARY} />
            </View>
          ) : (
            <View style={styles.emptyFlatListContainer}>
              <Image
                style={styles.emptyFlatListImage}
                source={Images.NO_RESULT_FOUND}
              />
              <Text style={styles.emptyFlatListText}>No Result Found</Text>
              <Text style={styles.emptyFlatListSubText}>
                Try changing the dates of your search
              </Text>
            </View>
          )
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSizes.fs20,
    fontFamily: typography.fontFamily.Montserrat.SemiBold,
    color: COLOR.PRIMARY,
    marginLeft: Matrics.s(16),
    marginBottom: Matrics.vs(10),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyFlatListSubText: {
    fontFamily: typography.fontFamily.Montserrat.Regular,
    color: COLOR.DIM_TEXT_COLOR,
  },
  emptyFlatListText: {
    fontSize: typography.fontSizes.fs18,
    fontFamily: typography.fontFamily.Montserrat.SemiBold,
  },
  emptyFlatListImage: {
    width: Matrics.s(100),
    height: Matrics.s(100),
    resizeMode: 'contain',
  },
  emptyFlatListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: Matrics.screenHeight * 0.3,
  },
});

export default SimilarHotels;
