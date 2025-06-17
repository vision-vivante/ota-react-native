import {View, Text, FlatList, Image} from 'react-native';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getTopHotelsThunk} from '../../Redux/Reducers/HotelReducer/GetHotelSlice';
import {COLOR, typography} from '../../Config/AppStyling';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {Images} from '../../Config';

const TopCitiesComponent = () => {
  const dispatch = useDispatch();
  const {topHotels, topCities} = useSelector(state => state.hotelSlice);

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
            {/* Image Placeholder with Overlay Effect */}
            <SkeletonPlaceholder.Item width={250} height={340} />
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)', // Subtle black overlay
              }}
            />
          </View>
          {/* Text Overlay Placeholder */}
          <View
            style={{
              position: 'absolute',
              bottom: 28,
              left: 38,
              right: 38,
              height: 50,
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
          {/* Subtle Black Overlay */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)', // Subtle black overlay
            }}
          />
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 28,
            width: 200,
            left: 38,
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
      </View>
    );
  };

  const fetchTopHotels = () => {
    const details = {
      countryCode: 'IN',
      countryName: 'India',
    };
    dispatch(getTopHotelsThunk({details: details}));
  };

  React.useEffect(() => {
    fetchTopHotels();
  }, [dispatch]);

  return (
    <View>
      <Text
        style={{
          fontFamily: typography.fontFamily.Montserrat.Bold,
          marginLeft: 15,
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
      />
    </View>
  );
};

export default TopCitiesComponent;
