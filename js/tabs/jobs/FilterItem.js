//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AppColors from '../../common/AppColors';

class FilterItem extends Component {
  render() {
    const {item, isChecked, onToggle} = this.props;
    const textStyle = isChecked
      ? {color: 'white'}
      : {color: AppColors.actionText};
    const itemStyle = isChecked
      ? {backgroundColor: AppColors.actionText}
      : {backgroundColor: 'white'};
    return (
      <TouchableOpacity
        accessibilityTraits={['button']}
        activeOpacity={0.8}
        style={[styles.item, itemStyle]}
        onPress={onToggle}>
        <Text style={[styles.itemText, textStyle]}>{item}</Text>
      </TouchableOpacity>
    );
  }
}

const scale = Dimensions.get('window').width / 375;

function normalize(size: number): number {
  return Math.round(scale * size);
}

var styles = StyleSheet.create({
  item: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.actionText,
  },
  itemText: {
    fontSize: normalize(14),
    textAlign: 'center',
  },
});

module.exports = FilterItem;
