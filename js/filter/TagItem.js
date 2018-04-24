//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import AppColors from '../common/AppColors';

class TagItem extends Component {

  render() {
    var checkbox;
    const {item, isChecked, onToggle} = this.props;
    const textStyle = isChecked
      ? {}
      : {color: AppColors.inactiveText};
    const accessibilityTraits = ['button'];
    if (isChecked) {
      checkbox = <Image style={styles.checkbox} source={require('./img/check.png')} />;
      accessibilityTraits.push('selected');
    }
    return (
      <TouchableOpacity
        accessibilityTraits={accessibilityTraits}
        activeOpacity={0.8}
        style={[styles.tag]}
        onPress={onToggle}>
        <Text style={[styles.text, textStyle]}>
          {item}
        </Text>
        {checkbox}
      </TouchableOpacity>
    );
  }
}

var styles = StyleSheet.create({
  tag: {
    flexGrow: 1,
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
});

module.exports = TagItem;
