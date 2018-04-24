//@flow
'use strict';

import React, {Component} from 'React';
import {
  View,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {Heading2} from '../../common/AppText';
import {createStylesheet} from '../../common/AppStyleSheet';
import AppColors from '../../common/AppColors';
import AppButton from '../../common/AppButton';

class LocationFilterScreen extends Component {

  render() {
    var action;
    if (this.props.locationLoading) {
      action = (
        <View style={styles.activityIndicator}>
          <ActivityIndicator style={styles.indicator} />
        </View>
      );
    } else {
      action = (
        <AppButton
          style={styles.button}
          type="secondary"
          caption="Use My Current Location"
          onPress={this.props.getLocation}
        />
      );
    }

    return (
      <View style={styles.container}>
        <Heading2 style={styles.text}>
          Where are you looking for gigs?
        </Heading2>
        <View style={styles.textInputWrap}>
          <TextInput
            autoCapitalize="words"
            placeholder="Enter your city, state or zip code"
            style={styles.textInput}
            value={this.props.location}
            returnKeyType="done"
            clearButtonMode="while-editing"
            underlineColorAndroid="transparent"
            {...this.props}
          />
        </View>
        {action}
      </View>
    );
  }
}

const scale = Dimensions.get('window').width / 375;

function normalize(size: number): number {
  return Math.round(scale * size);
}

var styles = createStylesheet({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  text: {
    marginBottom: 10,
    textAlign: 'center',
  },
  textInputWrap: {
    borderBottomWidth: 1,
    borderColor: AppColors.cellBorder,
    marginVertical: 10,
    android: {
      paddingVertical: 0,
    }
  },
  textInput: {
    flex: 1,
    height: 40,
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: normalize(15),
    android: {
      textAlignVertical: 'top',
    },
  },
  activityIndicator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  indicator: {
    width: 40,
    height: 40,
  }
});

module.exports = LocationFilterScreen;
