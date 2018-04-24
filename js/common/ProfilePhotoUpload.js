'use strict';

import React, { Component } from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  View,
  Text,
  Image,
} from 'react-native';
import AppColors from './AppColors';
import ProfilePicture from './ProfilePicture';
import { createStylesheet } from './AppStyleSheet';

class ProfilePhotoUpload extends Component {
  render() {
    let loading, photoContent;
    if (this.props.isLoading) {
      loading = (
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="white" />
          </View>
        </View>
      );
    }
    if (this.props.attachedPhoto) {
      photoContent = (
        <View style={styles.imageContainer}>
          <Image
            style={{
              width: 100,
              height: 100,
              borderRadius: 100 / 2,
            }}
            source={this.props.attachedPhotoSource}
          />
          {loading}
        </View>
      );
    } else {
      photoContent = (
        <View style={styles.imageContainer}>
          <ProfilePicture size={100} user={this.props.user} />
          {loading}
        </View>
      );
    }
    return (
      <View style={styles.container}>
        {photoContent}
        <TouchableOpacity style={styles.choosePhotoButton} onPress={() => this.props.handlePhotoUpload()}>
          <Text style={[styles.choosePhotoButtonText, this.props.captionStyle]}>Choose a photo</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

var styles = createStylesheet({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {

  },
  choosePhotoButton: {
    alignSelf: 'center',
    paddingVertical: 5,
    marginTop: 10,
  },
  choosePhotoButtonText: {
    color: AppColors.actionText,
  }
});


module.exports = ProfilePhotoUpload;
