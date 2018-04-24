//@flow
'use strict';

import React, {Component} from 'React';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import {createStylesheet} from '../common/AppStyleSheet';

class LocationFilter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var icon;
    if (this.props.locationLoading) {
      icon = <ActivityIndicator style={styles.activityIndictor} />;
    } else {
      icon = this.props.useLocation
             ? <Image style={styles.indicator} source={require('./img/near_me_active.png')} />
             : <Image style={styles.indicator} source={require('./img/near_me.png')} />;
    }

    return (
      <View style={styles.textInputWrap}>
        <TextInput
          autoCapitalize="words"
          placeholder="City, State or Zip Code"
          style={styles.textInput}
          returnKeyType="done"
          clearButtonMode="while-editing"
          underlineColorAndroid="transparent"
          {...this.props}
        />
        <TouchableOpacity onPress={this.props.getLocation}>
          {icon}
        </TouchableOpacity>
      </View>
    );
  }
}

var styles = createStylesheet({
  activityIndictor: {
    height: 30,
    width: 30,
  },
  textInputWrap: {
    flexGrow: 1,
    margin: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    android: {
      paddingVertical: 0,
    }
  },
  textInput: {
    flexGrow: 1,
    fontSize: 16,
    marginRight: 20,
  },
  indicator: {
    height: 28,
    width: 28,
  },
});

module.exports = LocationFilter;
