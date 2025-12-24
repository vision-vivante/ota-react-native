import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_HOTEL_KEY = 'ActiveHotelDetails';
const PENDING_HOTEL_FLOW_KEY = 'PendingHotelFlow';

// Backwards-compatible helper used by legacy callers
export const saveHotelDetails = async ({hotelId, giataId, provider}) => {
  try {
    const hotelDetails = {
      hotelId,
      giataId,
      provider,
    };

    await AsyncStorage.setItem(ACTIVE_HOTEL_KEY, JSON.stringify(hotelDetails));
  } catch (error) {
    console.log('Error storing hotel details:', error);
  }
};

export const getHotelDetails = async () => {
  try {
    const data = await AsyncStorage.getItem(ACTIVE_HOTEL_KEY);
    if (data) {
      const activeHotelDetails = JSON.parse(data);
      await AsyncStorage.removeItem(ACTIVE_HOTEL_KEY);
      return activeHotelDetails;
    }
  } catch (error) {
    console.error('Failed to get active hotel details', error);
  }
  return null;
};

export const stashPendingHotelFlow = async ({
  hotelId,
  giataId,
  provider,
  targetRoute = 'HotelBooking',
  targetParams = {},
}) => {
  try {
    const payload = {
      hotelId,
      giataId,
      provider,
      targetRoute,
      targetParams,
      storedAt: Date.now(),
    };

    await AsyncStorage.setItem(PENDING_HOTEL_FLOW_KEY, JSON.stringify(payload));
  } catch (error) {
    console.log('Error stashing pending hotel flow:', error);
  }
};

export const consumePendingHotelFlow = async () => {
  try {
    const data = await AsyncStorage.getItem(PENDING_HOTEL_FLOW_KEY);
    if (data) {
      await AsyncStorage.removeItem(PENDING_HOTEL_FLOW_KEY);
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to consume pending hotel flow', error);
  }
  return null;
};
