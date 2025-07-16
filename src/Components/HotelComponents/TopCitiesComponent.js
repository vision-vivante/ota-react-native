import {View, Text, FlatList, Image, Dimensions} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getTopHotelsThunk} from '../../Redux/Reducers/HotelReducer/GetHotelSlice';
import {COLOR, typography} from '../../Config/AppStyling';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {Images} from '../../Config';

const TopCitiesComponent = () => {
  const dispatch = useDispatch();
  const {topCities} = useSelector(state => state.hotelSlice);
  const flatListRef = useRef(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(true);

  // स्क्रीन की चौड़ाई
  const {width: screenWidth} = Dimensions.get('window');
  const itemWidth = 280 + 10; // कार्ड चौड़ाई (280) + मार्जिन (5 + 5)
  const snapWidth = itemWidth;

  // डेटा को तीन बार डुप्लिकेट करें ताकि रीसेट स्मूथ हो
  const data =
    topCities?.length > 0 ? [...topCities, ...topCities, ...topCities] : [];

  const renderEmptyComponent = () => (
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
            left: 38,
            right: 38,
            height: 50,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 12,
            paddingHorizontal: 15,
            paddingVertical: 8,
            justifyContent: 'center',
          }}>
          <SkeletonPlaceholder.Item width={120} height={20} borderRadius={4} />
        </View>
      </SkeletonPlaceholder>
    </View>
  );

  const renderMultipleEmptyComponents = () => (
    <View style={{flexDirection: 'row'}}>
      {Array.from({length: 5}).map((_, index) => (
        <View key={index} style={{marginHorizontal: 5}}>
          {renderEmptyComponent()}
        </View>
      ))}
    </View>
  );

  const renderItem = ({item}) => (
    <View
      style={{
        width: 280,
        height: 390,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        position: 'relative',
        marginHorizontal: 5,
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

  const fetchTopHotels = () => {
    const details = {
      countryCode: 'IN',
      countryName: 'India',
    };
    dispatch(getTopHotelsThunk({details}));
  };

  useEffect(() => {
    fetchTopHotels();
  }, [dispatch]);

  // ऑटो-स्क्रॉल लॉजिक
  useEffect(() => {
    if (!isScrolling || !data.length) return;

    const scrollInterval = setInterval(() => {
      setScrollIndex(prev => {
        let nextIndex = prev + 1;

        if (flatListRef.current) {
          // रीसेट जब इंडेक्स मूल डेटा की लंबाई से दोगुना हो
          if (nextIndex >= topCities.length * 2) {
            nextIndex = nextIndex % topCities.length; // मूल डेटा की शुरुआत
            flatListRef.current.scrollToIndex({
              index: nextIndex + topCities.length, // डुप्लिकेट के बीच में शुरू
              animated: false,
            });
          } else {
            flatListRef.current.scrollToIndex({
              index: nextIndex,
              animated: true,
            });
          }
        }

        return nextIndex;
      });
    }, 3000); // हर 3 सेकंड में स्क्रॉल

    return () => clearInterval(scrollInterval);
  }, [isScrolling, data.length, topCities.length]);

  // आइटम लेआउट
  const getItemLayout = (_, index) => ({
    length: itemWidth,
    offset: itemWidth * index,
    index,
  });

  // यूजर इंटरैक्शन
  const handleScrollBegin = () => setIsScrolling(false);
  const handleScrollEnd = () => setIsScrolling(true);

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
        ref={flatListRef}
        data={data}
        keyExtractor={(item, index) => `${item.cityName}-${index}`}
        renderItem={renderItem}
        ListEmptyComponent={renderMultipleEmptyComponents}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapWidth}
        snapToAlignment="center"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - itemWidth) / 2, // केंद्रित करने के लिए
        }}
      />
    </View>
  );
};

export default TopCitiesComponent;
