import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import LeftSideFilterOptions from './LeftSideFilterOptions';
import RightSideFilterOptions from './RightSideFilterOptions';
import {COLOR, Matrics, typography} from '../../../Config/AppStyling';

const MainFilterComponent = () => {
  return (
    <View>
      <View>
        <Text
          style={{
            fontFamily: typography.fontFamily.Montserrat.SemiBold,
            fontSize: typography.fontSizes.fs16,
            color: COLOR.DARK_TEXT_COLOR,
            marginLeft: Matrics.s(10),
          }}>
          Filters
        </Text>
      </View>
      <View style={{flexDirection: 'row'}}>
        <View style={{flex: 0.3}}>
          <LeftSideFilterOptions />
        </View>
        <View style={{flex: 0.7}}>
          <RightSideFilterOptions />
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: Matrics.s(10),
          backgroundColor: COLOR.SMALL_CARD_BACKGROUND,
          paddingVertical: Matrics.vs(10),
        }}>
        <TouchableOpacity>
          <Text
            style={{
              padding: 7,
              textAlign: 'center',
              backgroundColor: '#484848',
              color: '#fff',
              borderRadius: 3,
              fontFamily: typography.fontFamily.Montserrat.SemiBold,
            }}>
            Reset All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text
            style={{
              padding: 7,
              textAlign: 'center',
              backgroundColor: COLOR.PRIMARY,
              color: '#fff',
              borderRadius: 3,
              fontFamily: typography.fontFamily.Montserrat.SemiBold,
            }}>
            Apply Filters
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MainFilterComponent;
