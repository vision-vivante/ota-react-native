import {View, Text} from 'react-native';
import React, {useContext} from 'react';
import {FilterContext} from '../../../Context/FilterContext';
import PriceRangeSelector from './PriceRangeSelector';
import Amenities from './Amenities';
import Ratings from './Ratings';
import {Matrics} from '../../../Config/AppStyling';

const RightSideFilterOptions = () => {
  const {currentSelectedFilterOption} = useContext(FilterContext);

  const renderCorrectComponent = () => {
    switch (currentSelectedFilterOption) {
      case 'priceRange':
        return <PriceRangeSelector />;
      case 'amenities':
        return <Amenities />;
      case 'rating':
        return <Ratings />;
      default:
        return <PriceRangeSelector />;
    }
  };

  return (
    <View
      style={{
        paddingHorizontal: Matrics.s(10),
        minHeight: Matrics.screenHeight * 0.78,
      }}>
      {renderCorrectComponent()}
    </View>
  );
};

export default RightSideFilterOptions;
