import baseApiClient from '../baseApiClient';

export const getReferralList = async (
  pageCount = 1,
  limit = 10,
  statusType = null,
) => {
  try {
    const params = {
      page_count: pageCount,
      limit: limit,
      statusType: statusType,
    };
    console.log('Params', params);

    const response = await baseApiClient.get('/profile/referal-list', {params});
    return response.data;
  } catch (error) {
    console.error('Referral API Error:', error);
    throw error;
  }
};
