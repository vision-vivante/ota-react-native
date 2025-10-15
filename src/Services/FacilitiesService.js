import axios from 'axios';
import {Store} from '../Redux/store';
import Config from 'react-native-config';

export const getFacilities = async () => {
  try {
    const state = Store.getState();
    const authToken = state.auth.userToken;
    const contentToken = state.contentToken.universalToken;

    const response = await axios.get(
      `${Config.REACT_APP_OTA_GDS_URL}facilites`,
      {
        headers: {
          'x-access-token': authToken ? authToken : 'null',
          'content-token': contentToken,
          referer: 'https://arabgcc.com',
          origin: 'https://arabgcc.com',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching facilities:', error);
    throw error;
  }
};
