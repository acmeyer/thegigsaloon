//@flow
'use strict';

import React, {Component} from 'React';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AppColors from './AppColors';

class AppSegmentedControl extends Component {
  render() {
    var segments = this.props.values.map(
      (value, index) => (
        <Segment
          key={value}
          value={value}
          isSelected={index === this.props.selectedIndex}
          selectionColor={AppColors.actionText}
          onPress={() => this.props.onChange(index)}
        />
      )
    );
    return (
      <View style={[styles.container, this.props.style]}>
        {segments}
      </View>
    );
  }
}

class Segment extends React.Component {
  render() {
    var selectedButtonStyle;
    if (this.props.isSelected) {
      selectedButtonStyle = { borderColor: this.props.selectionColor };
    }
    var deselectedLabelStyle;
    if (!this.props.isSelected) {
      deselectedLabelStyle = styles.deselectedLabel;
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
        style={[styles.button, selectedButtonStyle]}>
        <Text style={[styles.label, deselectedLabelStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
}

const HEIGHT = 32;

var styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    height: HEIGHT,
    flex: 1,
    borderColor: 'transparent',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 17,
    color: AppColors.actionText,
  },
  deselectedLabel: {
    color: AppColors.inactiveText,
  },
});

module.exports = AppSegmentedControl;
