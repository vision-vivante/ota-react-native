import axios from 'axios';
import {Store} from '../Redux/store';
import {logout} from '../Redux/Reducers/AuthSlice';
import Config from 'react-native-config';
console.log('COnfig.AReac', Config.REACT_APP_OTA_URL);

const baseApiClient = axios.create({
  baseURL: Config.REACT_APP_OTA_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

baseApiClient.interceptors.request.use(
  async config => {
    const state = Store.getState();
    const authToken = state?.auth?.userToken;
    const contentToken = state.contentToken.universalToken;

    config.headers['x-access-token'] = `${authToken}` ? `${authToken}` : 'null';
    config.headers['Content-Token'] = contentToken;
    console.log('config', config);

    return config;
  },
  error => Promise.reject(error),
);

baseApiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      Store.dispatch(logout());
    }
    return Promise.reject(error);
  },
);

export default baseApiClient;
