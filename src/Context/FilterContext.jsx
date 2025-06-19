import React, {createContext, useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

export const FilterContext = createContext();

export const FilterProvider = ({children}) => {
  const [filter, setFilter] = useState({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [priceRangeBounds, setPriceRangeBounds] = useState([0, 1000]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [currentSelectedFilterOption, setCurrentSelectedFilterOption] =
    useState('priceRange');
  // Access hotelDataS from Redux
  const hotelDataS = useSelector(state => state.hotelSlice);

  // Calculate min/max prices when hotelDataS changes
  useEffect(() => {
    if (
      hotelDataS?.hotels &&
      Array.isArray(hotelDataS?.hotels) &&
      hotelDataS?.hotels?.length > 0
    ) {
      const prices = hotelDataS?.hotels
        .map(hotel => hotel.price)
        .filter(price => typeof price === 'number' && !isNaN(price));

      if (prices.length > 0) {
        const minPrice = Math.floor(Math.min(...prices) / 10) * 10;
        const maxPrice = Math.ceil(Math.max(...prices) / 10) * 10;

        setPriceRangeBounds([minPrice, maxPrice]);
        setPriceRange([minPrice, maxPrice]);
      } else {
        setPriceRangeBounds([0, 1000]);
        setPriceRange([0, 1000]);
      }
    } else {
      setPriceRangeBounds([0, 1000]);
      setPriceRange([0, 1000]);
    }
  }, [hotelDataS]);

  return (
    <FilterContext.Provider
      value={{
        filter,
        setFilter,
        showFilterModal,
        setShowFilterModal,
        selectedStars,
        setSelectedStars,
        selectedAmenities,
        setSelectedAmenities,
        priceRangeBounds,
        priceRange,
        setPriceRange,
        scrollEnabled,
        setScrollEnabled,
        currentSelectedFilterOption,
        setCurrentSelectedFilterOption,
      }}>
      {children}
    </FilterContext.Provider>
  );
};
