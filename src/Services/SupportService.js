import baseApiClient from './baseApiClient';

export const sendSupportMessage = async data => {
  console.log('data in api', data);
  try {
    const response = await baseApiClient.post('/profile/contact-us', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('response', response);

    return response.data;
  } catch (error) {
    console.log('error in api', error);
    throw error;
  }
};
