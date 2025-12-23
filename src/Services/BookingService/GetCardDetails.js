import baseApiClient from '../baseApiClient';

export const getCardDetails = async () => {
  try {
    const response = await baseApiClient.get('/payment/cardDetail');
    console.log('data of get card details', response);
    return response.data;
  } catch (error) {
    console.log('error in get card details', error);
    throw error;
  }
};
