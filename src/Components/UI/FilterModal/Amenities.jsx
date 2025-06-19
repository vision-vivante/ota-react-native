import {View} from 'react-native';
import React, {useContext, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getFacilitiesThunk} from '../../../Redux/Reducers/FacilitiesReducer';
import {ScrollView} from 'react-native-gesture-handler';
import FilterOption from './FilterOption';
import {FilterContext} from '../../../Context/FilterContext';
import {Matrics} from '../../../Config/AppStyling';
const Amenities = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getFacilitiesThunk());
  }, []);
  const {facilities} = useSelector(state => state.facilities);

  const {selectedAmenities, setSelectedAmenities} = useContext(FilterContext);
  const handleStarPress = facility => {
    if (selectedAmenities.includes(facility)) {
      setSelectedAmenities(prevAmenities =>
        prevAmenities.filter(amenity => amenity !== facility),
      );
    } else {
      setSelectedAmenities(prevAmenities => [...prevAmenities, facility]);
    }
  };
  return (
    <View
      style={{
        height: Matrics.screenHeight * 0.78,
      }}>
      <ScrollView
        contentContainerStyle={{
          // flexDirection: 'row',
          flexWrap: 'wrap',
          gap: Matrics.s(10),
          paddingHorizontal: Matrics.s(10),
          paddingVertical: Matrics.vs(10),
          // minHeight: Matrics.screenHeight * 0.78,

          //    paddingBottom: Matrics.vs(60),
        }}>
        {/* <Text>Amenities</Text> */}
        {facilities?.result?.map((facility, index) => {
          return (
            <View key={index}>
              <FilterOption
                title={facility}
                icon={facility}
                isAmenity={true}
                handleStarPress={() => {
                  handleStarPress(facility);
                }}
                id={facility}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Amenities;
