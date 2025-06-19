import {Text, Pressable, StyleSheet, Image, View} from 'react-native';
import React, {useContext} from 'react';
import {COLOR, Matrics, typography} from '../../../Config/AppStyling';
import {Images} from '../../../Config';
import {FilterContext} from '../../../Context/FilterContext';
import {amenityIcons, defaultIcon} from '../../../Helpers/amenityIcons';

const FilterOption = ({title, handleStarPress, isAmenity = false, id}) => {
  const {selectedStars, selectedAmenities} = useContext(FilterContext);
  const isSelected = isAmenity
    ? selectedAmenities?.includes(id)
    : selectedStars?.includes(title);

  const renderContent = () => {
    if (!isAmenity) {
      return (
        <>
          <Image
            style={styles.filterStarImage}
            source={
              isSelected
                ? Images.FILTER_STAR_ACTIVE
                : Images.FILTER_STAR_INACTIVE
            }
          />
          <Text
            style={[
              styles.filterStarText,
              {
                color: isSelected ? COLOR.PRIMARY : COLOR.DIM_TEXT_COLOR,
              },
            ]}>
            {title} Star{title !== 1 ? 's' : ''}
          </Text>
        </>
      );
    } else {
      const iconSource = amenityIcons[title] || defaultIcon;
      return (
        <>
          <Image style={styles.filterStarImage} source={iconSource} />
          <Text
            style={[
              styles.filterStarText,
              {
                color: isSelected ? COLOR.PRIMARY : COLOR.DIM_TEXT_COLOR,
              },
            ]}>
            {title}
          </Text>
        </>
      );
    }
  };

  return (
    <Pressable
      style={[
        styles.filterStarItem,
        {
          borderColor: isSelected ? COLOR.COLORED_BORDER : COLOR.BORDER_COLOR,
          backgroundColor: isSelected
            ? COLOR.ACTIVE_STAR_FILTER
            : COLOR.SMALL_CARD_BACKGROUND,
        },
      ]}
      onPress={() => handleStarPress(isAmenity ? id : title)}>
      {renderContent()}
    </Pressable>
  );
};

export default FilterOption;

const styles = StyleSheet.create({
  filterStarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: Matrics.s(8),
    paddingHorizontal: Matrics.s(5),
    paddingVertical: Matrics.vs(3),
    width: Matrics.s(200),
  },
  filterStarImage: {
    width: Matrics.s(15),
    height: Matrics.s(15),
    marginRight: Matrics.s(5),
  },
  filterStarText: {
    fontFamily: typography.fontFamily.Montserrat.Regular,
    fontSize: typography.fontSizes.fs12,
    color: COLOR.RED,
    flexWrap: 'wrap',
  },
});
