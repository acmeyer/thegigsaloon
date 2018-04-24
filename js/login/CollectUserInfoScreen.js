'use strict';

import React, { Component } from 'react';
import {
  TextInput,
  ActivityIndicator,
  View,
  Platform,
  InteractionManager,
} from 'react-native';
import AppColors from '../common/AppColors';
import AppButton from '../common/AppButton';
import ProfilePhotoUpload from '../common/ProfilePhotoUpload';
import ImagePicker from 'react-native-image-picker';
const {Crashlytics} = require('react-native-fabric');
import { Heading1 } from '../common/AppText';
import { createStylesheet } from '../common/AppStyleSheet';
import { saveUserProfile, skipUserInfoCollection } from '../actions';
import { connect } from 'react-redux';

class CollectUserInfoScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userName: this.props.user.name || '',
      isLoading: false,
      showPictureForm: false,
      attachedPhoto: false,
      photoLoading: false,
      photoData: null,
      photoName: null,
    };

    this.updateName = this.updateName.bind(this);
    this.continueToPicture = this.continueToPicture.bind(this);
    this.savePhoto = this.savePhoto.bind(this);
    this.handlePhotoChange = this.handlePhotoChange.bind(this);
    this.close = this.close.bind(this);
  }

  render() {
    var content;
    if (this.state.isLoading) {
      content = this.renderLoading();
    } else if (this.state.showPictureForm) {
      content = this.renderPictureForm();
    } else {
      content = this.renderNameForm();
    }
    return (
      <View style={styles.container}>
        {content}
      </View>
    );
  }

  renderLoading() {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  renderNameForm() {
    return (
      <View style={styles.loginForm}>
        <Heading1 style={styles.title}>What's your name?</Heading1>
        <View style={styles.textInputWrap}>
          <TextInput
            autoFocus={true}
            placeholder="Full Name"
            multiline={false}
            autoCapitalize="words"
            keyboardType="email-address"
            placeholderTextColor={'white'}
            returnKeyType="next"
            onSubmitEditing={() => this.continueToPicture()}
            onChangeText={(text) => this.updateName(text)}
            style={styles.textField}
            value={this.state.userName}
            underlineColorAndroid="transparent"
          />
        </View>
        <AppButton
          caption="Next"
          buttonStyle={styles.continueButton}
          captionStyle={styles.continueButtonText}
          onPress={() => this.continueToPicture()}
          type="square"
        />
      </View>
    );
  }

  renderPictureForm() {
    let uploadPhotoButton;
    if (this.state.attachedPhoto && !this.state.photoLoading) {
      uploadPhotoButton = (
        <AppButton
          caption="Looking Good"
          buttonStyle={styles.continueButton}
          captionStyle={styles.continueButtonText}
          onPress={() => this.savePhoto()}
          type="square"
        />
      );
    }
    return (
      <View style={styles.loginForm}>
        <Heading1 style={styles.title}>Hi {this.props.user.name}!</Heading1>
        <Heading1 style={styles.title}>Upload a photo of yourself</Heading1>
        <View style={styles.photoUploaderWrap}>
          <ProfilePhotoUpload
            captionStyle={styles.choosePhotoButton}
            user={this.props.user}
            handlePhotoUpload={this.handlePhotoChange}
            isLoading={this.state.photoLoading}
            attachedPhoto={this.state.attachedPhoto}
            attachedPhotoSource={this.state.photoSource}
          />
        </View>
        {uploadPhotoButton}
        <AppButton
          style={styles.button}
          captionStyle={styles.skipLabel}
          type="secondary"
          caption="Skip"
          onPress={() => this.close()}
        />
      </View>
    );
  }

  updateName(text) {
    this.setState({userName: text});
  }

  continueToPicture() {
    if (this.state.userName !== '') {
      this.setState({isLoading: true});
      this.props.dispatch(saveUserProfile({
        name: this.state.userName,
      })).then(() => {
        this.setState({isLoading: false});
      });
      this.setState({showPictureForm: true});
    } else {
      alert('Please enter your name before continuing.');
    }
  }

  handlePhotoChange() {
    let options = {
      title: null,
      mediaType: 'photo',
      maxHeight: 600,
      maxWidth: 600,
    };
    this.setState({photoLoading: true});
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        this.setState({photoLoading: false});
      } else if (response.error) {
        if (Platform.OS === 'ios') {
          Crashlytics.recordError(response.error);
        } else {
          Crashlytics.logException(response.error);
        }
        this.setState({photoLoading: false});
      } else {
        const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};

        let fileName;
        if (Platform.OS === 'ios') {
          fileName = response.uri.split('/').pop();
        } else {
          fileName = response.fileName;
        }

        this.setState({
          attachedPhoto: true,
          photoLoading: false,
          photoSource: source,
          photoData: response.data,
          photoName: fileName,
        });
      }
    });
  }

  savePhoto() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({isLoading: true});
      this.props.dispatch(saveUserProfile({
        photoData: this.state.photoData,
        photoName: this.state.photoName,
      })).then(() => {
        this.close();
      });
    });
  }

  close() {
    this.props.dispatch(skipUserInfoCollection());
  }
}

var styles = createStylesheet({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 22,
    backgroundColor: AppColors.actionText,
    justifyContent: 'flex-start'
  },
  closeButton: {
    position: 'absolute',
    top: 35,
    left: 15,
  },
  title: {
    color: 'white',
  },
  formText: {
    color: 'white',
  },
  loginForm: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputWrap: {
    borderBottomWidth: 1,
    borderColor: 'white',
    marginVertical: 10,
    flexGrow: 1,
  },
  textField: {
    fontSize: 18,
    flexGrow: 1,
    height: 40,
    color: 'white',
    android: {
      textAlignVertical: 'top',
    },
  },
  continueButton: {
    backgroundColor: 'white',
    borderWidth: 0,
  },
  continueButtonText: {
    color: AppColors.actionText,
  },
  resendWrap: {
    marginTop: 10,
  },
  resendLink: {
    textAlign: 'center',
    color: 'white',
  },
  explanation: {
    marginTop: 20,
  },
  explanationText: {
    paddingVertical: 5,
    lineHeight: 17,
    color: 'white',
  },
  skipLabel: {
    color: 'white',
  },
  photoUploaderWrap: {
    padding: 15,
  },
  choosePhotoButton: {
    color: 'white',
  },
});

function select(store) {
  return {
    user: store.user
  };
}

module.exports = connect(select)(CollectUserInfoScreen);
