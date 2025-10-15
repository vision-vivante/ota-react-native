import axios from 'axios';
import Config from 'react-native-config';
console.log('COnfig base url', Config.REACT_APP_OTA_URL);

const ContentTokenManager = axios.create({
  baseURL: Config.REACT_APP_OTA_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-access-token': null,
  },
});
export const getContentToken = async () => {
  console.log('Getting token');

  const response = await ContentTokenManager.get('auth/domain/arabgcc.com');
  console.log('ContentTokenManager response:', response);
  return response.data;
  // return ContentTokenManager.get('auth/domain/arabgcc.com');
};
