//@flow

'use strict';

import AppColors from './AppColors';
import React, {Component} from 'React';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
} from 'react-native';

class AppButton extends Component {
  render() {
    const caption = this.props.caption;
    let icon;
    if (this.props.icon) {
      icon = <Image source={this.props.icon} style={styles.icon} />;
    }
    let content;
    if (this.props.type === 'primary' || this.props.type === undefined) {
      content = (
        <View style={[styles.button, styles.primaryButton]}>
          {icon}
          <Text style={[styles.caption, styles.primaryCaption]}>
            {caption}
          </Text>
        </View>
      );
    } else if (this.props.type === 'fb-login') {
      content = (
        <View style={[styles.button, styles.fbLoginButton]}>
          {icon}
          <Text style={[styles.caption, styles.primaryCaption]}>
            {caption}
          </Text>
        </View>
      );
    } else if (this.props.type === 'square') {
      content = (
        <View style={[styles.button, styles.square, this.props.buttonStyle]}>
          {icon}
          <Text style={[styles.caption, this.props.captionStyle]}>
            {caption}
          </Text>
        </View>
      );
    } else {
      var border = this.props.type === 'bordered' && styles.border;
      content = (
        <View style={[styles.button, border]}>
          {icon}
          <Text style={[styles.caption, styles.secondaryCaption, this.props.captionStyle]}>
            {caption}
          </Text>
        </View>
      );
    }
    return (
      <TouchableOpacity
        accessibilityTraits="button"
        onPress={this.props.onPress}
        activeOpacity={0.8}
        style={[styles.container, this.props.style]}>
        {content}
      </TouchableOpacity>
    );
  }
}

const HEIGHT = 40;

var styles = StyleSheet.create({
  container: {
    height: HEIGHT,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  border: {
    borderWidth: 1,
    borderColor: AppColors.lightText,
    borderRadius: 3,
  },
  primaryButton: {
    borderRadius: 3,
    backgroundColor: AppColors.actionText,
  },
  fbLoginButton: {
    borderRadius: 3,
    backgroundColor: AppColors.facebookBlue,
  },
  square: {
    borderWidth: 1,
    borderRadius: 3,
    backgroundColor: AppColors.gray,
    borderColor: '#BBBBBB',
  },
  icon: {
    marginRight: 12,
  },
  caption: {
    fontWeight: 'bold',
  },
  primaryCaption: {
    color: 'white',
  },
  secondaryCaption: {
    color: AppColors.actionText,
  }
});

module.exports = AppButton;
