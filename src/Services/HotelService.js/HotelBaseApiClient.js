import axios from 'axios';
import Config from 'react-native-config';

const hotelBaseApiClient = axios.create({
  baseURL: Config.REACT_APP_OTA_GDS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// hotelBaseApiClient.interceptors.request.use(
//   async config => {
//     const state = Store.getState();
//     const authToken = state.auth.userToken;
//     const contentToken = state.contentToken.universalToken;
//     console.log('authtoken', authToken, contentToken);

//     if (authToken) {
//       config.headers['x-access-token'] = `${authToken}`;
//     }

//     if (contentToken) {
//       config.headers['Content-Token'] = contentToken;
//     }

//     return config;
//   },
//   error => {
//     console.log('error', error);

//     return Promise.reject(error);
//   },
// );

// hotelBaseApiClient.interceptors.response.use(
//   response => {
//     return response;
//   },
//   error => {
//     if (error.response && error.response.status === 401) {
//       // Token expired or unauthorized
//       Store.dispatch(logout());
//     }
//     return Promise.reject(error);
//   },
// );

export default hotelBaseApiClient;
