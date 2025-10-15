import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveHotelDetails = async ({hotelId, giataId, provider}) => {
  try {
    const hotelDetails = {
      hotelId: hotelId,
      giataId: giataId,
      provider: provider,
    };

    await AsyncStorage.setItem(
      'ActiveHotelDetails',
      JSON.stringify(hotelDetails),
    );
  } catch (error) {
    console.log('Error storing hotel details:', error);
  }
};

export const getHotelDetails = async () => {
  try {
    const data = await AsyncStorage.getItem('ActiveHotelDetails');
    if (data) {
      const activeHotelDetails = JSON.parse(data);
      await AsyncStorage.removeItem('ActiveHotelDetails');
      return activeHotelDetails;
    }
  } catch (error) {
    console.error('Failed to get active hotel details', error);
  }
  return null;
};
