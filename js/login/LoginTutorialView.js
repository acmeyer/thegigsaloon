//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
} from 'react-native';
import AppColors from '../common/AppColors';

class LoginTutorialView extends Component {

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.imageWrapper}>
          <Image source={this.props.imageSrc} />
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.h1}>{this.props.titleText}</Text>
          <Text style={styles.h2}>{this.props.description}</Text>
        </View>
      </View>
    );
  }
}

const scale = Dimensions.get('window').width / 375;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  imageWrapper: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: AppColors.actionText,
  },
  h1: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: Math.round(22 * scale),
    backgroundColor: 'transparent',
    color: 'white',
    marginBottom: 15,
  },
  h2: {
    textAlign: 'center',
    fontSize: Math.round(15 * scale),
    color: 'white',
  },
});

module.exports = LoginTutorialView;
