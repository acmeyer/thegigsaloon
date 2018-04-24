// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import AppColors from '../../common/AppColors';

class JobPageMenu extends Component {
  render() {
    const content = this.props.values.map(
      (value, index) => (
        <MenuItem
          key={index}
          value={value}
          isSelected={index === this.props.selectedIndex}
          onPress={() => this.props.onChange(index)}
        />
      )
    );
    return (
      <View style={styles.listMenu}>
        {content}
      </View>
    );
  }
}

class MenuItem extends Component {
  render() {
    var selectedButtonStyle, selectedButtonLabelStyle;
    if (this.props.isSelected) {
      selectedButtonStyle = styles.selectedButtonStyle;
      selectedButtonLabelStyle = styles.selectedButtonLabelStyle;
    }
    var title = this.props.value;

    var accessibilityTraits = ['button'];
    if (this.props.isSelected) {
      accessibilityTraits.push('selected');
    }

    return (
      <TouchableOpacity
        accessibilityTraits={accessibilityTraits}
        activeOpacity={0.8}
        onPress={this.props.onPress}
        style={[styles.menuItem, selectedButtonStyle]}>
        <Text style={[styles.menuItemText, selectedButtonLabelStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  listMenu: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: AppColors.cellBorder,
  },
  menuItem: {
    padding: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontWeight: 'bold',
  },
  selectedButtonStyle: {
    borderBottomWidth: 1,
    borderColor: AppColors.actionText,
  },
  selectedButtonLabelStyle: {
    color: AppColors.actionText,
  },
});

module.exports = JobPageMenu;
