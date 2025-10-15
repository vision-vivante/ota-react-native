import {Store} from '../../Redux/store';
import hotelBaseApiClient from './HotelBaseApiClient';

export const getTopHotels = async ({details}) => {
  console.log('🔍 Request details:', details);

  const state = Store.getState();
  const contentToken = state?.contentToken?.universalToken;
console.log('Content token', contentToken);

  if (!contentToken) {
    console.warn('⚠️ No content token found in Redux state.');
    throw new Error('Missing content token');
  }

  const headers = {
    'x-access-token': 'null', // Required as literal string
    'content-token': contentToken,
    referer: 'https://arabgcc.com/',
    origin: 'https://arabgcc.com/',
  };

  try {
    const response = await hotelBaseApiClient.post(
      'home-content',
      details,
      { headers }
    );
    console.log('✅ API response:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error('❌ API Error:', errorMessage);
    throw new Error(errorMessage);
  }
};
