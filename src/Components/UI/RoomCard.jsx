import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import React, {useContext} from 'react';
import {Matrics, typography, COLOR} from '../../Config/AppStyling';
import {Images} from '../../Config';
import {RoomContext} from '../../Context/RoomContext';
import i18n from '../../i18n/i18n';
import {useSelector} from 'react-redux';

const RoomCard = ({room}) => {
  const {
    selectedRoomId,
    setSelectedRoomId,
    setShowCheckoutToast,
    setRatePlanId,
  } = useContext(RoomContext);

  const isSelected = selectedRoomId === room.RatePlanID;
  const selectedCurrency = useSelector(
    state => state.currency.selectedCurrency,
  );
  const handleRoomSelection = () => {
    if (selectedRoomId === room.RatePlanID) {
      setSelectedRoomId(null);
      setShowCheckoutToast(false);
      setRatePlanId(null);
    } else {
      setRatePlanId(room.RatePlanID);
      setSelectedRoomId(room.RatePlanID);
      setShowCheckoutToast(true);
    }
  };
  const getCurrencySymbol = selectCurrency => {
    return selectCurrency === 'USD' || selectCurrency === 'CAD' ? '$' : '₹';
  };
  return (
    <View style={styles.roomCard}>
      <View style={styles.imageContainer}>
        <Image
          source={Images.ROOM_IMAGE_PLACEHOLDER}
          style={styles.roomImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.roomDetails}>
        <Text style={styles.roomType}>
          {room.RatePlanName || room.RoomName}
        </Text>
        <View style={styles.amenitiesContainer}>
          {room.facility?.map((facility, index) => (
            <View key={index} style={styles.amenityItem}>
              <Image
                source={Images.COLOR_CHECK}
                style={styles.amenityIcon}
                resizeMode="contain"
              />
              <Text style={styles.amenityText}>{facility.Name}</Text>
            </View>
          ))}
        </View>
        <View style={styles.priceContainer}>
          <View style={styles.priceDetails}>
            <View style={styles.priceNumber}>
              <Text style={styles.price}>
                {getCurrencySymbol(selectedCurrency)}
                {Number(room.totalprice).toFixed(2)}
              </Text>
            </View>
            <Text style={styles.vat}>Per Night (incl. VAT)</Text>
          </View>
          <Text style={styles.infoText}>
            {i18n.t('hotelDetails.only')} {room.InventoryCount}{' '}
            {i18n.t('hotelDetails.left')}
          </Text>
        </View>
      </View>
      {/* Button fixed at the bottom of the entire card */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={isSelected ? styles.bookedButton : styles.bookButton}
          onPress={handleRoomSelection}
          activeOpacity={0.7}>
          <Text style={styles.bookButtonText}>
            {isSelected
              ? i18n.t('hotelDetails.roomSelected')
              : i18n.t('hotelDetails.selectRoom')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  roomCard: {
    backgroundColor: COLOR.WHITE,
    borderRadius: Matrics.s(12),
    overflow: 'hidden',
    boxShadow: '0px 5px 8px rgba(0, 0, 0, 0.25)', // Left as is per request
    shadowColor: '#000', // Left as is per request
    shadowOffset: {width: 0, height: 5}, // Left as is per request
    shadowOpacity: 0.25, // Left as is per request
    shadowRadius: Matrics.s(8), // Left as is per request
    marginBottom: Matrics.vs(16),
    marginLeft: Matrics.s(3),
    width: Matrics.screenWidth * 0.8,
  },
  imageContainer: {
    padding: Matrics.s(10),
  },
  roomImage: {
    width: '100%',
    height: Matrics.vs(150),
    borderRadius: Matrics.s(10),
  },
  roomDetails: {
    paddingHorizontal: Matrics.s(13),
    paddingTop: Matrics.vs(10),
    paddingBottom: Matrics.vs(60), // Space for the fixed button to avoid overlap
  },
  roomType: {
    fontFamily: typography.fontFamily.Montserrat.SemiBold,
    fontSize: typography.fontSizes.fs18,
    marginBottom: Matrics.vs(8),
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    paddingVertical: Matrics.vs(4),
    borderRadius: Matrics.s(6),
  },
  amenityIcon: {
    width: Matrics.s(16),
    height: Matrics.s(16),
    marginRight: Matrics.s(4),
  },
  amenityText: {
    fontFamily: typography.fontFamily.Montserrat.Regular,
    fontSize: typography.fontSizes.fs12,
    color: COLOR.GRAY,
    width: Matrics.screenWidth * 0.27,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Matrics.vs(5),
  },
  priceDetails: {
    flexDirection: 'column',
  },
  priceNumber: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  price: {
    fontFamily: typography.fontFamily.Montserrat.Bold,
    fontSize: typography.fontSizes.fs24,
    color: COLOR.ORANGE_LIGHT,
  },
  oldPrice: {
    fontFamily: typography.fontFamily.Montserrat.Regular,
    fontSize: typography.fontSizes.fs15,
    color: COLOR.DIM_TEXT_COLOR,
    textDecorationLine: 'line-through',
  },
  vat: {
    fontFamily: typography.fontFamily.Montserrat.Regular,
    fontSize: typography.fontSizes.fs12,
    color: COLOR.DIM_TEXT_COLOR,
  },
  infoText: {
    fontFamily: typography.fontFamily.Montserrat.Regular,
    fontSize: typography.fontSizes.fs14,
    color: COLOR.RED,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: Matrics.vs(10), // Padding at the bottom of the card
    left: Matrics.s(13),
    right: Matrics.s(13),
  },
  bookButton: {
    backgroundColor: COLOR.PRIMARY,
    paddingHorizontal: Matrics.s(20),
    paddingVertical: Matrics.vs(10),
    borderRadius: Matrics.s(8),
  },
  bookedButton: {
    backgroundColor: COLOR.DIM_TEXT_COLOR,
    paddingHorizontal: Matrics.s(20),
    paddingVertical: Matrics.vs(10),
    borderRadius: Matrics.s(8),
  },
  bookButtonText: {
    fontFamily: typography.fontFamily.Montserrat.SemiBold,
    fontSize: typography.fontSizes.fs14,
    color: COLOR.WHITE,
    textAlign: 'center',
  },
});

export default RoomCard;
