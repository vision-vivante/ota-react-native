import baseApiClientgql from './GraphqlIndex';

export const getCityDetails = ({cityName}) => {
  const query = `
    query GetCities($name: String!) {
      getCities(name: $name) {
        cityName
        destinationName
        countryCode
        countryName
      }
    }
  `;
  console.log('City name being serached', cityName);

  const variables = {
    name: cityName,
  };
  return baseApiClientgql.post('', {
    query,
    variables,
  });
};
