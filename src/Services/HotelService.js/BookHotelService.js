import {Store} from '../../Redux/store';
import baseApiClient from '../baseApiClient';

export const bookHotel = async ({details}) => {
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
  console.log('details', details, authToken, contentToken);

  try {
    const response = await baseApiClient.post(
      'booking/book-hotel',
      details,
      config,
    );

    console.log('Response for book hotel', response);

    return response.data;
  } catch (error) {
    console.log(error);

    const errorMessage = error.response?.data?.message || error.message;
    console.error('❌ API Error:', errorMessage);
    throw new Error(errorMessage);
  }
};
