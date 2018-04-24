//@flow
'use strict';

import React, {Component} from 'React';
import {
  Image,
  PixelRatio,
} from 'react-native';

class ProfilePicture extends Component {
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
      <Image
        source={require('./img/profilePlaceholder.png')}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}>
        <Image
          source={source}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      </Image>
    );
  }
}

module.exports = ProfilePicture;
