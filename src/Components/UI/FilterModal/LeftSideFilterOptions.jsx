import {View, Text, TouchableOpacity} from 'react-native';
import React, {useContext, useEffect} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {COLOR, Matrics, typography} from '../../../Config/AppStyling';
import {FilterContext} from '../../../Context/FilterContext';

const LeftSideFilterOptions = () => {
  const {setCurrentSelectedFilterOption, currentSelectedFilterOption} =
    useContext(FilterContext);
  const filterOptions = [
    {id: '1', label: 'Price Range', value: 'priceRange'},
    {id: '2', label: 'Amenities', value: 'amenities'},
    {id: '3', label: 'Rating', value: 'rating'},
  ];

  const handleSelectedOption = value => {
    setCurrentSelectedFilterOption(value);
  };
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        backgroundColor: COLOR.SMALL_CARD_BACKGROUND,
        maxHeight: Matrics.screenHeight * 0.78,
      }}>
      {filterOptions.map(option => (
        <TouchableOpacity
          activeOpacity={0.7}
          key={option.id}
          style={{
            paddingHorizontal: Matrics.s(10),
            paddingVertical: Matrics.vs(10),
            backgroundColor:
              currentSelectedFilterOption === option.value
                ? '#fff'
                : 'transparent',
            borderBottomWidth: 1,
            borderBottomColor: COLOR.BORDER_COLOR,
          }}
          onPress={() => {
            handleSelectedOption(option.value);
          }}>
          <Text
            style={{
              fontFamily: typography.fontFamily.Montserrat.Regular,
              fontSize: typography.fontSizes.fs12,
            }}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default LeftSideFilterOptions;
