import React, {useContext, useState, useEffect, useCallback} from 'react';
import {View, Text, Animated} from 'react-native';
import {COLOR, Matrics, typography} from '../../../Config/AppStyling';
import {FilterContext} from '../../../Context/FilterContext';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const PriceRangeSelector = () => {
  const {priceRangeBounds, priceRange, setPriceRange, setScrollEnabled} =
    useContext(FilterContext);
  const [tempPriceRange, setTempPriceRange] = useState(priceRange);
  const sliderLength = Matrics.screenWidth * 0.55; // Default length, can be adjusted dynamically
  const handleValuesChange = useCallback(values => {
    if (values && Array.isArray(values) && values.length === 2) {
      // Update local state for real-time display
      setTempPriceRange(values);
    } else {
      console.warn('Invalid values in onValuesChange:', values);
    }
  }, []);

  const handleValuesChangeStart = useCallback(() => {
    setScrollEnabled(false);
  }, [setScrollEnabled]);

  const handleValuesChangeFinish = useCallback(() => {
    setScrollEnabled(true);
    // Update context with final values
    setPriceRange(tempPriceRange);
  }, [setScrollEnabled, setPriceRange, tempPriceRange]);

  useEffect(() => {
    // Sync tempPriceRange when priceRange changes externally
    setTempPriceRange(priceRange);
  }, [priceRange]);

  // Handle dynamic slider length

  const CustomMarkerLeft = React.memo(() => {
    return (
      <Animated.View
        style={{
          backgroundColor: COLOR.WHITE,
          borderColor: COLOR.PRIMARY,
          borderWidth: 2,
          height: 27,
          width: 27,
          borderRadius: 50,
          marginTop: 5,
        }}
      />
    );
  });

  const CustomMarkerRight = React.memo(() => {
    return (
      <Animated.View
        style={{
          backgroundColor: COLOR.WHITE,
          borderColor: COLOR.PRIMARY,
          borderWidth: 2,
          height: 27,
          width: 27,
          borderRadius: 50,
          marginTop: 5,
        }}
      />
    );
  });

  return (
    <>
      <View>
        <Text
          style={{
            fontFamily: typography.fontFamily.Montserrat.SemiBold,
            fontSize: typography.fontSizes.fs16,
            marginBottom: Matrics.vs(10),
          }}>
          Price Range
        </Text>
      </View>
      <View style={{width: '90%', paddingLeft: Matrics.s(10)}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text
            style={{
              fontFamily: typography.fontFamily.Montserrat.Regular,
              fontSize: typography.fontSizes.fs14,
              color: COLOR.GRAY,
            }}>
            ${tempPriceRange[0]}
          </Text>
          <Text
            style={{
              fontFamily: typography.fontFamily.Montserrat.Regular,
              fontSize: typography.fontSizes.fs14,
              color: COLOR.GRAY,
              textAlign: 'right',
            }}>
            ${tempPriceRange[1]}
          </Text>
        </View>
        <View style={{marginLeft: Matrics.s(4)}}>
          <MultiSlider
            values={tempPriceRange}
            onValuesChange={handleValuesChange}
            onValuesChangeStart={handleValuesChangeStart}
            onValuesChangeFinish={handleValuesChangeFinish}
            min={priceRangeBounds[0]}
            max={priceRangeBounds[1]}
            step={1}
            allowOverlap={false}
            snapped={true}
            sliderLength={sliderLength}
            selectedStyle={{backgroundColor: COLOR.PRIMARY}}
            unselectedStyle={{backgroundColor: '#d3d3d3'}}
            isMarkersSeparated={true}
            trackStyle={{
              height: 6,
            }}
            customMarkerLeft={CustomMarkerLeft}
            customMarkerRight={CustomMarkerRight}
          />
        </View>
      </View>
    </>
  );
};

export default PriceRangeSelector;
