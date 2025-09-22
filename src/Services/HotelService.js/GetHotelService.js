import hotelBaseApiClient from './HotelBaseApiClient';
import {Store} from '../../Redux/store';

// const API_TIMEOUT = 15000;

export const getHotels = async ({details}) => {
  const state = Store.getState();
  const authToken = state.auth.userToken;
  const contentToken = state.contentToken.universalToken;
  const config = {
    headers: {
      'x-access-token': authToken,
      'Content-Token': contentToken,
    },
    // timeout: API_TIMEOUT,
  };
console.log('new derails ------', details);

  try {
    const response = await hotelBaseApiClient.post('/hotels', details, config);
    console.log('RESPONSE+++++++________', response);
    return response.data;
    
  } catch (error) {
    console.log(error);

    const errorMessage = error.response?.data?.message || error.message;
    console.error('❌ API Error:', errorMessage);
    throw new Error(errorMessage);
  }
};
