import {Store} from '../../Redux/store';
import hotelBaseApiClient from './HotelBaseApiClient';

export const getTopHotels = async ({details}) => {
  const state = Store.getState();
  const authToken = state.auth.userToken;
  const contentToken = state.contentToken.universalToken;

  const config = {
    headers: {
      'x-access-token': authToken,
      'Content-Token': contentToken,
    },
  };

  try {
    const response = await hotelBaseApiClient.post(
      '/home-content',
      details,
      config,
    );

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error('❌ API Error:', errorMessage);
    throw new Error(errorMessage);
  }
};
