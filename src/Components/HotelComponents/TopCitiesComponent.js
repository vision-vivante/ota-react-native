import {
  View,
  Text,
  FlatList,
  Image,
  I18nManager,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getTopHotelsThunk} from '../../Redux/Reducers/HotelReducer/GetHotelSlice';
import {COLOR, typography} from '../../Config/AppStyling';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {Images} from '../../Config';
import {useNavigation} from '@react-navigation/native';
import {RoomContext} from '../../Context/RoomContext';

const TopCitiesComponent = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {topHotels, topCities} = useSelector(state => state.hotelSlice);
  const isRTL = I18nManager.isRTL;
  const [showSkeleton, setShowSkeleton] = useState(true);

  const handleCityPress = item => {
    // Handle city card press
    console.log('City pressed:', item.cityName);
    // Navigate to city details or hotel list
    // navigation.navigate('CityHotels', { city: item });
  };

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
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }}
            />
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: 28,
              ...(isRTL ? {right: 38} : {left: 38}),
              width: 200,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 12,
              paddingHorizontal: 15,
              paddingVertical: 8,
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
    // Only show skeleton if data hasn't loaded yet
    if (!showSkeleton) return null;

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

  const renderItem = ({item}) => {
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
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleCityPress(item)}
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
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 28,
              width: 200,
              ...(isRTL ? {right: 38} : {left: 38}),
              paddingHorizontal: 15,
              paddingVertical: 8,
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            }}>
            <Text
              style={{
                fontFamily: typography.fontFamily.Montserrat.SemiBold,
                fontSize: typography.fontSizes.fs13,
                color: COLOR.WHITE,
                textAlign: 'center',
              }}>
              {item.cityName}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const fetchTopHotels = React.useCallback(() => {
    const details = {
      countryCode: 'IN',
      countryName: 'India',
    };
    dispatch(getTopHotelsThunk({details: details}));
  }, [dispatch]);

  // Hide skeleton as soon as data arrives
  useEffect(() => {
    if (topCities && topCities.length > 0) {
      setShowSkeleton(false);
    }
  }, [topCities]);

  // Auto-hide skeleton after 1.5 seconds maximum
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    fetchTopHotels();
  }, [fetchTopHotels]);

  return (
    <View>
      <Text
        style={{
          fontFamily: typography.fontFamily.Montserrat.Bold,
          marginHorizontal: 15,
          marginBottom: -15,
          fontSize: typography.fontSizes.fs22,
        }}>
        Top Cities
      </Text>
      <FlatList
        data={topCities}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderMultipleEmptyComponents}
        horizontal
        showsHorizontalScrollIndicator={false}
        inverted={isRTL}
      />
    </View>
  );
};

export default TopCitiesComponent;
