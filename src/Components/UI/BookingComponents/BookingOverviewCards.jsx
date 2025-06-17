import {View, Text, Image, Platform} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {COLOR, Matrics, typography} from '../../../Config/AppStyling';
import {Images} from '../../../Config';

const BookingOverviewCards = ({
  gradientStart = '#fff',
  gradientEnd = '#000',
  title = 'Total Bookings',
  value = '30',
}) => {
  return (
    <LinearGradient
      colors={[gradientStart, gradientEnd]}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={{
        width: Matrics.screenWidth * 0.43,
        borderRadius: 10,
        paddingVertical: Platform.OS === 'android' ? Matrics.vs(20) : 0,
        paddingHorizontal: Platform.OS === 'android' ? Matrics.vs(20) : 0,
        position: 'relative',
      }}>
      <Image
        source={Images.LINES}
        style={{
          height: '150',
          position: 'absolute',
          width: '100%',
          resizeMode: 'contain',
          bottom: 0,
        }}
      />

      <Text
        style={{
          color: COLOR.WHITE,
          fontFamily: typography.fontFamily.Montserrat.Medium,
          fontSize: typography.fontSizes.fs16,
          marginLeft: Platform.OS === 'android' ? 0 : Matrics.vs(10),
          marginTop: Platform.OS === 'android' ? 0 : Matrics.vs(15),
        }}>
        {title}
      </Text>
      <Text
        style={{
          color: COLOR.WHITE,
          fontFamily: typography.fontFamily.Montserrat.Bold,
          fontSize: typography.fontSizes.fs30,
          marginLeft: Platform.OS === 'android' ? 0 : Matrics.vs(10),
        }}>
        {value}
      </Text>
    </LinearGradient>
  );
};

export default BookingOverviewCards;
