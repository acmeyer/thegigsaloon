//@flow
'use strict';

import React, {Component} from 'React';
import {
  Image,
  PixelRatio,
  View,
} from 'react-native';
import AppColors from './AppColors';

class ProfilePicture extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const {user, size} = this.props;
    const scaledSize = size * PixelRatio.get();
    let source;
    if (user.profilePicture) {
      source = {uri: user.profilePicture};
    } else if (user.facebook_id) {
      source = {uri: `http://graph.facebook.com/${user.facebook_id}/picture?width=${scaledSize}&height=${scaledSize}`};
    } else {
      source = require('./img/profilePlaceholder.png');
    }


    return (
      <View
        style={[{
          width: size,
          height: size,
          borderRadius: size / 2,
        }, this.state.loading ? { backgroundColor: AppColors.gray } : {}]}>
        <Image
          source={source}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          onLoadStart={(e) => this.setState({loading: true})}
          onLoad={(e) => this.setState({loading: false})}
        />
      </View>
    );
  }
}

module.exports = ProfilePicture;
