import React, {useContext} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Matrics} from '../../../Config/AppStyling';
import FilterOption from './FilterOption';
import {FilterContext} from '../../../Context/FilterContext';
import {Text} from 'react-native-svg';

const Ratings = ({panGestureRef}) => {
  const {selectedStars, setSelectedStars} = useContext(FilterContext);
  console.log('selectedStars', selectedStars);

  const handleStarPress = rating => {
    if (selectedStars.includes(rating)) {
      setSelectedStars(prevStars => prevStars.filter(star => star !== rating));
    } else {
      setSelectedStars(prevStars => [...prevStars, rating]);
    }
  };

  return (
    <View style={{height: Matrics.screenHeight * 0.78}}>
      <Text>Rating</Text>
      <ScrollView
        contentContainerStyle={styles.filterSortContainer}
        simultaneousHandlers={panGestureRef}>
        {['5', '4', '3', '2', '1'].map(rating => (
          <FilterOption
            key={rating}
            title={rating}
            handleStarPress={handleStarPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default Ratings;

const styles = StyleSheet.create({
  filterSortContainer: {
    paddingHorizontal: Matrics.s(10),
    gap: Matrics.s(10),
    paddingVertical: Matrics.vs(15),
  },
});
