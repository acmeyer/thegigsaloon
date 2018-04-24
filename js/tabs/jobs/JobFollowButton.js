// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import AppColors from '../../common/AppColors';

class JobPageHeader extends Component {
  render() {
    let followImage;
    if (this.props.followingGig) {
      followImage = <Image style={styles.buttonIcon} source={require('../../common/img/check-white.png')} />;
    }
    return (
      <TouchableOpacity style={[styles.button, this.props.followingGig ? styles.followingButton : styles.followButton]} onPress={() => this.props.handlePress(this.props.job.id)}>
        {followImage}
        <Text style={this.props.followingGig ? styles.followingButtonText : styles.followButtonText}>{this.props.followingGig ? 'Following' : 'Follow'}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    width: 100,
    padding: 5,
    borderRadius: 3,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: AppColors.actionText,
  },
  followButton: {
    backgroundColor: AppColors.secondaryButton,
  },
  followingButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  followButtonText: {
    color: AppColors.mediumText,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 5,
    width: 15,
    height: 15,
  }
});

module.exports = JobPageHeader;
