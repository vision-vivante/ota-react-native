import {Image, Text, TouchableOpacity, Platform} from 'react-native';
import React, {useState} from 'react';
import {Images} from '../../../Config';
import {COLOR, Matrics, typography} from '../../../Config/AppStyling';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {success, errorToast} from '../../../Helpers/ToastMessage';
import {useSelector} from 'react-redux';
import i18n from '../../../i18n/i18n';

const DownloadButton = ({invoicePath, title}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Get authentication tokens from Redux store
  const authToken = useSelector(state => state.auth.userToken);
  const contentToken = useSelector(state => state.contentToken.universalToken);

  const handleDownload = async () => {
    if (!invoicePath) {
      errorToast('Download Error', 'No invoice available for download');
      return;
    }

    if (!authToken || !contentToken) {
      errorToast(
        'Authentication Error',
        'Please login again to download invoice',
      );
      return;
    }

    // Construct the complete URL
    const downloadUrl = `https://otaapi.arabgcc.com/profile/download?file=${invoicePath}`;

    setIsDownloading(true);

    try {
      // Get the downloads directory
      const {dirs} = ReactNativeBlobUtil.fs;

      // Extract filename from the invoicePath
      const fileName = invoicePath.split('/').pop() || 'invoice.pdf';

      // Use different paths for Android and iOS
      let filePath;
      if (Platform.OS === 'android') {
        // Use the public Downloads directory for Android
        filePath = `${dirs.LegacyDownloadDir}/${fileName}`;
      } else {
        // Use DocumentDir for iOS
        filePath = `${dirs.DocumentDir}/${fileName}`;
      }

      // Configure download options based on platform
      let config = {
        path: filePath,
        fileCache: true,
      };

      // Add Android-specific configuration
      if (Platform.OS === 'android') {
        config.addAndroidDownloads = {
          useDownloadManager: false, // Disable download manager to avoid Status Code 16 error
          notification: true, // Enable single proper notification
          title: 'Invoice Downloaded',
          description: `${fileName} has been downloaded successfully`,
          mime: 'application/pdf',
          mediaScannable: true,
        };
      }

      // Download the file with proper headers including authentication
      const response = await ReactNativeBlobUtil.config(config).fetch(
        'GET',
        downloadUrl,
        {
          'Content-Type': 'application/pdf',
          Accept: 'application/pdf, */*',
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36',
          'x-access-token': authToken,
          'Content-Token': contentToken,
        },
      );

      if (response && response.info().status === 200) {
        // For Android, try to make the file visible in Downloads app
        if (Platform.OS === 'android') {
          try {
            await ReactNativeBlobUtil.fs.scanFile([
              {
                path: response.path(),
                mime: 'application/pdf',
              },
            ]);
            console.log('✅ File scanned and made visible in Downloads app');
          } catch (scanError) {
            console.log(
              '⚠️ File scan failed, but download was successful:',
              scanError,
            );
          }
        }

        success(
          i18n.t('Booking.downloadSuccessful'),
          i18n.t('Booking.invoiceDownloaded'),
        );
      } else {
        const statusCode = response.info().status;
        console.error('❌ Download failed with status:', statusCode);
        throw new Error(`Download failed with HTTP status: ${statusCode}`);
      }
    } catch (error) {
      console.error('=== Download Error ===');
      console.error('Error Type:', error.name);
      console.error('Error Message:', error.message);
      console.error('Full Error:', error);

      let errorMessage = 'Unable to download the invoice. Please try again.';

      // Provide more specific error messages
      if (
        error.message.includes('Network') ||
        error.message.includes('network')
      ) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (
        error.message.includes('401') ||
        error.message.includes('Unauthorized')
      ) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (
        error.message.includes('404') ||
        error.message.includes('Not Found')
      ) {
        errorMessage = 'Invoice file not found on server.';
      } else if (
        error.message.includes('403') ||
        error.message.includes('Forbidden')
      ) {
        errorMessage = 'Access denied. Please check your permissions.';
      } else if (
        error.message.includes('500') ||
        error.message.includes('Internal Server Error')
      ) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message.includes('Status Code = 16')) {
        errorMessage =
          'Download failed. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Download timeout. Please try again.';
      }

      errorToast('Download Failed', errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLOR.SUCCESS,
        borderRadius: Matrics.s(5),
        paddingVertical: Matrics.s(5),
        paddingHorizontal: Matrics.s(8),
        gap: 7,
        width: 'auto',
        opacity: isDownloading ? 0.6 : 1,
      }}
      onPress={handleDownload}
      disabled={isDownloading}>
      <Image
        source={Images.DOWNLOAD_BUTTON}
        style={{
          width: Matrics.s(17),
          height: Matrics.s(17),
          resizeMode: 'contain',
        }}
      />
      {title && <Text style={{
        fontFamily: typography.fontFamily.Montserrat.Medium,
        fontSize: typography.fontSizes.fs12,
        color: COLOR.SUCCESS,
      }}>{title}</Text>}
      {/* <Text
        style={{
          fontFamily: typography.fontFamily.Montserrat.Medium,
          fontSize: typography.fontSizes.fs12,
          color: COLOR.SUCCESS,
        }}>
        {isDownloading
          ? i18n.t('Booking.downloading')
          : i18n.t('Booking.download')}
      </Text> */}
    </TouchableOpacity>
  );
};

export default DownloadButton;
