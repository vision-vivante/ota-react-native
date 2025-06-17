import {View, Text} from 'react-native';
import React from 'react';
import {COLOR, Matrics, typography} from '../../../Config/AppStyling';

const BookingStatusTag = ({
  status,
  borderRadius = Matrics.vs(7),
  textAlign = 'center',
}) => {
  const borderAndBackgroundColorAndText = () => {
    switch (status?.toString()) {
      case '1':
        return {
          backgroundColor: COLOR.PROCESSING,
          borderColor: COLOR.ORANGE_LIGHT,
          color: COLOR.ORANGE_LIGHT,
        };
      case '2':
        return {
          backgroundColor: COLOR.CONFIRMED,
          borderColor: COLOR.CONFIRMED_BORDER,
          color: COLOR.CONFIRMED_BORDER,
        };
      case '3':
        return {
          backgroundColor: COLOR.CANCELLED,
          borderColor: COLOR.RED,
          color: COLOR.RED,
        };
      case '4':
        return {
          backgroundColor: COLOR.CANCELLED,
          borderColor: COLOR.RED,
          color: COLOR.RED,
        };
      default:
        return {
          backgroundColor: COLOR.PROCESSING,
          borderColor: COLOR.ORANGE_LIGHT,
          color: COLOR.ORANGE_LIGHT,
        };
    }
  };
  const {backgroundColor, borderColor, color} =
    borderAndBackgroundColorAndText();
  const statusTitle = () => {
    switch (status?.toString()) {
      case '1':
        return 'Processing';
      case '2':
        return 'Confirmed';
      case '3':
        return 'Cancelled';
      default:
        return 'Processing';
    }
  };
  const title = statusTitle();
  return (
    <View
      style={{
        backgroundColor,
        borderWidth: 1,
        borderColor,
        paddingHorizontal: Matrics.scale(5),
        paddingVertical: Matrics.vs(2),
        borderRadius: borderRadius,
        alignContent: 'flex-start',
      }}>
      <Text
        style={{
          color,
          fontFamily: typography.fontFamily.Montserrat.SemiBold,
          fontSize: typography.fontSizes.fs10,
          textAlign,
        }}>
        {title}
      </Text>
    </View>
  );
};

export default BookingStatusTag;
