import {View, Text, FlatList, Image, TouchableOpacity} from 'react-native';
import React, {useContext, useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getTopHotelsThunk} from '../../Redux/Reducers/HotelReducer/GetHotelSlice';
import {COLOR, typography} from '../../Config/AppStyling';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {Images} from '../../Config';
import {useNavigation} from '@react-navigation/native';
import {RoomContext} from '../../Context/RoomContext';

const TopHotelComponent = () => {
  const dispatch = useDispatch();
  const {topHotels, loading} = useSelector(state => state.hotelSlice);
  const navigation = useNavigation();
  const {setDefaultDates} = useContext(RoomContext);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [skeletonTimeout, setSkeletonTimeout] = useState(false);

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
            <SkeletonPlaceholder.Item width={250} height={340} />
          </View>
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
    // Show only 3 skeletons instead of 5 for faster perceived load
    return (
      <View style={{flexDirection: 'row'}}>
        {Array.from({length: 3}).map((_, index) => (
          <View key={index} style={{marginHorizontal: 5}}>
            {renderEmptyComponent()}
          </View>
        ))}
      </View>
    );
  };

  const detailsForTopHotels = item => {
    console.log('TopHotel clicked:', item.Name);
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

  // Hide skeleton after data loads OR after timeout
  useEffect(() => {
    if (topHotels && topHotels.length > 0) {
      setShowSkeleton(false);
    }
  }, [topHotels]);

  // Set a maximum skeleton display time of 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSkeletonTimeout(true);
      setShowSkeleton(false);
    }, 2000); // Hide skeleton after 2 seconds max

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchTopHotels();
  }, [fetchTopHotels]);

  // If skeleton timed out and still no data, show a message
  if (skeletonTimeout && (!topHotels || topHotels.length === 0)) {
    return (
      <View>
        <Text
          style={{
            fontFamily: typography.fontFamily.Montserrat.Bold,
            marginLeft: 15,
            marginBottom: 15,
            fontSize: typography.fontSizes.fs22,
          }}>
          Top Hotels
        </Text>
        <View style={{paddingHorizontal: 15, paddingVertical: 20}}>
          <Text
            style={{
              fontFamily: typography.fontFamily.Montserrat.Regular,
              fontSize: typography.fontSizes.fs14,
              color: COLOR.BLACK,
              textAlign: 'center',
            }}>
            Unable to load hotels at the moment
          </Text>
        </View>
      </View>
    );
  }

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
        ListEmptyComponent={showSkeleton ? renderMultipleEmptyComponents : null}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default TopHotelComponent;
