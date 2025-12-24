import {View, Text, FlatList, Image, TouchableOpacity} from 'react-native';
import React, {useContext} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getTopHotelsThunk} from '../../Redux/Reducers/HotelReducer/GetHotelSlice';
import {COLOR, typography} from '../../Config/AppStyling';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {Images} from '../../Config';
import {useNavigation} from '@react-navigation/native';
import {RoomContext} from '../../Context/RoomContext';

const TopHotelComponent = () => {
  const dispatch = useDispatch();
  const {topHotels} = useSelector(state => state.hotelSlice);
  const navigation = useNavigation();
  const {setDefaultDates} = useContext(RoomContext);
  const renderEmptyComponent = () => {
    return (
      <View
        style={{
          width: 280,
          height: 390,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
          position: 'relative',
        }}>
        <SkeletonPlaceholder borderRadius={15}>
          <View
            style={{
              width: 250,
              height: 340,
              borderRadius: 15,
              overflow: 'hidden',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            }}>
            {/* Image Placeholder */}
            <SkeletonPlaceholder.Item width={250} height={340} />
          </View>
          {/* Text Overlay Placeholder */}
          <View
            style={{
              position: 'absolute',
              bottom: 10,
              left: 15,
              right: 15,
              height: 50,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 12,
              paddingHorizontal: 15,
              paddingVertical: 12,
              justifyContent: 'center',
            }}>
            <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item
                width={120}
                height={20}
                borderRadius={4}
              />
            </SkeletonPlaceholder>
          </View>
        </SkeletonPlaceholder>
      </View>
    );
  };

  const renderMultipleEmptyComponents = () => {
    return (
      <View style={{flexDirection: 'row'}}>
        {Array.from({length: 5}).map((_, index) => (
          <View key={index} style={{marginHorizontal: 5}}>
            {renderEmptyComponent()}
          </View>
        ))}
      </View>
    );
  };

  const detailsForTopHotels = item => {
    console.log('TopHotel clicked:', item.Name);
    // Set default dates when clicking from top hotels
    console.log('Calling setDefaultDates from TopHotelComponent');
    setDefaultDates();
    console.log('Navigating to HotelDetail');
    navigation.navigate('HotelDetail', {
      provider: item.provider,
      hotelId: item.HotelID,
      GiataId: item.GiataId,
      cityName: item?.CityName,
      countryCode: item?.CountryCode,
      hotelName: item?.Name,
      placeId: item?.PlaceId,
    });
  };

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={{
          width: 280,
          height: 390,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
          position: 'relative',
        }}
        onPress={() => detailsForTopHotels(item)}>
        <View
          style={{
            width: 250,
            height: 340,
            borderRadius: 15,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          }}>
          <Image
            source={Images.HOTEL_CARD_BACKGROUND}
            style={{width: '100%', height: '100%'}}
            resizeMode="cover"
          />
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 8,
            width: 200,
            left: 38,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 12,
            paddingHorizontal: 15,
            paddingVertical: 8,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          }}>
          <Text
            style={{
              fontFamily: typography.fontFamily.Montserrat.Regular,
              fontSize: typography.fontSizes.fs13,
              color: COLOR.BLACK,
              textAlign: 'center',
            }}>
            {item.Name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const fetchTopHotels = React.useCallback(() => {
    const details = {
      countryCode: 'IN',
      countryName: 'India',
    };
    dispatch(getTopHotelsThunk({details: details}));
  }, [dispatch]);

  React.useEffect(() => {
    fetchTopHotels();
  }, [fetchTopHotels]);

  return (
    <View>
      <Text
        style={{
          fontFamily: typography.fontFamily.Montserrat.Bold,
          marginLeft: 15,
          marginBottom: -15,
          fontSize: typography.fontSizes.fs22,
        }}>
        Top Hotels
      </Text>
      <FlatList
        data={topHotels}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderMultipleEmptyComponents}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default TopHotelComponent;
